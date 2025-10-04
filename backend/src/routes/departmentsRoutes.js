const express = require('express');
const { listDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../repositories/departmentsRepository');
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

// Admin-only: create department
router.post('/', adminMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body || {};
        if (!name || !name.trim()) return res.status(400).json({ message: 'name is required' });
        const created = await createDepartment({ name: name.trim(), description: description ? String(description).trim() : null });
        res.status(201).json(created);
    } catch (e) {
        if (e && e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'department already exists' });
        res.status(500).json({ message: 'Failed to create department' });
    }
});

// Admin-only: update department
router.put('/:id', adminMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body || {};
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'invalid id' });
        if (!name || !name.trim()) return res.status(400).json({ message: 'name is required' });
        const updated = await updateDepartment(id, { name: name.trim(), description: description ? String(description).trim() : null });
        res.json(updated);
    } catch (e) {
        if (e && e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'department already exists' });
        res.status(500).json({ message: 'Failed to update department' });
    }
});

// Admin-only: delete department
router.delete('/:id', adminMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: 'invalid id' });
        await deleteDepartment(id);
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ message: 'Failed to delete department' });
    }
});

module.exports = router;


