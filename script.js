// Global variables
let schoolsData = [];
let questionsData = {
    chinese: [],
    english: [],
    math: [],
    science: [],
    news: [],
    creative: []
};
let studentAnswers = [];
let selectedCategories = ['all'];
let questionsPerCategory = 'all';
let generatedCount = 0;
let savedAnswersCount = 0;

// DOM elements
const questionsContainer = document.getElementById('questions-container');
const schoolSelect = document.getElementById('school-select');
const schoolDetails = document.getElementById('school-details');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const saveAnswersBtn = document.getElementById('save-answers-btn');
const viewHistoryBtn = document.getElementById('view-history-btn');
const closeHistoryBtn = document.getElementById('close-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const downloadHistoryBtn = document.getElementById('download-history-btn');
const loadAnswersBtn = document.getElementById('load-answers-btn');
const historyLogCard = document.getElementById('history-log-card');
const historyContainer = document.getElementById('history-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const countButtons = document.querySelectorAll('.count-btn');

// Statistics elements
const totalSchoolsEl = document.getElementById('total-schools');
const totalQuestionsEl = document.getElementById('total-questions');
const generatedTodayEl = document.getElementById('generated-today');
const savedAnswersEl = document.getElementById('saved-answers');
const questionsCountBadge = document.getElementById('questions-count-badge');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadStudentData();
    setupEventListeners();
    updateStatistics();
    setDefaultSelections();
});

// Load data from JSON files
async function loadData() {
    try {
        // Load schools data
        const schoolsResponse = await fetch('schools.json');
        schoolsData = await schoolsResponse.json();
        
        // Load all question files
        const questionFiles = [
            { key: 'chinese', file: 'questions-chi.json' },
            { key: 'english', file: 'questions-eng.json' },
            { key: 'math', file: 'questions-math.json' },
            { key: 'science', file: 'questions-science.json' },
            { key: 'news', file: 'questions-news.json' },
            { key: 'creative', file: 'questions-creative.json' }
        ];
        
        for (const { key, file } of questionFiles) {
            try {
                const response = await fetch(file);
                const data = await response.json();
                questionsData[key] = data.questions || [];
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
                questionsData[key] = [];
            }
        }
        
        // Initialize school dropdown
        populateSchoolDropdown();
        
        // Update statistics
        updateStatistics();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check if JSON files are available.');
    }
}

// Load student data from localStorage
function loadStudentData() {
    // Load saved answers
    const savedAnswers = localStorage.getItem('studentAnswers');
    if (savedAnswers) {
        try {
            studentAnswers = JSON.parse(savedAnswers);
            savedAnswersCount = studentAnswers.length;
            savedAnswersEl.textContent = savedAnswersCount;
        } catch (e) {
            console.error('Error parsing saved answers:', e);
        }
    }
}

// Save student data to localStorage
function saveStudentData() {
    localStorage.setItem('studentAnswers', JSON.stringify(studentAnswers));
}

// Populate school dropdown
function populateSchoolDropdown() {
    // Clear existing options (except first placeholder)
    schoolSelect.innerHTML = '<option value="">Select a school to view details</option>';
    
    schoolsData.schools.forEach(school => {
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = `${school.name} (${school.chineseName}) - ${school.banding}`;
        schoolSelect.appendChild(option);
    });
}

// Set default selections
function setDefaultSelections() {
    // All categories button is active by default
    const allCategoriesBtn = document.querySelector('.category-btn.all-btn');
    if (allCategoriesBtn) allCategoriesBtn.classList.add('active');
    
    // All count button is active by default
    const allCountBtn = document.querySelector('.all-count-btn');
    if (allCountBtn) allCountBtn.classList.add('active');
}

