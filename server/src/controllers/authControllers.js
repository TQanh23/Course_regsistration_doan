const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * API login for both admin and student users
 */
exports.login = async (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Username, password, and role are required'
    });
  }
  
  if (role !== 'admin' && role !== 'student') {
    return res.status(400).json({
      success: false,
      message: 'Invalid role selected'
    });
  }
  
  try {
    let user;
    let query;
    let passwordField;
    
    // Different queries based on role
    if (role === 'admin') {
      query = 'SELECT * FROM admins WHERE username = ?';
      passwordField = 'password_admin';
    } else {
      query = 'SELECT * FROM students WHERE username = ?';
      passwordField = 'password_student';
    }
    
    // Find user
    const [rows] = await pool.query(query, [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    user = rows[0];
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user[passwordField]);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Update last login time
    const updateQuery = `UPDATE ${role}s SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
    await pool.query(updateQuery, [user.id]);
    
    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Create user data object excluding password
    const userData = { ...user };
    delete userData[passwordField];
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Register a new student
 */
exports.register = async (req, res) => {
  try {
    const { 
      username, 
      password, 
      student_id,
      email, 
      full_name, 
      date_of_birth,
      program_id,
      class: class_name
    } = req.body;
    
    // Validate required fields
    if (!username || !password || !student_id || !email || !full_name || !program_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if program_id exists
    const [programs] = await pool.query('SELECT * FROM academic_programs WHERE id = ?', [program_id]);
    if (programs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid program ID'
      });
    }
    
    // Check if username, student_id, or email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM students WHERE username = ? OR student_id = ? OR email = ?',
      [username, student_id, email]
    );
    
    if (existingUsers.length > 0) {
      let message = 'Registration failed: ';
      if (existingUsers.some(user => user.username === username)) {
        message += 'Username already exists. ';
      }
      if (existingUsers.some(user => user.student_id === student_id)) {
        message += 'Student ID already exists. ';
      }
      if (existingUsers.some(user => user.email === email)) {
        message += 'Email already exists. ';
      }
      
      return res.status(400).json({
        success: false,
        message: message.trim()
      });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new student
    const [result] = await pool.query(
      `INSERT INTO students (
        username, password_student, student_id, email, full_name, 
        date_of_birth, class, program_id, enrollment_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        username, 
        hashedPassword, 
        student_id, 
        email, 
        full_name, 
        date_of_birth || null, 
        class_name || null, 
        program_id
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get the profile of the currently authenticated user
 */
exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    
    let query;
    if (role === 'admin') {
      query = 'SELECT id, username, email, created_at, last_login FROM admins WHERE id = ?';
    } else {
      query = `SELECT s.id, s.username, s.student_id, s.email, s.full_name, s.date_of_birth,
               s.class, s.program_id, s.enrollment_date, s.created_at, s.last_login,
               p.name as program_name, p.description as program_description
               FROM students s
               JOIN academic_programs p ON s.program_id = p.id
               WHERE s.id = ?`;
    }
    
    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Change password for the currently authenticated user
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id, role } = req.user;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    let table, passwordField;
    if (role === 'admin') {
      table = 'admins';
      passwordField = 'password_admin';
    } else {
      table = 'students';
      passwordField = 'password_student';
    }
    
    // Get current password
    const [rows] = await pool.query(`SELECT ${passwordField} FROM ${table} WHERE id = ?`, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, rows[0][passwordField]);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      `UPDATE ${table} SET ${passwordField} = ? WHERE id = ?`,
      [hashedPassword, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Refresh the user's authentication token
 */
exports.refreshToken = async (req, res) => {
  try {
    // Get the current user from the request (set by authenticateToken middleware)
    const { id, username, role } = req.user;
    
    // Create a new JWT token with a fresh expiration time
    const newToken = jwt.sign(
      {
        id,
        username,
        role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' } // Extending token validity to 7 days
    );
    
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};