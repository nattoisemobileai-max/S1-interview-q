// Global variables
let schoolsData = [];
let questionsData = [];
let selectedCategories = ['general'];
let questionsPerCategory = 5;
let generatedCount = 0;

// DOM elements
const questionsContainer = document.getElementById('questions-container');
const schoolSelect = document.getElementById('school-select');
const schoolDetails = document.getElementById('school-details');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const allQuestionsBtn = document.getElementById('all-questions');
const categoryButtons = document.querySelectorAll('.category-btn');
const countButtons = document.querySelectorAll('.count-btn');

// Statistics elements
const totalSchoolsEl = document.getElementById('total-schools');
const totalQuestionsEl = document.getElementById('total-questions');
const generatedCountEl = document.getElementById('generated-count');
const band1CountEl = document.getElementById('band1-count');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
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
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check if JSON files are available.');
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
        if (!btn.classList.contains('all-btn')) {
            btn.addEventListener('click', function() {
                const category = this.dataset.category;
                
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    selectedCategories = selectedCategories.filter(cat => cat !== category);
                } else {
                    this.classList.add('active');
                    selectedCategories.push(category);
                }
                
                // Ensure at least one category is selected
                if (selectedCategories.length === 0) {
                    this.classList.add('active');
                    selectedCategories.push(category);
                }
            });
        }
    });
    
    // All questions button
    allQuestionsBtn.addEventListener('click', function() {
        // Clear all other active categories
        categoryButtons.forEach(btn => {
            if (!btn.classList.contains('all-btn')) {
                btn.classList.remove('active');
            }
        });
        
        // Select all categories
        selectedCategories = ['general', 'academic', 'personal', 'school', 'current', 'creative'];
        
        // Highlight the "All" button
        this.classList.add('active');
    });
    
    // Count buttons
    countButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            countButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            questionsPerCategory = parseInt(this.dataset.count);
        });
    });
    
    // Generate button
    generateBtn.addEventListener('click', generateQuestions);
    
    // Clear button
    clearBtn.addEventListener('click', clearQuestions);
    
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
    
    // Reset "All" button active state if specific categories are selected
    if (selectedCategories.length < 6) {
        allQuestionsBtn.classList.remove('active');
    }
    
    // Generate questions for each selected category
    selectedCategories.forEach(category => {
        const categoryQuestions = questionsData.questions.filter(q => q.category === category);
        
        // Shuffle questions and take the required number
        const shuffled = shuffleArray([...categoryQuestions]);
        const selectedQuestions = shuffled.slice(0, questionsPerCategory);
        
        // Display questions
        selectedQuestions.forEach(question => {
            displayQuestion(question);
        });
    });
    
    // Update generated count
    generatedCount += selectedCategories.length * questionsPerCategory;
    generatedCountEl.textContent = generatedCount;
    
    // Scroll to questions
    questionsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display a single question
function displayQuestion(question) {
    const questionEl = document.createElement('div');
    questionEl.className = 'question-item';
    
    // Get category display name
    const categoryNames = {
        'general': 'General',
        'academic': 'Academic',
        'personal': 'Personal',
        'school': 'School Specific',
        'current': 'Current Affairs',
        'creative': 'Creative Thinking'
    };
    
    questionEl.innerHTML = `
        <div class="category">${categoryNames[question.category] || question.category}</div>
        <div class="text">${question.text}</div>
        <div class="difficulty">Difficulty: ${getDifficultyStars(question.difficulty)}</div>
    `;
    
    questionsContainer.appendChild(questionEl);
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
}

// Update statistics
function updateStatistics() {
    if (schoolsData.schools) {
        totalSchoolsEl.textContent = schoolsData.schools.length;
        
        // Count Band 1 schools
        const band1Count = schoolsData.schools.filter(school => 
            school.banding && school.banding.includes('Band 1')
        ).length;
        band1CountEl.textContent = band1Count;
    }
    
    if (questionsData.questions) {
        totalQuestionsEl.textContent = questionsData.questions.length;
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
