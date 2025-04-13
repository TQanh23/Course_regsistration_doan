// controllers/courseController.js
const pool = require('../config/db');

/**
 * Get all courses
 * @route GET /api/courses
 * @access Public
 */
const getAllCourses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, cc.name as category_name 
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.active = TRUE
      ORDER BY c.code
    `);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching courses:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courses',
      error: error.message
    });
  }
};

/**
 * Get a single course by ID
 * @route GET /api/courses/:id
 * @access Public
 */
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    const [rows] = await pool.query(`
      SELECT c.*, cc.name as category_name 
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.id = ? AND c.active = TRUE
    `, [courseId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${courseId} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error(`Error fetching course with ID ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course',
      error: error.message
    });
  }
};

/**
 * Create a new course
 * @route POST /api/courses
 * @access Private (Admin only)
 */
const createCourse = async (req, res) => {
  try {
    const { 
      code, 
      title, 
      description, 
      credits, 
      category_id, 
      max_capacity
    } = req.body;
    
    // Get admin ID from authenticated user
    const adminId = req.user.id; // Assuming auth middleware puts user info in req.user
    
    // Validate required fields
    if (!code || !title || !credits) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code, title, and credits'
      });
    }

    // Check if course already exists with the same code
    const [existingCourses] = await pool.query(
      'SELECT * FROM courses WHERE code = ?',
      [code]
    );

    if (existingCourses.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Course with code ${code} already exists`
      });
    }
    
    // Validate category if provided
    if (category_id) {
      const [categoryExists] = await pool.query(
        'SELECT * FROM course_categories WHERE id = ?',
        [category_id]
      );
      
      if (categoryExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Category with ID ${category_id} does not exist`
        });
      }
    }
    
    // Insert the new course
    const [result] = await pool.query(
      `INSERT INTO courses 
        (code, title, description, credits, category_id, max_capacity, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        code, 
        title, 
        description || null, 
        credits, 
        category_id || null, 
        max_capacity || 30, 
        adminId
      ]
    );
    
    // Fetch the newly created course with category name
    const [newCourse] = await pool.query(`
      SELECT c.*, cc.name as category_name 
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse[0]
    });
  } catch (error) {
    console.error('Error creating course:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course',
      error: error.message
    });
  }
};

/**
 * Update a course
 * @route PUT /api/courses/:id
 * @access Private (Admin only)
 */
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { 
      code, 
      title, 
      description, 
      credits, 
      category_id, 
      max_capacity,
      active
    } = req.body;
    
    // Check if course exists
    const [existingCourse] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );
    
    if (existingCourse.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${courseId} not found`
      });
    }
    
    // Check if updating to a code that already exists (excluding this course)
    if (code) {
      const [codeExists] = await pool.query(
        'SELECT * FROM courses WHERE code = ? AND id != ?',
        [code, courseId]
      );
      
      if (codeExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Another course with code ${code} already exists`
        });
      }
    }
    
    // Validate category if provided
    if (category_id) {
      const [categoryExists] = await pool.query(
        'SELECT * FROM course_categories WHERE id = ?',
        [category_id]
      );
      
      if (categoryExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Category with ID ${category_id} does not exist`
        });
      }
    }
    
    // Build update query dynamically based on provided fields
    let updateQuery = 'UPDATE courses SET ';
    const updateValues = [];
    const updateFields = [];
    
    if (code) {
      updateFields.push('code = ?');
      updateValues.push(code);
    }
    
    if (title) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    
    if (credits) {
      updateFields.push('credits = ?');
      updateValues.push(credits);
    }
    
    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(category_id);
    }
    
    if (max_capacity !== undefined) {
      updateFields.push('max_capacity = ?');
      updateValues.push(max_capacity);
    }
    
    if (active !== undefined) {
      updateFields.push('active = ?');
      updateValues.push(active);
    }
    
    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update'
      });
    }
    
    updateQuery += updateFields.join(', ');
    updateQuery += ' WHERE id = ?';
    updateValues.push(courseId);
    
    // Execute the update
    await pool.query(updateQuery, updateValues);
    
    // Get the updated course with category name
    const [updatedCourse] = await pool.query(`
      SELECT c.*, cc.name as category_name 
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.id = ?
    `, [courseId]);
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse[0]
    });
  } catch (error) {
    console.error(`Error updating course with ID ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course',
      error: error.message
    });
  }
};

