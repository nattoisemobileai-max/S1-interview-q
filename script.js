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
        // Use hardcoded school data as backup
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
        // Use hardcoded questions data as backup
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
                },
                {
                    id: "ENG-001",
                    category: "english",
                    question: "Tell us about yourself in three minutes.",
                    modelAnswer: "Good morning, teachers. My name is Chan Siu Ming..."
                },
                {
                    id: "ENG-002",
                    category: "english",
                    question: "Why do you want to study at our school?",
                    modelAnswer: "I want to study at your school for several reasons..."
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
        // Use hardcoded math questions data as backup
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
    
    // Clear existing options (keeping the "All Schools" option)
    schoolSelect.innerHTML = '<option value="all">All Schools</option>';
    
    // Add school options
    schoolsData.schools.forEach(school => {
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = `${school.chineseName} (${school.name})`;
        schoolSelect.appendChild(option);
    });
    
    // Update school count display
    if (schoolCount) {
        schoolCount.textContent = `${schoolsData.schools.length} schools available`;
    }
    
    console.log('School dropdown initialized');
}

// Get questions by type
function getQuestionsByType(questionType, count = 4) {
    if (questionType === 'math') {
        // Get math questions
        if (!mathQuestionsData || mathQuestionsData.length === 0) {
            return [{
                question: "數學問題數據加載中...",
                modelAnswer: "",
                type: "math"
            }];
        }
        
        const questions = [...mathQuestionsData];
        const selected = [];
        
        // If we have fewer questions than requested, adjust the count
        const questionsToSelect = Math.min(count, questions.length);
        
        // If we're requesting fewer questions than available, select randomly
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
            // Otherwise, use all questions
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
        // Get regular questions
        if (!questionsData || !questionsData.questions) {
            return [{
                question: "問題數據加載中...",
                modelAnswer: "",
                type: questionType
            }];
        }
        
        // Filter questions by category
        let filteredQuestions = questionsData.questions.filter(q => q.category === questionType);
        
        // If no questions found for this category, return empty
        if (filteredQuestions.length === 0) {
            return [{
                question: `No ${questionType} questions available`,
                modelAnswer: "",
                type: questionType
            }];
        }
        
        const selected = [];
        
        // If we have fewer questions than requested, adjust the count
        const questionsToSelect = Math.min(count, filteredQuestions.length);
        
        // If we're requesting fewer questions than available, select randomly
        if (questionsToSelect < filteredQuestions.length) {
            for (let i = 0; i < questionsToSelect; i++) {
                const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
                selected.push(filteredQuestions[randomIndex]);
                filteredQuestions.splice(randomIndex, 1);
            }
        } else {
            // Otherwise, use all questions
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
    
    // Filter questions for this specific school
    const schoolQuestions = questionsData.questions.filter(q => q.school === schoolChineseName);
    
    if (schoolQuestions.length === 0) {
        return [`你為什麼選擇${schoolChineseName}？`];
    }
    
    const selected = [];
    
    // Select up to 3 school specific questions
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
        'chinese': 'fa-language',
        'english': 'fa-language',
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
            answerPanel.classList.remove('show');
            button.innerHTML = '<i class="fas fa-eye"></i> View Answer';
        } else {
            answerPanel.classList.add('show');
            button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Answer';
        }
    }
}

