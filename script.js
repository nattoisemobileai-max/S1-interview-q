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
        if (daysRemaining.includes('Today')) {
            dateClass = 'date-urgent';
        } else if (daysRemaining.includes('Past')) {
            dateClass = 'date-past';
        } else {
            const daysNum = parseInt(daysRemaining);
            if (daysNum <= 7) dateClass = 'date-urgent';
            else if (daysNum <= 30) dateClass = 'date-near';
        }
        
        targetDateHTML = `
            <div class="school-detail-item">
                <h3>Target Interview Date</h3>
                <p><strong>Scheduled Date:</strong> ${formattedDate}</p>
                <p><strong>Status:</strong> <span class="date-badge ${dateClass}">${daysRemaining}</span></p>
            </div>
        `;
    }
    
    // Create image HTML if image path exists
    let imageHTML = '';
    if (school.image) {
        imageHTML = `
            <div class="school-image">
                <img src="${school.image}" alt="${school.name}" onerror="this.style.display='none'">
            </div>
        `;
    }
    
    schoolDetails.innerHTML = `
        ${imageHTML}
        
        <div class="school-detail-item">
            <h3>School Information</h3>
            <div class="school-name-row">
                <div class="school-name-english">
                    <strong>English Name:</strong> ${school.name}
                    <span class="banding-badge ${bandingClass}">${school.banding}</span>
                </div>
                <div class="school-name-chinese">
                    <strong>Chinese Name:</strong> ${school.chineseName}
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
        return `${diffDays} days remaining`;
    } else if (diffDays === 0) {
        return "Interview is today!";
    } else {
        return `Interview passed ${Math.abs(diffDays)} days ago`;
    }
}