// Setup event listeners
function setupEventListeners() {
    // Category buttons
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // If "All" button is clicked
            if (category === 'all') {
                // Deselect all other category buttons
                categoryButtons.forEach(b => {
                    if (b !== this) b.classList.remove('active');
                });
                this.classList.add('active');
                selectedCategories = ['all'];
            } else {
                // If a specific category is clicked
                const allBtn = document.querySelector('.category-btn.all-btn');
                allBtn.classList.remove('active');
                
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    selectedCategories = selectedCategories.filter(cat => cat !== category);
                    
                    // If no categories selected, select "All"
                    if (selectedCategories.length === 0) {
                        allBtn.classList.add('active');
                        selectedCategories = ['all'];
                    }
                } else {
                    this.classList.add('active');
                    selectedCategories.push(category);
                }
            }
        });
    });
    
    // Count buttons
    countButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const count = this.dataset.count;
            
            // If "All" button is clicked
            if (count === 'all') {
                // Deselect all other count buttons
                countButtons.forEach(b => {
                    if (b !== this) b.classList.remove('active');
                });
                this.classList.add('active');
                questionsPerCategory = 'all';
            } else {
                // If a specific count is clicked
                const allCountBtn = document.querySelector('.all-count-btn');
                allCountBtn.classList.remove('active');
                
                countButtons.forEach(b => {
                    if (b.dataset.count === count) {
                        b.classList.add('active');
                    } else if (b.dataset.count !== 'all') {
                        b.classList.remove('active');
                    }
                });
                
                questionsPerCategory = parseInt(count);
            }
        });
    });
    
    // Generate button
    generateBtn.addEventListener('click', generateQuestions);
    
    // Clear button
    clearBtn.addEventListener('click', clearQuestions);
    
    // Save answers button
    saveAnswersBtn.addEventListener('click', saveAllAnswers);
    
    // View history button
    viewHistoryBtn.addEventListener('click', showHistory);
    
    // Close history button
    closeHistoryBtn.addEventListener('click', hideHistory);
    
    // Clear history button
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Download history button
    downloadHistoryBtn.addEventListener('click', downloadAnswers);
    
    // Load answers button
    loadAnswersBtn.addEventListener('click', loadAnswersFile);
    
    // School select dropdown
    schoolSelect.addEventListener('change', function() {
        const schoolId = parseInt(this.value);
        if (schoolId) {
            displaySchoolDetails(schoolId);
        } else {
            schoolDetails.innerHTML = '<p class="placeholder">Select a school from the dropdown to view detailed information</p>';
        }
    });
}

// Generate questions based on selected categories
function generateQuestions() {
    // Clear previous questions
    questionsContainer.innerHTML = '';
    
    // Determine which categories to use
    let categoriesToUse = [];
    if (selectedCategories.includes('all')) {
        // Get all categories that have questions
        categoriesToUse = Object.keys(questionsData).filter(key => questionsData[key].length > 0);
    } else {
        categoriesToUse = selectedCategories.filter(cat => questionsData[cat] && questionsData[cat].length > 0);
    }
    
    if (categoriesToUse.length === 0) {
        showNotification('No questions available for selected categories');
        return;
    }
    
    let allSelectedQuestions = [];
    
    // Generate questions for each selected category
    categoriesToUse.forEach(category => {
        const categoryQuestions = questionsData[category];
        
        // Determine how many questions to take
        let questionsToTake = questionsPerCategory;
        if (questionsPerCategory === 'all') {
            questionsToTake = categoryQuestions.length;
        } else {
            questionsToTake = Math.min(questionsPerCategory, categoryQuestions.length);
        }
        
        // Shuffle questions and take the required number
        const shuffled = shuffleArray([...categoryQuestions]);
        const selectedQuestions = shuffled.slice(0, questionsToTake);
        
        // Add to all selected questions
        allSelectedQuestions = allSelectedQuestions.concat(selectedQuestions);
    });
    
    // Display questions
    allSelectedQuestions.forEach(question => {
        displayQuestion(question);
    });
    
    // Update generated count
    generatedCount += allSelectedQuestions.length;
    generatedTodayEl.textContent = generatedCount;
    questionsCountBadge.textContent = allSelectedQuestions.length;
    
    // Scroll to questions
    questionsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showNotification(`Generated ${allSelectedQuestions.length} questions successfully!`);
}

// Display a single question
function displayQuestion(question) {
    const questionEl = document.createElement('div');
    questionEl.className = 'question-item';
    questionEl.dataset.id = question.id;
    questionEl.dataset.category = question.category;
    
    // Get category display name
    const categoryNames = {
        'chinese': 'Chinese 中文',
        'english': 'English 英文',
        'math': 'Mathematics 數學',
        'science': 'Science 科學',
        'news': 'Current News 時事',
        'creative': 'Creative Thinking 創意思維'
    };
    
    // Check if this question has a saved answer
    const savedAnswer = studentAnswers.find(answer => answer.questionId === question.id);
    
    // Generate unique answer ID for this question
    const answerId = `answer-${question.id}-${Date.now()}`;
    
    questionEl.innerHTML = `
        <div class="question-item-header">
            <div>
                <div class="category">${categoryNames[question.category] || question.category}</div>
                <div class="question-id">ID: ${question.id}</div>
            </div>
            <button class="done-btn" onclick="markQuestionAsDone(${question.id}, '${question.category}', '${question.text.replace(/'/g, "\\'")}', ${question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1}, '${answerId}')">
                <i class="fas fa-check"></i> ${savedAnswer ? 'Answered' : 'Mark as Done'}
            </button>
        </div>
        <div class="text">${question.text}</div>
        
        <div class="question-answer-section">
            <label class="answer-label" for="${answerId}">Your Answer:</label>
            <textarea class="answer-input" id="${answerId}" placeholder="Type your answer here...">${savedAnswer ? savedAnswer.answer : ''}</textarea>
        </div>
        
        <div class="difficulty">Difficulty: ${getDifficultyStars(question.difficulty)}</div>
    `;
    
    questionsContainer.appendChild(questionEl);
}

