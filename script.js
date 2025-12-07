// Enhanced script.js with Duolingo-style features and complete functionality

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
let questionsPerCategory = 5;
let generatedCount = 0;
let savedAnswersCount = 0;
let currentQuestionData = null;
let studentXP = 0;

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
const saveAllBtn = document.getElementById('save-all-btn');

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
const modalCharacterCount = document.getElementById('modal-character-count');

// Student profile elements
const studentNameEl = document.getElementById('student-name');
const studentProgressEl = document.getElementById('student-progress');
const studentLevelEl = document.getElementById('student-level');
const streakCounterEl = document.getElementById('streak-counter');
const savedAnswersEl = document.getElementById('saved-answers');
const totalXPEl = document.getElementById('total-xp');

// Statistics elements
const totalSchoolsEl = document.getElementById('total-schools');
const totalQuestionsEl = document.getElementById('total-questions');
const generatedTodayEl = document.getElementById('generated-today');
const completedTodayEl = document.getElementById('completed-today');
const questionsCountBadge = document.getElementById('questions-count-badge');

// Example toast element
const exampleToast = document.getElementById('example-toast');
const exampleToastBody = document.getElementById('example-toast-body');
const closeExampleToastBtn = document.querySelector('.close-example-toast');

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
    
    // Load student XP
    const xp = localStorage.getItem('studentXP');
    if (xp) {
        studentXP = parseInt(xp);
        totalXPEl.textContent = studentXP;
    }
}

