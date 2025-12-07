function displaySchoolDetails(schoolId) {
    const school = schoolsData.schools.find(s => s.id === schoolId);
    
    if (!school) {
        schoolDetails.innerHTML = '<p class="placeholder">School information not found</p>';
        return;
    }
    
    // Get banding class
    const bandingClass = `banding-${school.banding.toLowerCase().replace(' ', '')}`;
    
    // Create image HTML if image path exists
    let imageHTML = '';
    if (school.image) {
        imageHTML = `
            <div class="school-image">
                <img src="${school.image}" alt="${school.name}" onerror="this.style.display='none'">
            </div>
        `;
    }
    
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
        targetDateHTML = `
            <div class="school-detail-item">
                <h3>Target Interview Date</h3>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Days remaining:</strong> <span class="days-remaining">${calculateDaysRemaining(school.targetInterviewDate)}</span></p>
            </div>
        `;
    }
    
    schoolDetails.innerHTML = `
        ${imageHTML}
        
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
        
        ${targetDateHTML}
        
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
    
    // Update days remaining styling
    updateDaysRemainingStyle();
}

// Add this helper function to calculate days remaining
function calculateDaysRemaining(targetDateStr) {
    const targetDate = new Date(targetDateStr);
    const today = new Date();
    
    // Reset hours to compare only dates
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
        return `${diffDays} days`;
    } else if (diffDays === 0) {
        return "Today!";
    } else {
        return `Past by ${Math.abs(diffDays)} days`;
    }
}

// Add this function to style days remaining based on urgency
function updateDaysRemainingStyle() {
    const daysRemainingElements = document.querySelectorAll('.days-remaining');
    
    daysRemainingElements.forEach(element => {
        const text = element.textContent;
        if (text.includes('Today')) {
            element.style.color = '#e74c3c';
            element.style.fontWeight = 'bold';
        } else if (text.includes('Past')) {
            element.style.color = '#7f8c8d';
            element.style.fontStyle = 'italic';
        } else if (parseInt(text) <= 7) {
            element.style.color = '#e67e22';
            element.style.fontWeight = '600';
        } else if (parseInt(text) <= 30) {
            element.style.color = '#f39c12';
        } else {
            element.style.color = '#27ae60';
        }
    });
}