/**
 * Delete a course (soft delete by setting active=false)
 * @route DELETE /api/courses/:id
 * @access Private (Admin only)
 */
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const [existingCourse] = await pool.query(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );
    
    if (existingCourse.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${courseId} not found`
      });
    }
    
    // Check if course has registrations
    const [registrations] = await pool.query(
      'SELECT COUNT(*) as count FROM registrations WHERE course_id = ?',
      [courseId]
    );
    
    if (registrations[0].count > 0) {
      // Soft delete by setting active=false instead of deleting
      await pool.query('UPDATE courses SET active = FALSE WHERE id = ?', [courseId]);
      
      return res.status(200).json({
        success: true,
        message: `Course with ID ${courseId} has been deactivated because it has ${registrations[0].count} active registrations`
      });
    }
    
    // Hard delete if no registrations
    await pool.query('DELETE FROM courses WHERE id = ?', [courseId]);
    
    res.status(200).json({
      success: true,
      message: `Course with ID ${courseId} deleted successfully`
    });
  } catch (error) {
    console.error(`Error deleting course with ID ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course',
      error: error.message
    });
  }
};

/**
 * Search courses by criteria
 * @route GET /api/courses/search
 * @access Public
 */
const searchCourses = async (req, res) => {
  try {
    const { code, title, category_id, credits } = req.query;
    let query = `
      SELECT c.*, cc.name as category_name 
      FROM courses c
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      WHERE c.active = TRUE
    `;
    const params = [];
    
    if (code) {
      query += ' AND c.code LIKE ?';
      params.push(`%${code}%`);
    }
    
    if (title) {
      query += ' AND c.title LIKE ?';
      params.push(`%${title}%`);
    }
    
    if (category_id) {
      query += ' AND c.category_id = ?';
      params.push(parseInt(category_id));
    }
    
    if (credits) {
      query += ' AND c.credits = ?';
      params.push(parseInt(credits));
    }
    
    query += ' ORDER BY c.code';
    
    const [rows] = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error searching courses:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while searching courses',
      error: error.message
    });
  }
};

/**
 * Get course categories
 * @route GET /api/courses/categories
 * @access Public
 */
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM course_categories
      ORDER BY name
    `);
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching course categories:', error.message);
    res.status(500).json({
      success: false,  
      message: 'Server error while fetching course categories',
      error: error.message
    });
  }
};

/**
 * Get course enrollment status
 * @route GET /api/courses/:id/enrollment
 * @access Public
 */
const getCourseEnrollment = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const [course] = await pool.query(
      'SELECT * FROM courses WHERE id = ? AND active = TRUE',
      [courseId]
    );
    
    if (course.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Course with ID ${courseId} not found or inactive`
      });
    }
    
    // Get enrollment count
    const [enrollment] = await pool.query(`
      SELECT COUNT(*) as registered_students
      FROM registrations
      WHERE course_id = ?
    `, [courseId]);
    
    const registeredStudents = enrollment[0].registered_students;
    const maxCapacity = course[0].max_capacity;
    const availableSeats = maxCapacity - registeredStudents;
    
    res.status(200).json({
      success: true,
      data: {
        course_id: parseInt(courseId),
        course_code: course[0].code,
        course_title: course[0].title,
        max_capacity: maxCapacity,
        registered_students: registeredStudents,
        available_seats: availableSeats,
        is_full: availableSeats <= 0
      }
    });
  } catch (error) {
    console.error(`Error fetching enrollment for course ID ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course enrollment',
      error: error.message
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  searchCourses,
  getCategories,
  getCourseEnrollment
};