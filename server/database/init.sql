-- Database initialization script for Course Registration System
-- This script creates the necessary tables for account management

CREATE DATABASE IF NOT EXISTS dkhp;
USE dkhp;

-- Create academic_programs table
CREATE TABLE IF NOT EXISTS academic_programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample academic programs
INSERT INTO academic_programs (name, description) VALUES 
('Khoa học máy tính', 'Chương trình đào tạo Khoa học máy tính'),
('Kỹ thuật phần mềm', 'Chương trình đào tạo Kỹ thuật phần mềm'),
('Hệ thống thông tin', 'Chương trình đào tạo Hệ thống thông tin'),
('Công nghệ thông tin', 'Chương trình đào tạo Công nghệ thông tin');

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    class VARCHAR(10),
    program_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    password_student VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (program_id) REFERENCES academic_programs(id),
    INDEX idx_student_username (username),
    INDEX idx_student_id (student_id)
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_username (username)
);

-- Insert sample students (matching frontend data)
INSERT INTO students (
    username, email, student_id, full_name, date_of_birth, 
    class, program_id, enrollment_date, password_student
) VALUES 
('Lê Hải Anh', '0120068@st.huce.edu.vn', '0120068', '0384895040', '2004-10-20', '68', 1, '2020-09-01', '$2b$10$hashedpassword1'),
('Lê Văn Anh', '0126468@st.huce.edu.vn', '0126467', '0335244235', '2003-04-15', '67', 1, '2019-09-01', '$2b$10$hashedpassword2'),
('Nguyễn Hoàng Mai Anh', '0127068@st.huce.edu.vn', '0127066', '0336194290', '2002-06-05', '66', 1, '2018-09-01', '$2b$10$hashedpassword3'),
('Hàn Thanh Cương', '0130068@st.huce.edu.vn', '0130065', '0918922564', '2001-09-12', '65', 2, '2017-09-01', '$2b$10$hashedpassword4'),
('Nguyễn Hải Cường', '0174067@st.huce.edu.vn', '0174064', '0977942963', '2000-03-28', '64', 3, '2016-09-01', '$2b$10$hashedpassword5');

-- Insert sample admins
INSERT INTO admins (username, password, email) VALUES 
('Trần Hải Anh', '$2b$10$hashedpassword6', 'thanhnh@st.huce.edu.vn'),
('Nguyễn Việt Anh', '$2b$10$hashedpassword7', 'anhvn@huce.edu.vn');

-- Create courses table (for future use)
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    credits INT NOT NULL,
    description TEXT,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create registrations table (for future use)
CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester VARCHAR(20),
    academic_year VARCHAR(20),
    status ENUM('pending', 'approved', 'rejected', 'dropped') DEFAULT 'pending',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (student_id, course_id, semester, academic_year)
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_student ON registrations(student_id);
CREATE INDEX idx_registrations_course ON registrations(course_id);
CREATE INDEX idx_registrations_status ON registrations(status);