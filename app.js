// Data Storage (using localStorage for persistence)
let users = JSON.parse(localStorage.getItem('users')) || [];
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let selectedClassId = null;
let selectedAssignmentId = null;
let selectedConversationId = null;
let selectedFiles = [];
let selectedStudentId = null;

// Initialize demo data if needed
function initializeDemoData() {
    if (users.length === 0) {
        users = [
            {
                id: 'user1',
                name: 'John Teacher',
                email: 'teacher@example.com',
                password: 'password123',
                type: 'teacher',
                joined: new Date().toISOString()
            },
            {
                id: 'user2',
                name: 'Jane Student',
                email: 'student@example.com',
                password: 'password123',
                type: 'student',
                joined: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
}

initializeDemoData();

// Handle File Selection
function handleFileSelect() {
    const fileInput = document.getElementById('submissionFiles');
    selectedFiles = Array.from(fileInput.files);
    displayAttachedFiles();
}

// Display Attached Files
function displayAttachedFiles() {
    const container = document.getElementById('attachedFiles');
    if (selectedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const filesHtml = selectedFiles.map((file, index) => `
        <div class="attached-file">
            <span class="file-icon">📄</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${(file.size / 1024).toFixed(2)} KB</span>
            <button type="button" class="file-remove" onclick="removeFile(${index})">✕</button>
        </div>
    `).join('');
    
    container.innerHTML = `<div class="files-list">${filesHtml}</div>`;
}

// Remove File from Selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    document.getElementById('submissionFiles').value = '';
    displayAttachedFiles();
}

// Convert File to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            data: reader.result
        });
        reader.onerror = error => reject(error);
    });
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;

    const user = users.find(u => u.email === email && u.password === password && u.type === userType);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } else {
        alert('Invalid email, password, or role');
    }
}

// Signup Handler
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const type = document.getElementById('signupUserType').value;

    if (users.find(u => u.email === email)) {
        alert('Email already exists');
        return;
    }

    const newUser = {
        id: 'user' + Date.now(),
        name,
        email,
        password,
        type,
        joined: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Account created successfully! Please log in.');
    showLogin();
}

// Show/Hide Screens
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('signupScreen').style.display = 'none';
}

function showSignup() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('signupScreen').style.display = 'flex';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('signupScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';

    updateDashboard();
    showSection('home');
}

// Update Dashboard UI
function updateDashboard() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1);
    document.getElementById('pageTitle').textContent = 'Welcome';

    // Show/Hide navigation items
    if (currentUser.type === 'teacher') {
        document.getElementById('teacherNav').style.display = 'block';
        document.getElementById('studentNav').style.display = 'none';
        document.getElementById('createClassNav').style.display = 'block';
        document.getElementById('joinClassNav').style.display = 'none';
    } else {
        document.getElementById('teacherNav').style.display = 'none';
        document.getElementById('studentNav').style.display = 'block';
        document.getElementById('createClassNav').style.display = 'none';
        document.getElementById('joinClassNav').style.display = 'block';
    }
}

// Show Section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    document.getElementById(sectionId).style.display = 'block';

    // Update page title
    const titles = {
        'home': 'Welcome',
        'classes': 'My Classes',
        'myClasses': 'My Classes',
        'createClass': 'Create Class',
        'joinClass': 'Join Class',
        'classDetail': 'Class Detail',
        'editClass': 'Edit Class',
        'assignmentDetail': 'Assignment',
        'messages': 'Messages',
        'profile': 'Profile'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'ClassHub';

    // Load section-specific content
    if (sectionId === 'home') {
        loadHome();
    } else if (sectionId === 'classes') {
        loadClasses();
    } else if (sectionId === 'myClasses') {
        loadStudentClasses();
    } else if (sectionId === 'classDetail') {
        loadClassDetail();
    } else if (sectionId === 'messages') {
        loadMessages();
    } else if (sectionId === 'profile') {
        loadProfile();
    }
}

