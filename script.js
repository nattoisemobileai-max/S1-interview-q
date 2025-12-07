// Enhanced script.js with Duolingo-style features

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
let selectedCategories = [];
let questionsPerCategory = 5;
let generatedCount = 0;
let savedAnswersCount = 0;
let currentQuestionData = null;

// DOM elements
const questionsContainer = document.getElementById('questions-container');
const schoolSelect = document.getElementById('school-select');
const schoolDetails = document.getElementById('school-details');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const viewHistoryBtn = document.getElementById('view-history-btn');
const closeHistoryBtn = document.getElementById('close-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const downloadHistoryBtn = document.getElementById('download-history-btn');
const historyLogCard = document.getElementById('history-log-card');
const historyContainer = document.getElementById('history-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const countButtons = document.querySelectorAll('.count-btn');

// Modal elements
const answerModal = document.getElementById('answer-modal');
const modalCloseBtn = document.querySelector('.modal-close');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalSaveBtn = document.getElementById('modal-save-btn');
const modalSaveDoneBtn = document.getElementById('modal-save-done-btn');
const modalAnswerInput = document.getElementById('modal-answer-input');
const modalCategory = document.getElementById('modal-category');
const modalQuestionText = document.getElementById('modal-question-text');
const modalQuestionId = document.getElementById('modal-question-id');
const modalExampleAnswer = document.getElementById('modal-example-answer');

// Statistics elements
const totalSchoolsEl = document.getElementById('total-schools');
const totalQuestionsEl = document.getElementById('total-questions');
const generatedTodayEl = document.getElementById('generated-today');
const savedAnswersEl = document.getElementById('saved-answers');
const questionsCountBadge = document.getElementById('questions-count-badge');

// New Elements for Duolingo-style features
const studentNameEl = document.getElementById('student-name');
const studentProgressEl = document.getElementById('student-progress');
const studentLevelEl = document.getElementById('student-level');
const streakCounterEl = document.getElementById('streak-counter');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadStudentData();
    setupEventListeners();
    updateStatistics();
    setDefaultSelections();
    initializeStudentProfile();
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

// Initialize student profile
function initializeStudentProfile() {
    const studentName = localStorage.getItem('studentName') || 'Interview Candidate';
    const studentStreak = localStorage.getItem('studentStreak') || '0';
    const studentLevel = localStorage.getItem('studentLevel') || '1';
    const studentProgress = localStorage.getItem('studentProgress') || '0';
    
    studentNameEl.textContent = studentName;
    streakCounterEl.textContent = studentStreak;
    studentLevelEl.textContent = `Level ${studentLevel}`;
    studentProgressEl.textContent = `${studentProgress}%`;
    
    // Update progress bar width
    studentProgressEl.parentElement.style.width = `${studentProgress}%`;
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
    selectedCategories = ['all'];
    
    // 5 count button is active by default
    const countBtn5 = document.querySelector('.count-btn[data-count="5"]');
    if (countBtn5) countBtn5.classList.add('active');
    questionsPerCategory = 5;
}

// Setup event listeners
function setupEventListeners() {
    // Category buttons - Duolingo style: single selection
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Remove active class from all category buttons
            categoryButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set selected category
            if (category === 'all') {
                selectedCategories = ['all'];
            } else {
                selectedCategories = [category];
            }
        });
    });
    
    // Count buttons
    countButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const count = this.dataset.count;
            
            // Remove active class from all count buttons
            countButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set questions per category
            if (count === 'all') {
                questionsPerCategory = 'all';
            } else {
                questionsPerCategory = parseInt(count);
            }
        });
    });
    
    // Generate button
    generateBtn.addEventListener('click', generateQuestions);
    
    // Clear button
    clearBtn.addEventListener('click', clearQuestions);
    
    // View history button
    viewHistoryBtn.addEventListener('click', showHistory);
    
    // Close history button
    closeHistoryBtn.addEventListener('click', hideHistory);
    
    // Clear history button
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Download history button
    downloadHistoryBtn.addEventListener('click', downloadAnswers);
    
    // School select dropdown
    schoolSelect.addEventListener('change', function() {
        const schoolId = parseInt(this.value);
        if (schoolId) {
            displaySchoolDetails(schoolId);
        } else {
            schoolDetails.innerHTML = '<p class="placeholder">Select a school from the dropdown to view detailed information</p>';
        }
    });
    
    // Modal event listeners
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalSaveBtn.addEventListener('click', saveAnswer);
    modalSaveDoneBtn.addEventListener('click', saveAnswerAndMarkDone);
    
    // Close modal when clicking outside
    answerModal.addEventListener('click', function(e) {
        if (e.target === answerModal) {
            closeModal();
        }
    });
}

