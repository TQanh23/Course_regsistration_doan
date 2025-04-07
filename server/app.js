const express = require('express');
const { createConnection } = require('typeorm');
const path = require('path');
const cookieParser = require('cookie-parser'); // NEW
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const authRoutes = require('./routes/authRoutes'); // NEW
const adminRoutes = require('./routes/adminRoutes'); // NEW
const dbConfig = require('./config/database');
const { isAuthenticated } = require('./middlewares/authMiddleware'); // NEW

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // NEW: Parse cookies

// Authentication routes (public)
app.use('/auth', authRoutes);

// Protected routes
app.use('/courses', isAuthenticated, courseRoutes);
app.use('/students', isAuthenticated, studentRoutes);
app.use('/registrations', isAuthenticated, registrationRoutes);
app.use('/admin', adminRoutes); // Already has middleware in its router

// Home route
app.get('/', (req, res) => {
  // Check if user is logged in
  const token = req.cookies.auth_token;
  if (token) {
    // Try to verify token
    try {
      const jwt = require('jsonwebtoken');
      const authConfig = require('./config/auth');
      const decoded = jwt.verify(token, authConfig.jwtSecret);
      
      // Redirect based on role
      if (decoded.role === 'admin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/students/dashboard');
      }
    } catch (error) {
      // Invalid token, continue to login page
    }
  }
  
  // No token or invalid token, render login page
  res.redirect('/auth/login');
});

const cors = require('cors');

app.use(cors({
  origin: '*', // More restrictive in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database connection and server start
createConnection(dbConfig)
  .then(() => {
    console.log('Connected to database');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log('Error connecting to database:', error));
