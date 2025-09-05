const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser } = require('../repositories/usersRepository');
const { query } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register (Admin only)
router.post('/register', authMiddleware, async (req, res) => {
	try {
		// Check if current user is admin
		if (req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Only admin can register users' });
		}
		
		let { name, email, password, role, student_id, department_id, phone, course, year_level } = req.body;

		// Normalize optional fields: empty strings -> null
		const normalize = (v) => (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) ? null : v;
		student_id = normalize(student_id);
		department_id = normalize(department_id);
		phone = normalize(phone);
		course = normalize(course);
		year_level = normalize(year_level);
		
		if (!name || !email || !password || !role) {
			return res.status(400).json({ message: 'All required fields are missing' });
		}
		
		if (!['student', 'department'].includes(role)) {
			return res.status(400).json({ message: 'Role must be student or department' });
		}

		// Role-specific validation and coercion
		if (role === 'student') {
			if (!student_id || !course || !year_level) {
				return res.status(400).json({ message: 'Student registration requires student_id, course, and year_level' });
			}
			department_id = null;
		} else if (role === 'department') {
			if (department_id === null) {
				return res.status(400).json({ message: 'Department registration requires department_id' });
			}
			const parsedDeptId = Number(department_id);
			if (!Number.isFinite(parsedDeptId) || parsedDeptId <= 0) {
				return res.status(400).json({ message: 'department_id must be a positive number' });
			}
			department_id = parsedDeptId;
			student_id = null;
			course = null;
			year_level = null;
		}
		
		// Check if user already exists
		const existingUser = await getUserByEmail(email);
		if (existingUser) {
			return res.status(409).json({ message: 'Email already exists' });
		}
		
		// Hash password
		const password_hash = await bcrypt.hash(password, 10);
		

		// Validate department exists if role is department (when departments table/FK are present)
		if (role === 'department') {
			try {
				const rows = await query('SELECT id FROM departments WHERE id = ?', [department_id]);
				if (!rows || rows.length === 0) {
					return res.status(400).json({ message: 'Department not found. Please use a valid department_id.' });
				}
			} catch (e) {
				// If departments table does not exist yet, return a helpful error
				return res.status(500).json({ message: 'Departments table missing. Please run schema.sql to create base tables.' });
			}
		}

		// Create user
		const user = await createUser({ name, email, password_hash, role, student_id, department_id, phone, course, year_level });
		
		res.status(201).json({
			message: 'User created successfully',
			user: { id: user.id, name: user.name, email: user.email, role: user.role }
		});
	} catch (error) {
		console.error('Registration error:', error && (error.code || error.name), error && error.message);
		// Map common MySQL errors to clearer messages
		if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
			return res.status(400).json({ message: 'Invalid department_id (no referenced department).' });
		}
		if (error && error.code === 'ER_TRUNCATED_WRONG_VALUE') {
			return res.status(400).json({ message: 'Invalid value type in request body.' });
		}
		return res.status(500).json({ message: 'Registration failed' });
	}
});

// Login (All users including admin)
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' });
		}
		
		// Find user
		const user = await getUserByEmail(email);
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		
		// Check password
		const isValidPassword = await bcrypt.compare(password, user.password_hash);
		if (!isValidPassword) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		
		// Generate JWT
		const token = jwt.sign(
			{ userId: user.id, email: user.email, role: user.role },
			process.env.JWT_SECRET || 'fallback-secret',
			{ expiresIn: '7d' }
		);
		
		res.json({
			message: 'Login successful',
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				student_id: user.student_id || null,
				course: user.course || null,
				year_level: user.year_level || null
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Login failed' });
	}
});

module.exports = router;
