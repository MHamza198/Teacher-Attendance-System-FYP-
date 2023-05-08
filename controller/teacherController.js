// rentalsController.js
const express = require('express');
const router = express.Router();


// Define an array of teachers
const teachers = [
  { name: 'John Smith', email: 'john@example.com', password: 'password123' },
  { name: 'Jane Doe', email: 'jane@example.com', password: 'password456' }
];
router.get('/addTeacher', function(req, res) {
  res.render('rental/addTeacher');
});
router.post('/addTeacher', (req, res) => {
  const { name, email, password } = req.body;
  teachers.push({ name, email, password });
  res.render('rental/addTeacher', { teachers });
});

router.get('/addCourse', function(req, res) {
  res.render('rental/addCourse');
});







module.exports = router;