// Save student data to localStorage
function saveStudentData() {
    localStorage.setItem('studentAnswers', JSON.stringify(studentAnswers));
    localStorage.setItem('studentXP', studentXP.toString());
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
    
    // Update progress bar width
    const progressBar = studentProgressEl;
    progressBar.style.width = `${studentProgress}%`;
    
    // Update completed today count
    updateCompletedToday();
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
    // Category buttons
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
            schoolDetails.innerHTML = '<div class="empty-state"><i class="fas fa-university fa-3x"></i><p>Select a school from the dropdown to view detailed information</p></div>';
        }
    });
    
    // Modal event listeners
    modalCancelBtn.addEventListener('click', closeModal);
    modalSaveBtn.addEventListener('click', saveAnswer);
    modalSaveDoneBtn.addEventListener('click', saveAnswerAndMarkDone);
    
    // Modal answer input character count
    modalAnswerInput.addEventListener('input', function() {
        modalCharacterCount.textContent = this.value.length;
    });
    
    // Close modal when clicking outside (handled by Bootstrap)
    
    // Example toast close button
    closeExampleToastBtn.addEventListener('click', hideExampleToast);
    
    // Close example toast when clicking outside
    exampleToast.addEventListener('click', function(e) {
        if (e.target === this) {
            hideExampleToast();
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
    const savedAnswer = studentAnswers.find(answer => {
        if (question.category === 'chinese') {
            return answer.questionId === question.id;
        } else {
            return answer.questionId == question.id;
        }
    });
    const isCompleted = savedAnswer && savedAnswer.completed;
    
    if (isCompleted) {
        questionEl.classList.add('completed');
    }
    
    // Calculate XP for this question
    const xpValue = question.difficulty === 'hard' ? 30 : question.difficulty === 'medium' ? 20 : 10;
    
    questionEl.innerHTML = `
        <div class="question-item-header">
            <div class="question-header-left">
                <div class="category-badge ${question.category}">${categoryNames[question.category] || question.category}</div>
                <div class="question-id">ID: ${question.id}</div>
                <div class="difficulty-badge difficulty-${question.difficulty}">${question.difficulty}</div>
            </div>
            <div class="question-header-right">
                <button class="done-btn ${isCompleted ? 'completed' : ''}" onclick="markQuestionAsDone('${question.id}')">
                    <i class="fas fa-check"></i> ${isCompleted ? 'Completed' : 'Mark as Done'}
                </button>
            </div>
        </div>
        
        <div class="question-text">${question.text}</div>
        
        ${savedAnswer ? `
        <div class="answer-preview">
            <p><strong>Your Answer:</strong> ${savedAnswer.answer.length > 150 ? savedAnswer.answer.substring(0, 150) + '...' : savedAnswer.answer}</p>
            <button class="edit-answer-btn" onclick="openAnswerModal('${question.id}', '${question.category}', '${question.text.replace(/'/g, "\\'")}', '${question.difficulty}')">
                <i class="fas fa-edit"></i> Edit
            </button>
        </div>
        ` : ''}
        
        <div class="answer-section">
            <div class="answer-header">
                <div class="answer-label">
                    <i class="fas fa-pencil-alt"></i>
                    Your Answer
                </div>
                <div class="character-count" data-question-id="${question.id}">
                    ${savedAnswer ? savedAnswer.answer.length : 0} characters
                </div>
            </div>
            
            <textarea class="student-answer-input" 
                      placeholder="Type your answer here..." 
                      rows="3" 
                      data-question-id="${question.id}"
                      oninput="updateCharacterCount(this)">${savedAnswer ? savedAnswer.answer : ''}</textarea>
            
            <div class="answer-actions">
                <button class="answer-save-btn" onclick="saveQuickAnswer('${question.id}', '${question.category}', '${question.text.replace(/'/g, "\\'")}', '${question.difficulty}')">
                    <i class="fas fa-save"></i> Save Answer
                </button>
                <button class="answer-modal-btn" onclick="openAnswerModal('${question.id}', '${question.category}', '${question.text.replace(/'/g, "\\'")}', '${question.difficulty}')">
                    <i class="fas fa-expand-alt"></i> Full Editor
                </button>
                ${question.modal_answer ? `
                <button class="hint-btn" onclick="showExampleAnswer('${question.id}')">
                    <i class="fas fa-lightbulb"></i> Example Answer
                </button>
                ` : ''}
            </div>
        </div>
        
        <div class="question-footer">
            <div class="xp-badge">+${xpValue} XP</div>
            <div class="time-estimate">${question.difficulty === 'hard' ? '5-7 min' : question.difficulty === 'medium' ? '3-5 min' : '1-3 min'}</div>
        </div>
    `;
    
    questionsContainer.appendChild(questionEl);
}

// Open answer modal
function openAnswerModal(questionId, category, text, difficulty) {
    // Find the question to get modal_answer
    const question = findQuestionById(questionId, category);
    
    // Store current question data
    currentQuestionData = {
        id: questionId,
        category: category,
        text: text,
        difficulty: difficulty,
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
            <h6><i class="fas fa-lightbulb"></i> Example Answer:</h6>
            <div class="example-answer-content">${currentQuestionData.modal_answer}</div>
        `;
        modalExampleAnswer.style.display = 'block';
    } else {
        modalExampleAnswer.style.display = 'none';
    }
    
    // Check for existing answer
    const savedAnswer = studentAnswers.find(answer => answer.questionId == questionId);
    if (savedAnswer) {
        modalAnswerInput.value = savedAnswer.answer;
    } else {
        modalAnswerInput.value = '';
    }
    
    // Update character count
    modalCharacterCount.textContent = modalAnswerInput.value.length;
    
    // Show modal using Bootstrap
    const modal = new bootstrap.Modal(answerModal);
    modal.show();
    
    // Focus on textarea
    setTimeout(() => modalAnswerInput.focus(), 500);
}

// Find question by ID and category
function findQuestionById(questionId, category) {
    const questions = questionsData[category];
    if (!questions) return null;
    
    return questions.find(q => q.id == questionId || q.id === questionId);
}

// Show example answer in toast
function showExampleAnswer(questionId) {
    // Find the question
    let question = null;
    for (const category in questionsData) {
        question = questionsData[category].find(q => q.id == questionId || q.id === questionId);
        if (question) break;
    }
    
    if (!question || !question.modal_answer) {
        showNotification('No example answer available for this question');
        return;
    }
    
    // Update toast content
    exampleToastBody.innerHTML = `
        <div class="question-preview">
            <strong>Question:</strong> ${question.text}
        </div>
        <div class="answer-preview">
            <strong>Example Answer:</strong><br>
            ${question.modal_answer}
        </div>
    `;
    
    // Show toast
    exampleToast.classList.add('show');
    
    // Auto-hide after 15 seconds
    setTimeout(hideExampleToast, 15000);
}

// Hide example toast
function hideExampleToast() {
    exampleToast.classList.remove('show');
}

// Save answer from quick input
function saveQuickAnswer(questionId, category, text, difficulty) {
    const textarea = document.querySelector(`.student-answer-input[data-question-id="${questionId}"]`);
    if (!textarea) {
        console.error('Textarea not found for question:', questionId);
        return;
    }
    
    const answerText = textarea.value.trim();
    const saveBtn = textarea.parentElement.querySelector('.answer-save-btn');
    
    if (!answerText) {
        showNotification('Please write an answer before saving');
        if (saveBtn) {
            saveBtn.classList.add('shake');
            setTimeout(() => saveBtn.classList.remove('shake'), 500);
        }
        return;
    }
    
    const difficultyLevel = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
    const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId == questionId);
    
    const answerData = {
        questionId: questionId,
        category: category,
        questionText: text,
        answer: answerText,
        difficulty: difficultyLevel,
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
    
    // Add XP
    addXP(difficultyLevel * 10);
    
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
    if (saveBtn) {
        saveBtn.classList.add('saved');
        const originalHTML = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveBtn.style.cursor = 'default';
        
        // Disable button temporarily
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.classList.remove('saved');
            saveBtn.innerHTML = originalHTML;
            saveBtn.disabled = false;
            saveBtn.style.cursor = 'pointer';
        }, 2000);
    }
    
    showNotification(`Answer saved successfully! +${difficultyLevel * 10} XP`);
}

// Update character count for textareas
function updateCharacterCount(textarea) {
    const count = textarea.value.length;
    const countElement = textarea.parentElement.querySelector('.character-count');
    if (countElement) {
        countElement.textContent = `${count} characters`;
        
        // Change color based on length
        if (count < 10) {
            countElement.style.color = '#e74c3c';
        } else if (count < 50) {
            countElement.style.color = '#e67e22';
        } else {
            countElement.style.color = '#27ae60';
        }
    }
}

// Close modal
function closeModal() {
    const modal = bootstrap.Modal.getInstance(answerModal);
    if (modal) modal.hide();
}

// Save answer from modal
function saveAnswer() {
    if (!currentQuestionData) return;
    
    const answerText = modalAnswerInput.value.trim();
    if (!answerText) {
        showNotification('Please write an answer before saving');
        return;
    }
    
    const difficultyLevel = currentQuestionData.difficulty === 'hard' ? 3 : currentQuestionData.difficulty === 'medium' ? 2 : 1;
    const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId == currentQuestionData.id);
    
    const answerData = {
        questionId: currentQuestionData.id,
        category: currentQuestionData.category,
        questionText: currentQuestionData.text,
        answer: answerText,
        difficulty: difficultyLevel,
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
    
    // Add XP
    addXP(difficultyLevel * 10);
    
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
    showNotification(`Answer saved successfully! +${difficultyLevel * 10} XP`);
}

// Save answer and mark as done
function saveAnswerAndMarkDone() {
    if (!currentQuestionData) return;
    
    const answerText = modalAnswerInput.value.trim();
    if (!answerText) {
        showNotification('Please write an answer before saving');
        return;
    }
    
    const difficultyLevel = currentQuestionData.difficulty === 'hard' ? 3 : currentQuestionData.difficulty === 'medium' ? 2 : 1;
    const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId == currentQuestionData.id);
    
    const answerData = {
        questionId: currentQuestionData.id,
        category: currentQuestionData.category,
        questionText: currentQuestionData.text,
        answer: answerText,
        difficulty: difficultyLevel,
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
    
    // Add XP for completion
    addXP(difficultyLevel * 15);
    
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
    showNotification(`Answer saved and marked as completed! +${difficultyLevel * 15} XP`);
}

// Save all answers
function saveAllAnswers() {
    const textareas = document.querySelectorAll('.student-answer-input');
    let savedCount = 0;
    
    textareas.forEach(textarea => {
        const questionId = textarea.dataset.questionId;
        const questionElement = document.querySelector(`.question-item[data-id="${questionId}"]`);
        
        if (!questionElement) return;
        
        const category = questionElement.dataset.category;
        const questionText = questionElement.querySelector('.question-text').textContent;
        const difficulty = questionElement.querySelector('.difficulty-badge').className.includes('hard') ? 'hard' : 
                          questionElement.querySelector('.difficulty-badge').className.includes('medium') ? 'medium' : 'easy';
        
        const answerText = textarea.value.trim();
        
        if (answerText) {
            const difficultyLevel = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
            const existingAnswerIndex = studentAnswers.findIndex(answer => answer.questionId == questionId);
            
            const answerData = {
                questionId: questionId,
                category: category,
                questionText: questionText,
                answer: answerText,
                difficulty: difficultyLevel,
                completed: existingAnswerIndex >= 0 ? studentAnswers[existingAnswerIndex].completed : false,
                date: getCurrentDate(),
                time: getCurrentTime(),
                timestamp: new Date().toISOString()
            };
            
            if (existingAnswerIndex >= 0) {
                studentAnswers[existingAnswerIndex] = answerData;
            } else {
                studentAnswers.push(answerData);
                savedAnswersCount++;
            }
            
            addXP(difficultyLevel * 10);
            savedCount++;
        }
    });
    
    if (savedCount > 0) {
        saveStudentData();
        savedAnswersEl.textContent = savedAnswersCount;
        updateProgress();
        showNotification(`Saved ${savedCount} answers! +${savedCount * 10} XP`);
    } else {
        showNotification('No answers to save');
    }
}

// Add XP to student
function addXP(amount) {
    studentXP += amount;
    totalXPEl.textContent = studentXP;
    localStorage.setItem('studentXP', studentXP.toString());
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
    
    // Calculate level based on XP
    const level = Math.floor(studentXP / 1000) + 1;
    
    localStorage.setItem('studentProgress', progress.toString());
    localStorage.setItem('studentLevel', level.toString());
    
    studentLevelEl.textContent = `Level ${level}`;
    
    // Update progress bar width
    const progressBar = studentProgressEl;
    progressBar.style.width = `${progress}%`;
}

// Update completed today count
function updateCompletedToday() {
    const today = getCurrentDate();
    const completedToday = studentAnswers.filter(answer => 
        answer.completed && answer.date === today
    ).length;
    
    completedTodayEl.textContent = completedToday;
}

// Update question display after saving answer
function updateQuestionDisplay(questionId) {
    const questionElement = document.querySelector(`.question-item[data-id="${questionId}"]`);
    if (!questionElement) return;
    
    // Get saved answer
    const savedAnswer = studentAnswers.find(answer => answer.questionId == questionId);
    
    if (savedAnswer) {
        // Update answer preview
        let answerPreview = questionElement.querySelector('.answer-preview');
        if (!answerPreview) {
            answerPreview = document.createElement('div');
            answerPreview.className = 'answer-preview';
            const questionText = questionElement.querySelector('.question-text');
            questionText.parentNode.insertBefore(answerPreview, questionText.nextSibling);
        }
        
        answerPreview.innerHTML = `
            <p><strong>Your Answer:</strong> ${savedAnswer.answer.length > 150 ? savedAnswer.answer.substring(0, 150) + '...' : savedAnswer.answer}</p>
            <button class="edit-answer-btn" onclick="openAnswerModal('${questionId}', '${savedAnswer.category}', '${savedAnswer.questionText.replace(/'/g, "\\'")}', '${savedAnswer.difficulty === 3 ? 'hard' : savedAnswer.difficulty === 2 ? 'medium' : 'easy'}')">
                <i class="fas fa-edit"></i> Edit
            </button>
        `;
        
        // Update done button
        const doneBtn = questionElement.querySelector('.done-btn');
        if (doneBtn) {
            if (savedAnswer.completed) {
                doneBtn.classList.add('completed');
                doneBtn.innerHTML = '<i class="fas fa-check"></i> Completed';
                doneBtn.style.backgroundColor = '#2ecc71';
            } else {
                doneBtn.classList.remove('completed');
                doneBtn.innerHTML = '<i class="fas fa-check"></i> Mark as Done';
                doneBtn.style.backgroundColor = '';
            }
        }
        
        // Update textarea value
        const textarea = questionElement.querySelector('.student-answer-input');
        if (textarea) {
            textarea.value = savedAnswer.answer;
            updateCharacterCount(textarea);
        }
        
        // Update completed styling
        if (savedAnswer.completed) {
            questionElement.classList.add('completed');
        } else {
            questionElement.classList.remove('completed');
        }
    }
    
    updateCompletedToday();
}

// Mark a question as done
function markQuestionAsDone(questionId) {
    // Find the answer
    const answerIndex = studentAnswers.findIndex(answer => answer.questionId == questionId);
    
    if (answerIndex >= 0) {
        // Toggle completed status
        const wasCompleted = studentAnswers[answerIndex].completed;
        studentAnswers[answerIndex].completed = !wasCompleted;
        
        // Add/remove XP
        if (!wasCompleted) {
            addXP(studentAnswers[answerIndex].difficulty * 5); // Bonus XP for completion
        }
        
        // Save to localStorage
        saveStudentData();
        
        // Update question display
        updateQuestionDisplay(questionId);
        
        // Update progress
        updateProgress();
        
        // Show notification
        const status = studentAnswers[answerIndex].completed ? 'marked as completed' : 'marked as incomplete';
        showNotification(`Question ${status}! ${!wasCompleted ? `+${studentAnswers[answerIndex].difficulty * 5} XP` : ''}`);
    } else {
        showNotification('Please save an answer first before marking as done');
    }
}

// Display school details
function displaySchoolDetails(schoolId) {
    const school = schoolsData.schools.find(s => s.id === schoolId);
    
    if (!school) {
        schoolDetails.innerHTML = '<div class="empty-state"><i class="fas fa-university fa-3x"></i><p>School information not found</p></div>';
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
                <h3><i class="fas fa-calendar-alt"></i> Target Interview Date</h3>
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
            <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
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
            <h3><i class="fas fa-quote-left"></i> School Motto / 校訓</h3>
            ${school.schoolMotto ? `<p><strong>English:</strong> "${school.schoolMotto}"</p>` : ''}
            ${school.chineseMotto ? `<p><strong>Chinese:</strong> "${school.chineseMotto}"</p>` : ''}
        </div>
        ` : ''}
        
        <div class="school-detail-item">
            <h3><i class="fas fa-bullseye"></i> Mission Statement</h3>
            <p>${school.mission}</p>
        </div>
        
        <div class="school-detail-item">
            <h3><i class="fas fa-comments"></i> Interview Features</h3>
            <p>${school.interviewFeatures}</p>
        </div>
        
        <div class="school-detail-item">
            <h3><i class="fas fa-star"></i> Specialties</h3>
            <p>${school.specialty}</p>
        </div>
        
        <div class="school-detail-item">
            <h3><i class="fas fa-school"></i> School Details</h3>
            <p><strong>Established:</strong> ${school.established}</p>
            <p><strong>Student Count:</strong> ${school.studentCount}</p>
            ${school.admissionProcess ? `<p><strong>Admission Process:</strong> ${school.admissionProcess}</p>` : ''}
            ${school.tuitionFee ? `<p><strong>Tuition Fee:</strong> ${school.tuitionFee}</p>` : ''}
        </div>
        
        ${school.specificFeatures ? `
        <div class="school-detail-item">
            <h3><i class="fas fa-feather-alt"></i> Specific Features</h3>
            <p>${school.specificFeatures}</p>
        </div>
        ` : ''}
        
        <div class="school-detail-item">
            <h3><i class="fas fa-address-card"></i> Contact Information</h3>
            <p><strong>Phone:</strong> ${school.phone}</p>
            <p><strong>Website:</strong> <a href="${school.website}" target="_blank">${school.website}</a></p>
        </div>
    `;
}

// Clear all generated questions
function clearQuestions() {
    questionsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-question-circle fa-3x"></i>
            <p>Select a category and click "Generate Questions" to start practicing!</p>
        </div>
    `;
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
        historyContainer.innerHTML = '<div class="empty-state"><i class="fas fa-history fa-3x"></i><p>No practice history yet. Complete some questions to see your history here.</p></div>';
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
            
            const statusBadge = answer.completed 
                ? '<span style="color:#2ecc71; font-weight:600;">✓ Completed</span>' 
                : '<span style="color:#f39c12;">In Progress</span>';
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-category">${categoryNames[answer.category] || answer.category} ${statusBadge}</div>
                    <div class="history-date">${answer.time}</div>
                </div>
                <div class="history-question">${answer.questionText}</div>
                <div class="history-answer"><strong>Your Answer:</strong> ${answer.answer}</div>
                <div class="history-meta">
                    <span>Difficulty: ${difficultyStars}</span>
                    <span>Question ID: ${answer.questionId}</span>
                    <span>XP: +${answer.completed ? answer.difficulty * 15 : answer.difficulty * 10}</span>
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
        studentXP = 0;
        localStorage.removeItem('studentAnswers');
        localStorage.removeItem('studentXP');
        savedAnswersEl.textContent = '0';
        totalXPEl.textContent = '0';
        updateProgress();
        displayHistory();
        showNotification('All saved answers and XP cleared');
    }
}

// Download answers as JSON file
function downloadAnswers() {
    if (studentAnswers.length === 0) {
        showNotification('No answers to download');
        return;
    }
    
    const studentData = {
        studentName: studentNameEl.textContent,
        level: studentLevelEl.textContent,
        totalXP: studentXP,
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
    
    // Update completed today
    updateCompletedToday();
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
    notificationEl.innerHTML = `<i class="fas fa-bell"></i> ${message}`;
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
    errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${message}`;
    
    document.querySelector('.container').prepend(errorEl);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        if (errorEl.parentNode) {
            errorEl.parentNode.removeChild(errorEl);
        }
    }, 5000);
}
