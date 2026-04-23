# ClassHub - Classroom Management Platform

A professional, web-based classroom management system inspired by Google Classroom. ClassHub allows teachers to create and manage classes, post assignments and announcements, while students can join classes, submit work, and interact with their teachers.

## Features

### For Teachers
- **Create Classes**: Easily create new classes with unique codes for students to join
- **Manage Classes**: Edit class details, descriptions, and settings
- **Post Announcements**: Share important updates and information with the entire class
- **Create Assignments**: Set up assignments with titles, descriptions, due dates, and point values
- **Grade Submissions**: Review and grade student submissions
- **View Student Progress**: See all student submissions and grades in one place
- **Message Students**: Direct messaging with students for one-on-one communication
- **Class Members**: View all enrolled students in each class

### For Students
- **Join Classes**: Join classes using unique class codes
- **Submit Work**: Submit assignments with detailed responses
- **View Assignments**: See all assignments with due dates and point values
- **Check Grades**: View grades and feedback on submitted work
- **Add Comments**: Comment on assignments and engage in discussions
- **Message Teachers**: Send direct messages to teachers for support
- **Track Progress**: View all assignments, submissions, and grades in one place

### General Features
- **User Authentication**: Secure login and signup for teachers and students
- **Professional UI**: Clean, modern interface inspired by Google Classroom
- **Responsive Design**: Works on desktop and mobile devices
- **Persistent Data**: All data is saved locally using browser storage
- **Real-time Updates**: Changes are immediately reflected across the application

## Getting Started

### Installation
1. Clone or download this repository
2. Open `index.html` in a web browser
3. That's it! No server or database setup required

### Demo Credentials
The application comes with pre-configured demo accounts:

**Teacher Account:**
- Email: `teacher@example.com`
- Password: `password123`
- Role: Teacher

**Student Account:**
- Email: `student@example.com`
- Password: `password123`
- Role: Student

### Creating Your Account
You can also create your own account:
1. Click "Create Account" on the login page
2. Fill in your details (name, email, password)
3. Select your role (Teacher or Student)
4. Click "Create Account"
5. Log in with your new credentials

## How to Use

### For Teachers
1. **Create a Class**
   - Click "Create Class" in the sidebar
   - Fill in the class name, description, subject, and room
   - Click "Create Class"
   - Share the generated class code with students

2. **Post an Announcement**
   - Open a class
   - Click the "Stream" tab
   - Enter your announcement in the text field
   - Click "Post"

3. **Create an Assignment**
   - Open a class
   - Click the "Classwork" tab
   - Fill in the assignment details (title, description, due date, points)
   - Click "Create Assignment"

4. **Grade Student Work**
   - Open a class
   - Click the "Classwork" tab
   - Click on an assignment
   - Review student submissions
   - Click "Grade" and enter the grade

5. **Message a Student**
   - Click "Messages" in the sidebar
   - Select a student from the conversation list
   - Type your message and click "Send"

### For Students
1. **Join a Class**
   - Click "Join Class" in the sidebar
   - Enter the class code provided by your teacher
   - Click "Join Class"

2. **Submit an Assignment**
   - Open a class
   - Click the "Classwork" tab
   - Click on an assignment
   - Enter your submission in the text field
   - Click "Submit Work"

3. **Check Your Grades**
   - Open a class
   - Click the "Grades" tab
   - View all your grades and feedback

4. **Message Your Teacher**
   - Click "Messages" in the sidebar
   - Select your teacher from the conversation list
   - Type your message and click "Send"

5. **Add Comments**
   - Open an assignment
   - Scroll to the comments section
   - Enter your comment and click "Comment"

## File Structure

```
├── index.html      # Main HTML file with all page structure
├── styles.css      # All styling and responsive design
├── app.js          # Application logic and functionality
└── README.md       # This file
```

## Data Storage

ClassHub uses the browser's localStorage to persist data. This means:
- All your data is saved locally on your device
- Data is not shared between different browsers or devices
- Data persists even after closing the browser
- Clearing browser data will delete all ClassHub information

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with HTML5 and localStorage support

## Features Overview

### Stream Tab
- Teachers can post announcements
- Both teachers and students can view the class stream
- Chronological order of all announcements

### Classwork Tab
- Shows all assignments for the class
- Teachers can create new assignments
- Students can view and submit assignments
- Color-coded status indicators (Assigned, Submitted, Graded, Overdue)

### Grades Tab
- Teachers see all students' grades for each assignment
- Students see their own grades and feedback
- Easy-to-read table format

### Members Tab
- View all class members (teacher and students)
- See member names, emails, and roles
- Help students identify their classmates

## Tips for Best Experience

1. **Use Consistent Credentials**: Log in with the same account across sessions
2. **Share Class Codes Safely**: Only give class codes to intended students
3. **Set Clear Due Dates**: Always set due dates for assignments
4. **Use Announcements**: Keep the class informed of important updates
5. **Regular Communication**: Use messaging for direct student-teacher communication

## Limitations and Notes

- This is a local application - all data is stored on your device
- No cloud backup or synchronization
- File uploads are not supported (text-based only)
- No real-time notifications
- Maximum recommended capacity: limited by browser storage (typically 5-10MB)

## Future Enhancements

Potential features for future versions:
- File upload support
- Real-time notifications
- Rubrics for grading
- Discussion forums
- Attendance tracking
- Parent notifications
- Mobile app
- Cloud synchronization
- Calendar view
- Advanced search and filtering

## Support

For issues, suggestions, or feedback, please create an issue in the repository.

## License

This project is open source and available under the MIT License.

## Credits

Inspired by Google Classroom's intuitive and clean design. Built with HTML5, CSS3, and vanilla JavaScript.

---

**Happy Teaching and Learning with ClassHub! 📚**