// Generate questions based on selected categories - FIXED
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
    
    // Update streak
    updateStreak();
    
    // Scroll to questions
    questionsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showNotification(`Generated ${allSelectedQuestions.length} questions successfully!`);
}

// Display a single question with Duolingo-style interface
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
    const isCompleted = savedAnswer && savedAnswer.completed;
    
    if (isCompleted) {
        questionEl.classList.add('completed');
    }
    
    // Truncate answer preview if too long
    let answerPreview = '';
    if (savedAnswer && savedAnswer.answer) {
        const truncatedAnswer = savedAnswer.answer.length > 200 
            ? savedAnswer.answer.substring(0, 200) + '...' 
            : savedAnswer.answer;
        answerPreview = `
            <div class="answer-preview">
                <p><strong>Your Answer:</strong> ${truncatedAnswer}</p>
                <button class="edit-answer-btn" onclick="openAnswerModal(${question.id}, '${question.category}', '${question.text.replace(/'/g, "\\'")}', ${question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
        `;
    }
    
    questionEl.innerHTML = `
        <div class="question-item-header">
            <div class="question-header-left">
                <div class="category-badge ${question.category}">${categoryNames[question.category] || question.category}</div>
                <div class="question-id">ID: ${question.id}</div>
                <div class="difficulty-badge difficulty-${question.difficulty}">${question.difficulty}</div>
            </div>
            <div class="question-header-right">
                <button class="done-btn ${isCompleted ? 'completed' : ''}" onclick="markQuestionAsDone(${question.id})">
                    <i class="fas fa-check"></i> ${isCompleted ? 'Completed' : 'Mark as Done'}
                </button>
            </div>
        </div>
        
        <div class="text">${question.text}</div>
        
        ${answerPreview}
        
        <div class="answer-section">
            <div class="answer-label">Your Answer:</div>
            <textarea class="student-answer-input" placeholder="Type your answer here..." rows="3" data-question-id="${question.id}">${savedAnswer ? savedAnswer.answer : ''}</textarea>
            <div class="answer-actions">
                <button class="answer-save-btn" onclick="saveQuickAnswer(${question.id})">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="answer-modal-btn" onclick="openAnswerModal(${question.id}, '${question.category}', '${question.text.replace(/'/g, "\\'")}', ${question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1})">
                    <i class="fas fa-expand"></i> Full Editor
                </button>
                ${question.modal_answer ? `
                <button class="hint-btn" onclick="showModalAnswer(${question.id})">
                    <i class="fas fa-lightbulb"></i> See Example Answer
                </button>
                ` : ''}
            </div>
        </div>
        
        <div class="question-footer">
            <div class="xp-badge">+${question.difficulty === 'hard' ? '30' : question.difficulty === 'medium' ? '20' : '10'} XP</div>
            <div class="time-estimate">${question.difficulty === 'hard' ? '5-7 min' : question.difficulty === 'medium' ? '3-5 min' : '1-3 min'}</div>
        </div>
    `;
    
    questionsContainer.appendChild(questionEl);
}

