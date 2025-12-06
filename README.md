# S1-interview-q
S1 Interview Questions
Summary of Changes Made:
Title changed from "香港中學面試題目生成器" to "S1 Interview Questions"

Removed subtitles "專為指定中學定制面試準備題目" and "Secondary School Interview Question Generator"

Added "All Schools" as the first option in school selection

Made either school or question type selection optional - now either one can be selected, not both required

One button per question - Only "View Answer" button appears on the right side of each question

Hidden modal answer and student version - Answers are shown in a collapsible panel below each question

Separate JSON files - Math questions use questions-math.json, other categories use questions.json

Simplified questions.json - Removed complex structure and student versions

Updated all UI text to English for consistency with the new title

Improved responsive design for better mobile experience

The application now has a cleaner interface with simplified functionality focusing on question generation and answer viewing.


I'll add a "DONE" button next to the "View Answer" button for each question. Here are the updated files:

## 1. Updated script.js (with DONE button functionality)

```javascript
// DOM Elements
const schoolSelect = document.getElementById('schoolSelect');
const schoolSearch = document.getElementById('schoolSearch');
const generateBtn = document.getElementById('generateBtn');
const randomBtn = document.getElementById('randomBtn');
const questionsOutput = document.getElementById('questionsOutput');
const noSchoolMessage = document.getElementById('noSchoolMessage');
const loadingIndicator = document.getElementById('loadingIndicator');
const schoolCount = document.getElementById('schoolCount');
const questionTypeSelect = document.getElementById('questionTypeSelect');
const questionCountInput = document.getElementById('questionCount');

// Global variables
let schoolsData = null;
let questionsData = null;
let mathQuestionsData = null;
let quickSetButtons = [];
let doneQuestions = new Set();

// Load done questions from localStorage
function loadDoneQuestions() {
    try {
        const saved = localStorage.getItem('doneQuestions');
        if (saved) {
            doneQuestions = new Set(JSON.parse(saved));
        }
    } catch (e) {
        console.error('Error loading done questions:', e);
    }
}

// Save done questions to localStorage
function saveDoneQuestions() {
    try {
        localStorage.setItem('doneQuestions', JSON.stringify([...doneQuestions]));
    } catch (e) {
        console.error('Error saving done questions:', e);
    }
}

// Mark question as done
function markQuestionDone(questionId, button) {
    if (doneQuestions.has(questionId)) {
        // Already done, undo it
        doneQuestions.delete(questionId);
        button.innerHTML = '<i class="fas fa-check-circle"></i> DONE';
        button.classList.remove('done-active');
        
        // Remove done style from question
        const questionItem = button.closest('.question-item');
        if (questionItem) {
            questionItem.classList.remove('question-done');
        }
    } else {
        // Mark as done
        doneQuestions.add(questionId);
        button.innerHTML = '<i class="fas fa-undo"></i> UNDO';
        button.classList.add('done-active');
        
        // Add done style to question
        const questionItem = button.closest('.question-item');
        if (questionItem) {
            questionItem.classList.add('question-done');
        }
    }
    
    // Save to localStorage
    saveDoneQuestions();
    
    // Update statistics if they exist
    updateDoneStatistics();
}

// Update done statistics
function updateDoneStatistics() {
    const totalQuestions = document.querySelectorAll('.question-item').length;
    const doneCount = doneQuestions.size;
    const statsElement = document.querySelector('.done-stats');
    
    if (statsElement) {
        statsElement.innerHTML = `
            <i class="fas fa-chart-bar"></i>
            <span>${doneCount}/${totalQuestions} questions completed</span>
        `;
    }
}

// Load schools data
async function loadSchoolsData() {
    try {
        const response = await fetch('schools.json');
        if (!response.ok) throw new Error('Failed to load school data');
        schoolsData = await response.json();
        console.log('School data loaded successfully');
        initializeSchoolDropdown();
    } catch (error) {
        console.error('Error loading school data:', error);
        schoolsData = {
            schools: [
                {
                    id: 1,
                    name: "Ying Wa College",
                    chineseName: "英華書院",
                    type: "直資",
                    religion: "基督教",
                    gender: "男校",
                    district: "深水埗區",
                    language: "英文",
                    specialty: "STEM、音樂、體育",
                    website: "https://www.yingwa.edu.hk/",
                    phone: "2380-4331"
                },
                {
                    id: 2,
                    name: "St. Paul's Co-educational College",
                    chineseName: "聖保羅男女中學",
                    type: "直資",
                    religion: "基督教",
                    gender: "男女校",
                    district: "中西區",
                    language: "英文",
                    specialty: "學術卓越、領導才能",
                    website: "https://www.spcc.edu.hk/",
                    phone: "2523-1194"
                },
                {
                    id: 3,
                    name: "Alliance Church Chan Sui Ki College",
                    chineseName: "宣道會陳瑞芝紀念中學",
                    type: "資助",
                    religion: "基督教",
                    gender: "男女校",
                    district: "屯門區",
                    language: "中文",
                    specialty: "社區服務、藝術",
                    website: "http://www.acsks.edu.hk/",
                    phone: "2451-2033"
                },
                {
                    id: 4,
                    name: "Po Leung Kuk Tang Yuk Tien College",
                    chineseName: "保良局董玉娣中學",
                    type: "資助",
                    religion: "無",
                    gender: "男女校",
                    district: "屯門區",
                    language: "中文",
                    specialty: "科技、體育",
                    website: "http://www.plktytc.edu.hk/",
                    phone: "2461-9888"
                },
                {
                    id: 5,
                    name: "Hong Kong Federation of Youth Groups Lee Shau Kee College",
                    chineseName: "香港青年會李兆基書院",
                    type: "直資",
                    religion: "無",
                    gender: "男女校",
                    district: "元朗區",
                    language: "英文",
                    specialty: "STEAM教育、多元智能發展、國際視野",
                    website: "https://www.hkfyg.org.hk/lskc/",
                    phone: "2479-9888"
                }
            ]
        };
        initializeSchoolDropdown();
    }
}

// Load questions data
async function loadQuestionsData() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to load questions data');
        questionsData = await response.json();
        console.log('Questions data loaded successfully');
    } catch (error) {
        console.error('Error loading questions data:', error);
        questionsData = {
            questions: [
                {
                    id: "CHI-001",
                    category: "chinese",
                    question: "請用三分鐘介紹你自己。",
                    modelAnswer: "各位老師好，我叫陳小明，今年12歲，就讀於聖公會小學。"
                },
                {
                    id: "CHI-002",
                    category: "chinese",
                    question: "你為什麼選擇我們學校？",
                    modelAnswer: "我選擇貴校主要有三個原因..."
                }
            ]
        };
    }
}

// Load math questions data
async function loadMathQuestionsData() {
    try {
        const response = await fetch('questions-math.json');
        if (!response.ok) throw new Error('Failed to load math questions data');
        mathQuestionsData = await response.json();
        console.log('Math questions data loaded successfully');
    } catch (error) {
        console.error('Error loading math questions data:', error);
        mathQuestionsData = [
            {
                Number: 1,
                問題: "計算 25 × 3 + 12 - 8",
                答案: "79",
                類型: "基礎四則運算"
            },
            {
                Number: 2,
                問題: "已知 28 × 48 = 1344，那麼 2.8 × 4.8 = ？",
                答案: "13.44",
                類型: "基礎四則運算（小數點處理）"
            }
        ];
    }
}

// Initialize school dropdown
function initializeSchoolDropdown() {
    if (!schoolsData || !schoolsData.schools) {
        console.error('School data not loaded');
        return;
    }
    
    schoolSelect.innerHTML = '<option value="all">All Schools</option>';
    
    schoolsData.schools.forEach(school => {
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = `${school.chineseName} (${school.name})`;
        schoolSelect.appendChild(option);
    });
    
    if (schoolCount) {
        schoolCount.textContent = `${schoolsData.schools.length} schools available`;
    }
    
    console.log('School dropdown initialized');
}

// Get questions by type
function getQuestionsByType(questionType, count = 4) {
    if (questionType === 'math') {
        if (!mathQuestionsData || mathQuestionsData.length === 0) {
            return [{
                question: "數學問題數據加載中...",
                modelAnswer: "",
                type: "math"
            }];
        }
        
        const questions = [...mathQuestionsData];
        const selected = [];
        const questionsToSelect = Math.min(count, questions.length);
        
        if (questionsToSelect < questions.length) {
            for (let i = 0; i < questionsToSelect; i++) {
                const randomIndex = Math.floor(Math.random() * questions.length);
                selected.push({
                    question: questions[randomIndex].問題,
                    modelAnswer: questions[randomIndex].答案,
                    type: questions[randomIndex].類型 || "math",
                    id: `MATH-${questions[randomIndex].Number}`
                });
                questions.splice(randomIndex, 1);
            }
        } else {
            questions.forEach(q => {
                selected.push({
                    question: q.問題,
                    modelAnswer: q.答案,
                    type: q.類型 || "math",
                    id: `MATH-${q.Number}`
                });
            });
        }
        
        return selected;
    } else {
        if (!questionsData || !questionsData.questions) {
            return [{
                question: "問題數據加載中...",
                modelAnswer: "",
                type: questionType
            }];
        }
        
        let filteredQuestions = questionsData.questions.filter(q => q.category === questionType);
        
        if (filteredQuestions.length === 0) {
            return [{
                question: `No ${questionType} questions available`,
                modelAnswer: "",
                type: questionType
            }];
        }
        
        const selected = [];
        const questionsToSelect = Math.min(count, filteredQuestions.length);
        
        if (questionsToSelect < filteredQuestions.length) {
            for (let i = 0; i < questionsToSelect; i++) {
                const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
                selected.push(filteredQuestions[randomIndex]);
                filteredQuestions.splice(randomIndex, 1);
            }
        } else {
            selected.push(...filteredQuestions);
        }
        
        return selected;
    }
}

// Get school specific questions
function getSchoolSpecificQuestions(schoolChineseName) {
    if (!questionsData || !questionsData.questions) {
        return [`你為什麼選擇${schoolChineseName}？`];
    }
    
    const schoolQuestions = questionsData.questions.filter(q => q.school === schoolChineseName);
    
    if (schoolQuestions.length === 0) {
        return [`你為什麼選擇${schoolChineseName}？`];
    }
    
    const selected = [];
    const questionsToSelect = Math.min(3, schoolQuestions.length);
    
    if (questionsToSelect < schoolQuestions.length) {
        for (let i = 0; i < questionsToSelect; i++) {
            const randomIndex = Math.floor(Math.random() * schoolQuestions.length);
            selected.push(schoolQuestions[randomIndex]);
            schoolQuestions.splice(randomIndex, 1);
        }
    } else {
        selected.push(...schoolQuestions);
    }
    
    return selected;
}

// Get icon for question type
function getIconForQuestionType(type) {
    const icons = {
        'chinese': 'fa-comment-dots',
        'english': 'fa-comments',
        'math': 'fa-calculator',
        'current': 'fa-newspaper',
        'science': 'fa-flask',
        'creative': 'fa-lightbulb',
        'other': 'fa-question-circle'
    };
    
    return icons[type] || 'fa-question-circle';
}

// Get display name for question type
function getDisplayNameForQuestionType(type) {
    const names = {
        'chinese': 'Chinese',
        'english': 'English',
        'math': 'Math (Mental)',
        'current': 'Current Affairs',
        'science': 'Science',
        'creative': 'Creative',
        'other': 'Other'
    };
    
    return names[type] || type;
}

// Toggle answer visibility
function toggleAnswer(questionId) {
    const answerPanel = document.getElementById(`answer-${questionId}`);
    const button = document.getElementById(`btn-${questionId}`);
    
    if (answerPanel && button) {
        if (answerPanel.classList.contains('show')) {
            // Hide the answer
            answerPanel.style.maxHeight = answerPanel.scrollHeight + "px";
            answerPanel.offsetHeight;
            answerPanel.style.maxHeight = "0";
            answerPanel.classList.remove('show');
            
            setTimeout(() => {
                if (!answerPanel.classList.contains('show')) {
                    answerPanel.style.overflow = "hidden";
                }
            }, 500);
            
            button.innerHTML = '<i class="fas fa-eye"></i> View Answer';
            button.classList.remove('active');
        } else {
            // Show the answer
            answerPanel.classList.add('show');
            answerPanel.style.overflow = "hidden";
            answerPanel.style.maxHeight = "0";
            
            const contentHeight = answerPanel.querySelector('.answer-content').scrollHeight;
            const padding = 50;
            const totalHeight = contentHeight + padding;
            
            setTimeout(() => {
                answerPanel.style.maxHeight = totalHeight + "px";
            }, 10);
            
            setTimeout(() => {
                if (answerPanel.classList.contains('show')) {
                    answerPanel.style.maxHeight = "none";
                    answerPanel.style.overflow = "visible";
                }
            }, 550);
            
            button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Answer';
            button.classList.add('active');
        }
    }
}

// Toggle section collapse/expand
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const header = section.querySelector('.section-header');
    const content = section.querySelector('.section-content');
    
    if (header && content) {
        if (header.classList.contains('collapsed')) {
            // Expand
            header.classList.remove('collapsed');
            content.style.maxHeight = content.scrollHeight + 100 + "px";
            content.style.opacity = "1";
            content.style.padding = "20px";
            content.style.overflow = "visible";
            
            setTimeout(() => {
                if (!header.classList.contains('collapsed')) {
                    content.style.maxHeight = "none";
                }
            }, 500);
        } else {
            // Collapse
            header.classList.add('collapsed');
            content.style.maxHeight = content.scrollHeight + "px";
            content.offsetHeight;
            content.style.maxHeight = "0";
            content.style.opacity = "0";
            content.style.padding = "0 20px";
            content.style.overflow = "hidden";
        }
    }
}

// Expand all sections
function expandAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        const header = section.querySelector('.section-header');
        const content = section.querySelector('.section-content');
        
        if (header && content) {
            header.classList.remove('collapsed');
            content.style.maxHeight = content.scrollHeight + 100 + "px";
            content.style.opacity = "1";
            content.style.padding = "20px";
            content.style.overflow = "visible";
            
            setTimeout(() => {
                if (!header.classList.contains('collapsed')) {
                    content.style.maxHeight = "none";
                }
            }, 500);
        }
    });
}

// Collapse all sections
function collapseAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        const header = section.querySelector('.section-header');
        const content = section.querySelector('.section-content');
        
        if (header && content) {
            header.classList.add('collapsed');
            content.style.maxHeight = content.scrollHeight + "px";
            content.offsetHeight;
            content.style.maxHeight = "0";
            content.style.opacity = "0";
            content.style.padding = "0 20px";
            content.style.overflow = "hidden";
        }
    });
}

// Initialize sections with proper height
function initializeSections() {
    document.querySelectorAll('.section').forEach(section => {
        const header = section.querySelector('.section-header');
        const content = section.querySelector('.section-content');
        
        if (header && content) {
            if (!header.classList.contains('collapsed')) {
                content.style.maxHeight = "none";
                content.style.opacity = "1";
                content.style.overflow = "visible";
            } else {
                content.style.maxHeight = "0";
                content.style.opacity = "0";
                content.style.overflow = "hidden";
            }
        }
    });
    
    document.querySelectorAll('.answer-panel').forEach(panel => {
        if (!panel.classList.contains('show')) {
            panel.style.maxHeight = "0";
            panel.style.overflow = "hidden";
        }
    });
}

// Set quick question count
function setQuestionCount(count) {
    questionCountInput.value = count;
    
    // Update active state of buttons
    quickSetButtons.forEach(btn => {
        if (btn.dataset.count == count) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Generate unique question ID
function generateQuestionId(category, index) {
    return `${category}-${Date.now()}-${index}`;
}

// Generate interview questions
async function generateQuestions() {
    const selectedSchoolId = schoolSelect.value;
    const questionType = questionTypeSelect.value;
    const questionCount = parseInt(questionCountInput.value) || 4;
    
    if (selectedSchoolId === "" && questionType === "all") {
        alert("Please select at least a school or a question type.");
        return;
    }
    
    if (questionCount < 1 || questionCount > 10) {
        alert("Question count must be between 1 and 10.");
        return;
    }
    
    if (!schoolsData || !questionsData) {
        alert("Data not loaded yet, please wait.");
        return;
    }
    
    loadingIndicator.style.display = 'block';
    questionsOutput.style.display = 'none';
    
    setTimeout(() => {
        noSchoolMessage.style.display = 'none';
        
        let html = '';
        const timestamp = Date.now();
        
        // Check if we should show school details (only when school is selected AND question type is "all")
        const showSchoolDetails = selectedSchoolId !== "all" && questionType === "all";
        
        if (showSchoolDetails) {
            const school = schoolsData.schools.find(s => s.id == selectedSchoolId);
            
            if (school) {
                const schoolSectionId = `school-details-${timestamp}`;
                html += `
                    <div class="school-name-display">
                        <div class="chinese-name">${school.chineseName}</div>
                        <div class="english-name">${school.name}</div>
                    </div>
                    
                    <div class="section" id="${schoolSectionId}">
                        <div class="section-header" onclick="toggleSection('${schoolSectionId}')">
                            <h3>
                                <i class="fas fa-school"></i>
                                School Details
                                <span class="question-count">8</span>
                            </h3>
                            <i class="fas fa-chevron-down toggle-icon"></i>
                        </div>
                        <div class="section-content">
                            <div class="school-details">
                                <div class="detail-item">
                                    <div class="detail-label">School Type</div>
                                    <div class="detail-value">${school.type}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Religion</div>
                                    <div class="detail-value">${school.religion}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Gender</div>
                                    <div class="detail-value">${school.gender}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">District</div>
                                    <div class="detail-value">${school.district}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Language</div>
                                    <div class="detail-value">${school.language}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Specialty</div>
                                    <div class="detail-value">${school.specialty}</div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Website</div>
                                    <div class="detail-value"><a href="${school.website}" target="_blank">${school.website}</a></div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-label">Phone</div>
                                    <div class="detail-value">${school.phone}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add school specific questions
                const schoolSpecificQuestions = getSchoolSpecificQuestions(school.chineseName);
                if (schoolSpecificQuestions.length > 0) {
                    const specificSectionId = `school-specific-${timestamp}`;
                    html += `
                        <div class="section highlight" id="${specificSectionId}">
                            <div class="section-header" onclick="toggleSection('${specificSectionId}')">
                                <h3>
                                    <i class="fas fa-star"></i>
                                    School Specific Questions
                                    <span class="question-count">${schoolSpecificQuestions.length}</span>
                                </h3>
                                <i class="fas fa-chevron-down toggle-icon"></i>
                            </div>
                            <div class="section-content">
                                <div class="question-list">
                    `;
                    
                    schoolSpecificQuestions.forEach((q, index) => {
                        const questionId = `school-specific-${timestamp}-${index}`;
                        const isDone = doneQuestions.has(questionId);
                        const doneClass = isDone ? ' question-done' : '';
                        const doneButtonText = isDone ? '<i class="fas fa-undo"></i> UNDO' : '<i class="fas fa-check-circle"></i> DONE';
                        const doneButtonClass = isDone ? 'done-btn done-active' : 'done-btn';
                        
                        html += `
                            <div class="question-item${doneClass}">
                                <div class="question-content">${q.question || q}</div>
                                <div class="question-actions">
                                    <button class="view-answer-btn" id="btn-${questionId}" onclick="toggleAnswer('${questionId}')">
                                        <i class="fas fa-eye"></i> View Answer
                                    </button>
                                    <button class="${doneButtonClass}" onclick="markQuestionDone('${questionId}', this)">
                                        ${doneButtonText}
                                    </button>
                                </div>
                                <div class="answer-panel" id="answer-${questionId}">
                                    <div class="answer-content">
                                        ${q.modelAnswer || "No answer provided"}
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    
                    html += `
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
        }
        
        // Generate questions based on selected type
        if (questionType === 'all') {
            // Show all question types
            const questionTypes = ['chinese', 'english', 'math', 'current', 'science', 'creative', 'other'];
            
            questionTypes.forEach(type => {
                const questions = getQuestionsByType(type, Math.min(questionCount, 3));
                if (questions.length > 0) {
                    const sectionId = `section-${type}-${timestamp}`;
                    html += `
                        <div class="section" id="${sectionId}">
                            <div class="section-header" onclick="toggleSection('${sectionId}')">
                                <h3>
                                    <i class="fas ${getIconForQuestionType(type)}"></i>
                                    ${getDisplayNameForQuestionType(type)} Questions
                                    <span class="question-count">${questions.length}</span>
                                </h3>
                                <i class="fas fa-chevron-down toggle-icon"></i>
                            </div>
                            <div class="section-content">
                                <div class="question-list">
                    `;
                    
                    questions.forEach((q, index) => {
                        const questionId = generateQuestionId(type, index);
                        const isDone = doneQuestions.has(questionId);
                        const doneClass = isDone ? ' question-done' : '';
                        const doneButtonText = isDone ? '<i class="fas fa-undo"></i> UNDO' : '<i class="fas fa-check-circle"></i> DONE';
                        const doneButtonClass = isDone ? 'done-btn done-active' : 'done-btn';
                        
                        html += `
                            <div class="question-item${doneClass}">
                                <div class="question-content">${q.question}</div>
                                <div class="question-actions">
                                    <button class="view-answer-btn" id="btn-${questionId}" onclick="toggleAnswer('${questionId}')">
                                        <i class="fas fa-eye"></i> View Answer
                                    </button>
                                    <button class="${doneButtonClass}" onclick="markQuestionDone('${questionId}', this)">
                                        ${doneButtonText}
                                    </button>
                                </div>
                                <div class="answer-panel" id="answer-${questionId}">
                                    <div class="answer-content">
                                        ${q.modelAnswer || "No answer provided"}
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    
                    html += `
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
            
            // Only show interview tips when showing all question types
            const tipsSectionId = `interview-tips-${timestamp}`;
            html += `
                <div class="section" id="${tipsSectionId}">
                    <div class="section-header" onclick="toggleSection('${tipsSectionId}')">
                        <h3>
                            <i class="fas fa-lightbulb"></i>
                            Interview Tips
                            <span class="question-count">6</span>
                        </h3>
                        <i class="fas fa-chevron-down toggle-icon"></i>
                    </div>
                    <div class="section-content">
                        <div class="question-list">
            `;
            
            // Interview tips don't have DONE buttons
            const tips = [
                "Research the school's history and achievements",
                "Prepare specific examples to support your answers",
                "Practice expressing ideas clearly and logically",
                "Prepare questions to ask the interviewers",
                "Dress neatly and maintain good posture",
                "Arrive on time with all required documents"
            ];
            
            tips.forEach((tip, index) => {
                html += `
                    <div class="question-item">
                        <div class="question-content">${tip}</div>
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
            
            // Add section controls for "all" mode
            html = `
                <div class="section-controls">
                    <div class="done-stats">
                        <i class="fas fa-chart-bar"></i>
                        <span>0/0 questions completed</span>
                    </div>
                    <div class="section-buttons">
                        <button class="expand-all-btn" onclick="expandAllSections()">
                            <i class="fas fa-expand-alt"></i> Expand All
                        </button>
                        <button class="collapse-all-btn" onclick="collapseAllSections()">
                            <i class="fas fa-compress-alt"></i> Collapse All
                        </button>
                    </div>
                </div>
                ${html}
            `;
        } else {
            // Show single question type - auto-expand by default (don't collapse)
            const questions = getQuestionsByType(questionType, questionCount);
            
            if (questions.length > 0) {
                const sectionId = `section-${questionType}-${timestamp}`;
                html += `
                    <div class="section" id="${sectionId}" style="border-left: 6px solid #58cc00;">
                        <div class="section-header" onclick="toggleSection('${sectionId}')" style="background: linear-gradient(135deg, #58cc00 0%, #1cb0f6 100%);">
                            <h3>
                                <i class="fas ${getIconForQuestionType(questionType)}"></i>
                                ${getDisplayNameForQuestionType(questionType)} Questions
                                <span class="question-count">${questions.length}</span>
                            </h3>
                            <i class="fas fa-chevron-down toggle-icon"></i>
                        </div>
                        <div class="section-content">
                            <div class="question-list">
                `;
                
                questions.forEach((q, index) => {
                    const questionId = generateQuestionId(questionType, index);
                    const isDone = doneQuestions.has(questionId);
                    const doneClass = isDone ? ' question-done' : '';
                    const doneButtonText = isDone ? '<i class="fas fa-undo"></i> UNDO' : '<i class="fas fa-check-circle"></i> DONE';
                    const doneButtonClass = isDone ? 'done-btn done-active' : 'done-btn';
                    
                    html += `
                        <div class="question-item${doneClass}">
                            <div class="question-content">${q.question}</div>
                            <div class="question-actions">
                                <button class="view-answer-btn" id="btn-${questionId}" onclick="toggleAnswer('${questionId}')">
                                    <i class="fas fa-eye"></i> View Answer
                                </button>
                                <button class="${doneButtonClass}" onclick="markQuestionDone('${questionId}', this)">
                                    ${doneButtonText}
                                </button>
                            </div>
                            <div class="answer-panel" id="answer-${questionId}">
                                <div class="answer-content">
                                    ${q.modelAnswer || "No answer provided"}
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                </div>
                `;
            }
            
            // Don't add section controls for single question type
            html = `
                <div class="selected-type-header">
                    <h3><i class="fas ${getIconForQuestionType(questionType)}"></i> Showing Only: ${getDisplayNameForQuestionType(questionType)} Questions</h3>
                    <div class="done-stats">
                        <i class="fas fa-chart-bar"></i>
                        <span>0/${questions.length} questions completed</span>
                    </div>
                </div>
                ${html}
            `;
        }
        
        // Update display
        questionsOutput.innerHTML = html;
        questionsOutput.style.display = 'block';
        loadingIndicator.style.display = 'none';
        
        setTimeout(() => {
            initializeSections();
            
            // Auto-expand the single section when only one question type is selected
            if (questionType !== 'all') {
                expandAllSections();
            }
            
            // Update statistics
            updateDoneStatistics();
        }, 100);
        
        questionsOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
}

// Search schools
function searchSchools(query) {
    if (!schoolsData) return;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    if (normalizedQuery === '') {
        initializeSchoolDropdown();
        return;
    }
    
    schoolSelect.innerHTML = '<option value="all">All Schools</option>';
    
    const matchedSchools = schoolsData.schools.filter(school => 
        school.name.toLowerCase().includes(normalizedQuery) ||
        school.chineseName.toLowerCase().includes(normalizedQuery)
    );
    
    if (matchedSchools.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No matching schools found";
        schoolSelect.appendChild(option);
        return;
    }
    
    matchedSchools.forEach(school => {
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = `${school.chineseName} (${school.name})`;
        schoolSelect.appendChild(option);
    });
}

// Initialize quick set buttons
function initializeQuickSetButtons() {
    const quickSetContainer = document.querySelector('.quick-set-buttons');
    if (!quickSetContainer) return;
    
    const quickSetValues = [3, 5, 8, 10];
    
    quickSetValues.forEach(value => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'quick-set-btn';
        button.dataset.count = value;
        button.textContent = value;
        button.onclick = () => setQuestionCount(value);
        
        quickSetContainer.appendChild(button);
        quickSetButtons.push(button);
    });
    
    // Set initial active button
    const initialValue = parseInt(questionCountInput.value) || 4;
    setQuestionCount(initialValue);
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing...');
    
    // Load done questions first
    loadDoneQuestions();
    
    await Promise.all([
        loadSchoolsData(),
        loadQuestionsData(),
        loadMathQuestionsData()
    ]);
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generateQuestions);
    }
    
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            if (!schoolsData || schoolsData.schools.length === 0) {
                alert("School data not loaded yet");
                return;
            }
            
            const useAllSchools = Math.random() > 0.5;
            
            if (useAllSchools) {
                schoolSelect.value = "all";
            } else {
                const randomIndex = Math.floor(Math.random() * schoolsData.schools.length);
                const randomSchool = schoolsData.schools[randomIndex];
                schoolSelect.value = randomSchool.id;
            }
            
            const questionTypes = ['all', 'chinese', 'english', 'math', 'current', 'science', 'creative', 'other'];
            const randomTypeIndex = Math.floor(Math.random() * questionTypes.length);
            questionTypeSelect.value = questionTypes[randomTypeIndex];
            
            generateQuestions();
        });
    }
    
    if (schoolSearch) {
        schoolSearch.addEventListener('input', (e) => {
            searchSchools(e.target.value);
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            generateQuestions();
        }
    });
    
    // Initialize quick set buttons
    initializeQuickSetButtons();
    
    initializeSections();
    
    console.log('Application initialized');
});
```

## 2. Updated style.css (with DONE button styling)

```css
/* Reset styles - Duolingo Inspired */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

body {
    background-color: #f0f2f5;
    color: #333;
    line-height: 1.6;
    padding: 20px;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Header styles - Duolingo Green */
header {
    text-align: center;
    margin-bottom: 30px;
    padding: 25px;
    background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
    color: white;
    border-radius: 20px;
    box-shadow: 0 8px 25px rgba(88, 204, 2, 0.3);
    position: relative;
    overflow: hidden;
}

header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #ffc800, #ff9600);
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

/* Content area */
.content {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    margin-bottom: 30px;
}

.selection-panel {
    flex: 1;
    min-width: 350px;
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border: 3px solid #e8e8e8;
}

.results-panel {
    flex: 2;
    min-width: 350px;
    background-color: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border: 3px solid #e8e8e8;
}

h2 {
    color: #1cb0f6;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 3px solid #58cc02;
    font-size: 1.8rem;
    font-weight: 700;
}

/* Form styles - Duolingo Style */
.form-group {
    margin-bottom: 25px;
}

label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: #333;
    font-size: 1.1rem;
    font-weight: 700;
}

select, input {
    width: 100%;
    padding: 16px 20px;
    border: 3px solid #e0e0e0;
    border-radius: 15px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background-color: white;
    font-weight: 500;
}

select:focus, input:focus {
    border-color: #58cc02;
    outline: none;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.2);
    transform: translateY(-2px);
}

option {
    padding: 12px;
    font-size: 1rem;
}

/* Quick set buttons container */
.quick-set-container {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 10px;
    flex-wrap: wrap;
}

.quick-set-label {
    font-size: 0.95rem;
    color: #666;
    font-weight: 600;
    margin-right: 5px;
}

.quick-set-buttons {
    display: flex;
    gap: 8px;
}

.quick-set-btn {
    background: #f0f2f5;
    color: #666;
    border: 2px solid #ddd;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 45px;
    text-align: center;
}

.quick-set-btn:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.quick-set-btn.active {
    background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
    color: white;
    border-color: #58cc02;
    box-shadow: 0 3px 0 #3ca100;
}

.quick-set-btn.active:hover {
    box-shadow: 0 5px 0 #3ca100;
}

.quick-tip {
    font-size: 0.85rem;
    color: #666;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.quick-tip i {
    color: #1cb0f6;
}

/* Button styles - Duolingo Inspired */
.btn {
    background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
    color: white;
    border: none;
    padding: 18px 28px;
    border-radius: 15px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    margin-top: 10px;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-transform: uppercase;
    box-shadow: 0 4px 0 #3ca100;
}

.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 0 #3ca100;
}

.btn:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 0 #3ca100;
}

.random-btn {
    background: linear-gradient(135deg, #ffc800 0%, #ff9600 100%);
    box-shadow: 0 4px 0 #e6a700;
}

.random-btn:hover {
    box-shadow: 0 6px 0 #e6a700;
}

.random-btn:active {
    box-shadow: 0 2px 0 #e6a700;
}

/* View answer button */
.view-answer-btn {
    background: linear-gradient(135deg, #1cb0f6 0%, #1899d6 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 130px;
    justify-content: center;
    box-shadow: 0 3px 0 #0d8ecf;
    text-transform: uppercase;
}

.view-answer-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #0d8ecf;
}

.view-answer-btn.active {
    background: linear-gradient(135deg, #ff9600 0%, #ff7a00 100%);
    box-shadow: 0 3px 0 #e66a00;
}

.view-answer-btn.active:hover {
    box-shadow: 0 5px 0 #e66a00;
}

/* Done button */
.done-btn {
    background: linear-gradient(135deg, #58cc00 0%, #4ca000 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 110px;
    justify-content: center;
    box-shadow: 0 3px 0 #3ca000;
    text-transform: uppercase;
}

.done-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #3ca000;
}

.done-btn.done-active {
    background: linear-gradient(135deg, #ffc800 0%, #ff9600 100%);
    box-shadow: 0 3px 0 #e6a700;
}

.done-btn.done-active:hover {
    box-shadow: 0 5px 0 #e6a700;
}

/* Done statistics */
.done-stats {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
    color: white;
    border-radius: 12px;
    font-weight: 600;
    box-shadow: 0 3px 0 #3ca100;
}

.done-stats i {
    font-size: 1.2rem;
}

/* Selected type header */
.selected-type-header {
    background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    margin-bottom: 25px;
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
}

.selected-type-header h3 {
    margin: 0;
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    gap: 12px;
}

/* Section controls */
.section-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 15px;
    border: 2px solid #e8e8e8;
    flex-wrap: wrap;
}

.section-buttons {
    display: flex;
    gap: 15px;
}

.expand-all-btn, .collapse-all-btn {
    background: linear-gradient(135deg, #ffc800 0%, #ff9600 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    box-shadow: 0 3px 0 #e6a700;
    text-transform: uppercase;
}

.expand-all-btn:hover, .collapse-all-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 0 #e6a700;
}

/* Section styles - Duolingo Card Style */
.section {
    margin-bottom: 30px;
    background-color: white;
    border-radius: 20px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
    border: 2px solid #e8e8e8;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.section:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 25px 30px;
    background: linear-gradient(135deg, #1cb0f6 0%, #0d8ecf 100%);
    color: white;
    user-select: none;
    transition: all 0.3s ease;
}

.section-header:hover {
    background: linear-gradient(135deg, #1cb0f6 0%, #0a7bb9 100%);
}

.section-header h3 {
    margin: 0;
    color: white;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 15px;
    font-weight: 700;
}

.toggle-icon {
    transition: transform 0.3s ease;
    color: white;
    font-size: 1.2rem;
    background: rgba(255, 255, 255, 0.2);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.collapsed .toggle-icon {
    transform: rotate(-90deg);
}

.section-content {
    overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
                opacity 0.3s ease, 
                padding 0.3s ease;
    max-height: 0;
    opacity: 0;
    padding: 0 30px;
}

/* Highlight sections */
.highlight .section-header {
    background: linear-gradient(135deg, #ffc800 0%, #ff9600 100%);
}

.highlight .section-header:hover {
    background: linear-gradient(135deg, #ffc800 0%, #e66a00 100%);
}

/* Question list */
.question-list {
    list-style-type: none;
}

.question-item {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: 2px solid #e8e8e8;
    transition: all 0.3s ease;
}

.question-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: #1cb0f6;
}

/* Done question style */
.question-item.question-done {
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border-color: #4caf50;
    opacity: 0.9;
}

.question-item.question-done .question-content {
    text-decoration: line-through;
    color: #666;
}

.question-content {
    flex: 1;
    font-size: 1.15rem;
    line-height: 1.7;
    color: #333;
    font-weight: 600;
    margin-right: 15px;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #58cc02;
    transition: all 0.3s ease;
}

.question-actions {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
    justify-content: flex-end;
    flex-wrap: wrap;
}

/* Answer panel */
.answer-panel {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    background: #f0f9ff;
    border-radius: 15px;
    margin-top: 20px;
    border: 2px solid transparent;
}

.answer-panel.show {
    max-height: none;
    padding: 25px;
    border-color: #1cb0f6;
    animation: slideDown 0.5s ease;
    overflow: visible;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.answer-content {
    background: white;
    padding: 20px;
    border-radius: 12px;
    border-left: 5px solid #58cc02;
    line-height: 1.7;
    font-size: 1.05rem;
    color: #444;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    display: block;
}

.answer-content * {
    max-width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
}

/* School details */
.school-details {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    margin-top: 15px;
}

.detail-item {
    background-color: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    border: 2px solid #e8e8e8;
    transition: transform 0.3s ease;
}

.detail-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: #58cc02;
}

.detail-label {
    font-weight: 700;
    color: #1cb0f6;
    font-size: 0.95rem;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-label:before {
    content: "✓";
    color: #58cc02;
    font-weight: bold;
}

.detail-value {
    margin-top: 8px;
    font-size: 1.1rem;
    color: #333;
    font-weight: 600;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.detail-value a {
    color: #1cb0f6;
    text-decoration: none;
    word-break: break-all;
    font-weight: 700;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
}

.detail-value a:hover {
    color: #58cc02;
    border-bottom: 2px solid #58cc02;
}

/* School name display */
.school-name-display {
    display: flex;
    flex-direction: column;
    margin-bottom: 25px;
    padding: 25px;
    border-bottom: 3px solid #e8e8e8;
    background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
    border-radius: 20px;
    color: white;
    box-shadow: 0 8px 25px rgba(88, 204, 2, 0.2);
}

.chinese-name {
    font-size: 2rem;
    color: white;
    font-weight: 800;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.english-name {
    font-size: 1.6rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    margin-bottom: 15px;
}

/* Question count label */
.question-count {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 700;
    margin-left: 10px;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

/* No school information */
.no-school {
    text-align: center;
    color: #666;
    padding: 50px 30px;
    background-color: #f8f9fa;
    border-radius: 20px;
    border: 3px dashed #1cb0f6;
}

.no-school i {
    font-size: 4rem;
    margin-bottom: 20px;
    color: #1cb0f6;
    background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.no-school h3 {
    font-size: 1.8rem;
    margin-bottom: 15px;
    color: #333;
    font-weight: 700;
}

.no-school p {
    color: #666;
    font-size: 1.1rem;
    max-width: 500px;
    margin: 0 auto 30px;
}

/* Quick guide */
.guide-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
}

.guide-item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    border: 2px solid #e8e8e8;
    transition: all 0.3s ease;
}

.guide-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: #58cc02;
}

.guide-item i {
    color: #1cb0f6;
    font-size: 2rem;
    background: #f0f9ff;
    padding: 15px;
    border-radius: 50%;
    min-width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.guide-item strong {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-size: 1.2rem;
    font-weight: 700;
}

.guide-item p {
    font-size: 0.95rem;
    color: #666;
    margin: 0;
    line-height: 1.5;
}

/* Loading indicator */
.loading {
    display: none;
    text-align: center;
    padding: 50px;
    color: #1cb0f6;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    margin: 20px 0;
    border: 3px solid #1cb0f6;
}

.loading i {
    font-size: 3.5rem;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.loading p {
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
}

/* School count display */
.school-count {
    font-size: 1.1rem;
    color: #1cb0f6;
    margin-top: 10px;
    text-align: center;
    font-weight: 700;
    background-color: #f0f9ff;
    padding: 12px 18px;
    border-radius: 15px;
    display: inline-block;
    border: 2px solid #1cb0f6;
}

/* Footer */
.footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 25px;
    border-top: 3px solid #e8e8e8;
    color: #666;
    font-size: 0.95rem;
    line-height: 1.8;
}

.footer p {
    margin-bottom: 10px;
    font-weight: 500;
}

/* Instruction list */
.instruction-list {
    list-style-type: decimal;
    padding-left: 25px;
    margin: 20px 0;
}

.instruction-list li {
    margin-bottom: 15px;
    padding: 12px 0;
    color: #333;
    font-size: 1.1rem;
    line-height: 1.6;
    font-weight: 500;
    padding-left: 10px;
    border-left: 3px solid #58cc02;
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
}

/* Animation effects */
@keyframes fadeIn {
    from { 
        opacity: 0; 
        transform: translateY(15px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

.question-item {
    animation: fadeIn 0.5s ease;
}

/* Responsive design */
@media (max-width: 992px) {
    .content {
        flex-direction: column;
    }
    
    .selection-panel,
    .results-panel {
        min-width: 100%;
    }
    
    h1 {
        font-size: 2.2rem;
    }
    
    .school-details {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
    
    .guide-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
    
    .section-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }
    
    .done-stats {
        justify-content: center;
    }
    
    .section-buttons {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 768px) {
    body {
        padding: 15px;
    }
    
    .container {
        padding: 15px;
    }
    
    header {
        padding: 20px;
    }
    
    h1 {
        font-size: 2rem;
    }
    
    .selection-panel,
    .results-panel {
        padding: 25px;
    }
    
    .question-content {
        margin-right: 0;
        margin-bottom: 20px;
    }
    
    .question-actions {
        width: 100%;
        justify-content: center;
        gap: 10px;
    }
    
    .view-answer-btn, .done-btn {
        flex: 1;
        min-width: 140px;
        justify-content: center;
    }
    
    .section-header h3 {
        font-size: 1.2rem;
    }
    
    .section-header {
        padding: 20px;
    }
    
    .guide-grid {
        grid-template-columns: 1fr;
    }
    
    .answer-content {
        padding: 15px;
        font-size: 1rem;
    }
    
    .quick-set-container {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .quick-set-buttons {
        width: 100%;
        justify-content: space-between;
    }
    
    .quick-set-btn {
        flex: 1;
    }
    
    .selected-type-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
}

@media (max-width: 576px) {
    body {
        padding: 10px;
    }
    
    .container {
        padding: 10px;
    }
    
    header {
        padding: 15px;
    }
    
    h1 {
        font-size: 1.8rem;
    }
    
    .selection-panel,
    .results-panel {
        padding: 20px;
    }
    
    .school-details {
        grid-template-columns: 1fr;
    }
    
    .chinese-name {
        font-size: 1.7rem;
    }
    
    .english-name {
        font-size: 1.4rem;
    }
    
    .question-content {
        font-size: 1.1rem;
    }
    
    .answer-content {
        padding: 12px;
        font-size: 0.95rem;
    }
    
    .section-header h3 {
        font-size: 1.1rem;
        flex-wrap: wrap;
    }
    
    .view-answer-btn, .done-btn {
        font-size: 0.9rem;
        padding: 10px 15px;
        min-width: 120px;
    }
    
    .question-count {
        font-size: 0.8rem;
        padding: 4px 8px;
    }
    
    .detail-label {
        font-size: 0.9rem;
    }
    
    .detail-value {
        font-size: 1rem;
    }
    
    .quick-set-btn {
        padding: 6px 12px;
        min-width: 40px;
        font-size: 0.85rem;
    }
    
    .selected-type-header {
        padding: 15px 20px;
    }
    
    .selected-type-header h3 {
        font-size: 1.2rem;
    }
    
    .done-stats {
        font-size: 0.9rem;
        padding: 10px 15px;
    }
    
    .expand-all-btn, .collapse-all-btn {
        font-size: 0.85rem;
        padding: 10px 15px;
    }
}
```

## 3. Updated index.html (updated instructions)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S1 Interview Questions</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>">
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-graduation-cap"></i> S1 Interview Questions</h1>
        </header>
        
        <div class="content">
            <div class="selection-panel">
                <h2><i class="fas fa-cog"></i> Settings</h2>
                
                <div class="form-group">
                    <label for="schoolSelect"><i class="fas fa-school"></i> Select School:</label>
                    <select id="schoolSelect">
                        <option value="all">All Schools</option>
                    </select>
                    <div class="school-count" id="schoolCount">Loading...</div>
                </div>
                
                <div class="form-group">
                    <label for="questionTypeSelect"><i class="fas fa-question-circle"></i> Question Type:</label>
                    <select id="questionTypeSelect">
                        <option value="all">All Types</option>
                        <option value="chinese">Chinese</option>
                        <option value="english">English</option>
                        <option value="math">Math (Mental)</option>
                        <option value="current">Current Affairs</option>
                        <option value="science">Science</option>
                        <option value="creative">Creative</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="schoolSearch"><i class="fas fa-search"></i> Search School:</label>
                    <input type="text" id="schoolSearch" placeholder="Enter school name in Chinese or English...">
                </div>
                
                <div class="form-group">
                    <label for="questionCount">Questions per category:</label>
                    <div class="quick-set-container">
                        <div class="quick-set-label">Quick Set:</div>
                        <div class="quick-set-buttons">
                            <!-- Quick set buttons will be added by JavaScript -->
                        </div>
                    </div>
                    <input type="number" id="questionCount" min="1" max="10" value="4" placeholder="Enter 1-10">
                    <div class="quick-tip">
                        <i class="fas fa-info-circle"></i>
                        Click numbers above for quick selection
                    </div>
                </div>
                
                <button class="btn random-btn" id="randomBtn">
                    <i class="fas fa-random"></i> Random Generate
                </button>
                
                <button class="btn" id="generateBtn">
                    <i class="fas fa-magic"></i> Generate Questions
                </button>
                
                <div class="loading" id="loadingIndicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Generating questions...</p>
                </div>
                
                <div class="section highlight" id="instructionsSection">
                    <div class="section-header" onclick="toggleSection('instructionsSection')">
                        <h3>
                            <i class="fas fa-lightbulb"></i>
                            How to Use
                        </h3>
                        <i class="fas fa-chevron-down toggle-icon"></i>
                    </div>
                    <div class="section-content">
                        <ol class="instruction-list">
                            <li>Select school and/or question type</li>
                            <li>Set questions per category using quick buttons or input</li>
                            <li>Click "Generate Questions"</li>
                            <li>When selecting a single question type, only that section will show</li>
                            <li>Click "View Answer" button to see answer</li>
                            <li>Click "DONE" button to mark questions as completed</li>
                            <li>Completed questions will be visually marked and tracked</li>
                            <li>Click section headers to expand/collapse (for "All Types")</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <div class="results-panel">
                <h2><i class="fas fa-file-alt"></i> Interview Questions</h2>
                
                <div id="resultsContainer">
                    <div class="no-school" id="noSchoolMessage">
                        <i class="fas fa-info-circle"></i>
                        <h3>Please make a selection</h3>
                        <p>Select a school or question type, then click "Generate Questions".</p>
                        
                        <div class="section" id="quickGuideSection">
                            <div class="section-header" onclick="toggleSection('quickGuideSection')">
                                <h3>
                                    <i class="fas fa-graduation-cap"></i>
                                    Question Types
                                </h3>
                                <i class="fas fa-chevron-down toggle-icon"></i>
                            </div>
                            <div class="section-content">
                                <div class="guide-grid">
                                    <div class="guide-item">
                                        <i class="fas fa-comment-dots"></i>
                                        <div>
                                            <strong>Chinese</strong>
                                            <p>Chinese language ability</p>
                                        </div>
                                    </div>
                                    <div class="guide-item">
                                        <i class="fas fa-comments"></i>
                                        <div>
                                            <strong>English</strong>
                                            <p>English communication</p>
                                        </div>
                                    </div>
                                    <div class="guide-item">
                                        <i class="fas fa-calculator"></i>
                                        <div>
                                            <strong>Math (Mental)</strong>
                                            <p>Mental math and logic</p>
                                        </div>
                                    </div>
                                    <div class="guide-item">
                                        <i class="fas fa-newspaper"></i>
                                        <div>
                                            <strong>Current Affairs</strong>
                                            <p>Social and current issues</p>
                                        </div>
                                    </div>
                                    <div class="guide-item">
                                        <i class="fas fa-flask"></i>
                                        <div>
                                            <strong>Science</strong>
                                            <p>Scientific knowledge</p>
                                        </div>
                                    </div>
                                    <div class="guide-item">
                                        <i class="fas fa-lightbulb"></i>
                                        <div>
                                            <strong>Creative</strong>
                                            <p>Creative thinking</p>
                                        </div>
                                    </div>
                                    <div class="guide-item">
                                        <i class="fas fa-question-circle"></i>
                                        <div>
                                            <strong>Other</strong>
                                            <p>General questions</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="questionsOutput" style="display: none;">
                        <!-- Content will be generated here -->
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>This tool generates practice questions for S1 interviews. Actual interview questions may vary.</p>
            <p>Your progress is saved automatically in your browser.</p>
            <p>Hosted on GitHub Pages | Made for students <i class="fas fa-heart" style="color: #ff6b6b;"></i></p>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

## Key Features Added:

### 1. **DONE Button Functionality:**
- Green "DONE" button appears next to each question
- Clicking "DONE" marks the question as completed (changes to "UNDO")
- Completed questions get a visual treatment (green background, strikethrough text)
- Clicking "UNDO" removes the completed status

### 2. **Progress Tracking:**
- Tracks completed questions in browser's localStorage
- Progress persists across page reloads
- Shows statistics: "X/Y questions completed"
- Updates statistics in real-time

### 3. **Visual Feedback:**
- DONE button turns orange when active (UNDO state)
- Question item gets green background when completed
- Question text gets strikethrough effect
- Progress statistics are shown prominently

### 4. **Responsive Design:**
- Buttons stack properly on mobile devices
- Proper spacing and sizing for all screen sizes
- Touch-friendly button sizes

### 5. **User Experience:**
- Clear visual feedback when marking questions as done
- Easy undo functionality
- Progress tracking helps users see their advancement
- Instructions updated to include DONE button usage

Now each question has two buttons on the right side: "View Answer" (blue) and "DONE" (green, turns orange when active). Users can track their progress through questions, and their completion status is saved automatically.
