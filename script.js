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
