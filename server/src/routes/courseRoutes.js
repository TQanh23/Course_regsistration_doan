// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchCourses);
router.get('/categories', courseController.getCategories);
router.get('/:id', courseController.getCourseById);
router.get('/:id/enrollment', courseController.getCourseEnrollment);

// Protected routes (Admin only)
router.post('/', authMiddleware.authenticateToken, authMiddleware.isAdmin, courseController.createCourse);
router.put('/:id', authMiddleware.authenticateToken, authMiddleware.isAdmin, courseController.updateCourse);
router.delete('/:id', authMiddleware.authenticateToken, authMiddleware.isAdmin, courseController.deleteCourse);
module.exports = router;