// Generate interview questions
async function generateQuestions() {
    const selectedSchoolId = schoolSelect.value;
    const questionType = questionTypeSelect.value;
    const questionCount = parseInt(questionCountInput.value) || 4;
    
    // Validate input - either school or question type must be selected
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
    
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    questionsOutput.style.display = 'none';
    
    // Simulate loading
    setTimeout(() => {
        // Hide "no school" message
        noSchoolMessage.style.display = 'none';
        
        let html = '';
        
        // If a specific school is selected, show school details
        if (selectedSchoolId !== "all") {
            const school = schoolsData.schools.find(s => s.id == selectedSchoolId);
            
            if (school) {
                html += `
                    <div class="school-name-display">
                        <div class="chinese-name">${school.chineseName}</div>
                        <div class="english-name">${school.name}</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-header" onclick="toggleSection('schoolDetails')">
                            <h3>
                                <i class="fas fa-school"></i>
                                School Details
                            </h3>
                            <i class="fas fa-chevron-down toggle-icon"></i>
                        </div>
                        <div class="section-content" id="schoolDetails-content">
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
                
                // Add school specific questions if not "all" question types
                if (questionType !== 'all') {
                    const schoolSpecificQuestions = getSchoolSpecificQuestions(school.chineseName);
                    if (schoolSpecificQuestions.length > 0) {
                        html += `
                            <div class="section highlight">
                                <div class="section-header" onclick="toggleSection('schoolSpecific')">
                                    <h3>
                                        <i class="fas fa-star"></i>
                                        School Specific Questions
                                    </h3>
                                    <i class="fas fa-chevron-down toggle-icon"></i>
                                </div>
                                <div class="section-content" id="schoolSpecific-content">
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
        
        // Generate questions based on selected type
        if (questionType === 'all') {
            // Show all question types
            const questionTypes = ['chinese', 'english', 'math', 'current', 'science', 'creative', 'other'];
            
            questionTypes.forEach(type => {
                const questions = getQuestionsByType(type, Math.min(questionCount, 3));
                if (questions.length > 0) {
                    const sectionId = `section-${type}-${Date.now()}`;
                    html += `
                        <div class="section">
                            <div class="section-header" onclick="toggleSection('${sectionId}')">
                                <h3>
                                    <i class="fas ${getIconForQuestionType(type)}"></i>
                                    ${getDisplayNameForQuestionType(type)} Questions
                                    <span class="question-count">${questions.length}</span>
                                </h3>
                                <i class="fas fa-chevron-down toggle-icon"></i>
                            </div>
                            <div class="section-content" id="${sectionId}-content">
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
            // Show single question type
            const questions = getQuestionsByType(questionType, questionCount);
            
            if (questions.length > 0) {
                const sectionId = `section-${questionType}-${Date.now()}`;
                html += `
                    <div class="section">
                        <div class="section-header" onclick="toggleSection('${sectionId}')">
                            <h3>
                                <i class="fas ${getIconForQuestionType(questionType)}"></i>
                                ${getDisplayNameForQuestionType(questionType)} Questions
                                <span class="question-count">${questions.length}</span>
                            </h3>
                            <i class="fas fa-chevron-down toggle-icon"></i>
                        </div>
                        <div class="section-content" id="${sectionId}-content">
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
        
        // Add interview tips section
        html += `
            <div class="section">
                <div class="section-header" onclick="toggleSection('interviewTips')">
                    <h3>
                        <i class="fas fa-tips"></i>
                        Interview Tips
                    </h3>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="section-content" id="interviewTips-content">
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
        
        // Update display
        questionsOutput.innerHTML = html;
        questionsOutput.style.display = 'block';
        loadingIndicator.style.display = 'none';
        
        // Expand all sections by default
        expandAllSections();
        
        // Scroll to results
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
    
    // Clear dropdown but keep "All Schools" option
    schoolSelect.innerHTML = '<option value="all">All Schools</option>';
    
    // Filter schools
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
    
    // Add matched schools
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
    
    // Load all data
    await Promise.all([
        loadSchoolsData(),
        loadQuestionsData(),
        loadMathQuestionsData()
    ]);
    
    // Set up event listeners
    if (generateBtn) {
        generateBtn.addEventListener('click', generateQuestions);
    }
    
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            if (!schoolsData || schoolsData.schools.length === 0) {
                alert("School data not loaded yet");
                return;
            }
            
            // Randomly choose between "All Schools" or a specific school
            const useAllSchools = Math.random() > 0.5;
            
            if (useAllSchools) {
                schoolSelect.value = "all";
            } else {
                // Select random school
                const randomIndex = Math.floor(Math.random() * schoolsData.schools.length);
                const randomSchool = schoolsData.schools[randomIndex];
                schoolSelect.value = randomSchool.id;
            }
            
            // Select random question type
            const questionTypes = ['all', 'chinese', 'english', 'math', 'current', 'science', 'creative', 'other'];
            const randomTypeIndex = Math.floor(Math.random() * questionTypes.length);
            questionTypeSelect.value = questionTypes[randomTypeIndex];
            
            // Generate questions
            generateQuestions();
        });
    }
    
    if (schoolSearch) {
        schoolSearch.addEventListener('input', (e) => {
            searchSchools(e.target.value);
        });
    }
    
    // Add keyboard shortcut for Enter key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            generateQuestions();
        }
    });
    
    console.log('Application initialized');
});
