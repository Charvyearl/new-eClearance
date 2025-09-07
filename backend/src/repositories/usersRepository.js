const { query } = require('../db');

async function ensureTable() {
	await query(`
		CREATE TABLE IF NOT EXISTS users (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			email VARCHAR(150) NOT NULL UNIQUE,
			password_hash VARCHAR(255) NOT NULL,
			role ENUM('admin', 'student', 'department') NOT NULL,
			student_id VARCHAR(20) UNIQUE NULL,
			department_id INT NULL,
			phone VARCHAR(20) NULL,
			course VARCHAR(100) NULL,
			year_level VARCHAR(50) NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);
}

async function listUsers() {
	return query('SELECT id, name, email, role, phone, course, student_id, year_level, created_at, updated_at FROM users ORDER BY id DESC');
}

async function getUserById(id) {
	const rows = await query('SELECT id, name, email, role, phone, course, student_id, department_id, year_level, created_at, updated_at FROM users WHERE id = ?', [id]);
	return rows[0] || null;
}

async function getUserByEmail(email) {
	const rows = await query('SELECT id, name, email, password_hash, role, phone, course, student_id, department_id, year_level, created_at, updated_at FROM users WHERE email = ?', [email]);
	return rows[0] || null;
}

async function getUserByStudentId(studentId) {
	// Flexible match: exact, or case-insensitive and ignoring hyphens
	const rows = await query(
		`SELECT id, name, email, password_hash, role, phone, course, student_id, department_id, year_level, created_at, updated_at
		 FROM users
		 WHERE student_id = ?
		    OR REPLACE(LOWER(student_id), '-', '') = REPLACE(LOWER(?), '-', '')
		 LIMIT 1`,
		[studentId, studentId]
	);
	return rows[0] || null;
}

async function createUser({ name, email, password_hash, role, student_id = null, department_id = null, phone = null, course = null, year_level = null }) {
	const result = await query('INSERT INTO users (name, email, password_hash, role, student_id, department_id, phone, course, year_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, email, password_hash, role, student_id, department_id, phone, course, year_level]);
	return getUserById(result.insertId);
}

async function updateUser(id, { name, email }) {
	await query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
	return getUserById(id);
}

async function updateStudentProfile(id, { student_id = null, course = null, year_level = null }) {
	await query('UPDATE users SET student_id = ?, course = ?, year_level = ? WHERE id = ?', [student_id, course, year_level, id]);
	return getUserById(id);
}

async function deleteUser(id) {
	await query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = {
	ensureTable,
	listUsers,
	getUserById,
	getUserByEmail,
	getUserByStudentId,
	createUser,
	updateUser,
	updateStudentProfile,
	deleteUser,
};