// Load Home
function loadHome() {
    const statsHtml = currentUser.type === 'teacher'
        ? `<div class="stat-card">
            <h3>${classes.filter(c => c.teacherId === currentUser.id).length}</h3>
            <p>Classes Created</p>
        </div>
        <div class="stat-card">
            <h3>${classes.filter(c => c.teacherId === currentUser.id).reduce((sum, c) => sum + (c.students || []).length, 0)}</h3>
            <p>Total Students</p>
        </div>
        <div class="stat-card">
            <h3>${classes.filter(c => c.teacherId === currentUser.id).reduce((sum, c) => sum + (c.assignments || []).length, 0)}</h3>
            <p>Assignments Created</p>
        </div>`
        : `<div class="stat-card">
            <h3>${classes.filter(c => (c.students || []).includes(currentUser.id)).length}</h3>
            <p>Classes Joined</p>
        </div>
        <div class="stat-card">
            <h3>${classes.filter(c => (c.students || []).includes(currentUser.id)).reduce((sum, c) => sum + (c.assignments || []).length, 0)}</h3>
            <p>Total Assignments</p>
        </div>
        <div class="stat-card">
            <h3>${classes.filter(c => (c.students || []).includes(currentUser.id)).reduce((sum, c) => sum + (c.assignments || []).filter(a => getCurrentUserSubmission(a.id) !== null).length, 0)}</h3>
            <p>Submissions</p>
        </div>`;

    document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.name}! Ready to continue learning and teaching?`;
    document.getElementById('quickStats').innerHTML = statsHtml;
}

// Create Class Handler
function handleCreateClass(e) {
    e.preventDefault();
    const name = document.getElementById('className').value;
    const description = document.getElementById('classDescription').value;
    const subject = document.getElementById('classSubject').value;
    const room = document.getElementById('classRoom').value;

    const newClass = {
        id: 'class' + Date.now(),
        name,
        description,
        subject,
        room,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        code: generateClassCode(),
        students: [],
        assignments: [],
        announcements: [],
        gradeCategories: [],
        streamEvents: [],
        createdAt: new Date().toISOString()
    };

    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));

    alert(`Class created! Code: ${newClass.code}`);
    document.getElementById('createClassForm').reset();
    showSection('classes');
}

// Generate Class Code
function generateClassCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Load Teacher Classes
function loadClasses() {
    const teacherClasses = classes.filter(c => c.teacherId === currentUser.id);
    const html = teacherClasses.length > 0
        ? teacherClasses.map(c => `
            <div class="class-card" onclick="openClass('${c.id}')">
                <div class="class-card-header">
                    <h3>${c.name}</h3>
                    <p>${c.subject || 'No subject'}</p>
                </div>
                <div class="class-card-body">
                    <p><strong>Code:</strong> <span class="class-code">${c.code}</span></p>
                    <p><strong>Students:</strong> ${c.students ? c.students.length : 0}</p>
                    <p><strong>Assignments:</strong> ${c.assignments ? c.assignments.length : 0}</p>
                </div>
            </div>
        `).join('')
        : '<p>You haven\'t created any classes yet.</p>';

    document.getElementById('classesContainer').innerHTML = html;
}

// Load Student Classes
function loadStudentClasses() {
    const studentClasses = classes.filter(c => c.students && c.students.includes(currentUser.id));
    const html = studentClasses.length > 0
        ? studentClasses.map(c => `
            <div class="class-card" onclick="openClass('${c.id}')">
                <div class="class-card-header">
                    <h3>${c.name}</h3>
                    <p>Teacher: ${c.teacherName}</p>
                </div>
                <div class="class-card-body">
                    <p><strong>Subject:</strong> ${c.subject || 'No subject'}</p>
                    <p><strong>Assignments:</strong> ${c.assignments ? c.assignments.length : 0}</p>
                    <p><strong>Room:</strong> ${c.room || 'Not specified'}</p>
                </div>
            </div>
        `).join('')
        : '<p>You haven\'t joined any classes yet.</p>';

    document.getElementById('studentClassesContainer').innerHTML = html;
}

// Join Class Handler
function handleJoinClass(e) {
    e.preventDefault();
    const code = document.getElementById('classCode').value.toUpperCase();

    const targetClass = classes.find(c => c.code === code);

    if (!targetClass) {
        alert('Invalid class code');
        return;
    }

    if (!targetClass.students) {
        targetClass.students = [];
    }

    if (targetClass.students.includes(currentUser.id)) {
        alert('You are already in this class');
        return;
    }

    targetClass.students.push(currentUser.id);
    localStorage.setItem('classes', JSON.stringify(classes));

    alert(`Successfully joined class: ${targetClass.name}`);
    document.getElementById('joinClassForm').reset();
    showSection('myClasses');
}

// Open Class
function openClass(classId) {
    selectedClassId = classId;
    showSection('classDetail');
}

// Load Class Detail
function loadClassDetail() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    document.getElementById('classDetailTitle').textContent = targetClass.name;
    document.getElementById('classDetailTeacher').textContent = `Teacher: ${targetClass.teacherName}`;

    // Show edit button only for teachers
    if (currentUser.type === 'teacher' && currentUser.id === targetClass.teacherId) {
        document.getElementById('editClassBtn').style.display = 'inline-block';
        document.getElementById('announcementForm').style.display = 'block';
        document.getElementById('assignmentForm').style.display = 'block';
        document.getElementById('categoryManagementBtn').style.display = 'inline-block';
    } else {
        document.getElementById('editClassBtn').style.display = 'none';
        document.getElementById('announcementForm').style.display = 'none';
        document.getElementById('assignmentForm').style.display = 'none';
        document.getElementById('categoryManagementBtn').style.display = 'none';
    }

    loadStream();
}

// Switch Tab
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const tabId = tabName + 'Tab';
    document.getElementById(tabId).style.display = 'block';
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');

    // Load tab content
    if (tabName === 'stream') {
        loadStream();
    } else if (tabName === 'classwork') {
        loadClasswork();
    } else if (tabName === 'grades') {
        loadGrades();
    } else if (tabName === 'members') {
        loadMembers();
    }
}

// Load Stream (Announcements + Assignments)
function loadStream() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    const streamEvents = targetClass.streamEvents || [];
    const sortedEvents = [...streamEvents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const html = sortedEvents.length > 0
        ? sortedEvents.map(event => {
            if (event.type === 'announcement') {
                return `
                    <div class="stream-item announcement-item">
                        <div class="stream-item-header">
                            <div>
                                <h4>📢 ${event.authorName}</h4>
                                <span class="stream-item-time">${new Date(event.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="stream-item-content">${event.content}</div>
                    </div>
                `;
            } else if (event.type === 'assignment') {
                return `
                    <div class="stream-item assignment-stream-item" onclick="openAssignment('${event.assignmentId}')">
                        <div class="stream-item-header">
                            <div>
                                <h4>📋 ${event.title}</h4>
                                <span class="stream-item-time">Posted: ${new Date(event.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="stream-item-content">
                            <p>${event.description || 'No description'}</p>
                            <p><strong>Due:</strong> ${new Date(event.dueDate).toLocaleDateString()}</p>
                            <p><strong>Points:</strong> ${event.points}</p>
                        </div>
                    </div>
                `;
            }
        }).join('')
        : '<p>No announcements or assignments yet.</p>';

    document.getElementById('streamContainer').innerHTML = html;
}

// Post Announcement Handler
function handlePostAnnouncement(e) {
    e.preventDefault();
    const content = document.getElementById('announcementText').value;

    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    if (!targetClass.streamEvents) {
        targetClass.streamEvents = [];
    }
    if (!targetClass.announcements) {
        targetClass.announcements = [];
    }

    targetClass.announcements.push({
        id: 'announcement' + Date.now(),
        authorName: currentUser.name,
        authorId: currentUser.id,
        content,
        createdAt: new Date().toISOString()
    });

    targetClass.streamEvents.push({
        id: 'event' + Date.now(),
        type: 'announcement',
        authorName: currentUser.name,
        authorId: currentUser.id,
        content,
        createdAt: new Date().toISOString()
    });

    localStorage.setItem('classes', JSON.stringify(classes));
    document.getElementById('announcementText').value = '';
    loadStream();
}

// Load Classwork
function loadClasswork() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    const assignments = targetClass.assignments || [];
    const html = assignments.length > 0
        ? assignments.map(a => {
            let status = 'assigned';
            if (currentUser.type === 'student') {
                const submission = getCurrentUserSubmission(a.id);
                if (submission) {
                    status = submission.grade ? 'returned' : 'submitted';
                } else if (new Date(a.dueDate) < new Date()) {
                    status = 'overdue';
                }
            }
            return `
                <div class="assignment-item" onclick="openAssignment('${a.id}')">
                    <div class="assignment-item-header">
                        <div>
                            <h4>${a.title}</h4>
                            <div class="assignment-item-meta">
                                <span>Due: ${new Date(a.dueDate).toLocaleDateString()}</span>
                                <span>${a.points} points</span>
                            </div>
                        </div>
                        <span class="assignment-status status-${status}">${status}</span>
                    </div>
                </div>
            `;
        }).join('')
        : '<p>No assignments yet.</p>';

    document.getElementById('classworkContainer').innerHTML = html;
}

// Create Assignment Handler
function handleCreateAssignment(e) {
    e.preventDefault();
    const title = document.getElementById('assignmentTitle').value;
    const description = document.getElementById('assignmentDescription').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    const points = document.getElementById('assignmentPoints').value || 100;
    const category = document.getElementById('assignmentCategory').value || 'General';

    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    if (!targetClass.assignments) {
        targetClass.assignments = [];
    }
    if (!targetClass.streamEvents) {
        targetClass.streamEvents = [];
    }

    const newAssignment = {
        id: 'assignment' + Date.now(),
        title,
        description,
        dueDate,
        points,
        category,
        createdBy: currentUser.id,
        submissions: [],
        comments: [],
        createdAt: new Date().toISOString()
    };

    targetClass.assignments.push(newAssignment);

    // Add to stream
    targetClass.streamEvents.push({
        id: 'event' + Date.now(),
        type: 'assignment',
        assignmentId: newAssignment.id,
        title,
        description,
        dueDate,
        points,
        createdAt: new Date().toISOString()
    });

    localStorage.setItem('classes', JSON.stringify(classes));
    document.getElementById('assignmentTitle').value = '';
    document.getElementById('assignmentDescription').value = '';
    document.getElementById('assignmentDueDate').value = '';
    document.getElementById('assignmentPoints').value = '';
    loadClasswork();
    loadStream();
}

// Open Assignment
function openAssignment(assignmentId) {
    selectedAssignmentId = assignmentId;
    selectedFiles = [];
    showSection('assignmentDetail');
    document.getElementById('submissionFiles').removeEventListener('change', handleFileSelect);
    document.getElementById('submissionFiles').addEventListener('change', handleFileSelect);
}

// Load Assignment Detail
function loadAssignmentDetail() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignment = targetClass.assignments.find(a => a.id === selectedAssignmentId);
    if (!assignment) return;

    document.getElementById('assignmentDetailTitle').textContent = assignment.title;
    document.getElementById('assignmentDetailDue').textContent = `Due: ${new Date(assignment.dueDate).toLocaleDateString()}`;
    document.getElementById('assignmentDetailPoints').textContent = `${assignment.points} points`;
    document.getElementById('assignmentDetailDesc').innerHTML = `<p>${assignment.description || 'No description'}</p>`;

    // Show submission form for students
    if (currentUser.type === 'student') {
        document.getElementById('submissionSection').style.display = 'block';
        document.getElementById('submissionsView').style.display = 'none';
        loadSubmissionStatus(assignment);
    } else {
        document.getElementById('submissionSection').style.display = 'none';
        document.getElementById('submissionsView').style.display = 'block';
        loadSubmissions(assignment);
    }

    loadComments(assignment);
}

// Get current user submission
function getCurrentUserSubmission(assignmentId) {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignment = targetClass.assignments.find(a => a.id === assignmentId);
    if (!assignment) return null;
    return assignment.submissions.find(s => s.studentId === currentUser.id);
}

// Load Submission Status
function loadSubmissionStatus(assignment) {
    const submission = getCurrentUserSubmission(assignment.id);
    let statusHtml = '';
    
    if (submission) {
        statusHtml = `<div class="submission-status">
            <p><strong>✅ Status:</strong> Submitted on ${new Date(submission.submittedAt).toLocaleDateString()}</p>
            ${submission.grade ? `<p><strong>📊 Grade:</strong> ${submission.grade}/${assignment.points}</p>` : '<p>⏳ Waiting for grading...</p>'}
            ${submission.notes ? `<p><strong>📝 Notes:</strong> ${submission.notes}</p>` : ''}
            ${submission.feedback ? `<p><strong>💬 Teacher Feedback:</strong> ${submission.feedback}</p>` : ''}
            ${submission.files && submission.files.length > 0 ? `
                <div class="submission-files">
                    <p><strong>📎 Attached Files:</strong></p>
                    ${submission.files.map(file => `
                        <div class="file-link">
                            <span>📄 ${file.name}</span>
                            <span class="file-size">(${(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>`;
    } else {
        statusHtml = '<div class="submission-status"><p>You haven\'t submitted this assignment yet.</p></div>';
    }

    document.getElementById('submissionStatus').innerHTML = statusHtml;
}

// Submit Work Handler
async function handleSubmitWork() {
    const notes = document.getElementById('submissionText').value;
    
    if (selectedFiles.length === 0 && !notes) {
        alert('Please add files or write notes for your submission');
        return;
    }

    // Convert files to base64
    let filesData = [];
    for (let file of selectedFiles) {
        const fileData = await fileToBase64(file);
        filesData.push(fileData);
    }

    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignment = targetClass.assignments.find(a => a.id === selectedAssignmentId);

    let submission = assignment.submissions.find(s => s.studentId === currentUser.id);
    if (submission) {
        submission.notes = notes;
        submission.files = filesData;
        submission.submittedAt = new Date().toISOString();
    } else {
        assignment.submissions.push({
            id: 'submission' + Date.now(),
            studentId: currentUser.id,
            studentName: currentUser.name,
            notes,
            files: filesData,
            submittedAt: new Date().toISOString(),
            grade: null,
            feedback: ''
        });
    }

    localStorage.setItem('classes', JSON.stringify(classes));
    document.getElementById('submissionText').value = '';
    document.getElementById('submissionFiles').value = '';
    selectedFiles = [];
    displayAttachedFiles();
    loadSubmissionStatus(assignment);
    alert('Assignment submitted successfully!');
}

// Load Submissions (Teacher View)
function loadSubmissions(assignment) {
    const submissionsHtml = assignment.submissions && assignment.submissions.length > 0
        ? assignment.submissions.map(s => `
            <div class="submission-item">
                <div class="submission-item-header">
                    <div>
                        <span class="submission-item-name">${s.studentName}</span>
                        <span class="submission-item-date">${new Date(s.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <span class="submission-item-score">${s.grade !== null && s.grade !== undefined ? s.grade : 'Not graded'}</span>
                </div>
                ${s.notes ? `<div class="submission-item-notes"><strong>Student Notes:</strong> ${s.notes}</div>` : ''}
                ${s.feedback ? `<div class="submission-item-feedback"><strong>Your Feedback:</strong> ${s.feedback}</div>` : ''}
                ${s.files && s.files.length > 0 ? `
                    <div class="submission-files">
                        <strong>📎 Attached Files:</strong>
                        ${s.files.map(file => `
                            <div class="file-item">
                                <span>📄 ${file.name}</span>
                                <span class="file-size">(${(file.size / 1024).toFixed(2)} KB)</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                <div class="submission-actions">
                    <button class="btn-primary" onclick="gradeSubmissionForm('${s.id}')">Grade Submission</button>
                </div>
            </div>
        `).join('')
        : '<p>No submissions yet.</p>';

    document.getElementById('submissionsContainer').innerHTML = submissionsHtml;
}

// Grade Submission Form
function gradeSubmissionForm(submissionId) {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignment = targetClass.assignments.find(a => a.id === selectedAssignmentId);
    const submission = assignment.submissions.find(s => s.id === submissionId);

    const grade = prompt(`Enter grade (out of ${assignment.points}):`, submission.grade || '');
    if (grade === null) return;

    const feedback = prompt('Add feedback for the student (optional):', submission.feedback || '');
    
    submission.grade = parseFloat(grade) || null;
    submission.feedback = feedback || '';

    localStorage.setItem('classes', JSON.stringify(classes));
    loadSubmissions(assignment);
    recalculateAllGrades();
}

// Load Comments
function loadComments(assignment) {
    const commentsHtml = assignment.comments && assignment.comments.length > 0
        ? assignment.comments.map(c => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${c.authorName}</span>
                    <span class="comment-time">${new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="comment-text">${c.content}</div>
            </div>
        `).join('')
        : '<p>No comments yet.</p>';

    document.getElementById('commentsContainer').innerHTML = commentsHtml;
}

// Add Comment Handler
function handleAddComment() {
    const content = document.getElementById('commentText').value;
    if (!content) return;

    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignment = targetClass.assignments.find(a => a.id === selectedAssignmentId);

    if (!assignment.comments) {
        assignment.comments = [];
    }

    assignment.comments.push({
        id: 'comment' + Date.now(),
        authorName: currentUser.name,
        authorId: currentUser.id,
        content,
        createdAt: new Date().toISOString()
    });

    localStorage.setItem('classes', JSON.stringify(classes));
    document.getElementById('commentText').value = '';
    loadComments(assignment);
}

// Grade Categories Management
function showGradeCategoryManager() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const categories = targetClass.gradeCategories || [];

    let html = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>Manage Grade Categories</h2>
                    <button class="modal-close" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="categories-list">
    `;

    categories.forEach(cat => {
        html += `
            <div class="category-item">
                <div class="category-info">
                    <span class="category-name">${cat.name}</span>
                    <span class="category-weight">${cat.weight}% of grade</span>
                </div>
                <button class="btn-danger" onclick="deleteCategory('${cat.id}')">Delete</button>
            </div>
        `;
    });

    html += `
                    </div>
                    <div class="add-category-form">
                        <h3>Add New Category</h3>
                        <div class="form-group">
                            <label for="newCategoryName">Category Name</label>
                            <input type="text" id="newCategoryName" placeholder="e.g., Tests, Homework, Classwork">
                        </div>
                        <div class="form-group">
                            <label for="newCategoryWeight">Weight (%)</label>
                            <input type="number" id="newCategoryWeight" min="0" max="100" placeholder="e.g., 30">
                        </div>
                        <button class="btn-primary" onclick="addCategory()">Add Category</button>
                        <button class="btn-secondary" onclick="closeModal()">Done</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

function addCategory() {
    const name = document.getElementById('newCategoryName').value;
    const weight = parseFloat(document.getElementById('newCategoryWeight').value);

    if (!name || isNaN(weight)) {
        alert('Please fill in all fields');
        return;
    }

    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass.gradeCategories) {
        targetClass.gradeCategories = [];
    }

    targetClass.gradeCategories.push({
        id: 'category' + Date.now(),
        name,
        weight
    });

    localStorage.setItem('classes', JSON.stringify(classes));
    closeModal();
    showGradeCategoryManager();
}

function deleteCategory(categoryId) {
    const targetClass = classes.find(c => c.id === selectedClassId);
    targetClass.gradeCategories = targetClass.gradeCategories.filter(c => c.id !== categoryId);
    localStorage.setItem('classes', JSON.stringify(classes));
    closeModal();
    showGradeCategoryManager();
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

// Calculate Overall Grade
function calculateStudentGrade(studentId) {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const categories = targetClass.gradeCategories || [];

    if (categories.length === 0) {
        return null; // No categories configured
    }

    let weightedSum = 0;
    let totalWeight = 0;

    categories.forEach(category => {
        const assignments = targetClass.assignments.filter(a => a.category === category.name);
        if (assignments.length === 0) return;

        let categorySum = 0;
        let categoryCount = 0;

        assignments.forEach(assignment => {
            const submission = assignment.submissions.find(s => s.studentId === studentId);
            if (submission && submission.grade !== null && submission.grade !== undefined) {
                categorySum += (submission.grade / assignment.points) * 100;
                categoryCount++;
            }
        });

        if (categoryCount > 0) {
            const categoryAverage = categorySum / categoryCount;
            weightedSum += categoryAverage * (category.weight / 100);
            totalWeight += category.weight / 100;
        }
    });

    if (totalWeight === 0) return null;
    return (weightedSum / totalWeight).toFixed(2);
}

function recalculateAllGrades() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    targetClass.students.forEach(studentId => {
        calculateStudentGrade(studentId);
    });
}

// Load Grades (Teacher and Student view)
function loadGrades() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignments = targetClass.assignments || [];

    if (currentUser.type === 'student') {
        // Student view - show their grades by category
        const categories = targetClass.gradeCategories || [];
        let gradesHtml = '';

        if (categories.length > 0) {
            gradesHtml = `
                <div class="grades-summary">
                    <h3>Overall Grade: ${calculateStudentGrade(currentUser.id) || 'N/A'}%</h3>
                </div>
                <table class="grades-table">
                    <thead>
                        <tr>
                            <th>Assignment</th>
                            <th>Category</th>
                            <th>Due Date</th>
                            <th>Grade</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            assignments.forEach(a => {
                const submission = a.submissions.find(s => s.studentId === currentUser.id);
                const grade = submission && submission.grade !== null && submission.grade !== undefined ? `${submission.grade}/${a.points}` : 'N/A';
                const status = submission ? (submission.grade !== null && submission.grade !== undefined ? 'Graded' : 'Submitted') : 'Not submitted';
                gradesHtml += `<tr>
                    <td>${a.title}</td>
                    <td>${a.category || 'General'}</td>
                    <td>${new Date(a.dueDate).toLocaleDateString()}</td>
                    <td>${grade}</td>
                    <td>${status}</td>
                </tr>`;
            });

            gradesHtml += `
                    </tbody>
                </table>
            `;
        } else {
            gradesHtml = '<p>Teacher hasn\'t set up grade categories yet.</p>';
        }
        document.getElementById('gradesContainer').innerHTML = gradesHtml;
    } else {
        // Teacher view - show all students' grades
        const students = targetClass.students || [];
        const categories = targetClass.gradeCategories || [];

        if (students.length === 0) {
            document.getElementById('gradesContainer').innerHTML = '<p>No students in this class yet.</p>';
            return;
        }

        if (categories.length === 0) {
            document.getElementById('gradesContainer').innerHTML = '<p><strong>⚠️ No grade categories configured.</strong> <button class="btn-primary" onclick="showGradeCategoryManager()">Set up categories</button></p>';
            return;
        }

        let gradesHtml = `
            <div class="grades-header">
                <button class="btn-secondary" onclick="showGradeCategoryManager()">Manage Categories</button>
            </div>
            <table class="grades-table">
                <thead>
                    <tr>
                        <th>Student</th>
        `;

        categories.forEach(cat => {
            gradesHtml += `<th>${cat.name}<br>(${cat.weight}%)</th>`;
        });
        gradesHtml += `<th>Overall Grade</th></tr></thead><tbody>`;

        students.forEach(studentId => {
            const student = users.find(u => u.id === studentId);
            gradesHtml += `<tr><td>${student.name}</td>`;

            categories.forEach(category => {
                const categoryAssignments = assignments.filter(a => a.category === category.name);
                let categoryGrade = '-';
                let categorySum = 0;
                let categoryCount = 0;

                categoryAssignments.forEach(a => {
                    const submission = a.submissions.find(s => s.studentId === studentId);
                    if (submission && submission.grade !== null && submission.grade !== undefined) {
                        categorySum += (submission.grade / a.points) * 100;
                        categoryCount++;
                    }
                });

                if (categoryCount > 0) {
                    categoryGrade = (categorySum / categoryCount).toFixed(1) + '%';
                }

                gradesHtml += `<td>${categoryGrade}</td>`;
            });

            const overallGrade = calculateStudentGrade(studentId);
            gradesHtml += `<td><strong>${overallGrade || '-'}%</strong></td></tr>`;
        });

        gradesHtml += '</tbody></table>';
        document.getElementById('gradesContainer').innerHTML = gradesHtml;
    }
}

// Load Members (Enhanced for Teachers)
function loadMembers() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const students = targetClass.students || [];
    const teacher = users.find(u => u.id === targetClass.teacherId);

    if (currentUser.type === 'student') {
        // Student view - show all members
        const membersHtml = `
            <div class="member-card">
                <div class="member-name">${teacher.name}</div>
                <div class="member-email">${teacher.email}</div>
                <div class="member-role">Teacher</div>
            </div>
            ${students.map(studentId => {
                const student = users.find(u => u.id === studentId);
                return `<div class="member-card">
                    <div class="member-name">${student.name}</div>
                    <div class="member-email">${student.email}</div>
                    <div class="member-role">Student</div>
                </div>`;
            }).join('')}
        `;
        document.getElementById('membersContainer').innerHTML = membersHtml;
    } else {
        // Teacher view - detailed student info and work
        const assignments = targetClass.assignments || [];

        let membersHtml = '<div class="members-teacher-view">';

        if (students.length === 0) {
            membersHtml += '<p>No students in this class yet.</p>';
        } else {
            students.forEach(studentId => {
                const student = users.find(u => u.id === studentId);
                const grade = calculateStudentGrade(studentId) || 'N/A';
                
                let submittedCount = 0;
                let gradedCount = 0;

                assignments.forEach(a => {
                    const submission = a.submissions.find(s => s.studentId === studentId);
                    if (submission) {
                        submittedCount++;
                        if (submission.grade !== null && submission.grade !== undefined) {
                            gradedCount++;
                        }
                    }
                });

                membersHtml += `
                    <div class="student-detail-card">
                        <div class="student-header">
                            <h3>${student.name}</h3>
                            <span class="overall-grade">Grade: ${grade}%</span>
                        </div>
                        <div class="student-info">
                            <p><strong>Email:</strong> ${student.email}</p>
                            <p><strong>Assignments:</strong> ${submittedCount}/${assignments.length} submitted</p>
                            <p><strong>Graded:</strong> ${gradedCount}/${submittedCount || 0} graded</p>
                        </div>
                        <div class="student-work">
                            <h4>Assignment Details:</h4>
                            <table class="student-work-table">
                                <thead>
                                    <tr>
                                        <th>Assignment</th>
                                        <th>Status</th>
                                        <th>Grade</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;

                assignments.forEach(a => {
                    const submission = a.submissions.find(s => s.studentId === studentId);
                    const status = submission ? (submission.grade !== null && submission.grade !== undefined ? 'Graded' : 'Submitted') : 'Not submitted';
                    const gradeDisplay = submission && submission.grade !== null && submission.grade !== undefined ? `${submission.grade}/${a.points}` : '-';
                    
                    membersHtml += `
                        <tr>
                            <td>${a.title}</td>
                            <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                            <td>${gradeDisplay}</td>
                            <td><button class="btn-small" onclick="viewStudentWork('${studentId}', '${a.id}')">View</button></td>
                        </tr>
                    `;
                });

                membersHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });
        }

        membersHtml += '</div>';
        document.getElementById('membersContainer').innerHTML = membersHtml;
    }
}

function viewStudentWork(studentId, assignmentId) {
    selectedStudentId = studentId;
    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignment = targetClass.assignments.find(a => a.id === assignmentId);
    const student = users.find(u => u.id === studentId);
    const submission = assignment.submissions.find(s => s.studentId === studentId);

    let html = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${student.name} - ${assignment.title}</h2>
                    <button class="modal-close" onclick="closeModal()">✕</button>
                </div>
                <div class="modal-body">
    `;

    if (!submission) {
        html += '<p>No submission yet.</p>';
    } else {
        html += `
            <div class="work-details">
                <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleDateString()}</p>
                <p><strong>Current Grade:</strong> ${submission.grade !== null && submission.grade !== undefined ? `${submission.grade}/${assignment.points}` : 'Not graded'}</p>
        `;

        if (submission.notes) {
            html += `<p><strong>Student Notes:</strong> ${submission.notes}</p>`;
        }

        if (submission.files && submission.files.length > 0) {
            html += `
                <div class="work-files">
                    <strong>📎 Files Submitted:</strong>
                    ${submission.files.map(file => `
                        <div class="file-item">
                            <span>📄 ${file.name}</span>
                            <span class="file-size">(${(file.size / 1024).toFixed(2)} KB)</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (submission.feedback) {
            html += `<p><strong>Your Feedback:</strong> ${submission.feedback}</p>`;
        }

        html += `
            <div class="grade-form">
                <div class="form-group">
                    <label for="workGrade">Grade</label>
                    <input type="number" id="workGrade" value="${submission.grade || ''}" max="${assignment.points}" placeholder="Enter grade">
                </div>
                <div class="form-group">
                    <label for="workFeedback">Feedback</label>
                    <textarea id="workFeedback" placeholder="Enter feedback for student">${submission.feedback || ''}</textarea>
                </div>
                <button class="btn-primary" onclick="saveStudentGrade('${studentId}', '${assignmentId}')">Save Grade</button>
            </div>
        `;
    }

    html += `
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

function saveStudentGrade(studentId, assignmentId) {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignment = targetClass.assignments.find(a => a.id === assignmentId);
    const submission = assignment.submissions.find(s => s.studentId === studentId);

    const grade = document.getElementById('workGrade').value;
    const feedback = document.getElementById('workFeedback').value;

    submission.grade = grade ? parseFloat(grade) : null;
    submission.feedback = feedback;

    localStorage.setItem('classes', JSON.stringify(classes));
    closeModal();
    recalculateAllGrades();
    loadMembers();
}

// Edit Class Handler
function handleEditClass(e) {
    e.preventDefault();
    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    targetClass.name = document.getElementById('editClassName').value;
    targetClass.description = document.getElementById('editClassDescription').value;
    targetClass.subject = document.getElementById('editClassSubject').value;
    targetClass.room = document.getElementById('editClassRoom').value;

    localStorage.setItem('classes', JSON.stringify(classes));
    alert('Class updated successfully!');
    showSection('classDetail');
}

// Prepare Edit Form
function prepareEditForm() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    document.getElementById('editClassName').value = targetClass.name;
    document.getElementById('editClassDescription').value = targetClass.description || '';
    document.getElementById('editClassSubject').value = targetClass.subject || '';
    document.getElementById('editClassRoom').value = targetClass.room || '';
}

// Load Messages
function loadMessages() {
    const conversations = [];

    // Get all unique conversation partners
    if (currentUser.type === 'teacher') {
        // Teachers can see all their students
        classes.filter(c => c.teacherId === currentUser.id).forEach(c => {
            c.students.forEach(studentId => {
                if (!conversations.find(conv => conv.userId === studentId)) {
                    const student = users.find(u => u.id === studentId);
                    conversations.push({
                        userId: studentId,
                        name: student.name,
                        role: 'Student'
                    });
                }
            });
        });
    } else {
        // Students can message their teachers
        classes.filter(c => c.students.includes(currentUser.id)).forEach(c => {
            if (!conversations.find(conv => conv.userId === c.teacherId)) {
                const teacher = users.find(u => u.id === c.teacherId);
                conversations.push({
                    userId: c.teacherId,
                    name: teacher.name,
                    role: 'Teacher'
                });
            }
        });
    }

    const conversationsHtml = conversations.length > 0
        ? conversations.map(conv => `
            <div class="conversation-item" onclick="selectConversation('${conv.userId}')">
                <div class="conversation-name">${conv.name}</div>
                <div class="conversation-preview">${conv.role}</div>
            </div>
        `).join('')
        : '<p>No conversations yet.</p>';

    document.getElementById('conversationsList').innerHTML = conversationsHtml;
    document.getElementById('chatWindow').innerHTML = '';
    document.getElementById('messageCompose').style.display = 'none';
}

// Select Conversation
function selectConversation(userId) {
    selectedConversationId = userId;
    const otherUser = users.find(u => u.id === userId);
    document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.conversation-item').classList.add('active');

    // Load messages
    const messages = JSON.parse(localStorage.getItem('messages_' + [currentUser.id, userId].sort().join('_'))) || [];
    const chatHtml = messages.map(msg => `
        <div class="message ${msg.senderId === currentUser.id ? 'sent' : 'received'}">
            ${msg.content}
        </div>
    `).join('');

    document.getElementById('chatWindow').innerHTML = chatHtml || '<p>Start a conversation...</p>';
    document.getElementById('messageCompose').style.display = 'flex';
}

// Send Message Handler
function handleSendMessage() {
    const content = document.getElementById('messageText').value;
    if (!content || !selectedConversationId) return;

    const messageKey = 'messages_' + [currentUser.id, selectedConversationId].sort().join('_');
    const messages = JSON.parse(localStorage.getItem(messageKey)) || [];

    messages.push({
        id: 'msg' + Date.now(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        content,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem(messageKey, JSON.stringify(messages));
    document.getElementById('messageText').value = '';
    selectConversation(selectedConversationId);
}

// Load Profile
function loadProfile() {
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileRole').textContent = currentUser.type.charAt(0).toUpperCase() + currentUser.type.slice(1);
    document.getElementById('profileJoined').textContent = new Date(currentUser.joined).toLocaleDateString();
}

// Logout Handler
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    selectedClassId = null;
    selectedAssignmentId = null;
    selectedConversationId = null;
    selectedFiles = [];
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('signupScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
}

// Update active nav item
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('nav-item')) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        e.target.classList.add('active');
    }
});

// Initialize
if (currentUser) {
    showDashboard();
} else {
    showLogin();
}

// Watch for assignment detail section
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.target.id === 'assignmentDetail' && mutation.target.style.display !== 'none') {
            loadAssignmentDetail();
        } else if (mutation.target.id === 'editClass' && mutation.target.style.display !== 'none') {
            prepareEditForm();
        }
    });
});

observer.observe(document.body, { attributes: true, subtree: true });