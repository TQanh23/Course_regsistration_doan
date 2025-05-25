const pool = require('../config/db');
const bcrypt = require('bcrypt');

class AccountController {
    // Get all accounts (students and admins)
    async getAllAccounts(req, res) {
        try {
            const { search, searchFilter, roleFilter, sortDirection } = req.query;
            
            let query = `
                SELECT 
                    s.id,
                    s.username as name,
                    s.email,
                    s.student_id as code,
                    s.full_name as phone,
                    'Sinh viên' as role,
                    s.date_of_birth as dob,
                    p.name as major,
                    p.name as specialization,
                    'Công nghệ thông tin' as faculty,
                    'Chính quy - CĐIO' as trainingType,
                    'Đại học - B7' as universitySystem,
                    s.class as classGroup,
                    s.class as classSection,
                    s.password_student as password
                FROM students s
                LEFT JOIN academic_programs p ON s.program_id = p.id
                
                UNION ALL
                
                SELECT 
                    a.id,
                    a.username as name,
                    a.email,
                    CAST(a.id + 1000000 AS CHAR) as code,
                    '0000000000' as phone,
                    'Admin' as role,
                    '1990-01-01' as dob,
                    '' as major,
                    '' as specialization,
                    '' as faculty,
                    '' as trainingType,
                    '' as universitySystem,
                    '' as classGroup,
                    '' as classSection,
                    a.password
                FROM admins a
            `;
            
            const conditions = [];
            const params = [];
            
            // Apply role filter
            if (roleFilter && roleFilter !== 'all') {
                if (roleFilter === 'student') {
                    query = query.split('UNION ALL')[0]; // Only students
                } else if (roleFilter === 'admin') {
                    query = query.split('UNION ALL')[1]; // Only admins
                }
            }
            
            // Apply search filter
            if (search && searchFilter) {
                let searchCondition;
                switch (searchFilter) {
                    case 'name':
                        searchCondition = `name LIKE ?`;
                        break;
                    case 'code':
                        searchCondition = `code LIKE ?`;
                        break;
                    case 'phone':
                        searchCondition = `phone LIKE ?`;
                        break;
                    default:
                        searchCondition = `name LIKE ?`;
                }
                conditions.push(searchCondition);
                params.push(`%${search}%`);
            }
            
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            // Apply sorting
            if (sortDirection && sortDirection !== 'none') {
                const order = sortDirection === 'asc' ? 'ASC' : 'DESC';
                query += ` ORDER BY name ${order}`;
            }
            
            const [rows] = await pool.query(query, params);
            
            // Transform data to match frontend format
            const accounts = rows.map(row => ({
                id: row.id,
                name: row.name,
                phone: row.phone,
                email: row.email,
                code: row.code,
                role: row.role,
                password: row.password,
                studentDetails: row.role === 'Sinh viên' ? {
                    dob: row.dob ? new Date(row.dob).toLocaleDateString('vi-VN') : '',
                    major: row.major || '',
                    specialization: row.specialization || '',
                    faculty: row.faculty || '',
                    trainingType: row.trainingType || '',
                    universitySystem: row.universitySystem || '',
                    classGroup: row.classGroup || '',
                    classSection: row.classSection || ''
                } : undefined
            }));
            
            return res.status(200).json({
                success: true,
                data: accounts
            });
        } catch (error) {
            console.error('Error fetching accounts:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching accounts',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    // Get account by ID
    async getAccountById(req, res) {
        try {
            const { id } = req.params;
            
            // Try to find in students first
            const [studentRows] = await pool.query(`
                SELECT 
                    s.id,
                    s.username as name,
                    s.email,
                    s.student_id as code,
                    s.full_name as phone,
                    'Sinh viên' as role,
                    s.date_of_birth as dob,
                    p.name as major,
                    p.name as specialization,
                    'Công nghệ thông tin' as faculty,
                    'Chính quy - CĐIO' as trainingType,
                    'Đại học - B7' as universitySystem,
                    s.class as classGroup,
                    s.class as classSection,
                    s.password_student as password
                FROM students s
                LEFT JOIN academic_programs p ON s.program_id = p.id
                WHERE s.id = ?
            `, [id]);
            
            if (studentRows.length > 0) {
                const row = studentRows[0];
                const account = {
                    id: row.id,
                    name: row.name,
                    phone: row.phone,
                    email: row.email,
                    code: row.code,
                    role: row.role,
                    password: row.password,
                    studentDetails: {
                        dob: row.dob ? new Date(row.dob).toLocaleDateString('vi-VN') : '',
                        major: row.major || '',
                        specialization: row.specialization || '',
                        faculty: row.faculty || '',
                        trainingType: row.trainingType || '',
                        universitySystem: row.universitySystem || '',
                        classGroup: row.classGroup || '',
                        classSection: row.classSection || ''
                    }
                };
                return res.status(200).json({ success: true, data: account });
            }
            
            // Try to find in admins
            const [adminRows] = await pool.query(`
                SELECT 
                    a.id,
                    a.username as name,
                    a.email,
                    CAST(a.id + 1000000 AS CHAR) as code,
                    '0000000000' as phone,
                    'Admin' as role,
                    a.password
                FROM admins a
                WHERE a.id = ?
            `, [id]);
            
            if (adminRows.length > 0) {
                const row = adminRows[0];
                const account = {
                    id: row.id,
                    name: row.name,
                    phone: row.phone,
                    email: row.email,
                    code: row.code,
                    role: row.role,
                    password: row.password
                };
                return res.status(200).json({ success: true, data: account });
            }
            
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        } catch (error) {
            console.error('Error fetching account:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching account',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    // Create new account
    async createAccount(req, res) {
        try {
            const { 
                role, name, email, phone, code, password, 
                dob, major, specialization, faculty, 
                trainingType, universitySystem, classGroup, classSection 
            } = req.body;
            
            // Basic validation
            if (!role || !name || !email || !code || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Role, name, email, code, and password are required'
                });
            }

            // Email format validation
            const emailRegex = role === 'Admin' 
                ? /^[^\s@]+@huce\.edu\.vn$/
                : /^[^\s@]+@st\.huce\.edu\.vn$/;
            
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid email format. ${role === 'Admin' ? 'Admin emails must end with @huce.edu.vn' : 'Student emails must end with @st.huce.edu.vn'}`
                });
            }

            // Password validation
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters long'
                });
            }

            // Code format validation
            const codeRegex = /^\d{5,7}$/;
            if (!codeRegex.test(code)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid code format. Code must be 5-7 digits'
                });
            }

            // Additional student validation
            if (role === 'Sinh viên') {
                if (!dob || !major || !classGroup) {
                    return res.status(400).json({
                        success: false,
                        message: 'Date of birth, major, and class group are required for students'
                    });
                }

                // Validate date format
                const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                if (!dobRegex.test(dob)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid date format. Use DD/MM/YYYY'
                    });
                }
            }

            // Check for existing email
            const [existingEmail] = await pool.query(
                role === 'Sinh viên' 
                    ? 'SELECT id FROM students WHERE email = ?'
                    : 'SELECT id FROM admins WHERE email = ?',
                [email]
            );

            if (existingEmail.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists',
                    error: 'duplicate_email'
                });
            }

            // Check for existing code
            const [existingCode] = await pool.query(
                role === 'Sinh viên'
                    ? 'SELECT id FROM students WHERE student_id = ?'
                    : 'SELECT id FROM admins WHERE id = ?',
                [code]
            );

            if (existingCode.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Code already exists',
                    error: 'duplicate_code'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            let newAccountId;
            
            if (role === 'Sinh viên') {
                // Create student
                const [result] = await pool.query(`
                    INSERT INTO students (
                        username, email, student_id, full_name, 
                        date_of_birth, class, program_id, 
                        enrollment_date, password_student
                    ) VALUES (?, ?, ?, ?, ?, ?, 1, CURDATE(), ?)
                `, [
                    name, email, code, phone,
                    dob ? new Date(dob.split('/').reverse().join('-')) : null,
                    classSection || classGroup, hashedPassword
                ]);
                newAccountId = result.insertId;
            } else {
                // Create admin
                const [result] = await pool.query(`
                    INSERT INTO admins (username, email, password)
                    VALUES (?, ?, ?)
                `, [name, email, hashedPassword]);
                newAccountId = result.insertId;
            }
            
            // Return success response with basic account info
            const accountData = {
                id: newAccountId,
                name,
                email,
                code,
                phone: phone || '',
                role
            };
            
            if (role === 'Sinh viên') {
                accountData.studentDetails = {
                    dob: dob || '',
                    major: major || '',
                    specialization: specialization || '',
                    faculty: faculty || '',
                    trainingType: trainingType || '',
                    universitySystem: universitySystem || '',
                    classGroup: classGroup || '',
                    classSection: classSection || ''
                };
            }
            
            return res.status(201).json({
                success: true,
                data: accountData,
                message: 'Account created successfully'
            });
        } catch (error) {
            console.error('Error creating account:', error);
            
            // More specific error handling
            if (error.code === 'ER_DUP_ENTRY') {
                let message = 'An account with this information already exists';
                let errorType = 'duplicate_entry';
                
                if (error.message.includes('email')) {
                    message = 'This email is already registered';
                    errorType = 'duplicate_email';
                } else if (error.message.includes('student_id') || error.message.includes('code')) {
                    message = 'This code is already registered';
                    errorType = 'duplicate_code';
                }
                
                return res.status(400).json({
                    success: false,
                    message,
                    error: errorType
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Error creating account',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
    
    // Update account
    async updateAccount(req, res) {
        try {
            const { id } = req.params;
            const { 
                role, name, email, phone, code, password,
                dob, major, specialization, faculty,
                trainingType, universitySystem, classGroup, classSection
            } = req.body;
            
            // Check if account exists and get its current role
            const currentAccount = await this.getAccountById(
                { params: { id } },
                { status: () => ({ json: (data) => data }) }
            );
            
            if (!currentAccount.success) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            
            const currentRole = currentAccount.data.role;
            
            // Prepare update data
            let updateQuery;
            let updateParams;
            
            if (currentRole === 'Sinh viên') {
                updateQuery = `
                    UPDATE students SET 
                        username = ?, email = ?, student_id = ?, full_name = ?,
                        date_of_birth = ?, class = ?
                `;
                updateParams = [
                    name, email, code, phone,
                    dob ? new Date(dob.split('/').reverse().join('-')) : null,
                    classGroup
                ];
                
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    updateQuery += `, password_student = ?`;
                    updateParams.push(hashedPassword);
                }
                
                updateQuery += ` WHERE id = ?`;
                updateParams.push(id);
            } else {
                updateQuery = `
                    UPDATE admins SET 
                        username = ?, email = ?
                `;
                updateParams = [name, email];
                
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    updateQuery += `, password = ?`;
                    updateParams.push(hashedPassword);
                }
                
                updateQuery += ` WHERE id = ?`;
                updateParams.push(id);
            }
            
            await pool.query(updateQuery, updateParams);
            
            // Fetch updated account
            const updatedAccount = await this.getAccountById(
                { params: { id } },
                { status: () => ({ json: (data) => data }) }
            );
            
            return res.status(200).json({
                success: true,
                data: updatedAccount.data,
                message: 'Account updated successfully'
            });
        } catch (error) {
            console.error('Error updating account:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Email or code already exists'
                });
            }
            
            return res.status(500).json({
                success: false,
                message: 'Error updating account',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    
    // Delete account
    async deleteAccount(req, res) {
        try {
            const { id } = req.params;
            
            // Check if account exists and get its role
            const currentAccount = await this.getAccountById(
                { params: { id } },
                { status: () => ({ json: (data) => data }) }
            );
            
            if (!currentAccount.success) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found'
                });
            }
            
            const currentRole = currentAccount.data.role;
            
            // Delete from appropriate table
            if (currentRole === 'Sinh viên') {
                await pool.query('DELETE FROM students WHERE id = ?', [id]);
            } else {
                await pool.query('DELETE FROM admins WHERE id = ?', [id]);
            }
            
            return res.status(200).json({
                success: true,
                message: 'Account deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting account:', error);
            return res.status(500).json({
                success: false,
                message: 'Error deleting account',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new AccountController();