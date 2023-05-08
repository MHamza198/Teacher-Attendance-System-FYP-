const express = require('express');
const session = require('express-session');
const router = express.Router();
const Teacher = require('../models/userModel');
const Department = require('../models/departmentModel');
const Degree = require('../models/degreeModel');
const Course = require('../models/courseModel');
const AllocateCourse = require('../models/allocationModel');
const Attendance = require('../models/attendanceModel');
// Session middleware
router.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: false
}));
// Home route
router.get("/", async (req, res) => {
  res.render("general/home");
});
// Admin login form
router.get('/login', (req, res) => {
  res.render('adminPanel/adminLogin');
});

// Handle admin login form submission
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@gmail.com' && password === 'password') {
    const user = {
      email: 'admin@gmail.com',
      password: 'password',
      isAdmin: true
    };
    req.session.user = user;
    res.redirect('/admin/dashboard');
  } else {
    res.render('adminPanel/adminLogin', { message: 'Invalid email or password' });
  }
});

// Admin dashboard
router.get('/dashboard', (req, res) => {
  if (req.session.user && req.session.user.isAdmin) {
    res.render('adminPanel/dashboard');
  } else {
    res.redirect('/admin/login');
  }
});

// Define the add teacher route
router.get('/add-teacher', async (req, res) => {
    try {
      const teachers = await Teacher.find().sort({ createdAt: 'desc' }).lean();
      res.render('adminPanel/add-teacher', { teachers });
    } catch (err) {
      console.error(err);
      res.render('error/500');
    }
  });
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// POST route for creating a new teacher
router.post('/add-teacher', async (req, res) => {
  const { name, email, password } = req.body;
  const teacher = new Teacher({ name, email, password });

  try {
    await teacher.save();

   // Send email to teacher
const msg = {
  to: email,
  from: 'muhammadhamza198198@gmail.com', // Update with your email address
  subject: 'Congratulations! Your Teacher Attendance System account has been successfully created.',
  html: `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
          }
          h1, h2, h3, h4, h5, h6 {
            margin-top: 0;
          }
          p {
            margin-top: 0;
            margin-bottom: 10px;
          }
          ul, ol {
            margin-top: 0;
            margin-bottom: 10px;
            padding-left: 0;
          }
          li {
            margin-top: 5px;
            margin-bottom: 5px;
          }
          .container {
            padding: 20px;
            margin: 0 auto;
            max-width: 600px;
          }
          .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 10px;
            text-align: center;
          }
          .header h1 {
            margin-top: 0;
            margin-bottom: 0;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
          }
          .footer {
            background-color: #f5f5f5;
            color: #777777;
            font-size: 12px;
            text-align: center;
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Congratulations! Your account has been successfully created!</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Welcome to the Teacher Attendance System! Your account has been successfully created.</p>
            <p>You can now log in and start marking your attendance record. Here are your login credentials:</p>
            <ul>
              <li>Email: ${email}</li>
              <li>Password: ${password}</li>
            </ul>
            <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
            <p>Thank you for choosing our platform for managing your attendance record. We look forward to supporting you in your teaching journey.</p>
          </div>
          <div class="footer">
            <p>The Teacher Attendance System team</p>      
          </div>
        </div>
      </body>
    </html>
  `,
};
await sgMail.send(msg);

    console.log('Email sent successfully');
    res.redirect('/admin/add-teacher');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Add Department
router.get('/add-department', async (req, res, next) => {
    try {
      const departments = await Department.find().sort({ createdAt: 'asc' }).lean();
      res.render('adminPanel/add-department', { departments });
    } catch (err) {
      next(err);
    }
  });
router.post('/add-department', async (req, res, next) => {
    const { department_name } = req.body;
    try {
      const department = new Department({ department_name });
      await department.save();
      res.redirect('/admin/add-department');
    } catch (err) {
      next(err);
    }
  });
router.post('/remove-department', async (req, res, next) => {
    const { departmentId } = req.body;
    try {
      await Department.findByIdAndDelete(departmentId);
      res.redirect('/admin/add-department');
    } catch (err) {
      next(err);
    }
  });

// Add Degree 
// GET /admin/add-degree
router.get('/add-degree', async (req, res, next) => {
    try {
      const departments = await Department.find().sort({ name: 'asc' }).lean();
      const degrees = await Degree.find()
      .populate('department', 'department_name') // populate department field with department_name field only
      .sort({ createdAt: 'asc' })
      .lean();
      res.render('adminPanel/add-degree', { departments, degrees });
    } catch (err) {
      console.error(err);
      next(err);
    }
});



  // POST /admin/add-degree
  router.post('/add-degree', async (req, res, next) => {
    const { department, degree_name } = req.body;
    try {
      const newDegree = new Degree({
        department,
        degree_name
      });
      await newDegree.save();
      res.redirect('/admin/add-degree');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });
  // POST /admin/remove-degree
router.post('/remove-degree', async (req, res, next) => {
    const { degreeId } = req.body;
    try {
      await Degree.findByIdAndDelete(degreeId);
      res.redirect('/admin/add-degree');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });

  //Add Course
// GET /admin/add-course
router.get('/add-course', async (req, res, next) => {
  try {
      const departments = await Department.find().sort({ department_name: 'asc' }).lean();
      const degrees = await Degree.find().sort({ degree_name: 'asc' }).lean();
      
      const courses = await Course.find()
      .populate('department', 'department_name') // populate department field with department_name field only
      .populate('degree_name', 'degree_name') // populate degree field with degree_name field only
      .sort({ createdAt: 'asc' })
      .lean();
    
      
      res.render('adminPanel/add-course', { departments, degrees, courses });
  } catch (err) {
      console.error(err);
      next(err);
  }
});
  // POST /admin/add-course
  router.post('/add-course', async (req, res, next) => {
    try {
      const { department, degree_name, course_name, course_code } = req.body;
      const course = new Course({ department, degree_name, course_name, course_code });
      await course.save();
      res.redirect('/admin/add-course');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });
  router.post('/remove-course', async (req, res, next) => {
    const { course_id } = req.body;
  
    try {
      const result = await Course.findByIdAndDelete(course_id);
      console.log(result); // log the result of the delete operation to the console
      res.redirect('/admin/add-course');
    } catch (err) {
      console.error(err);
      next(err);
    }
  });
  
// Allocate Course
// GET route to display the form for allocating a course to a teacher
router.get('/allocate-course', async (req, res, next) => {
  try {
    const teachers = await Teacher.find().sort({ name: 'asc' }).lean();
    const degrees = await Degree.find().sort({ degree_name: 'asc' }).lean();
    const courses = await Course.find().sort({ course_name: 'asc' }).lean();
    const allocations = await AllocateCourse.find()
    .populate('teacher')
    .populate('degree_name')
    .populate('course_name')
    .populate('course_code')
    .lean();
   
    res.render('adminPanel/allocate-course', { teachers, degrees, courses, allocations });
  } catch (err) {
    console.error(err);
    next(err);
  }
});


// POST route to handle the allocation of a course to a teacher
router.post('/allocate-course', async (req, res) => {
  try {
    const { teacher, degree_name, course_code, course_name, semester } = req.body;

    // Validation
    if (!teacher || !degree_name || !course_code || !course_name || !semester) {
      return res.status(400).send('Please fill all fields');
    }

    const allocation = new AllocateCourse({
      teacher,
      degree_name,
      course_code,
      course_name,
      semester
    });
    await allocation.save();

    res.redirect('/admin/allocate-course');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/teacher-courses', async (req, res) => {
  try {
    const teacherId = req.body.teacherId;
    const teacher = await Teacher.findById(teacherId).lean();
    if (!teacher) {
      // Handle case where teacher is not found
      return res.render('error/404');
    }
    const allocatedCourses = await AllocateCourse.find({ teacher: teacher._id })
    .populate('course_code')
    .populate('course_name')
    .populate('degree_name')
    .lean();
  // Store the selected teacher ID in the session object
    req.session.teacherId = teacherId;
    
    res.render('adminPanel/attendnace-record', { 
      teacher,
      allocatedCourses
    }); // pass courses to the view as well
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.post('/attendanceRecords', async (req, res) => {
  try {
    const { courseCode, startDate, endDate } = req.body;

    let query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (courseCode) {
      query.course_code = courseCode;
    }

    const teacher = await Teacher.findById(req.session.teacherId).lean();
    if (!teacher) {
      return res.render('error/404');
    }

    const allocatedCourses = await AllocateCourse.find({ teacher: teacher._id })
      .populate('course_code')
      .populate('course_name')
      .populate('degree_name')
      .lean();

    const attendanceRecords = await Attendance.find(query)
      .populate('degree_name course_name course_code')
      .lean();

    res.render('adminPanel/attendnace-record.hbs', {
      teacher,
      allocatedCourses,
      attendanceRecords,
      selectedCourseCode: courseCode,
      startDate,
      endDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/view-attendance', async (req, res) => {
  try {
    const teachers = await Teacher.find().lean();

    res.render('adminPanel/view-attendance', {teachers});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



const handlebars = require('handlebars');
handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});


// Admin logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

module.exports = router;
