const APP_KEY = 'internship_applications'
const INT_KEY = 'internships_list'
const USERS_KEY = 'admin_platform_users'
const COMPANIES_KEY = 'admin_partner_companies'
const ACTIVITY_KEY = 'admin_activity_log'

const initialApplications = [
  { id: 'app-1', name: 'Rahul Sharma', roll: 'CS2023012', profile: 'Software Engineering Intern', company: 'TCS', date: 'Oct 24, 2023', status: 'Pending' },
  { id: 'app-2', name: 'Priya Singh', roll: 'CS2023055', profile: 'UI/UX Design Intern', company: 'Wipro', date: 'Oct 23, 2023', status: 'Approved' },
  { id: 'app-3', name: 'Koushik Mahanta', roll: 'CS2023045', profile: 'Frontend Developer Intern', company: 'Infosys', date: 'Oct 22, 2023', status: 'Pending' },
  { id: 'app-4', name: 'Amit Kumar', roll: 'EC2023089', profile: 'Hardware Intern', company: 'Intel', date: 'Oct 20, 2023', status: 'Rejected' },
  { id: 'app-5', name: 'Neha Gupta', roll: 'CS2023021', profile: 'Data Analyst Intern', company: 'Accenture', date: 'Oct 19, 2023', status: 'Pending' }
]

const initialInternships = [
  { id: 'int-1', role: 'Frontend Developer Intern', company: 'Infosys', location: 'Bangalore', duration: '6 Months', stipend: '20k/mo', description: 'Looking for a passionate frontend developer intern with knowledge of React and modern CSS.', icon: 'fa-code', color: 'bg-primary', deadline: '25 May 2026' },
  { id: 'int-2', role: 'Backend Engineering Intern', company: 'TCS', location: 'Pune', duration: '6 Months', stipend: '15k/mo', description: 'Join our backend team to build scalable microservices using Java Spring Boot.', icon: 'fa-server', color: 'bg-blue', deadline: '30 May 2026' },
  { id: 'int-3', role: 'UI/UX Design Intern', company: 'Wipro', location: 'Bangalore', duration: '3 Months', stipend: '12k/mo', description: 'Assist in user research, wireframing, and prototyping for our upcoming mobile application.', icon: 'fa-pen-nib', color: 'bg-green', deadline: '20 May 2026' },
  { id: 'int-4', role: 'Data Analyst Intern', company: 'Accenture', location: 'Remote', duration: '4 Months', stipend: '18k/mo', description: 'Analyze large datasets and build dashboards using Python and Tableau.', icon: 'fa-chart-pie', color: 'bg-warning', deadline: '15 May 2026' },
  { id: 'int-5', role: 'Hardware Intern', company: 'Intel', location: 'Hyderabad', duration: '6 Months', stipend: '25k/mo', description: 'Work on semiconductor testing and quality assurance.', icon: 'fa-microchip', color: 'bg-purple', deadline: '10 May 2026' }
]

const initialUsers = [
  { id: 'usr-1', name: 'Aryan Sharma', email: 'aryan.sharma@example.com', role: 'student', joined: 'Jan 15, 2025', status: 'Active' },
  { id: 'usr-2', name: 'Priya Singh', email: 'priya.singh@example.com', role: 'student', joined: 'Feb 3, 2025', status: 'Active' },
  { id: 'usr-3', name: 'Dr. Priya Patel', email: 'priya.patel@example.com', role: 'mentor', joined: 'Jan 10, 2025', status: 'Active' },
  { id: 'usr-4', name: 'Rahul Verma', email: 'rahul.verma@example.com', role: 'recruiter', joined: 'Mar 1, 2025', status: 'Active' },
  { id: 'usr-5', name: 'Neha Gupta', email: 'neha.gupta@example.com', role: 'student', joined: 'Apr 12, 2025', status: 'Active' },
  { id: 'usr-6', name: 'Rohit Mehta', email: 'rohit.mehta@example.com', role: 'student', joined: 'May 20, 2025', status: 'Inactive' }
]

const initialCompanies = [
  { id: 'comp-1', name: 'TCS', industry: 'IT Services', location: 'Mumbai', placed: 45, status: 'Active' },
  { id: 'comp-2', name: 'Infosys', industry: 'IT Services', location: 'Bangalore', placed: 38, status: 'Active' },
  { id: 'comp-3', name: 'Wipro', industry: 'IT Services', location: 'Bangalore', placed: 30, status: 'Active' },
  { id: 'comp-4', name: 'Accenture', industry: 'Consulting', location: 'Gurgaon', placed: 25, status: 'Active' },
  { id: 'comp-5', name: 'Intel', industry: 'Semiconductors', location: 'Hyderabad', placed: 12, status: 'Active' },
  { id: 'comp-6', name: 'Google', industry: 'Internet Services', location: 'Bangalore', placed: 8, status: 'Active' }
]

