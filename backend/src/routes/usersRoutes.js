const express = require('express');
const repo = require('../repositories/usersRepository');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const users = await repo.listUsers();
		res.json(users);
	} catch (e) {
		res.status(500).json({ message: 'Failed to list users' });
	}
});

router.get('/:id', async (req, res) => {
	try {
		const user = await repo.getUserById(req.params.id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user);
	} catch (e) {
		res.status(500).json({ message: 'Failed to get user' });
	}
});

router.post('/', async (req, res) => {
	try {
		const { name, email } = req.body;
		if (!name || !email) return res.status(400).json({ message: 'name and email are required' });
		const created = await repo.createUser({ name, email });
		res.status(201).json(created);
	} catch (e) {
		if (e && e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'email already exists' });
		res.status(500).json({ message: 'Failed to create user' });
	}
});

router.put('/:id', async (req, res) => {
	try {
		const { name, email } = req.body;
		if (!name || !email) return res.status(400).json({ message: 'name and email are required' });
		const updated = await repo.updateUser(req.params.id, { name, email });
		res.json(updated);
	} catch (e) {
		res.status(500).json({ message: 'Failed to update user' });
	}
});

// Update student-specific profile fields (student_id, course, year_level)
router.put('/:id/profile', async (req, res) => {
	try {
		const { student_id, course, year_level } = req.body;
		const updated = await repo.updateStudentProfile(req.params.id, { student_id, course, year_level });
		res.json(updated);
	} catch (e) {
		res.status(500).json({ message: 'Failed to update student profile' });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		await repo.deleteUser(req.params.id);
		res.status(204).send();
	} catch (e) {
		res.status(500).json({ message: 'Failed to delete user' });
	}
});

module.exports = router;


