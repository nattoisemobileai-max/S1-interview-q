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
