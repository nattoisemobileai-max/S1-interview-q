// Enhanced script.js with sidebar functionality

// ... [All the original JavaScript from the provided script.js file remains here] ...

// Add sidebar toggle functionality at the end of the file
document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization code...
    
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Add scroll to section function
    window.scrollToSection = function(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    // Mobile menu functionality
    function setupMobileMenu() {
        if (window.innerWidth <= 992) {
            const mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.className = 'mobile-menu-btn';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.appendChild(mobileMenuBtn);
            
            mobileMenuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('show');
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(event) {
                if (window.innerWidth <= 992 && 
                    !sidebar.contains(event.target) && 
                    !mobileMenuBtn.contains(event.target)) {
                    sidebar.classList.remove('show');
                }
            });
        }
    }
    
    setupMobileMenu();
    window.addEventListener('resize', setupMobileMenu);
});

// Update the loadData function to handle navigation
async function loadData() {
    try {
        // Load schools data
        const schoolsResponse = await fetch('schools.json');
        schoolsData = await schoolsResponse.json();
        
        // Load all question files
        const questionFiles = [
            { key: 'must', file: 'questions-must.json' },
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
        
        // Only initialize school dropdown if we're on the main page
        if (document.getElementById('school-select')) {
            populateSchoolDropdown();
        }
        
        // Update statistics
        updateStatistics();
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check if JSON files are available.');
    }
}
console.log('問題數據類型:', typeof questions[year].questions[category]);
console.log('第一個項目:', questions[year].questions[category][0]);
