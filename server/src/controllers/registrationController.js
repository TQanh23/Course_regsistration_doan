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
   * Get registrations for the currently authenticated user
   * @route GET /api/registrations/my-registrations
   * @access Private
   */
  getMyRegistrations: async (req, res) => {
    try {
      // Get the currently authenticated user's ID
      const studentId = req.user.id;
      
      // Check if the user is a student
      if (req.user.role !== 'student') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Student privileges required.'
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
      `, [studentId]);
      
      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      console.error(`Error fetching registrations for current user:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching your registrations',
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
  },

  /**
   * Student course signup (one-time only)
   * @route POST /api/registrations/course-signup
   * @access Private (Students only)
   * @body {course_offering_id} - ID of the course offering to register for
   */
  studentCourseSignup: async (req, res) => {
    try {
      // Only students can use this endpoint
      if (req.user.role !== 'student') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Student access only.'
        });
      }
      
      const studentId = req.user.id;
      const { course_offering_id } = req.body;
      
      // Validate required fields
      if (!course_offering_id) {
        return res.status(400).json({
          success: false,
          message: 'Course offering ID is required'
        });
      }
      
      // Check if course offering exists and get its details
      const [courseOffering] = await pool.query(`
        SELECT co.*, c.course_code, c.title as course_title, c.credits, 
               at.term_name, at.registration_open, at.registration_close
        FROM course_offerings co
        JOIN courses c ON co.course_id = c.id
        JOIN academic_terms at ON co.term_id = at.id
        WHERE co.id = ?
      `, [course_offering_id]);
      
      if (courseOffering.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course offering not found'
        });
      }
      
      // Check if registration period is open
      const now = new Date();
      const regOpen = new Date(courseOffering[0].registration_open);
      const regClose = new Date(courseOffering[0].registration_close);
      
      if (now < regOpen || now > regClose) {
        return res.status(400).json({
          success: false,
          message: `Registration for this course is only open from ${regOpen.toLocaleDateString()} to ${regClose.toLocaleDateString()}`
        });
      }
      
      // Check if student is already registered for this course offering
      const [existingReg] = await pool.query(`
        SELECT * FROM registrations 
        WHERE student_id = ? AND course_offering_id = ?
      `, [studentId, course_offering_id]);
      
      if (existingReg.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You are already registered for this course'
        });
      }
      
      // Check course capacity
      if (courseOffering[0].current_enrollment >= courseOffering[0].max_enrollment) {
        return res.status(400).json({
          success: false,
          message: 'Course is full. Would you like to be added to the waitlist?'
        });
      }
      
      // Check for schedule conflicts with existing registrations
      const [conflicts] = await pool.query(`
        SELECT r.id, co2.id as conflicting_offering_id, 
               c2.course_code, c2.title,
               co2.schedule_day, co2.schedule_time
        FROM registrations r
        JOIN course_offerings co ON r.course_offering_id = co.id
        JOIN course_offerings co2 ON co2.id = ?
        JOIN courses c2 ON co2.course_id = c2.id
        WHERE r.student_id = ? 
        AND r.registration_status = 'enrolled'
        AND co.schedule_day = co2.schedule_day
        AND (
          (co.schedule_time <= co2.schedule_time AND co.schedule_end_time > co2.schedule_time)
          OR
          (co2.schedule_time <= co.schedule_time AND co2.schedule_end_time > co.schedule_time)
        )
      `, [course_offering_id, studentId]);
      
      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Schedule conflict with ${conflicts[0].course_code}: ${conflicts[0].title} on ${conflicts[0].schedule_day} at ${conflicts[0].schedule_time}`
        });
      }
      
      // Check if student has already completed this course in a previous term
      const [completedCourses] = await pool.query(`
        SELECT r.id 
        FROM registrations r
        JOIN course_offerings co_prev ON r.course_offering_id = co_prev.id
        JOIN course_offerings co_current ON co_current.id = ?
        WHERE r.student_id = ?
        AND co_prev.course_id = co_current.course_id
        AND r.registration_status = 'completed'
        AND r.grade >= 'C'
      `, [course_offering_id, studentId]);
      
      if (completedCourses.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You have already successfully completed this course'
        });
      }
      
      // Check prerequisites if any
      const [prerequisites] = await pool.query(`
        SELECT p.prerequisite_course_id, c_pre.course_code, c_pre.title
        FROM prerequisites p
        JOIN course_offerings co ON co.course_id = ? 
        JOIN courses c_pre ON c_pre.id = p.prerequisite_course_id
        WHERE p.course_id = co.course_id
      `, [courseOffering[0].course_id]);
      
      if (prerequisites.length > 0) {
        // For each prerequisite, check if student has completed it
        for (const prereq of prerequisites) {
          const [completed] = await pool.query(`
            SELECT r.id
            FROM registrations r
            JOIN course_offerings co ON r.course_offering_id = co.id
            WHERE r.student_id = ?
            AND co.course_id = ?
            AND r.registration_status = 'completed'
            AND r.grade >= 'C'
          `, [studentId, prereq.prerequisite_course_id]);
          
          if (completed.length === 0) {
            return res.status(400).json({
              success: false,
              message: `Missing prerequisite: ${prereq.course_code}: ${prereq.title}`
            });
          }
        }
      }
      
      // All validation passed, create registration
      const [result] = await pool.query(
        'INSERT INTO registrations (student_id, course_offering_id, registration_status) VALUES (?, ?, ?)',
        [studentId, course_offering_id, 'enrolled']
      );
      
      // Update enrollment count
      await pool.query(
        'UPDATE course_offerings SET current_enrollment = current_enrollment + 1 WHERE id = ?',
        [course_offering_id]
      );
      
      // Get the created registration details
      const [newRegistration] = await pool.query(`
        SELECT r.*, s.username as student_username, s.full_name as student_name,
        c.course_code, c.title as course_title, at.term_name, co.schedule_day, co.schedule_time
        FROM registrations r
        JOIN students s ON r.student_id = s.id
        JOIN course_offerings co ON r.course_offering_id = co.id
        JOIN courses c ON co.course_id = c.id
        JOIN academic_terms at ON co.term_id = at.id
        WHERE r.id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        success: true,
        message: 'Course registration successful',
        data: newRegistration[0]
      });
    } catch (error) {
      console.error('Error in student course signup:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error during course registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = registrationController;