// Mark a question as done
function markQuestionAsDone(questionId, category, text, difficultyLevel, answerId) {
    // Get the answer text
    const answerInput = document.getElementById(answerId);
    const answerText = answerInput ? answerInput.value.trim() : '';
    
    if (!answerText) {
        showNotification('Please write an answer before marking as done');
        return;
    }
    
    // Find the question element
    const questionElement = document.querySelector(`.question-item[data-id="${questionId}"]`);
    
    if (questionElement) {
        // Mark as completed
        questionElement.classList.add('completed');
        
        // Update the button
        const doneBtn = questionElement.querySelector('.done-btn');
        doneBtn.innerHTML = '<i class="fas fa-check"></i> Answered';
        doneBtn.style.backgroundColor = '#7f8c8d';
        doneBtn.onclick = null;
        
        // Save answer to studentAnswers array
        const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId === questionId);
        
        const answerData = {
            questionId: questionId,
            category: category,
            questionText: text,
            answer: answerText,
            difficulty: difficultyLevel,
            date: getCurrentDate(),
            time: getCurrentTime(),
            timestamp: new Date().toISOString()
        };
        
        if (existingAnswerIndex >= 0) {
            // Update existing answer
            studentAnswers[existingAnswerIndex] = answerData;
        } else {
            // Add new answer
            studentAnswers.push(answerData);
            savedAnswersCount++;
        }
        
        // Save to localStorage
        saveStudentData();
        
        // Update statistics
        savedAnswersEl.textContent = savedAnswersCount;
        
        // Show notification
        showNotification(`Answer saved successfully!`);
    }
}

// Save all answers
function saveAllAnswers() {
    // Collect all answers from textareas
    const answerInputs = document.querySelectorAll('.answer-input');
    let savedCount = 0;
    
    answerInputs.forEach(input => {
        const answerText = input.value.trim();
        if (answerText) {
            // Extract question ID from input ID
            const match = input.id.match(/answer-(\d+)-/);
            if (match) {
                const questionId = parseInt(match[1]);
                
                // Find the question data
                const questionElement = document.querySelector(`.question-item[data-id="${questionId}"]`);
                if (questionElement) {
                    const category = questionElement.dataset.category;
                    
                    // Check if answer already exists
                    const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId === questionId);
                    
                    const answerData = {
                        questionId: questionId,
                        category: category,
                        questionText: questionElement.querySelector('.text').textContent,
                        answer: answerText,
                        date: getCurrentDate(),
                        time: getCurrentTime(),
                        timestamp: new Date().toISOString()
                    };
                    
                    if (existingAnswerIndex >= 0) {
                        // Update existing answer
                        studentAnswers[existingAnswerIndex] = answerData;
                    } else {
                        // Add new answer
                        studentAnswers.push(answerData);
                    }
                    
                    savedCount++;
                }
            }
        }
    });
    
    if (savedCount > 0) {
        // Save to localStorage
        saveStudentData();
        
        // Update statistics
        savedAnswersCount = studentAnswers.length;
        savedAnswersEl.textContent = savedAnswersCount;
        
        showNotification(`Saved ${savedCount} answers successfully!`);
    } else {
        showNotification('No answers to save. Please write answers first.');
    }
}