let applications = []
let internships = []
let platformUsers = []
let companies = []
let currentReviewId = null
let currentEditUserId = null
let currentEditCompanyId = null
let activityLog = []

function initStorage() {
  applications = loadData(APP_KEY, initialApplications)
  internships = loadData(INT_KEY, initialInternships)
  platformUsers = loadData(USERS_KEY, initialUsers)
  companies = loadData(COMPANIES_KEY, initialCompanies)
  activityLog = loadData(ACTIVITY_KEY, [])
}

function loadData(key, fallback) {
  const stored = localStorage.getItem(key)
  if (stored) {
    try { return JSON.parse(stored) } catch (e) { return [...fallback] }
  }
  localStorage.setItem(key, JSON.stringify(fallback))
  return [...fallback]
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function logActivity(action, details) {
  const entry = {
    id: 'act-' + Date.now(),
    timestamp: new Date().toLocaleString(),
    action: action,
    details: details,
    user: 'Admin'
  }
  activityLog.unshift(entry)
  if (activityLog.length > 100) activityLog.pop()
  saveData(ACTIVITY_KEY, activityLog)
  renderActivityLog()
}

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('applications-table-body') &&
      !document.getElementById('users-table-body') &&
      !document.getElementById('companies-table-body')) return

  initStorage()
  renderDashboard()
  initReviewModal()
  initPostInternshipModal()
  initUserModals()
  initCompanyModals()
  initTabs()
  renderActivityLog()
})

function initTabs() {
  const tabs = document.querySelectorAll('.admin-tab')
  const sections = {
    'tab-apps': 'section-apps',
    'tab-users': 'section-users',
    'tab-companies': 'section-companies',
    'tab-activity': 'section-activity'
  }
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active') })
      this.classList.add('active')
      Object.keys(sections).forEach(function (id) {
        var el = document.getElementById(sections[id])
        if (el) el.style.display = id === this.id ? 'block' : 'none'
      }.bind(this))
    })
  })
  var firstTab = document.querySelector('.admin-tab.active') || tabs[0]
  if (firstTab) firstTab.click()
}

function renderDashboard() {
  renderStats()
  renderTable()
  renderUsersTable()
  renderCompaniesTable()
}

function renderStats() {
  const pendingCount = applications.filter(function (a) { return a.status === 'Pending' }).length
  const activeUsers = platformUsers.filter(function (u) { return u.status === 'Active' }).length
  document.getElementById('stat-students').innerText = activeUsers
  document.getElementById('stat-internships').innerText = internships.length
  document.getElementById('stat-pending').innerText = pendingCount
  document.getElementById('stat-companies').innerText = companies.length
}

function renderTable() {
  var tbody = document.getElementById('applications-table-body')
  if (!tbody) return
  tbody.innerHTML = ''
  if (applications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">No applications found.</td></tr>'
    return
  }
  applications.forEach(function (app) {
    var cls = ''
    var txt = ''
    if (app.status === 'Pending') { cls = 'status-pending'; txt = 'Pending Review' }
    else if (app.status === 'Approved') { cls = 'status-approved'; txt = 'Approved & Forwarded' }
    else if (app.status === 'Rejected') { cls = 'status-rejected'; txt = 'Rejected' }
    var tr = document.createElement('tr')
    tr.innerHTML = '<td><strong>' + app.name + '</strong></td><td>' + app.roll + '</td><td>' + app.profile + '</td><td>' + app.company + '</td><td>' + app.date + '</td><td><span class="status-badge ' + cls + '">' + txt + '</span></td><td><button class="btn btn-sm btn-outline-primary" onclick="openReviewModal(\'' + app.id + '\')">' + (app.status === 'Pending' ? 'Review' : 'Details') + '</button></td>'
    tbody.appendChild(tr)
  })
}

function renderUsersTable() {
  var tbody = document.getElementById('users-table-body')
  if (!tbody) return
  tbody.innerHTML = ''
  if (platformUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No users registered.</td></tr>'
    return
  }
  platformUsers.forEach(function (u) {
    var statusCls = u.status === 'Active' ? 'status-approved' : 'status-rejected'
    var roleBadge = { student: 'Student', mentor: 'Mentor', recruiter: 'Recruiter', admin: 'Admin' }
    var tr = document.createElement('tr')
    tr.innerHTML = '<td><strong>' + u.name + '</strong></td><td>' + u.email + '</td><td><span class="status-badge status-pending" style="background:var(--primary-bg);color:var(--primary)">' + (roleBadge[u.role] || u.role) + '</span></td><td>' + u.joined + '</td><td><span class="status-badge ' + statusCls + '">' + u.status + '</span></td><td style="white-space:nowrap"><button class="btn btn-sm btn-outline-primary" onclick="openEditUserModal(\'' + u.id + '\')"><i class="fa-solid fa-pen"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(\'' + u.id + '\')"><i class="fa-solid fa-trash"></i></button></td>'
    tbody.appendChild(tr)
  })
}

