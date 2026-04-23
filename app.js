// Data Storage (using localStorage for persistence)
let users = JSON.parse(localStorage.getItem('users')) || [];
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let selectedClassId = null;
let selectedAssignmentId = null;
let selectedConversationId = null;

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
    } else {
        document.getElementById('editClassBtn').style.display = 'none';
        document.getElementById('announcementForm').style.display = 'none';
        document.getElementById('assignmentForm').style.display = 'none';
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

// Load Stream (Announcements)
function loadStream() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    const announcements = targetClass.announcements || [];
    const html = announcements.length > 0
        ? announcements.map(a => `
            <div class="stream-item">
                <div class="stream-item-header">
                    <div>
                        <h4>${a.authorName}</h4>
                        <span class="stream-item-time">${new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="stream-item-content">${a.content}</div>
            </div>
        `).join('')
        : '<p>No announcements yet.</p>';

    document.getElementById('streamContainer').innerHTML = html;
}

// Post Announcement Handler
function handlePostAnnouncement(e) {
    e.preventDefault();
    const content = document.getElementById('announcementText').value;

    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

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

    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    if (!targetClass.assignments) {
        targetClass.assignments = [];
    }

    targetClass.assignments.push({
        id: 'assignment' + Date.now(),
        title,
        description,
        dueDate,
        points,
        createdBy: currentUser.id,
        submissions: [],
        comments: []
    });

    localStorage.setItem('classes', JSON.stringify(classes));
    document.getElementById('assignmentTitle').value = '';
    document.getElementById('assignmentDescription').value = '';
    document.getElementById('assignmentDueDate').value = '';
    document.getElementById('assignmentPoints').value = '';
    loadClasswork();
}

// Open Assignment
function openAssignment(assignmentId) {
    selectedAssignmentId = assignmentId;
    showSection('assignmentDetail');
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
    const statusHtml = submission
        ? `<div class="submission-status">
            <p><strong>Status:</strong> Submitted on ${new Date(submission.submittedAt).toLocaleDateString()}</p>
            ${submission.grade ? `<p><strong>Grade:</strong> ${submission.grade}/${assignment.points}</p>` : '<p>Waiting for grading...</p>'}
            <p><strong>Your Answer:</strong></p>
            <p>${submission.content}</p>
        </div>`
        : '<div class="submission-status"><p>You haven\'t submitted this assignment yet.</p></div>';

    document.getElementById('submissionStatus').innerHTML = statusHtml;
}

// Submit Work Handler
function handleSubmitWork() {
    const content = document.getElementById('submissionText').value;
    if (!content) {
        alert('Please enter your submission');
        return;
    }

    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignment = targetClass.assignments.find(a => a.id === selectedAssignmentId);

    let submission = assignment.submissions.find(s => s.studentId === currentUser.id);
    if (submission) {
        submission.content = content;
        submission.submittedAt = new Date().toISOString();
    } else {
        assignment.submissions.push({
            id: 'submission' + Date.now(),
            studentId: currentUser.id,
            studentName: currentUser.name,
            content,
            submittedAt: new Date().toISOString(),
            grade: null
        });
    }

    localStorage.setItem('classes', JSON.stringify(classes));
    document.getElementById('submissionText').value = '';
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
                    <span class="submission-item-score">${s.grade || 'Not graded'}</span>
                </div>
                <div class="submission-item-content">${s.content}</div>
                <button class="btn-primary" onclick="gradeSubmission('${s.id}')">Grade</button>
            </div>
        `).join('')
        : '<p>No submissions yet.</p>';

    document.getElementById('submissionsContainer').innerHTML = submissionsHtml;
}

// Grade Submission (simplified)
function gradeSubmission(submissionId) {
    const grade = prompt('Enter grade (e.g., 95/100):');
    if (grade) {
        const targetClass = classes.find(c => c.id === selectedClassId);
        const assignment = targetClass.assignments.find(a => a.id === selectedAssignmentId);
        const submission = assignment.submissions.find(s => s.id === submissionId);
        submission.grade = grade;
        localStorage.setItem('classes', JSON.stringify(classes));
        loadSubmissions(assignment);
    }
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

// Load Grades (Teacher view)
function loadGrades() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const assignments = targetClass.assignments || [];

    if (currentUser.type === 'student') {
        // Student view - show their grades
        const gradesHtml = assignments.length > 0
            ? `<table class="grades-table">
                <thead>
                    <tr>
                        <th>Assignment</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${assignments.map(a => {
                        const submission = a.submissions.find(s => s.studentId === currentUser.id);
                        return `<tr>
                            <td>${a.title}</td>
                            <td>${new Date(a.dueDate).toLocaleDateString()}</td>
                            <td>${submission ? (submission.grade ? 'Graded' : 'Submitted') : 'Not submitted'}</td>
                            <td>${submission && submission.grade ? submission.grade : 'N/A'}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>`
            : '<p>No assignments yet.</p>';
        document.getElementById('gradesContainer').innerHTML = gradesHtml;
    } else {
        // Teacher view - show all students grades
        const students = targetClass.students || [];
        const gradesHtml = students.length > 0
            ? `<table class="grades-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        ${assignments.map(a => `<th>${a.title}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${students.map(studentId => {
                        const student = users.find(u => u.id === studentId);
                        return `<tr>
                            <td>${student.name}</td>
                            ${assignments.map(a => {
                                const submission = a.submissions.find(s => s.studentId === studentId);
                                return `<td>${submission && submission.grade ? submission.grade : '-'}</td>`;
                            }).join('')}
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>`
            : '<p>No students in this class yet.</p>';
        document.getElementById('gradesContainer').innerHTML = gradesHtml;
    }
}

// Load Members
function loadMembers() {
    const targetClass = classes.find(c => c.id === selectedClassId);
    const students = targetClass.students || [];
    const teacher = users.find(u => u.id === targetClass.teacherId);

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