// Open answer modal with example answer
function openAnswerModal(questionId, category, text, difficultyLevel) {
    // Find the question to get modal_answer
    const question = findQuestionById(questionId, category);
    
    // Store current question data
    currentQuestionData = {
        id: questionId,
        category: category,
        text: text,
        difficulty: difficultyLevel,
        modal_answer: question ? question.modal_answer : null
    };
    
    // Get category display name
    const categoryNames = {
        'chinese': 'Chinese 中文',
        'english': 'English 英文',
        'math': 'Mathematics 數學',
        'science': 'Science 科學',
        'news': 'Current News 時事',
        'creative': 'Creative Thinking 創意思維'
    };
    
    // Update modal content
    modalCategory.textContent = categoryNames[category] || category;
    modalQuestionText.textContent = text;
    modalQuestionId.textContent = questionId;
    
    // Update example answer if available
    if (currentQuestionData.modal_answer) {
        modalExampleAnswer.innerHTML = `
            <h4>Example Answer:</h4>
            <div class="example-answer-content">${currentQuestionData.modal_answer}</div>
        `;
        modalExampleAnswer.style.display = 'block';
    } else {
        modalExampleAnswer.style.display = 'none';
    }
    
    // Check for existing answer
    const savedAnswer = studentAnswers.find(answer => answer.questionId === questionId);
    if (savedAnswer) {
        modalAnswerInput.value = savedAnswer.answer;
    } else {
        modalAnswerInput.value = '';
    }
    
    // Show modal
    answerModal.classList.add('show');
    modalAnswerInput.focus();
}

// Find question by ID and category
function findQuestionById(questionId, category) {
    const questions = questionsData[category];
    if (!questions) return null;
    
    if (category === 'chinese') {
        return questions.find(q => q.id === `CHI-${String(questionId).padStart(4, '0')}`);
    } else if (category === 'english') {
        return questions.find(q => q.id === questionId);
    } else {
        return questions.find(q => q.id == questionId);
    }
}

// Show modal answer in a toast
function showModalAnswer(questionId) {
    const question = findQuestionById(questionId, 'chinese');
    if (!question || !question.modal_answer) return;
    
    const modalAnswerToast = document.createElement('div');
    modalAnswerToast.className = 'modal-answer-toast';
    modalAnswerToast.innerHTML = `
        <div class="modal-answer-header">
            <h4><i class="fas fa-lightbulb"></i> Example Answer</h4>
            <button class="close-toast" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
        <div class="modal-answer-content">${question.modal_answer}</div>
        <div class="modal-answer-note">This is just an example. Your answer can be different!</div>
    `;
    
    document.body.appendChild(modalAnswerToast);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (modalAnswerToast.parentElement) {
            modalAnswerToast.parentElement.removeChild(modalAnswerToast);
        }
    }, 10000);
}

// Save answer from quick input
function saveQuickAnswer(questionId) {
    const textarea = document.querySelector(`.student-answer-input[data-question-id="${questionId}"]`);
    const answerText = textarea.value.trim();
    
    if (!answerText) {
        showNotification('Please write an answer before saving');
        return;
    }
    
    // Find question to get category and text
    let question = null;
    let category = null;
    
    // Search through all categories
    for (const cat in questionsData) {
        const found = questionsData[cat].find(q => {
            if (cat === 'chinese') {
                return q.id === `CHI-${String(questionId).padStart(4, '0')}`;
            } else if (cat === 'english') {
                return q.id === questionId;
            } else {
                return q.id == questionId;
            }
        });
        
        if (found) {
            question = found;
            category = cat;
            break;
        }
    }
    
    if (!question) {
        showNotification('Question not found');
        return;
    }
    
    const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId === questionId);
    
    const answerData = {
        questionId: questionId,
        category: category,
        questionText: question.text,
        answer: answerText,
        difficulty: question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1,
        completed: existingAnswerIndex >= 0 ? studentAnswers[existingAnswerIndex].completed : false,
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
    
    // Update question display
    updateQuestionDisplay(questionId);
    
    // Update streak and progress
    updateStreak();
    updateProgress();
    
    // Show success animation
    const saveBtn = document.querySelector(`.answer-save-btn[onclick="saveQuickAnswer(${questionId})"]`);
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    saveBtn.style.backgroundColor = '#2ecc71';
    
    setTimeout(() => {
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        saveBtn.style.backgroundColor = '';
    }, 2000);
    
    showNotification(`Answer saved successfully! +${answerData.difficulty * 10} XP`);
}

