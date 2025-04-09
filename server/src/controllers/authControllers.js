const { getRepository } = require('typeorm');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

// Display login form
exports.getLoginForm = (req, res) => {
  res.render('auth/login', { error: null });
};

// Process login
exports.login = async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    let user;
    let repository;
    
    // Determine which repository to use based on role
    if (role === 'admin') {
      repository = getRepository('Admin');
    } else if (role === 'student') {
      repository = getRepository('Student');
    } else {
      return res.render('auth/login', { 
        error: 'Invalid role selected' 
      });
    }
    
    // Find user
    user = await repository.findOne({ where: { username } });
    
    if (!user) {
      return res.render('auth/login', { 
        error: 'Invalid username or password' 
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.render('auth/login', { 
        error: 'Invalid username or password' 
      });
    }
    
    // Create JWT token - FIX: Use process.env.JWT_SECRET to match middleware
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: authConfig.expiresIn }
    );
    
    // Set cookie with token
    res.cookie(authConfig.cookieName, token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Add secure flag for production
      sameSite: 'strict', // Add sameSite protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Redirect based on role
    if (role === 'admin') {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/students/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', { 
      error: 'An error occurred during login' 
    });
  }
};

// Student registration form
exports.getRegisterForm = (req, res) => {
  res.render('auth/register', { error: null });
};

// Process student registration
exports.registerStudent = async (req, res) => {
  try {
    const { username, password, name, email, dateOfBirth } = req.body;
    const studentRepository = getRepository('Student');
    
    // Check if username or email already exists
    const existingStudent = await studentRepository.findOne({
      where: [
        { username },
        { email }
      ]
    });
    
    if (existingStudent) {
      return res.render('auth/register', { 
        error: 'Username or email already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create student
    const student = studentRepository.create({
      username,
      password: hashedPassword,
      name,
      email,
      dateOfBirth: dateOfBirth || null
    });
    
    await studentRepository.save(student);
    
    // Redirect to login
    res.redirect('/auth/login?registered=true');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', { 
      error: 'An error occurred during registration' 
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie(authConfig.cookieName);
  res.redirect('/auth/login');
};