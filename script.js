// Global variables
let schoolsData = [];
let questionsData = [];
let historyLog = [];
let selectedCategories = ['all'];
let questionsPerCategory = 'all';
let generatedCount = 0;
let completedToday = 0;

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
const allCountBtn = document.querySelector('.all-count-btn');

// Statistics elements
const totalSchoolsEl = document.getElementById('total-schools');
const totalQuestionsEl = document.getElementById('total-questions');
const generatedTodayEl = document.getElementById('generated-today');
const completedTodayEl = document.getElementById('completed-today');
const questionsCountBadge = document.getElementById('questions-count-badge');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadHistory();
    setupEventListeners();
    updateStatistics();
});

// Load data from JSON files
async function loadData() {
    try {
        // Load schools data
        const schoolsResponse = await fetch('schools.json');
        schoolsData = await schoolsResponse.json();
        
        // Load questions data
        const questionsResponse = await fetch('questions.json');
        questionsData = await questionsResponse.json();
        
        // Initialize school dropdown
        populateSchoolDropdown();
        
        // Update statistics
        updateStatistics();
        
        // Set default selections
        setDefaultSelections();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check if JSON files are available.');
    }
}

// Load history from localStorage
function loadHistory() {
    const savedHistory = localStorage.getItem('interviewQuestionHistory');
    if (savedHistory) {
        historyLog = JSON.parse(savedHistory);
        updateCompletedToday();
    }
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('interviewQuestionHistory', JSON.stringify(historyLog));
    updateCompletedToday();
}

// Set default selections
function setDefaultSelections() {
    // All categories button is active by default
    const allCategoriesBtn = document.querySelector('.category-btn.all-btn');
    allCategoriesBtn.classList.add('active');
    
    // All count button is active by default
    if (allCountBtn) {
        allCountBtn.classList.add('active');
    }
}

