// Example usage in route files
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Protected route requiring authentication
router.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Route with role-based authorization
router.post('/courses', authenticate, authorize(['admin', 'teacher']), (req, res) => {
  // Only admins can create courses
  // Route handler code...
  
});

// Student-specific route
router.post('/course-registration', authenticate, authorize(['student']), (req, res) => {
  // Only students can register for courses
  // Route handler code...
});