// Display school details
function displaySchoolDetails(schoolId) {
    const school = schoolsData.schools.find(s => s.id === schoolId);
    
    if (!school) {
        schoolDetails.innerHTML = '<p class="placeholder">School information not found</p>';
        return;
    }
    
    // Get banding class
    const bandingClass = `banding-${school.banding.toLowerCase().replace(' ', '')}`;
    
    // Format target interview date if it exists
    let targetDateHTML = '';
    if (school.targetInterviewDate) {
        const date = new Date(school.targetInterviewDate);
        const formattedDate = date.toLocaleDateString('en-HK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        const daysRemaining = calculateDaysRemaining(school.targetInterviewDate);
        
        // Determine color class based on urgency
        let dateClass = 'date-normal';
        if (daysRemaining.includes('today')) {
            dateClass = 'date-urgent';
        } else if (daysRemaining.includes('passed')) {
            dateClass = 'date-past';
        } else {
            const daysMatch = daysRemaining.match(/\d+/);
            if (daysMatch) {
                const daysNum = parseInt(daysMatch[0]);
                if (daysNum <= 7) dateClass = 'date-urgent';
                else if (daysNum <= 30) dateClass = 'date-near';
            }
        }
        
        targetDateHTML = `
            <div class="school-detail-item">
                <h3>Target Interview Date</h3>
                <p><strong>Scheduled Date:</strong> ${formattedDate}</p>
                <p><strong>Status:</strong> <span class="date-badge ${dateClass}">${daysRemaining}</span></p>
            </div>
        `;
    }
    
    schoolDetails.innerHTML = `
        <div class="school-header-container">
            <div class="school-header-image">
                <img src="${school.image || 'img/default-school.jpg'}" alt="${school.name}" onerror="this.src='img/default-school.jpg'">
            </div>
            <div class="school-header-names">
                <div class="school-english-name">
                    ${school.name}
                    <span class="banding-badge ${bandingClass}">${school.banding}</span>
                </div>
                <div class="school-chinese-name">
                    ${school.chineseName}
                </div>
            </div>
        </div>
        
        ${targetDateHTML}
        
        <div class="school-detail-item">
            <h3>Basic Information</h3>
            <div class="basic-info-grid">
                <div><strong>Type:</strong> ${school.type}</div>
                <div><strong>Religion:</strong> ${school.religion}</div>
                <div><strong>Gender:</strong> ${school.gender}</div>
                <div><strong>District:</strong> ${school.district}</div>
                <div><strong>Medium of Instruction:</strong> ${school.language}</div>
            </div>
        </div>
        
        ${school.schoolMotto || school.chineseMotto ? `
        <div class="school-detail-item">
            <h3>School Motto / 校訓</h3>
            ${school.schoolMotto ? `<p><strong>English:</strong> "${school.schoolMotto}"</p>` : ''}
            ${school.chineseMotto ? `<p><strong>Chinese:</strong> "${school.chineseMotto}"</p>` : ''}
        </div>
        ` : ''}
        
        <div class="school-detail-item">
            <h3>Mission Statement</h3>
            <p>${school.mission}</p>
        </div>
        
        <div class="school-detail-item">
            <h3>Interview Features</h3>
            <p>${school.interviewFeatures}</p>
        </div>
        
        <div class="school-detail-item">
            <h3>Specialties</h3>
            <p>${school.specialty}</p>
        </div>
        
        <div class="school-detail-item">
            <h3>School Details</h3>
            <p><strong>Established:</strong> ${school.established}</p>
            <p><strong>Student Count:</strong> ${school.studentCount}</p>
            ${school.admissionProcess ? `<p><strong>Admission Process:</strong> ${school.admissionProcess}</p>` : ''}
            ${school.tuitionFee ? `<p><strong>Tuition Fee:</strong> ${school.tuitionFee}</p>` : ''}
        </div>
        
        ${school.specificFeatures ? `
        <div class="school-detail-item">
            <h3>Specific Features</h3>
            <p>${school.specificFeatures}</p>
        </div>
        ` : ''}
        
        <div class="school-detail-item">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> ${school.phone}</p>
            <p><strong>Website:</strong> <a href="${school.website}" target="_blank">${school.website}</a></p>
        </div>
    `;
}

// Clear all generated questions
function clearQuestions() {
    questionsContainer.innerHTML = '';
    questionsCountBadge.textContent = '0';
    showNotification('All questions cleared');
}

// Show history log
function showHistory() {
    historyLogCard.style.display = 'block';
    historyLogCard.classList.add('show');
    displayHistory();
}

// Hide history log
function hideHistory() {
    historyLogCard.style.display = 'none';
    historyLogCard.classList.remove('show');
}

// Display history
function displayHistory() {
    if (studentAnswers.length === 0) {
        historyContainer.innerHTML = '<p class="empty-history">No saved answers yet. Answer some questions to see your history here.</p>';
        return;
    }
    
    historyContainer.innerHTML = '';
    
    // Group answers by date
    const answersByDate = {};
    studentAnswers.forEach(answer => {
        if (!answersByDate[answer.date]) {
            answersByDate[answer.date] = [];
        }
        answersByDate[answer.date].push(answer);
    });
    
    // Display answers grouped by date (most recent first)
    const sortedDates = Object.keys(answersByDate).sort((a, b) => new Date(b) - new Date(a));
    
    sortedDates.forEach(date => {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = date;
        dateHeader.style.marginTop = '20px';
        dateHeader.style.marginBottom = '10px';
        dateHeader.style.color = '#2c3e50';
        historyContainer.appendChild(dateHeader);
        
        answersByDate[date].forEach(answer => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const difficultyStars = '★'.repeat(answer.difficulty) + '☆'.repeat(3 - answer.difficulty);
            const categoryNames = {
                'chinese': 'Chinese',
                'english': 'English',
                'math': 'Mathematics',
                'science': 'Science',
                'news': 'Current News',
                'creative': 'Creative Thinking'
            };
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-category">${categoryNames[answer.category] || answer.category}</div>
                    <div class="history-date">${answer.time}</div>
                </div>
                <div class="history-question">${answer.questionText}</div>
                <div class="history-answer"><strong>Your Answer:</strong> ${answer.answer}</div>
                <div class="history-meta">
                    <span>Difficulty: ${difficultyStars}</span>
                    <span>Question ID: ${answer.questionId}</span>
                </div>
            `;
            
            historyContainer.appendChild(historyItem);
        });
    });
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all saved answers? This action cannot be undone.')) {
        studentAnswers = [];
        savedAnswersCount = 0;
        localStorage.removeItem('studentAnswers');
        savedAnswersEl.textContent = '0';
        displayHistory();
        showNotification('All saved answers cleared');
    }
}

// Download answers as JSON file
function downloadAnswers() {
    if (studentAnswers.length === 0) {
        showNotification('No answers to download');
        return;
    }
    
    const studentData = {
        generatedAt: new Date().toISOString(),
        totalAnswers: studentAnswers.length,
        answers: studentAnswers
    };
    
    const dataStr = JSON.stringify(studentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `student-answers-${getCurrentDate()}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    showNotification('Answers downloaded successfully!');
}

// Load answers from file
function loadAnswersFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const loadedData = JSON.parse(e.target.result);
                
                if (loadedData.answers && Array.isArray(loadedData.answers)) {
                    // Merge loaded answers with existing ones
                    loadedData.answers.forEach(loadedAnswer => {
                        const existingIndex = studentAnswers.findIndex(
                            answer => answer.questionId === loadedAnswer.questionId
                        );
                        
                        if (existingIndex >= 0) {
                            // Update existing answer
                            studentAnswers[existingIndex] = loadedAnswer;
                        } else {
                            // Add new answer
                            studentAnswers.push(loadedAnswer);
                        }
                    });
                    
                    // Update statistics
                    savedAnswersCount = studentAnswers.length;
                    savedAnswersEl.textContent = savedAnswersCount;
                    
                    // Save to localStorage
                    saveStudentData();
                    
                    // Update display
                    displayHistory();
                    
                    showNotification(`Loaded ${loadedData.answers.length} answers successfully!`);
                } else {
                    showNotification('Invalid file format');
                }
            } catch (error) {
                console.error('Error loading file:', error);
                showNotification('Error loading file. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Update statistics
function updateStatistics() {
    if (schoolsData.schools) {
        totalSchoolsEl.textContent = schoolsData.schools.length;
    }
    
    // Calculate total questions
    let totalQuestions = 0;
    Object.keys(questionsData).forEach(category => {
        totalQuestions += questionsData[category].length;
    });
    totalQuestionsEl.textContent = totalQuestions;
    
    generatedTodayEl.textContent = generatedCount;
    savedAnswersEl.textContent = savedAnswersCount;
}

// Utility functions
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function calculateDaysRemaining(targetDateStr) {
    const targetDate = new Date(targetDateStr);
    const today = new Date();
    
    // Reset hours to compare only dates
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
        return `${diffDays} days remaining`;
    } else if (diffDays === 0) {
        return "Interview is today!";
    } else {
        return `Interview passed ${Math.abs(diffDays)} days ago`;
    }
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Get star representation of difficulty
function getDifficultyStars(difficulty) {
    const stars = {
        'easy': '★☆☆',
        'medium': '★★☆',
        'hard': '★★★'
    };
    
    return stars[difficulty] || difficulty;
}

// Show notification
function showNotification(message) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
    const notificationEl = document.createElement('div');
    notificationEl.className = 'notification';
    notificationEl.textContent = message;
    document.body.appendChild(notificationEl);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notificationEl.parentNode) {
            notificationEl.parentNode.removeChild(notificationEl);
        }
    }, 3000);
}

// Show error message
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
        border: 1px solid #f5c6cb;
    `;
    errorEl.textContent = `Error: ${message}`;
    
    document.querySelector('.container').prepend(errorEl);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        if (errorEl.parentNode) {
            errorEl.parentNode.removeChild(errorEl);
        }
    }, 5000);
}
