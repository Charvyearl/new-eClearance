const { query } = require('../db');

async function ensureSubmissionsTable() {
	await query(`
		CREATE TABLE IF NOT EXISTS submissions (
			id INT AUTO_INCREMENT PRIMARY KEY,
			requirement_id INT NOT NULL,
			student_user_id INT NOT NULL,
			responses JSON NOT NULL,
			status ENUM('submitted','reviewed','approved','rejected') DEFAULT 'submitted',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			INDEX idx_submissions_requirement (requirement_id),
			INDEX idx_submissions_student (student_user_id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);
}

async function createSubmission({ requirement_id, student_user_id, responses, status = 'submitted' }) {
	const result = await query(
		'INSERT INTO submissions (requirement_id, student_user_id, responses, status) VALUES (?, ?, ?, ?)',
		[requirement_id, student_user_id, JSON.stringify(responses || {}), status]
	);
	return await getSubmissionById(result.insertId);
}

async function getSubmissionById(id) {
	const rows = await query('SELECT id, requirement_id, student_user_id, responses, status, created_at, updated_at FROM submissions WHERE id = ?', [id]);
	const row = rows[0];
	if (!row) return null;
	return { ...row, responses: safeParse(row.responses, {}) };
}

async function listSubmissionsByStudent(student_user_id) {
	const rows = await query('SELECT id, requirement_id, student_user_id, responses, status, created_at, updated_at FROM submissions WHERE student_user_id = ? ORDER BY id DESC', [student_user_id]);
	return rows.map(r => ({ ...r, responses: safeParse(r.responses, {}) }));
}

async function listSubmissionsByDepartment(department_id) {
	const rows = await query(`
		SELECT s.id, s.requirement_id, s.student_user_id, s.responses, s.status, s.created_at, s.updated_at,
		       r.title AS requirement_title, r.department_id,
		       u.student_id AS student_identifier, u.course AS student_course, u.name AS student_name
		FROM submissions s
		JOIN requirements r ON r.id = s.requirement_id
		LEFT JOIN users u ON u.id = s.student_user_id
		WHERE r.department_id <=> ?
		ORDER BY s.id DESC
	`, [department_id]);
	return rows.map(r => ({ ...r, responses: safeParse(r.responses, {}) }));
}

async function updateSubmissionStatus(id, status) {
	await query('UPDATE submissions SET status = ? WHERE id = ?', [status, id]);
	return getSubmissionById(id);
}

async function getSubmissionByRequirementAndStudent(requirement_id, student_user_id) {
	const rows = await query(
		'SELECT * FROM submissions WHERE requirement_id = ? AND student_user_id = ? ORDER BY created_at DESC LIMIT 1',
		[requirement_id, student_user_id]
	);
	const row = rows[0];
	if (!row) return null;
	return { ...row, responses: safeParse(row.responses, {}) };
}

async function updateSubmission(id, responses, status = 'submitted') {
	await query(
		'UPDATE submissions SET responses = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
		[JSON.stringify(responses || {}), status, id]
	);
	return getSubmissionById(id);
}

function safeParse(s, fb) { try { return s ? JSON.parse(s) : fb; } catch { return fb; } }

module.exports = { 
	ensureSubmissionsTable, 
	createSubmission, 
	getSubmissionById, 
	listSubmissionsByStudent, 
	listSubmissionsByDepartment, 
	updateSubmissionStatus,
	getSubmissionByRequirementAndStudent,
	updateSubmission,
	deleteSubmissionByRequirementAndStudent
};

async function deleteSubmissionByRequirementAndStudent(requirement_id, student_user_id) {
	await query('DELETE FROM submissions WHERE requirement_id = ? AND student_user_id = ?', [requirement_id, student_user_id]);
}

module.exports.deleteSubmissionByRequirementAndStudent = deleteSubmissionByRequirementAndStudent;


