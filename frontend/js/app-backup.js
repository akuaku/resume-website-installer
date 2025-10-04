// API Configuration - Strapi v3
//const CURRENT_HOST = window.location.hostname;
//const CURRENT_PROTOCOL = window.location.protocol;
//const API_URL = `${CURRENT_PROTOCOL}//${CURRENT_HOST}:1338`;
//const STRAPI_URL = `${CURRENT_PROTOCOL}//${CURRENT_HOST}:1338`;
// API Configuration - For NPM
const API_URL = '/strapi';
const STRAPI_URL = '/strapi';
// Helper function to fetch data from Strapi
async function fetchFromStrapi(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Helper function to get image URL (Strapi v3)
function getImageUrl(imageData) {
    if (!imageData) return '';
    // Strapi v3 format
    const url = imageData.url || imageData.formats?.medium?.url || imageData.formats?.small?.url;
    return url ? `${STRAPI_URL}${url}` : '';
}

// HOME PAGE - Load Profile Data (Strapi v3)
async function loadHomePageData() {
    const profileData = await fetchFromStrapi('/profile'); // NO /api prefix
    
    if (profileData) {
        const profile = profileData;
        
        // Load profile image
        const profileImage = document.getElementById('profileImage');
        if (profileImage && profile.photo) {
            profileImage.src = getImageUrl(profile.photo);
        }
        
        // Load about content
        const aboutContent = document.getElementById('aboutContent');
        if (aboutContent && profile.about) {
            aboutContent.innerHTML = profile.about.split('\n').map(p => `<p>${p}</p>`).join('');
        }
        
        // Load contact information
        if (profile.citizenship) document.getElementById('citizenship').textContent = profile.citizenship;
        if (profile.location) document.getElementById('location').textContent = profile.location;
        if (profile.phone) document.getElementById('phone').textContent = profile.phone;
        if (profile.email) document.getElementById('email').textContent = profile.email;
        if (profile.availability) document.getElementById('availability').textContent = profile.availability;
    }
}

// EDUCATION PAGE - Load Education Data (Strapi v3)
async function loadEducationData() {
    const educationData = await fetchFromStrapi('/educations?_sort=startYear:DESC');
    
    if (educationData && Array.isArray(educationData)) {
        const timeline = document.getElementById('educationTimeline');
        if (timeline) {
            timeline.innerHTML = educationData.map(edu => {
                return `
                    <div class="timeline-item fade-in">
                        <div class="timeline-header">
                            <h3>${edu.degree}</h3>
                            <div class="timeline-meta">
                                <span class="timeline-date">${edu.startYear} - ${edu.endYear}</span>
                                <span class="timeline-company">${edu.institution}</span>
                            </div>
                        </div>
                        <div class="timeline-content">
                            ${edu.major ? `<p><strong>Major:</strong> ${edu.major}</p>` : ''}
                            ${edu.description ? `<p>${edu.description}</p>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// EDUCATION PAGE - Load Skills Data (Strapi v3)
// EDUCATION PAGE - Load Skills Data (Strapi v3)
async function loadSkillsData() {
    console.log('loadSkillsData called');
    const skillsData = await fetchFromStrapi('/skills');
    console.log('Skills data received:', skillsData);
    
    if (skillsData && Array.isArray(skillsData)) {
        const allSkills = document.getElementById('allSkills');
        
        if (allSkills) {
            allSkills.innerHTML = `
                <ul class="skills-list">
                    ${skillsData.map(skill => `<li>${skill.name}</li>`).join('')}
                </ul>
            `;
        }
    }
}

// EXPERIENCE PAGE - Load Experience Data (Strapi v3)
async function loadExperienceData() {
    console.log('loadExperienceData called');
    const experienceData = await fetchFromStrapi('/experiences');
    console.log('Experience data received:', experienceData);
    
    if (experienceData && Array.isArray(experienceData)) {
        // Sort by order field (or startDate if order doesn't exist)
	experienceData.sort((a, b) => {
    	     // If both have order field, use that
    	     if (a.order !== undefined && b.order !== undefined) {
                 return a.order - b.order;
             }
    	     // Otherwise fall back to date sorting
    	     const parseDate = (dateStr) => {
        	 if (!dateStr) return new Date(0);
        	 const date = new Date(dateStr);
        	 if (!isNaN(date)) return date;
        	 return new Date(0);
    	     };
    
    	     const dateA = parseDate(a.startDate);
    	     const dateB = parseDate(b.startDate);
    	     return dateB - dateA;
 	});
        
        const timeline = document.getElementById('experienceTimeline');
        console.log('Timeline element found:', timeline);
        
        if (timeline) {
            timeline.innerHTML = experienceData.map(exp => {
                const responsibilities = exp.responsibilities ? exp.responsibilities.split('\n').filter(r => r.trim()) : [];
                const achievements = exp.keyAchievements ? exp.keyAchievements.split('\n').filter(a => a.trim()) : [];
                
                return `
                    <div class="timeline-item fade-in">
                        <div class="timeline-header">
                            <h3>${exp.position}</h3>
                            <div class="timeline-meta">
                                <span class="timeline-date">${exp.startDate} - ${exp.endDate || 'Present'}</span>
                                <span class="timeline-company">${exp.company}</span>
                            </div>
                        </div>
                        <div class="timeline-content">
                            ${exp.description ? `<p>${exp.description}</p>` : ''}
                            ${responsibilities.length > 0 ? `
                                <h4>Responsibilities:</h4>
                                <ul>
                                    ${responsibilities.map(r => `<li>${r}</li>`).join('')}
                                </ul>
                            ` : ''}
                            ${achievements.length > 0 ? `
                                <h4>Key Achievements:</h4>
                                <ul>
                                    ${achievements.map(a => `<li>${a}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            console.log('Timeline populated with', experienceData.length, 'experiences');
        } else {
            console.error('experienceTimeline element not found!');
        }
    } else {
        console.error('Invalid experience data format:', experienceData);
    }
}

// GALLERY PAGE - Load Gallery Data (Strapi v3)
async function loadGalleryData() {
    const galleryData = await fetchFromStrapi('/galleries');
    
    if (galleryData && Array.isArray(galleryData)) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid) {
            galleryGrid.innerHTML = galleryData.map(item => {
                const imageUrl = item.image ? getImageUrl(item.image) : '';
                
                return `
                    <div class="gallery-item fade-in">
                        <img src="${imageUrl}" alt="${item.title}" loading="lazy">
                        <div class="gallery-info">
                            <h3>${item.title}</h3>
                            <p>${item.description || ''}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// CONTACT PAGE - Load Contact Data (Strapi v3)
async function loadContactData() {
    const profileData = await fetchFromStrapi('/profile');
    
    if (profileData) {
        const profile = profileData;
        const contactDetails = document.getElementById('contactDetails');
        
        if (contactDetails) {
            contactDetails.innerHTML = `
                <div class="contact-detail-item fade-in">
                    <div class="contact-icon">
                        <i class="fas fa-map-marker-alt">📍</i>
                    </div>
                    <div class="contact-detail-content">
                        <strong>Location</strong>
                        <span>${profile.location || 'N/A'}</span>
                    </div>
                </div>
                <div class="contact-detail-item fade-in">
                    <div class="contact-icon">
                        <i class="fas fa-envelope">✉️</i>
                    </div>
                    <div class="contact-detail-content">
                        <strong>Email</strong>
                        <span>${profile.email || 'N/A'}</span>
                    </div>
                </div>
                <div class="contact-detail-item fade-in">
                    <div class="contact-icon">
                        <i class="fas fa-phone">📞</i>
                    </div>
                    <div class="contact-detail-content">
                        <strong>Phone</strong>
                        <span>${profile.phone || 'N/A'}</span>
                    </div>
                </div>
                <div class="contact-detail-item fade-in">
                    <div class="contact-icon">
                        <i class="fas fa-check-circle">✓</i>
                    </div>
                    <div class="contact-detail-content">
                        <strong>Availability</strong>
                        <span>${profile.availability || 'N/A'}</span>
                    </div>
                </div>
            `;
        }
    }
}

// CONTACT FORM - Handle Submission (Strapi v3)
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };
            
            try {
                const response = await fetch(`${API_URL}/contacts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const formMessage = document.getElementById('formMessage');
                
                if (response.ok) {
                    formMessage.textContent = 'Thank you! Your message has been sent successfully.';
                    formMessage.className = 'success';
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                const formMessage = document.getElementById('formMessage');
                formMessage.textContent = 'Sorry, there was an error sending your message. Please try again.';
                formMessage.className = 'error';
            }
        });
    }
}

// Initialize page based on current URL
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
        case '':
            loadHomePageData();
            break;
        case 'education.html':
            loadEducationData();
            loadSkillsData();
            break;
        case 'experience.html':
            loadExperienceData();
            break;
        case 'gallery.html':
            loadGalleryData();
            break;
        case 'contact.html':
            loadContactData();
            setupContactForm();
            break;
    }
});
