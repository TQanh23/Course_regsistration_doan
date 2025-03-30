const express = require('express');
const studentController = require('../controllers/studentController');
const { authenticate, isStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication and student role check to all routes
router.use(authenticate);
router.use(isStudent);

// Get all available courses
router.get('/courses', studentController.getAvailableCourses);

// Get student's registered courses
router.get('/my-courses', studentController.getStudentCourses);

// Register for a course
router.post('/register/:courseId', studentController.registerForCourse);

// Drop a course
router.delete('/drop/:courseId', studentController.dropCourse);

// Get student profile
router.get('/profile', studentController.getStudentProfile);

// Update student profile
router.put('/profile', studentController.updateStudentProfile);

// Get registration history
router.get('/registration-history', studentController.getRegistrationHistory);

module.exports = router;