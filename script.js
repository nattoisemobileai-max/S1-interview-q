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

// Toggle answer visibility - FIXED VERSION
function toggleAnswer(questionId) {
    const answerPanel = document.getElementById(`answer-${questionId}`);
    const button = document.getElementById(`btn-${questionId}`);
    
    if (answerPanel && button) {
        if (answerPanel.classList.contains('show')) {
            // Hide the answer
            answerPanel.style.maxHeight = answerPanel.scrollHeight + "px";
            
            // Force reflow to make the transition work
            answerPanel.offsetHeight;
            
            answerPanel.style.maxHeight = "0";
            answerPanel.classList.remove('show');
            
            setTimeout(() => {
                if (!answerPanel.classList.contains('show')) {
                    answerPanel.style.overflow = "hidden";
                }
            }, 500); // Match the transition duration
            
            button.innerHTML = '<i class="fas fa-eye"></i> View Answer';
            button.classList.remove('active');
        } else {
            // Show the answer
            answerPanel.classList.add('show');
            answerPanel.style.overflow = "hidden";
            
            // Set initial height
            answerPanel.style.maxHeight = "0";
            
            // Calculate the actual height needed
            const contentHeight = answerPanel.querySelector('.answer-content').scrollHeight;
            const padding = 50; // Account for padding
            const totalHeight = contentHeight + padding;
            
            // Set the max-height to show all content
            setTimeout(() => {
                answerPanel.style.maxHeight = totalHeight + "px";
            }, 10);
            
            // After transition completes, allow content to expand naturally
            setTimeout(() => {
                if (answerPanel.classList.contains('show')) {
                    answerPanel.style.maxHeight = "none";
                    answerPanel.style.overflow = "visible";
                }
            }, 550); // Slightly longer than transition duration
            
            button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Answer';
            button.classList.add('active');
        }
    }
}

// Toggle section collapse/expand - FIXED VERSION
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
            
            // After transition, remove max-height to allow natural expansion
            setTimeout(() => {
                if (!header.classList.contains('collapsed')) {
                    content.style.maxHeight = "none";
                }
            }, 500);
        } else {
            // Collapse
            header.classList.add('collapsed');
            content.style.maxHeight = content.scrollHeight + "px";
            
            // Force reflow
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
        const sectionId = section.id;
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
        const sectionId = section.id;
        const header = section.querySelector('.section-header');
        const content = section.querySelector('.section-content');
        
        if (header && content) {
            header.classList.add('collapsed');
            content.style.maxHeight = content.scrollHeight + "px";
            content.offsetHeight; // Force reflow
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
    
    // Initialize answer panels
    document.querySelectorAll('.answer-panel').forEach(panel => {
        if (!panel.classList.contains('show')) {
            panel.style.maxHeight = "0";
            panel.style.overflow = "hidden";
        }
    });
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
        
        if (selectedSchoolId !== "all") {
            const school = schoolsData.schools.find(s => s.id == selectedSchoolId);
            
            if (school) {
                const schoolSectionId = `school-details-${Date.now()}`;
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
                
                if (questionType !== 'all') {
                    const schoolSpecificQuestions = getSchoolSpecificQuestions(school.chineseName);
                    if (schoolSpecificQuestions.length > 0) {
                        const specificSectionId = `school-specific-${Date.now()}`;
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
                            const questionId = `school-specific-${Date.now()}-${index}`;
                            html += `
                                <div class="question-item">
                                    <div class="question-content">${q.question || q}</div>
                                    <div class="question-actions">
                                        <button class="view-answer-btn" id="btn-${questionId}" onclick="toggleAnswer('${questionId}')">
                                            <i class="fas fa-eye"></i> View Answer
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
        }
        
        if (questionType === 'all') {
            const questionTypes = ['chinese', 'english', 'math', 'current', 'science', 'creative', 'other'];
            
            questionTypes.forEach(type => {
                const questions = getQuestionsByType(type, Math.min(questionCount, 3));
                if (questions.length > 0) {
                    const sectionId = `section-${type}-${Date.now()}`;
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
                        const questionId = `${type}-${Date.now()}-${index}`;
                        html += `
                            <div class="question-item">
                                <div class="question-content">${q.question}</div>
                                <div class="question-actions">
                                    <button class="view-answer-btn" id="btn-${questionId}" onclick="toggleAnswer('${questionId}')">
                                        <i class="fas fa-eye"></i> View Answer
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
        } else {
            const questions = getQuestionsByType(questionType, questionCount);
            
            if (questions.length > 0) {
                const sectionId = `section-${questionType}-${Date.now()}`;
                html += `
                    <div class="section" id="${sectionId}">
                        <div class="section-header" onclick="toggleSection('${sectionId}')">
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
                    const questionId = `${questionType}-${Date.now()}-${index}`;
                    html += `
                        <div class="question-item">
                            <div class="question-content">${q.question}</div>
                            <div class="question-actions">
                                <button class="view-answer-btn" id="btn-${questionId}" onclick="toggleAnswer('${questionId}')">
                                    <i class="fas fa-eye"></i> View Answer
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
        
        const tipsSectionId = `interview-tips-${Date.now()}`;
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
                        <div class="question-item">
                            <div class="question-content">Research the school's history and achievements</div>
                        </div>
                        <div class="question-item">
                            <div class="question-content">Prepare specific examples to support your answers</div>
                        </div>
                        <div class="question-item">
                            <div class="question-content">Practice expressing ideas clearly and logically</div>
                        </div>
                        <div class="question-item">
                            <div class="question-content">Prepare questions to ask the interviewers</div>
                        </div>
                        <div class="question-item">
                            <div class="question-content">Dress neatly and maintain good posture</div>
                        </div>
                        <div class="question-item">
                            <div class="question-content">Arrive on time with all required documents</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        html = `
            <div class="section-controls">
                <button class="expand-all-btn" onclick="expandAllSections()">
                    <i class="fas fa-expand-alt"></i> Expand All
                </button>
                <button class="collapse-all-btn" onclick="collapseAllSections()">
                    <i class="fas fa-compress-alt"></i> Collapse All
                </button>
            </div>
            ${html}
        `;
        
        questionsOutput.innerHTML = html;
        questionsOutput.style.display = 'block';
        loadingIndicator.style.display = 'none';
        
        setTimeout(() => {
            initializeSections();
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

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing...');
    
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
    
    initializeSections();
    
    console.log('Application initialized');
});
