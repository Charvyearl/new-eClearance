const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const repo = require('../repositories/requirementsRepository');

const router = express.Router();

// List requirements for current user's department (department users)
// Admins can pass ?department_id=ID to view a department's requirements
router.get('/', authMiddleware, async (req, res) => {
	try {
		// Students see all requirements; department users see their department; admins optional filter
		if (req.user.role === 'student') {
			const rows = await repo.listAllRequirements();
			return res.json(rows);
		}
		let departmentId = null;
		if (req.user.role === 'department') {
			departmentId = req.user.department_id || null;
		} else if (req.user.role === 'admin') {
			const param = req.query.department_id;
			departmentId = param !== undefined ? Number(param) : null;
			if (param !== undefined && (!Number.isFinite(departmentId) || departmentId <= 0)) {
				return res.status(400).json({ message: 'department_id must be a positive number' });
			}
		}
		const rows = await repo.listRequirementsByDepartment(departmentId);
		res.json(rows);
	} catch (e) {
		console.error('List requirements error:', e);
		res.status(500).json({ message: 'Failed to list requirements' });
	}
});

// Create requirement (admin or department)
router.post('/', authMiddleware, async (req, res) => {
	try {
		const { title, description, due_date, required_documents, department_id } = req.body || {};
		if (!title || !String(title).trim()) return res.status(400).json({ message: 'Title is required' });
		let depId = null;
		if (req.user.role === 'department') {
			depId = req.user.department_id || null; // department user default to own department
		} else if (req.user.role === 'admin') {
			if (department_id !== undefined && department_id !== null) {
				const parsed = Number(department_id);
				if (!Number.isFinite(parsed) || parsed <= 0) return res.status(400).json({ message: 'department_id must be a positive number' });
				depId = parsed;
			}
		}
		const created = await repo.createRequirement({
			title: String(title).trim(),
			description: description ? String(description) : null,
			due_date: due_date || null,
			required_documents: Array.isArray(required_documents) ? required_documents : [],
			department_id: depId,
			created_by: req.user.id,
		});
		res.status(201).json(created);
	} catch (e) {
		console.error('Create requirement error:', e);
		res.status(500).json({ message: 'Failed to create requirement' });
	}
});

module.exports = router;

// Update a requirement (admin or department who owns it)
router.put('/:id', authMiddleware, async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'Invalid id' });
		const existing = await repo.getRequirementById(id);
		if (!existing) return res.status(404).json({ message: 'Requirement not found' });
		// If department user, optionally add ownership checks when department_id is used
		if (req.user.role === 'department' && existing.department_id && req.user.department_id && existing.department_id !== req.user.department_id) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const { title, description, due_date, required_documents } = req.body || {};
		const updated = await repo.updateRequirement(id, {
			title: title !== undefined ? String(title) : undefined,
			description: description !== undefined ? String(description) : undefined,
			due_date: due_date !== undefined ? due_date : undefined,
			required_documents: Array.isArray(required_documents) ? required_documents : undefined,
		});
		res.json(updated);
	} catch (e) {
		console.error('Update requirement error:', e);
		res.status(500).json({ message: 'Failed to update requirement' });
	}
});

// Delete a requirement (admin or owning department)
router.delete('/:id', authMiddleware, async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'Invalid id' });
		const existing = await repo.getRequirementById(id);
		if (!existing) return res.status(404).json({ message: 'Requirement not found' });
		if (req.user.role === 'department' && existing.department_id && req.user.department_id && existing.department_id !== req.user.department_id) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		await repo.deleteRequirement(id);
		res.json({ success: true });
	} catch (e) {
		console.error('Delete requirement error:', e);
		res.status(500).json({ message: 'Failed to delete requirement' });
	}
});