function renderCompaniesTable() {
  var tbody = document.getElementById('companies-table-body')
  if (!tbody) return
  tbody.innerHTML = ''
  if (companies.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">No partner companies added.</td></tr>'
    return
  }
  companies.forEach(function (c) {
    var statusCls = c.status === 'Active' ? 'status-approved' : 'status-rejected'
    var tr = document.createElement('tr')
    tr.innerHTML = '<td><strong>' + c.name + '</strong></td><td>' + c.industry + '</td><td>' + c.location + '</td><td>' + c.placed + '</td><td><span class="status-badge ' + statusCls + '">' + c.status + '</span></td><td style="white-space:nowrap"><button class="btn btn-sm btn-outline-primary" onclick="openEditCompanyModal(\'' + c.id + '\')"><i class="fa-solid fa-pen"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="deleteCompany(\'' + c.id + '\')"><i class="fa-solid fa-trash"></i></button></td>'
    tbody.appendChild(tr)
  })
}

function renderActivityLog() {
  var tbody = document.getElementById('activity-table-body')
  if (!tbody) return
  tbody.innerHTML = ''
  if (activityLog.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;">No recent activity.</td></tr>'
    return
  }
  activityLog.slice(0, 20).forEach(function (entry) {
    var tr = document.createElement('tr')
    tr.innerHTML = '<td style="white-space:nowrap">' + entry.timestamp + '</td><td>' + entry.action + '</td><td>' + entry.details + '</td>'
    tbody.appendChild(tr)
  })
}

function initReviewModal() {
  var modal = document.getElementById('review-modal')
  if (!modal) return
  var closeBtn = document.getElementById('close-review-btn')
  var saveBtn = document.getElementById('save-review-btn')
  function closeModal() { modal.classList.add('hidden'); currentReviewId = null }
  if (closeBtn) closeBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal() })
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      if (!currentReviewId) return
      var newStatus = document.getElementById('review-status').value
      var idx = applications.findIndex(function (a) { return a.id === currentReviewId })
      if (idx !== -1) {
        applications[idx].status = newStatus
        saveData(APP_KEY, applications)
        renderDashboard()
        closeModal()
        logActivity('Application ' + newStatus.toLowerCase(), applications[idx].name + ' - ' + applications[idx].profile)
        Toast.success('Application status updated!')
      }
    })
  }
}

window.openReviewModal = function (appId) {
  var app = applications.find(function (a) { return a.id === appId })
  if (!app) return
  currentReviewId = app.id
  var nameEl = document.getElementById('review-name')
  var intEl = document.getElementById('review-internship')
  var compEl = document.getElementById('review-company')
  var statusEl = document.getElementById('review-status')
  if (nameEl) nameEl.innerText = app.name + ' (' + app.roll + ')'
  if (intEl) intEl.innerText = app.profile
  if (compEl) compEl.innerText = app.company
  if (statusEl) statusEl.value = app.status
  var modal = document.getElementById('review-modal')
  if (modal) modal.classList.remove('hidden')
}

function initPostInternshipModal() {
  var openBtn = document.getElementById('post-internship-btn')
  var modal = document.getElementById('post-internship-modal')
  var closeBtn = document.getElementById('close-post-btn')
  var form = document.getElementById('post-internship-form')
  if (!modal) return
  function closeModal() { modal.classList.add('hidden') }
  if (openBtn) openBtn.addEventListener('click', function () { if (form) form.reset(); modal.classList.remove('hidden') })
  if (closeBtn) closeBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal() })
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var newInt = {
        id: 'int-' + Date.now(),
        role: document.getElementById('post-role').value,
        company: document.getElementById('post-company').value,
        location: document.getElementById('post-location').value,
        stipend: document.getElementById('post-stipend').value,
        duration: document.getElementById('post-duration').value,
        description: 'New internship posting. Requires skills: ' + document.getElementById('post-tags').value,
        icon: 'fa-briefcase', color: 'bg-primary', deadline: 'TBD'
      }
      internships.unshift(newInt)
      saveData(INT_KEY, internships)
      renderDashboard()
      closeModal()
      logActivity('Internship posted', newInt.role + ' at ' + newInt.company)
      Toast.success('Internship posted successfully!')
    })
  }
}

