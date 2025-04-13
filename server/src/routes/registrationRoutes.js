const express = require('express');
const registrationController = require('../controllers/registrationController');
const { authenticateToken, isAdmin, isAdminOrStudent } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Admin-only routes
router.get('/', isAdmin, registrationController.getAllRegistrations);

// Routes with ID parameter - need special handling for user-specific routes
router.get('/user/:userId', isAdminOrStudent, registrationController.getRegistrationsByUser);
router.get('/course/:courseId', isAdmin, registrationController.getRegistrationsByCourse);

// Mixed access routes - controller handles permission checks
router.get('/:id', isAdminOrStudent, registrationController.getRegistrationById);
router.post('/', isAdminOrStudent, registrationController.createRegistration);
router.put('/:id', isAdmin, registrationController.updateRegistration);
router.delete('/:id', isAdminOrStudent, registrationController.deleteRegistration);

module.exports = router;