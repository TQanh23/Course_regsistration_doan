const AdminService = require('../services/adminService');

class AdminController {
    // Course Management
    async getAllCourses(req, res) {
        try {
            const courses = await AdminService.getAllCourses();
            return res.status(200).json({ success: true, data: courses });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getCourseById(req, res) {
        try {
            const { id } = req.params;
            const course = await AdminService.getCourseById(id);
            if (!course) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }
            return res.status(200).json({ success: true, data: course });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async createCourse(req, res) {
        try {
            const courseData = req.body;
            if (!courseData.name || !courseData.description || !courseData.credits) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }
            
            const course = await AdminService.createCourse(courseData);
            return res.status(201).json({ success: true, data: course });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateCourse(req, res) {
        try {
            const { id } = req.params;
            const courseData = req.body;
            
            const course = await AdminService.updateCourse(id, courseData);
            if (!course) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }
            return res.status(200).json({ success: true, data: course });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteCourse(req, res) {
        try {
            const { id } = req.params;
            const result = await AdminService.deleteCourse(id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Course not found' });
            }
            return res.status(200).json({ success: true, message: 'Course deleted successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Registration Management
    async getAllRegistrations(req, res) {
        try {
            const registrations = await AdminService.getAllRegistrations();
            return res.status(200).json({ success: true, data: registrations });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async approveRegistration(req, res) {
        try {
            const { id } = req.params;
            const result = await AdminService.approveRegistration(id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Registration not found' });
            }
            return res.status(200).json({ success: true, message: 'Registration approved successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async rejectRegistration(req, res) {
        try {
            const { id } = req.params;
            const result = await AdminService.rejectRegistration(id);
            if (!result) {
                return res.status(404).json({ success: false, message: 'Registration not found' });
            }
            return res.status(200).json({ success: true, message: 'Registration rejected successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Dashboard Statistics
    async getDashboardStats(req, res) {
        try {
            const stats = await AdminService.getDashboardStats();
            return res.status(200).json({ success: true, data: stats });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AdminController();