// Close modal
function closeModal() {
    answerModal.classList.remove('show');
    currentQuestionData = null;
    modalAnswerInput.value = '';
}

// Save answer from modal
function saveAnswer() {
    if (!currentQuestionData) return;
    
    const answerText = modalAnswerInput.value.trim();
    if (!answerText) {
        showNotification('Please write an answer before saving');
        return;
    }
    
    const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId === currentQuestionData.id);
    
    const answerData = {
        questionId: currentQuestionData.id,
        category: currentQuestionData.category,
        questionText: currentQuestionData.text,
        answer: answerText,
        difficulty: currentQuestionData.difficulty,
        completed: existingAnswerIndex >= 0 ? studentAnswers[existingAnswerIndex].completed : false,
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
    
    // Update question display
    updateQuestionDisplay(currentQuestionData.id);
    
    // Update streak and progress
    updateStreak();
    updateProgress();
    
    // Close modal
    closeModal();
    
    // Show notification
    showNotification(`Answer saved successfully! +${currentQuestionData.difficulty * 10} XP`);
}

// Save answer and mark as done
function saveAnswerAndMarkDone() {
    if (!currentQuestionData) return;
    
    const answerText = modalAnswerInput.value.trim();
    if (!answerText) {
        showNotification('Please write an answer before saving');
        return;
    }
    
    const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId === currentQuestionData.id);
    
    const answerData = {
        questionId: currentQuestionData.id,
        category: currentQuestionData.category,
        questionText: currentQuestionData.text,
        answer: answerText,
        difficulty: currentQuestionData.difficulty,
        completed: true,
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
    
    // Update question display
    updateQuestionDisplay(currentQuestionData.id);
    
    // Update streak and progress
    updateStreak();
    updateProgress();
    
    // Close modal
    closeModal();
    
    // Show notification
    showNotification(`Answer saved and marked as completed! +${currentQuestionData.difficulty * 15} XP`);
}

// Update streak
function updateStreak() {
    let streak = parseInt(localStorage.getItem('studentStreak') || '0');
    const lastPracticeDate = localStorage.getItem('lastPracticeDate');
    const today = getCurrentDate();
    
    if (lastPracticeDate !== today) {
        streak++;
        localStorage.setItem('studentStreak', streak.toString());
        localStorage.setItem('lastPracticeDate', today);
        streakCounterEl.textContent = streak;
        
        // Show streak animation
        if (streak > 1) {
            showNotification(`🔥 ${streak}-day streak! Keep it up!`);
        }
    }
}

// Update progress
function updateProgress() {
    const totalAnswers = studentAnswers.length;
    const completedAnswers = studentAnswers.filter(answer => answer.completed).length;
    
    // Calculate progress percentage (max 100%)
    const progress = Math.min(100, Math.round((completedAnswers / Math.max(1, totalAnswers)) * 100));
    
    // Calculate level based on XP (10 XP per question difficulty)
    let totalXP = 0;
    studentAnswers.forEach(answer => {
        totalXP += answer.completed ? answer.difficulty * 15 : answer.difficulty * 10;
    });
    
    const level = Math.floor(totalXP / 1000) + 1;
    const levelProgress = totalXP % 1000;
    
    localStorage.setItem('studentProgress', progress.toString());
    localStorage.setItem('studentLevel', level.toString());
    
    studentProgressEl.textContent = `${progress}%`;
    studentLevelEl.textContent = `Level ${level}`;
    
    // Update progress bar width
    studentProgressEl.parentElement.style.width = `${progress}%`;
}

