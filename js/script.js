document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle Logic
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Multi-page Active Link Logic
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === currentPath) {
            item.classList.add('active');
        }
    });

    // Render dynamic internships if we are on that page
    renderStudentInternships();

    // Initialize Save/Bookmark functionality
    initSaveInternship();

    // Initialize Apply Internship functionality
    initApplyButtons();

    // Initialize Edit Profile functionality
    initProfileEditing();

    // Initialize Logout functionality
    initLogout();
});

function renderStudentInternships() {
    const grid = document.getElementById('student-internships-grid');
    if (!grid) return;

    const INTERNSHIPS_KEY = 'internships_list';
    let internships = [];
    
    const storedInts = localStorage.getItem(INTERNSHIPS_KEY);
    if (storedInts) {
        internships = JSON.parse(storedInts);
    } else {
        // If not initialized yet by admin, initialize with defaults
        const initialInternships = [
            { id: 'int-1', role: 'Frontend Developer Intern', company: 'Infosys', location: 'Bangalore', duration: '6 Months', stipend: '20k/mo', description: 'Looking for a passionate frontend developer intern with knowledge of React and modern CSS.', icon: 'fa-code', color: 'bg-primary', deadline: '25 May 2026' },
            { id: 'int-2', role: 'Backend Engineering Intern', company: 'TCS', location: 'Pune', duration: '6 Months', stipend: '15k/mo', description: 'Join our backend team to build scalable microservices using Java Spring Boot.', icon: 'fa-server', color: 'bg-blue', deadline: '30 May 2026' },
            { id: 'int-3', role: 'UI/UX Design Intern', company: 'Wipro', location: 'Bangalore', duration: '3 Months', stipend: '12k/mo', description: 'Assist in user research, wireframing, and prototyping for our upcoming mobile application.', icon: 'fa-pen-nib', color: 'bg-green', deadline: '20 May 2026' },
            { id: 'int-4', role: 'Data Analyst Intern', company: 'Accenture', location: 'Remote', duration: '4 Months', stipend: '18k/mo', description: 'Analyze large datasets and build dashboards using Python and Tableau.', icon: 'fa-chart-pie', color: 'bg-warning', deadline: '15 May 2026' },
            { id: 'int-5', role: 'Hardware Intern', company: 'Intel', location: 'Hyderabad', duration: '6 Months', stipend: '25k/mo', description: 'Work on semiconductor testing and quality assurance.', icon: 'fa-microchip', color: 'bg-purple', deadline: '10 May 2026' }
        ];
        internships = [...initialInternships];
        localStorage.setItem(INTERNSHIPS_KEY, JSON.stringify(internships));
    }

    grid.innerHTML = '';
    
    if (internships.length === 0) {
        grid.innerHTML = '<p class="text-center w-100" style="grid-column: 1/-1;">No internships available at the moment.</p>';
        return;
    }

    internships.forEach(int => {
        const div = document.createElement('div');
        div.className = 'card internship-grid-card';
        div.innerHTML = `
            <div class="card-body">
                <div class="company-logo ${int.color || 'bg-primary'}">
                    <i class="fa-solid ${int.icon || 'fa-briefcase'}"></i>
                </div>
                <h4 class="mt-3">${int.role}</h4>
                <p class="company mb-3"><i class="fa-solid fa-building"></i> ${int.company}</p>
                
                <div class="tags mb-3">
                    <span class="tag"><i class="fa-solid fa-location-dot"></i> ${int.location}</span>
                    <span class="tag"><i class="fa-regular fa-clock"></i> ${int.duration}</span>
                    <span class="tag"><i class="fa-solid fa-indian-rupee-sign"></i> ${int.stipend}</span>
                </div>
                
                <p class="description">${int.description}</p>
                
                <hr class="my-3">
                <div class="flex-between">
                    <span class="deadline">Deadline: ${int.deadline}</span>
                    <div class="action-btns">
                        <button class="btn-icon save-btn" data-id="${int.id}"><i class="fa-regular fa-bookmark"></i> Save</button>
                        <button class="btn btn-primary btn-sm apply-btn" data-id="dash-${int.id}">Apply</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(div);
    });
}

function initSaveInternship() {
    const saveBtns = document.querySelectorAll('.save-btn');
    if (saveBtns.length === 0) return;

    // Initialize button states
    saveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (btn.classList.contains('saved')) {
                // Remove Save
                btn.innerHTML = '<i class="fa-regular fa-bookmark"></i> Save';
                btn.classList.remove('saved');
            } else {
                // Save
                btn.innerHTML = '<i class="fa-solid fa-bookmark"></i> Saved';
                btn.classList.add('saved');
            }
        });
    });
}

function initApplyButtons() {
    const applyBtns = document.querySelectorAll('.apply-btn');
    const appliedCountEl = document.getElementById('applied-count');
    
    // Apply Modal Elements
    const applyModal = document.getElementById('apply-modal');
    const closeApplyModalBtn = document.getElementById('close-apply-modal');
    const applyForm = document.getElementById('apply-form');
    
    let currentApplyBtn = null;
    let currentInternshipId = null;

    if (applyBtns.length === 0) return;

    // Update count on load
    if(appliedCountEl) {
        // Base count is 5
        appliedCountEl.innerText = 5;
    }

    // Modal Close Logic
    const closeApplyModal = () => applyModal.classList.add('hidden');
    if (closeApplyModalBtn) closeApplyModalBtn.addEventListener('click', closeApplyModal);
    if (applyModal) {
        applyModal.addEventListener('click', (e) => {
            if (e.target === applyModal) closeApplyModal();
        });
    }

    // Form Submit Logic
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!currentApplyBtn) return;
            
            // Update UI
            currentApplyBtn.innerHTML = 'Applied <i class="fa-solid fa-check"></i>';
            currentApplyBtn.classList.add('btn-applied');
            currentApplyBtn.disabled = true;

            // Update Counter
            if(appliedCountEl) {
                appliedCountEl.innerText = parseInt(appliedCountEl.innerText) + 1;
            }
            
            closeApplyModal();
            
            // Show alert
            alert('Successfully applied! Your cover letter has been submitted.');
            
            // Reset form
            applyForm.reset();
        });
    }

    applyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.disabled) return;

            currentApplyBtn = btn;
            
            // Show Modal
            if (applyModal) applyModal.classList.remove('hidden');
        });
    });
}

function initProfileEditing() {
    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-profile-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('edit-profile-form');

    if (!editBtn || !modal) return;
    
    const elements = {
        name: [document.getElementById('nav-user-name'), document.getElementById('dash-profile-name'), document.getElementById('main-profile-name')],
        email: document.getElementById('profile-email'),
        phone: document.getElementById('profile-phone'),
        location: document.getElementById('profile-location'),
        linkedinText: document.getElementById('display-linkedin-text'),
        linkedinIcon: document.getElementById('display-linkedin-icon'),
        githubText: document.getElementById('display-github-text'),
        githubIcon: document.getElementById('display-github-icon')
    };

    // Open Modal
    editBtn.addEventListener('click', () => {
        const nameEl = elements.name[0];
        if (nameEl) document.getElementById('input-name').value = nameEl.innerText;
        if (elements.email) document.getElementById('input-email').value = elements.email.innerText;
        if (elements.phone) document.getElementById('input-phone').value = elements.phone.innerText;
        if (elements.location) document.getElementById('input-location').value = elements.location.innerText;
        if(elements.linkedinText) {
            const href = elements.linkedinText.getAttribute('href');
            document.getElementById('input-linkedin').value = (href && href !== '#') ? href : '';
        }
        if(elements.githubText) {
            const href = elements.githubText.getAttribute('href');
            document.getElementById('input-github').value = (href && href !== '#') ? href : '';
        }
        
        modal.classList.remove('hidden');
    });

    // Close Modal
    const closeModal = () => modal.classList.add('hidden');
    
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newProfile = {
            name: document.getElementById('input-name').value,
            email: document.getElementById('input-email').value,
            phone: document.getElementById('input-phone').value,
            location: document.getElementById('input-location').value,
            linkedin: document.getElementById('input-linkedin').value,
            github: document.getElementById('input-github').value
        };

        // Update DOM
        elements.name.forEach(el => { if(el) el.innerText = newProfile.name; });
        if(elements.email) elements.email.innerText = newProfile.email;
        if(elements.phone) elements.phone.innerText = newProfile.phone;
        if(elements.location) elements.location.innerText = newProfile.location;

        if(elements.linkedinText && newProfile.linkedin) {
            elements.linkedinText.href = newProfile.linkedin;
            elements.linkedinText.innerText = newProfile.linkedin.replace(/^https?:\/\//, '').replace(/\/$/, '');
        }
        if(elements.linkedinIcon && newProfile.linkedin) elements.linkedinIcon.href = newProfile.linkedin;
        
        if(elements.githubText && newProfile.github) {
            elements.githubText.href = newProfile.github;
            elements.githubText.innerText = newProfile.github.replace(/^https?:\/\//, '').replace(/\/$/, '');
        }
        if(elements.githubIcon && newProfile.github) elements.githubIcon.href = newProfile.github;

        closeModal();
    });
}

function initLogout() {
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('skillpilot_state');
            window.location.href = 'login.html';
        });
    });
}
