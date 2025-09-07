const { query } = require('../db');

async function ensureRequirementsTable() {
	await query(`
		CREATE TABLE IF NOT EXISTS requirements (
			id INT AUTO_INCREMENT PRIMARY KEY,
			title VARCHAR(200) NOT NULL,
			description TEXT NULL,
			due_date DATE NULL,
			required_documents JSON NULL,
			department_id INT NULL,
			created_by INT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			INDEX idx_requirements_department (department_id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);
}

async function createRequirement({ title, description = null, due_date = null, required_documents = [], department_id = null, created_by = null }) {
	const docsJson = JSON.stringify(required_documents || []);
	const result = await query(
		'INSERT INTO requirements (title, description, due_date, required_documents, department_id, created_by) VALUES (?, ?, ?, ?, ?, ?)',
		[title, description, due_date, docsJson, department_id, created_by]
	);
	return getRequirementById(result.insertId);
}

async function getRequirementById(id) {
	const rows = await query('SELECT id, title, description, due_date, required_documents, department_id, created_by, created_at, updated_at FROM requirements WHERE id = ?', [id]);
	if (!rows[0]) return null;
	const row = rows[0];
	return {
		...row,
		required_documents: safeParseJson(row.required_documents, [])
	};
}

async function listRequirementsByDepartment(department_id) {
	const rows = await query('SELECT id, title, description, due_date, required_documents, department_id, created_by, created_at, updated_at FROM requirements WHERE department_id <=> ? ORDER BY id DESC', [department_id]);
	return rows.map(r => ({ ...r, required_documents: safeParseJson(r.required_documents, []) }));
}

async function listAllRequirements() {
	const rows = await query('SELECT id, title, description, due_date, required_documents, department_id, created_by, created_at, updated_at FROM requirements ORDER BY id DESC');
	return rows.map(r => ({ ...r, required_documents: safeParseJson(r.required_documents, []) }));
}

function safeParseJson(str, fallback) {
	try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}

module.exports = {
	ensureRequirementsTable,
	createRequirement,
	getRequirementById,
	listRequirementsByDepartment,
	updateRequirement,
	deleteRequirement,
	listAllRequirements,
};

async function updateRequirement(id, { title, description = null, due_date = null, required_documents = undefined }) {
	const fields = [];
	const params = [];
	if (title !== undefined) { fields.push('title = ?'); params.push(title); }
	if (description !== undefined) { fields.push('description = ?'); params.push(description); }
	if (due_date !== undefined) { fields.push('due_date = ?'); params.push(due_date); }
	if (required_documents !== undefined) { fields.push('required_documents = ?'); params.push(JSON.stringify(required_documents || [])); }
	if (fields.length === 0) return getRequirementById(id);
	params.push(id);
	await query(`UPDATE requirements SET ${fields.join(', ')} WHERE id = ?`, params);
	return getRequirementById(id);
}

async function deleteRequirement(id) {
	await query('DELETE FROM requirements WHERE id = ?', [id]);
}