// Update question display after saving answer
function updateQuestionDisplay(questionId) {
    const questionElement = document.querySelector(`.question-item[data-id="${questionId}"]`);
    if (!questionElement) return;
    
    // Get saved answer
    const savedAnswer = studentAnswers.find(answer => answer.questionId === questionId);
    
    // Update answer textarea
    const textarea = questionElement.querySelector('.student-answer-input');
    if (textarea && savedAnswer) {
        textarea.value = savedAnswer.answer;
    }
    
    // Update done button
    const doneBtn = questionElement.querySelector('.done-btn');
    if (doneBtn) {
        if (savedAnswer && savedAnswer.completed) {
            doneBtn.classList.add('completed');
            doneBtn.innerHTML = '<i class="fas fa-check"></i> Completed';
            doneBtn.style.backgroundColor = '#2ecc71';
        } else {
            doneBtn.classList.remove('completed');
            doneBtn.innerHTML = '<i class="fas fa-check"></i> Mark as Done';
            doneBtn.style.backgroundColor = '';
        }
    }
    
    // Add/update answer preview
    let answerPreview = questionElement.querySelector('.answer-preview');
    if (savedAnswer && savedAnswer.answer) {
        const truncatedAnswer = savedAnswer.answer.length > 200 
            ? savedAnswer.answer.substring(0, 200) + '...' 
            : savedAnswer.answer;
        
        if (answerPreview) {
            answerPreview.innerHTML = `
                <p><strong>Your Answer:</strong> ${truncatedAnswer}</p>
                <button class="edit-answer-btn" onclick="openAnswerModal(${questionId}, '${savedAnswer.category}', '${savedAnswer.questionText.replace(/'/g, "\\'")}', ${savedAnswer.difficulty})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            `;
        } else {
            answerPreview = document.createElement('div');
            answerPreview.className = 'answer-preview';
            answerPreview.innerHTML = `
                <p><strong>Your Answer:</strong> ${truncatedAnswer}</p>
                <button class="edit-answer-btn" onclick="openAnswerModal(${questionId}, '${savedAnswer.category}', '${savedAnswer.questionText.replace(/'/g, "\\'")}', ${savedAnswer.difficulty})">
                    <i class="fas fa-edit"></i> Edit
                </button>
            `;
            
            // Insert after question text
            const questionText = questionElement.querySelector('.text');
            if (questionText && questionText.nextSibling) {
                questionElement.insertBefore(answerPreview, questionText.nextSibling);
            }
        }
    } else if (answerPreview) {
        answerPreview.remove();
    }
    
    // Update completed styling
    if (savedAnswer && savedAnswer.completed) {
        questionElement.classList.add('completed');
    } else {
        questionElement.classList.remove('completed');
    }
}

// Mark a question as done
function markQuestionAsDone(questionId) {
    // Find the answer
    const answerIndex = studentAnswers.findIndex(answer => answer.questionId === questionId);
    
    if (answerIndex >= 0) {
        // Toggle completed status
        studentAnswers[answerIndex].completed = !studentAnswers[answerIndex].completed;
        
        // Save to localStorage
        saveStudentData();
        
        // Update question display
        updateQuestionDisplay(questionId);
        
        // Update progress
        updateProgress();
        
        // Show notification
        const status = studentAnswers[answerIndex].completed ? 'marked as completed' : 'marked as incomplete';
        showNotification(`Question ${status}!`);
    } else {
        showNotification('Please save an answer first before marking as done');
    }
}

// Display school details
function displaySchoolDetails(schoolId) {
    // ... (keep existing displaySchoolDetails function as is)
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
    // ... (keep existing displayHistory function as is)
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all saved answers? This action cannot be undone.')) {
        studentAnswers = [];
        savedAnswersCount = 0;
        localStorage.removeItem('studentAnswers');
        savedAnswersEl.textContent = '0';
        displayHistory();
        updateProgress();
        showNotification('All saved answers cleared');
    }
}

// Download answers as JSON file
function downloadAnswers() {
    // ... (keep existing downloadAnswers function as is)
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

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    // ... (keep existing showError function as is)
}
