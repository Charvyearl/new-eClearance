-- eClearance Database Schema
-- Optional: create database
CREATE DATABASE IF NOT EXISTS eclearance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eclearance;

-- Users table (students, department staff, and admin)
CREATE TABLE IF NOT EXISTS users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(150) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	role ENUM('admin', 'student', 'department') NOT NULL,
	student_id VARCHAR(20) UNIQUE NULL, -- Only for students
	department_id INT NULL, -- Only for department staff
	phone VARCHAR(20) NULL, -- Student phone number
	course VARCHAR(100) NULL, -- Student course/program
	year_level VARCHAR(50) NULL, -- Student year level
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	description TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clearance requests table
CREATE TABLE IF NOT EXISTS clearance_requests (
	id INT AUTO_INCREMENT PRIMARY KEY,
	student_id INT NOT NULL,
	status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
	request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	completion_date TIMESTAMP NULL,
	notes TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clearance items table (specific requirements for clearance)
CREATE TABLE IF NOT EXISTS clearance_items (
	id INT AUTO_INCREMENT PRIMARY KEY,
	clearance_request_id INT NOT NULL,
	department_id INT NOT NULL,
	item_name VARCHAR(200) NOT NULL,
	status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
	approved_by INT NULL,
	approved_at TIMESTAMP NULL,
	notes TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (clearance_request_id) REFERENCES clearance_requests(id) ON DELETE CASCADE,
	FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
	FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add foreign key constraint for users.department_id
ALTER TABLE users ADD CONSTRAINT fk_users_department 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Insert sample departments
INSERT IGNORE INTO departments (name, description) VALUES
('Library', 'Library clearance for books and fines'),
('Finance', 'Financial clearance for outstanding fees'),
('Registrar', 'Academic records and transcript clearance'),
('IT Department', 'Computer and network access clearance'),
('Security', 'Security clearance and access cards'),
('Health Center', 'Medical clearance and health records'),
('Student Affairs', 'Student conduct and activities clearance'),
('Laboratory', 'Laboratory equipment and safety clearance');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_course ON users(course);
CREATE INDEX idx_clearance_requests_student_id ON clearance_requests(student_id);
CREATE INDEX idx_clearance_requests_status ON clearance_requests(status);
CREATE INDEX idx_clearance_items_request_id ON clearance_items(clearance_request_id);
CREATE INDEX idx_clearance_items_department_id ON clearance_items(department_id);
CREATE INDEX idx_clearance_items_status ON clearance_items(status);

-- Seed default admin user (email: admin@eclearance.com, password: admin123)
INSERT IGNORE INTO users (name, email, password_hash, role)
VALUES ('System Administrator', 'admin@eclearance.com', '$2b$10$bEynuq7Sb8VGLOrpNhvZCeOAY9O3GGUfL/t4Git5KrE40Z2vFEiXW', 'admin');


