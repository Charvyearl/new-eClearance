const express = require('express');
const { listDepartments } = require('../repositories/departmentsRepository');
const { adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public list of departments so clients can choose a valid department_id
router.get('/', async (req, res) => {
	try {
		const rows = await listDepartments();
		res.json(rows);
	} catch (e) {
		console.error('List departments error:', e);
		res.status(500).json({ message: 'Failed to list departments' });
	}
});

module.exports = router;


