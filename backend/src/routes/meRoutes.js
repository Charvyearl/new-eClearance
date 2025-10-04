const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/', authMiddleware, (req, res) => {
	res.json({
		user: {
			id: req.user.id,
			name: req.user.name,
			email: req.user.email,
			role: req.user.role,
			student_id: req.user.student_id || null,
			course: req.user.course || null,
			year_level: req.user.year_level || null,
			created_at: req.user.created_at
		}
	});
});

module.exports = router;
