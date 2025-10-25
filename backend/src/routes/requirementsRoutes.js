const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const repo = require('../repositories/requirementsRepository');
const submissions = require('../repositories/submissionsRepository');

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

// Student: list own submissions (all requirements)
router.get('/submissions/mine', authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== 'student') return res.status(403).json({ message: 'Student access only' });
		const rows = await submissions.listSubmissionsByStudent(req.user.id);
		res.json(rows);
	} catch (e) {
		console.error('List my submissions error:', e);
		res.status(500).json({ message: 'Failed to list submissions' });
	}
});

// Department: list all submissions for own department (admin can pass department_id)
router.get('/submissions', authMiddleware, async (req, res) => {
	try {
		let departmentId = null;
		if (req.user.role === 'department') {
			departmentId = req.user.department_id || null;
		} else if (req.user.role === 'admin') {
			const p = req.query.department_id;
			if (p !== undefined) {
				const parsed = Number(p);
				if (!Number.isFinite(parsed) || parsed <= 0) return res.status(400).json({ message: 'department_id must be a positive number' });
				departmentId = parsed;
			}
		}
		const rows = await submissions.listSubmissionsByDepartment(departmentId);
		res.json(rows);
	} catch (e) {
		console.error('List department submissions error:', e);
		res.status(500).json({ message: 'Failed to list department submissions' });
	}
});

// Department or Admin: get a single submission with requirement details
router.get('/submissions/:submissionId', authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.submissionId);
        if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'Invalid submission id' });
        const sub = await submissions.getSubmissionById(id);
        if (!sub) return res.status(404).json({ message: 'Submission not found' });
        const reqRecord = await repo.getRequirementById(sub.requirement_id);
        if (!reqRecord) return res.status(404).json({ message: 'Requirement not found' });
        if (req.user.role === 'department') {
            if (reqRecord.department_id && req.user.department_id && reqRecord.department_id !== req.user.department_id) {
                return res.status(403).json({ message: 'Forbidden' });
            }
        } else if (req.user.role !== 'admin') {
            // Students should not fetch arbitrary submissions here
            return res.status(403).json({ message: 'Forbidden' });
        }
        return res.json({
            id: sub.id,
            requirement_id: sub.requirement_id,
            student_user_id: sub.student_user_id,
            responses: sub.responses,
            status: sub.status,
            created_at: sub.created_at,
            updated_at: sub.updated_at,
            requirement: {
                id: reqRecord.id,
                title: reqRecord.title,
                required_documents: reqRecord.required_documents || []
            }
        });
    } catch (e) {
        console.error('Get submission details error:', e);
        res.status(500).json({ message: 'Failed to get submission details' });
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

// Student submission for a requirement
router.post('/:id/submit', authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== 'student') return res.status(403).json({ message: 'Student access only' });
		const requirementId = Number(req.params.id);
		if (!Number.isFinite(requirementId) || requirementId <= 0) return res.status(400).json({ message: 'Invalid requirement id' });
		const { responses } = req.body || {};
		if (!responses || typeof responses !== 'object') return res.status(400).json({ message: 'responses object is required' });
		
		// Check if there's already a submission for this requirement and student
		const existingSubmission = await submissions.getSubmissionByRequirementAndStudent(requirementId, req.user.id);
		
		let result;
		if (existingSubmission) {
			// Update existing submission (resubmission)
			result = await submissions.updateSubmission(existingSubmission.id, responses, 'submitted');
		} else {
			// Create new submission
			result = await submissions.createSubmission({ requirement_id: requirementId, student_user_id: req.user.id, responses });
		}
		
		res.status(201).json(result);
	} catch (e) {
		console.error('Submit requirement error:', e);
		res.status(500).json({ message: 'Failed to submit requirement' });
	}
});

// Student unsubmit (delete their submission for this requirement)
router.delete('/:id/submit', authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== 'student') return res.status(403).json({ message: 'Student access only' });
		const requirementId = Number(req.params.id);
		if (!Number.isFinite(requirementId) || requirementId <= 0) return res.status(400).json({ message: 'Invalid requirement id' });
		await submissions.deleteSubmissionByRequirementAndStudent(requirementId, req.user.id);
		res.json({ success: true });
	} catch (e) {
		console.error('Unsubmit requirement error:', e);
		res.status(500).json({ message: 'Failed to unsubmit requirement' });
	}
});

// Department view submissions (own department) or admin optionally filter by department_id
router.get('/:id/submissions', authMiddleware, async (req, res) => {
	try {
		const reqId = Number(req.params.id);
		if (!Number.isFinite(reqId) || reqId <= 0) return res.status(400).json({ message: 'Invalid requirement id' });
		const requirement = await repo.getRequirementById(reqId);
		if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
		if (req.user.role === 'department') {
			if (requirement.department_id && req.user.department_id && requirement.department_id !== req.user.department_id) {
				return res.status(403).json({ message: 'Forbidden' });
			}
		}
		// For simplicity return all submissions for this requirement
		const rows = await submissions.listSubmissionsByDepartment(requirement.department_id || null);
		const filtered = rows.filter((r) => r.requirement_id === reqId);
		res.json(filtered);
	} catch (e) {
		console.error('List requirement submissions error:', e);
		res.status(500).json({ message: 'Failed to list submissions' });
	}
});

// Department approve/reject
router.post('/submissions/:submissionId/:action', authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== 'department' && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
		const id = Number(req.params.submissionId);
		if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ message: 'Invalid submission id' });
		const actionParam = String(req.params.action || '').toLowerCase();
		if (actionParam !== 'approve' && actionParam !== 'reject') return res.status(400).json({ message: 'Invalid action' });
		const sub = await submissions.getSubmissionById(id);
		if (!sub) return res.status(404).json({ message: 'Submission not found' });
		const reqRecord = await repo.getRequirementById(sub.requirement_id);
		if (req.user.role === 'department' && reqRecord && reqRecord.department_id && req.user.department_id && reqRecord.department_id !== req.user.department_id) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		const status = actionParam === 'approve' ? 'approved' : 'rejected';
		const updated = await submissions.updateSubmissionStatus(id, status);
		res.json(updated);
	} catch (e) {
		console.error('Update submission status error:', e);
		res.status(500).json({ message: 'Failed to update submission' });
	}
});

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

module.exports = router;