function initUserModals() {
  var addBtn = document.getElementById('add-user-btn')
  var modal = document.getElementById('user-modal')
  var closeBtn = document.getElementById('close-user-btn')
  var form = document.getElementById('user-form')
  if (!modal) return
  function closeModal() { modal.classList.add('hidden'); currentEditUserId = null }
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      currentEditUserId = null
      if (form) form.reset()
      document.getElementById('user-modal-title').innerText = 'Add New User'
      modal.classList.remove('hidden')
    })
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal() })
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var name = document.getElementById('user-name').value
      var email = document.getElementById('user-email').value
      var role = document.getElementById('user-role').value
      var status = document.getElementById('user-status').value
      if (currentEditUserId) {
        var idx = platformUsers.findIndex(function (u) { return u.id === currentEditUserId })
        if (idx !== -1) {
          platformUsers[idx].name = name
          platformUsers[idx].email = email
          platformUsers[idx].role = role
          platformUsers[idx].status = status
          logActivity('User updated', name + ' (' + role + ')')
          Toast.success('User updated successfully!')
        }
      } else {
        var newUser = {
          id: 'usr-' + Date.now(),
          name: name,
          email: email,
          role: role,
          joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: status
        }
        platformUsers.push(newUser)
        logActivity('User added', name + ' (' + role + ')')
        Toast.success('User added successfully!')
      }
      saveData(USERS_KEY, platformUsers)
      renderUsersTable()
      renderStats()
      closeModal()
    })
  }
}

window.openEditUserModal = function (userId) {
  var user = platformUsers.find(function (u) { return u.id === userId })
  if (!user) return
  currentEditUserId = user.id
  document.getElementById('user-modal-title').innerText = 'Edit User'
  document.getElementById('user-name').value = user.name
  document.getElementById('user-email').value = user.email
  document.getElementById('user-role').value = user.role
  document.getElementById('user-status').value = user.status
  document.getElementById('user-modal').classList.remove('hidden')
}

window.deleteUser = function (userId) {
  if (!confirm('Are you sure you want to remove this user?')) return
  var user = platformUsers.find(function (u) { return u.id === userId })
  platformUsers = platformUsers.filter(function (u) { return u.id !== userId })
  saveData(USERS_KEY, platformUsers)
  renderUsersTable()
  renderStats()
  if (user) logActivity('User removed', user.name)
  Toast.success('User removed successfully!')
}

function initCompanyModals() {
  var addBtn = document.getElementById('add-company-btn')
  var modal = document.getElementById('company-modal')
  var closeBtn = document.getElementById('close-company-btn')
  var form = document.getElementById('company-form')
  if (!modal) return
  function closeModal() { modal.classList.add('hidden'); currentEditCompanyId = null }
  if (addBtn) {
    addBtn.addEventListener('click', function () {
      currentEditCompanyId = null
      if (form) form.reset()
      document.getElementById('company-modal-title').innerText = 'Add Partner Company'
      modal.classList.remove('hidden')
    })
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal() })
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var name = document.getElementById('comp-name').value
      var industry = document.getElementById('comp-industry').value
      var location = document.getElementById('comp-location').value
      var placed = parseInt(document.getElementById('comp-placed').value) || 0
      var status = document.getElementById('comp-status').value
      if (currentEditCompanyId) {
        var idx = companies.findIndex(function (c) { return c.id === currentEditCompanyId })
        if (idx !== -1) {
          companies[idx].name = name
          companies[idx].industry = industry
          companies[idx].location = location
          companies[idx].placed = placed
          companies[idx].status = status
          logActivity('Company updated', name)
          Toast.success('Company updated successfully!')
        }
      } else {
        var newCompany = { id: 'comp-' + Date.now(), name: name, industry: industry, location: location, placed: placed, status: status }
        companies.push(newCompany)
        logActivity('Company added', name)
        Toast.success('Company added successfully!')
      }
      saveData(COMPANIES_KEY, companies)
      renderCompaniesTable()
      renderStats()
      closeModal()
    })
  }
}

window.openEditCompanyModal = function (companyId) {
  var comp = companies.find(function (c) { return c.id === companyId })
  if (!comp) return
  currentEditCompanyId = comp.id
  document.getElementById('company-modal-title').innerText = 'Edit Company'
  document.getElementById('comp-name').value = comp.name
  document.getElementById('comp-industry').value = comp.industry
  document.getElementById('comp-location').value = comp.location
  document.getElementById('comp-placed').value = comp.placed
  document.getElementById('comp-status').value = comp.status
  document.getElementById('company-modal').classList.remove('hidden')
}

window.deleteCompany = function (companyId) {
  if (!confirm('Are you sure you want to remove this company?')) return
  var comp = companies.find(function (c) { return c.id === companyId })
  companies = companies.filter(function (c) { return c.id !== companyId })
  saveData(COMPANIES_KEY, companies)
  renderCompaniesTable()
  renderStats()
  if (comp) logActivity('Company removed', comp.name)
  Toast.success('Company removed successfully!')
}
