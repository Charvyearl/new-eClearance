const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser } = require('../repositories/usersRepository');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register (Admin only)
router.post('/register', authMiddleware, async (req, res) => {
	try {
		// Check if current user is admin
		if (req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Only admin can register users' });
		}
		
		const { name, email, password, role, student_id, department_id, phone, course, year_level } = req.body;
		
		if (!name || !email || !password || !role) {
			return res.status(400).json({ message: 'All required fields are missing' });
		}
		
		if (!['student', 'department'].includes(role)) {
			return res.status(400).json({ message: 'Role must be student or department' });
		}
		
		// Check if user already exists
		const existingUser = await getUserByEmail(email);
		if (existingUser) {
			return res.status(409).json({ message: 'Email already exists' });
		}
		
		// Hash password
		const password_hash = await bcrypt.hash(password, 10);
		
		// Create user
		const user = await createUser({ name, email, password_hash, role, student_id, department_id, phone, course, year_level });
		
		res.status(201).json({
			message: 'User created successfully',
			user: { id: user.id, name: user.name, email: user.email, role: user.role }
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ message: 'Registration failed' });
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