// Populate school dropdown
function populateSchoolDropdown() {
    schoolSelect.innerHTML = '<option value="">Select a school to view details</option>';
    
    schoolsData.schools.forEach(school => {
        const option = document.createElement('option');
        option.value = school.id;
        option.textContent = `${school.name} (${school.chineseName}) - ${school.banding}`;
        schoolSelect.appendChild(option);
    });
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
    
    // View history button
    viewHistoryBtn.addEventListener('click', showHistory);
    
    // Close history button
    closeHistoryBtn.addEventListener('click', hideHistory);
    
    // Clear history button
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Download history button
    downloadHistoryBtn.addEventListener('click', downloadHistory);
    
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
        // Get all unique categories from questions
        categoriesToUse = [...new Set(questionsData.questions.map(q => q.category))];
    } else {
        categoriesToUse = selectedCategories;
    }
    
    let allSelectedQuestions = [];
    
    // Generate questions for each selected category
    categoriesToUse.forEach(category => {
        const categoryQuestions = questionsData.questions.filter(q => q.category === category);
        
        // Determine how many questions to take
        let questionsToTake = questionsPerCategory;
        if (questionsPerCategory === 'all') {
            questionsToTake = categoryQuestions.length;
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
}

// Display a single question
function displayQuestion(question) {
    const questionEl = document.createElement('div');
    questionEl.className = 'question-item';
    questionEl.dataset.id = question.id;
    questionEl.dataset.category = question.category;
    
    // Get category display name
    const categoryNames = {
        'general': 'General',
        'academic': 'Academic',
        'personal': 'Personal',
        'school': 'School Specific',
        'current': 'Current Affairs',
        'creative': 'Creative Thinking'
    };
    
    // Check if this question is already completed
    const isCompleted = historyLog.some(entry => 
        entry.questionId === question.id && 
        entry.date === getCurrentDate()
    );
    
    if (isCompleted) {
        questionEl.classList.add('completed');
    }
    
    questionEl.innerHTML = `
        <div class="question-item-header">
            <div class="category">${categoryNames[question.category] || question.category}</div>
            <button class="done-btn" onclick="markQuestionAsDone(${question.id}, '${question.category}', '${question.text.replace(/'/g, "\\'")}', ${question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1})">
                <i class="fas fa-check"></i> ${isCompleted ? 'Completed' : 'Done'}
            </button>
        </div>
        <div class="text">${question.text}</div>
        <div class="difficulty">Difficulty: ${getDifficultyStars(question.difficulty)}</div>
    `;
    
    questionsContainer.appendChild(questionEl);
}

// Mark a question as done
function markQuestionAsDone(questionId, category, text, difficultyLevel) {
    // Find the question element
    const questionElement = document.querySelector(`.question-item[data-id="${questionId}"]`);
    
    if (questionElement && !questionElement.classList.contains('completed')) {
        // Mark as completed
        questionElement.classList.add('completed');
        
        // Update the button
        const doneBtn = questionElement.querySelector('.done-btn');
        doneBtn.innerHTML = '<i class="fas fa-check"></i> Completed';
        doneBtn.style.backgroundColor = '#7f8c8d';
        doneBtn.onclick = null;
        
        // Create history entry
        const historyEntry = {
            questionId: questionId,
            category: category,
            text: text,
            difficulty: difficultyLevel,
            date: getCurrentDate(),
            time: getCurrentTime(),
            timestamp: new Date().toISOString()
        };
        
        // Add to history log
        historyLog.unshift(historyEntry);
        
        // Save to localStorage
        saveHistory();
        
        // Update statistics
        completedToday++;
        completedTodayEl.textContent = completedToday;
        
        // Show notification
        showNotification(`Question marked as completed!`);
    }
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

// Display school details
function displaySchoolDetails(schoolId) {
    const school = schoolsData.schools.find(s => s.id === schoolId);
    
    if (!school) {
        schoolDetails.innerHTML = '<p class="placeholder">School information not found</p>';
        return;
    }
    
    // Get banding class
    const bandingClass = `banding-${school.banding.toLowerCase().replace(' ', '')}`;
    
    schoolDetails.innerHTML = `
        <div class="school-detail-item">
            <h3>School Name <span class="banding-badge ${bandingClass}">${school.banding}</span></h3>
            <p>${school.name} (${school.chineseName})</p>
        </div>
        
        <div class="school-detail-item">
            <h3>Basic Information</h3>
            <p><strong>Type:</strong> ${school.type}</p>
            <p><strong>Religion:</strong> ${school.religion}</p>
            <p><strong>Gender:</strong> ${school.gender}</p>
            <p><strong>District:</strong> ${school.district}</p>
            <p><strong>Medium of Instruction:</strong> ${school.language}</p>
        </div>
        
        <div class="school-detail-item">
            <h3>Specialties</h3>
            <p>${school.specialty}</p>
        </div>
        
        <div class="school-detail-item">
            <h3>School Details</h3>
            <p><strong>Established:</strong> ${school.established}</p>
            <p><strong>Student Count:</strong> ${school.studentCount}</p>
            ${school.tuitionFee ? `<p><strong>Tuition Fee:</strong> ${school.tuitionFee}</p>` : ''}
        </div>
        
        <div class="school-detail-item">
            <h3>Mission Statement</h3>
            <p>${school.mission}</p>
        </div>
        
        <div class="school-detail-item">
            <h3>Admission Process</h3>
            <p>${school.admissionProcess}</p>
        </div>
        
        <div class="school-detail-item">
            <h3>Specific Features</h3>
            <p>${school.specificFeatures}</p>
        </div>
        
        <div class="school-detail-item">
            <h3>Interview Features</h3>
            <p>${school.interviewFeatures}</p>
        </div>
        
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
    if (historyLog.length === 0) {
        historyContainer.innerHTML = '<p class="empty-history">No practice history yet. Complete some questions to see your history here.</p>';
        return;
    }
    
    historyContainer.innerHTML = '';
    
    // Group history by date
    const historyByDate = {};
    historyLog.forEach(entry => {
        if (!historyByDate[entry.date]) {
            historyByDate[entry.date] = [];
        }
        historyByDate[entry.date].push(entry);
    });
    
    // Display history grouped by date
    Object.keys(historyByDate).forEach(date => {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = date;
        dateHeader.style.marginTop = '20px';
        dateHeader.style.marginBottom = '10px';
        dateHeader.style.color = '#2c3e50';
        historyContainer.appendChild(dateHeader);
        
        historyByDate[date].forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const difficultyStars = '★'.repeat(entry.difficulty) + '☆'.repeat(3 - entry.difficulty);
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <div class="history-category">${entry.category}</div>
                    <div class="history-date">${entry.time}</div>
                </div>
                <div class="history-question">${entry.text}</div>
                <div class="history-meta">
                    <span>Difficulty: ${difficultyStars}</span>
                    <span>ID: ${entry.questionId}</span>
                </div>
            `;
            
            historyContainer.appendChild(historyItem);
        });
    });
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all practice history? This action cannot be undone.')) {
        historyLog = [];
        localStorage.removeItem('interviewQuestionHistory');
        displayHistory();
        updateCompletedToday();
        showNotification('History cleared successfully');
    }
}

// Download history as JSON file
function downloadHistory() {
    if (historyLog.length === 0) {
        showNotification('No history to download');
        return;
    }
    
    const historyData = {
        generatedAt: new Date().toISOString(),
        totalEntries: historyLog.length,
        history: historyLog
    };
    
    const dataStr = JSON.stringify(historyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `interview-practice-history-${getCurrentDate()}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    showNotification('History downloaded successfully');
}

// Update statistics
function updateStatistics() {
    if (schoolsData.schools) {
        totalSchoolsEl.textContent = schoolsData.schools.length;
    }
    
    if (questionsData.questions) {
        totalQuestionsEl.textContent = questionsData.questions.length;
    }
    
    generatedTodayEl.textContent = generatedCount;
    completedTodayEl.textContent = completedToday;
}

// Update completed today count
function updateCompletedToday() {
    const today = getCurrentDate();
    completedToday = historyLog.filter(entry => entry.date === today).length;
    completedTodayEl.textContent = completedToday;
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
    notificationEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2ecc71;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
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
