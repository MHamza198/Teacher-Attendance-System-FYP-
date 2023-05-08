const express = require('express');
const session = require('express-session');
const router = express.Router();
const Teacher = require('../models/userModel');
const Degree = require('../models/degreeModel');
const Course = require('../models/courseModel');
const AllocateCourse = require('../models/allocationModel');
const Attendance = require('../models/attendanceModel');

const MongoStore = require('connect-mongo');

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: 'sessions'
});
router.use(session({
  secret: 'foo',
  store: sessionStore
}));

      // Add middleware to make session variable available in views
router.use((req, res, next) => {
  res.locals.teacherName = req.session.teacherName;
  next();
});
// Middleware to check if teacher is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session.teacherId) {
    return res.redirect('/teacher/teacherDashboard');
  }
  next();
}

// GET route for teacher login
router.get('/login', isLoggedIn, (req, res) => {
  res.render('teacherPanel/teacherLogin');
});


// POST route for teacher login
// POST route for teacher login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find teacher by email
    const teacher = await Teacher.findOne({ email });

    if (!teacher) {
      return res.render('teacherPanel/teacherLogin', {
        message: 'Invalid email or password'
      });
    }

    // Check password
    if (teacher.password !== password) {
      return res.render('teacherPanel/teacherLogin', {
        message: 'Invalid email or password'
      });
    }

    // Set session
    req.session.teacherId = teacher._id;
    // console.log(teacher.name);
    req.session.teacherName = teacher.name;


    res.redirect('/teacher/teacherDashboard');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

// Teacher Dashboard

router.get('/teacherDashboard', async (req, res) => {
  if (req.session.teacherId) {
    try {
      const teacher = await Teacher.findById(req.session.teacherId);
      const data = { teacher: teacher.toObject() };
      res.render('teacherPanel/teacherDashboard', data);
    } catch (err) {
      console.error(err);
      res.render('error/500');
    }
  } else {
    res.redirect('/teacher/login');
  }
});

// Mark Attendance Page
router.get('/markAttendance', async (req, res) => {
  try {
    // Get teacher's courses
    const teacher = await Teacher.findById(req.session.teacherId);
    if (!teacher) {
      // Handle case where teacher is not found
      return res.render('error/404');
    }
    const allocatedCourses = await AllocateCourse.find({ teacher: teacher._id })
    .populate('course_code')
    .populate('course_name')
    .populate('degree_name')
    .lean();
    
    res.render('teacherPanel/markAttendance', { allocatedCourses });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});
router.post('/markAttendance', async (req, res) => {
  try {
    const { course_name, course_code, degree_name, semester, date, day, attendance } = req.body;
    const existingAttendance = await Attendance.findOne({ course_name, course_code, degree_name, semester, date });
    if (existingAttendance) {
      const message = `Attendance already marked for ${existingAttendance.course_code} on ${existingAttendance.date}`;
      const teacher = await Teacher.findById(req.session.teacherId);
      if (!teacher) {
        // Handle case where teacher is not found
        return res.render('error/404');
      }
      const allocatedCourses = await AllocateCourse.find({ teacher: teacher._id })
      .populate('course_code')
      .populate('course_name')
      .populate('degree_name')
      .lean();
      return res.render('teacherPanel/markAttendance', { message, allocatedCourses });
    }
    await Attendance.create({ course_name, course_code, degree_name, semester, date, day, attendance });
    res.redirect('/teacher/markAttendance');
  } catch (err) {
    console.error(err);
    const teacher = await Teacher.findById(req.session.teacherId);
    if (!teacher) {
      // Handle case where teacher is not found
      return res.render('error/404');
    }
    const allocatedCourses = await AllocateCourse.find({ teacher: teacher._id })
    .populate('course_code')
    .populate('course_name')
    .populate('degree_name')
    .lean();
    res.render('teacherPanel/markAttendance', { allocatedCourses, error: 'Internal Server Error' });
  }
});





// GET route to show attendance records
router.get('/attendanceRecords', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.session.teacherId);
    if (!teacher) {
      // Handle case where teacher is not found
      return res.render('error/404');
    }
    const allocatedCourses = await AllocateCourse.find({ teacher: teacher._id })
    .populate('course_code')
    .populate('course_name')
    .populate('degree_name')
    .lean();

    res.render('teacherPanel/attendanceRecord', {
      allocatedCourses,
      selectedCourseCode: '',
      startDate: '',
      endDate: ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



const { generatePdfReport } = require('../routes/pdfGenerator');

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

    const teacher = await Teacher.findById(req.session.teacherId);
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

    res.render('teacherPanel/attendanceRecord', {
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

router.get('/attendanceRecords/report', async (req, res) => {
  try {
    const { courseCode, startDate, endDate } = req.query;

    let query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (courseCode) {
      query.course_code = courseCode;
    }

    const pdf = await generatePdfReport(query);

    res.type('application/pdf');
    res.attachment('attendanceReport.pdf');
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// GET route for teacher logout
router.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect('/teacher/login');
    }
  });
});






 



module.exports = router;
