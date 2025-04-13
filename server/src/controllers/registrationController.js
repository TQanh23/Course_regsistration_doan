const pool = require('../config/db');

/**
 * Registration controller to handle course registrations
 */
const registrationController = {
  /**
   * Get all registrations
   * @route GET /api/registrations
   * @access Private (Admin only)
   */
  getAllRegistrations: async (req, res) => {
    try {
      const [registrations] = await pool.query(`
        SELECT r.*, s.username as student_username, s.full_name as student_name,
        c.course_code, c.title as course_title, at.term_name
        FROM registrations r
        JOIN students s ON r.student_id = s.id
        JOIN course_offerings co ON r.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        JOIN academic_terms at ON co.term_id = at.id
        ORDER BY r.registration_date DESC
      `);

      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      console.error('Error fetching registrations:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching registrations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get registration by ID
   * @route GET /api/registrations/:id
   * @access Private
   */
  getRegistrationById: async (req, res) => {
    try {
      const registrationId = req.params.id;
      
      const [registration] = await pool.query(`
        SELECT r.*, s.username as student_username, s.full_name as student_name, s.student_id,
        c.course_code, c.title as course_title, at.term_name
        FROM registrations r
        JOIN students s ON r.student_id = s.id
        JOIN course_offerings co ON r.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        JOIN academic_terms at ON co.term_id = at.id
        WHERE r.id = ?
      `, [registrationId]);

      if (registration.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Registration with ID ${registrationId} not found`
        });
      }

      // Check authorization - only admin or the student who owns the registration can access
      if (req.user.role === 'student' && req.user.id !== registration[0].student_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own registrations.'
        });
      }

      res.status(200).json({
        success: true,
        data: registration[0]
      });
    } catch (error) {
      console.error(`Error fetching registration ID ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Create new registration
   * @route POST /api/registrations
   * @access Private
   */
  createRegistration: async (req, res) => {
    try {
      const { student_id, course_id, term_id } = req.body;
      
      // Check if student exists
      const [student] = await pool.query('SELECT * FROM students WHERE id = ?', [student_id]);
      
      if (student.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Check if requesting user is authorized (admin or the student themselves)
      if (req.user.role === 'student' && req.user.id !== student_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only create registrations for yourself.'
        });
      }
      
      // Check if course exists and is active
      const [course] = await pool.query(
        'SELECT * FROM courses WHERE id = ? AND active = TRUE',
        [course_id]
      );
      
      if (course.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or inactive'
        });
      }

      // Check if term exists
      const [term] = await pool.query('SELECT * FROM academic_terms WHERE id = ?', [term_id]);
      
      if (term.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Academic term not found'
        });
      }

      // Check if student is already registered for this course in this term
      const [courseOffering] = await pool.query(`
        SELECT co.* FROM course_offerings co
        WHERE co.course_id = ? AND co.term_id = ?
      `, [course_id, term_id]);
      
      if (courseOffering.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course is not offered in the selected term'
        });
      }

      const [existingReg] = await pool.query(`
        SELECT * FROM registrations r
        WHERE r.student_id = ? AND r.course_offering_id = ?
      `, [student_id, courseOffering[0].id]);
      
      if (existingReg.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Student is already registered for this course in this term'
        });
      }

      // Check course capacity
      if (courseOffering[0].current_enrollment >= courseOffering[0].max_enrollment) {
        return res.status(400).json({
          success: false,
          message: 'Course is full'
        });
      }

      // Create registration
      const [result] = await pool.query(
        'INSERT INTO registrations (student_id, course_offering_id) VALUES (?, ?)',
        [student_id, courseOffering[0].id]
      );

      // Update enrollment count
      await pool.query(
        'UPDATE course_offerings SET current_enrollment = current_enrollment + 1 WHERE id = ?',
        [courseOffering[0].id]
      );
      
      // Get the created registration with details
      const [newRegistration] = await pool.query(`
        SELECT r.*, s.username as student_username, s.full_name as student_name,
        c.course_code, c.title as course_title, at.term_name
        FROM registrations r
        JOIN students s ON r.student_id = s.id
        JOIN course_offerings co ON r.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        JOIN academic_terms at ON co.term_id = at.id
        WHERE r.id = ?
      `, [result.insertId]);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: newRegistration[0]
      });
    } catch (error) {
      console.error('Error creating registration:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while creating registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Update registration status
   * @route PUT /api/registrations/:id
   * @access Private (Admin only)
   */
  updateRegistration: async (req, res) => {
    try {
      const registrationId = req.params.id;
      const { registration_status, grade } = req.body;
      
      // Get current registration to check if status is being updated
      const [existingReg] = await pool.query(
        'SELECT * FROM registrations WHERE id = ?',
        [registrationId]
      );

      if (existingReg.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Registration with ID ${registrationId} not found`
        });
      }

      // Build update query
      const updateFields = [];
      const updateValues = [];
      
      if (registration_status) {
        // Validate registration status
        const validStatuses = ['enrolled', 'waitlisted', 'dropped', 'completed'];
        if (!validStatuses.includes(registration_status)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
          });
        }
        updateFields.push('registration_status = ?');
        updateValues.push(registration_status);
      }
      
      if (grade) {
        updateFields.push('grade = ?');
        updateValues.push(grade);
      }
      
      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
      }
      
      // Add registrationId to values array
      updateValues.push(registrationId);
      
      // Update registration
      await pool.query(
        `UPDATE registrations SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      // Update course enrollment count if status changed
      if (registration_status && existingReg[0].registration_status !== registration_status) {
        const course_offering_id = existingReg[0].course_offering_id;
        
        // If changing from enrolled to something else, decrease enrollment
        if (existingReg[0].registration_status === 'enrolled' && registration_status !== 'enrolled') {
          await pool.query(
            'UPDATE course_offerings SET current_enrollment = current_enrollment - 1 WHERE id = ?',
            [course_offering_id]
          );
        }
        
        // If changing to enrolled from something else, increase enrollment
        else if (existingReg[0].registration_status !== 'enrolled' && registration_status === 'enrolled') {
          await pool.query(
            'UPDATE course_offerings SET current_enrollment = current_enrollment + 1 WHERE id = ?',
            [course_offering_id]
          );
        }
      }

      // Get updated registration
      const [updatedReg] = await pool.query(`
        SELECT r.*, s.username as student_username, s.full_name as student_name,
        c.course_code, c.title as course_title, at.term_name
        FROM registrations r
        JOIN students s ON r.student_id = s.id
        JOIN course_offerings co ON r.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        JOIN academic_terms at ON co.term_id = at.id
        WHERE r.id = ?
      `, [registrationId]);
      
      res.status(200).json({
        success: true,
        message: 'Registration updated successfully',
        data: updatedReg[0]
      });
    } catch (error) {
      console.error(`Error updating registration ID ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while updating registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Delete registration
   * @route DELETE /api/registrations/:id
   * @access Private
   */
  deleteRegistration: async (req, res) => {
    try {
      const registrationId = req.params.id;
      
      // Get registration before deleting
      const [registration] = await pool.query(
        'SELECT * FROM registrations WHERE id = ?',
        [registrationId]
      );
      
      if (registration.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Registration with ID ${registrationId} not found`
        });
      }
      
      const reg = registration[0];

      // Check authorization - only admin or the student who owns the registration can delete
      if (req.user.role === 'student' && req.user.id !== reg.student_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete your own registrations.'
        });
      }

      // Delete registration
      await pool.query(
        'DELETE FROM registrations WHERE id = ?',
        [registrationId]
      );
      
      // Update course enrollment count if registration was enrolled
      if (reg.registration_status === 'enrolled') {
        await pool.query(
          'UPDATE course_offerings SET current_enrollment = current_enrollment - 1 WHERE id = ?',
          [reg.course_offering_id]
        );
      }
      
      res.status(200).json({
        success: true,
        message: 'Registration deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting registration ID ${req.params.id}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get registrations by user ID
   * @route GET /api/registrations/user/:userId
   * @access Private
   */
  getRegistrationsByUser: async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Check authorization - only admin or the student themselves can view their registrations
      if (req.user.role === 'student' && req.user.id !== parseInt(userId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own registrations.'
        });
      }
      
      // Check if student exists
      const [student] = await pool.query(
        'SELECT * FROM students WHERE id = ?',
        [userId]
      );
      
      if (student.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Student with ID ${userId} not found`
        });
      }
      
      const [registrations] = await pool.query(`
        SELECT r.*, c.course_code, c.title as course_title, 
        c.credits, c.course_description, at.term_name,
        cc.name as category_name
        FROM registrations r
        JOIN course_offerings co ON r.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        JOIN academic_terms at ON co.term_id = at.id
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE r.student_id = ?
        ORDER BY r.registration_date DESC
      `, [userId]);
      
      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      console.error(`Error fetching registrations for user ID ${req.params.userId}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching registrations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get registrations by course ID
   * @route GET /api/registrations/course/:courseId
   * @access Private (Admin only)
   */
  getRegistrationsByCourse: async (req, res) => {
    try {
      const courseId = req.params.courseId;
      
      // Only allow admins to view all course registrations
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }

      // Check if course exists
      const [course] = await pool.query(
        'SELECT * FROM courses WHERE id = ?',
        [courseId]
      );
      
      if (course.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Course with ID ${courseId} not found`
        });
      }
      
      const [registrations] = await pool.query(`
        SELECT r.*, s.username as student_username, s.student_id, s.full_name as student_name,
        s.email as student_email, s.class as student_class,
        at.term_name, at.id as term_id
        FROM registrations r
        JOIN students s ON r.student_id = s.id
        JOIN course_offerings co ON r.course_offering_id = co.id
        JOIN academic_terms at ON co.term_id = at.id
        WHERE co.course_id = ?
        ORDER BY r.registration_date DESC
      `, [courseId]);
      
      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      console.error(`Error fetching registrations for course ID ${req.params.courseId}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching registrations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = registrationController;