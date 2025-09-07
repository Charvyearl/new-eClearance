const { query } = require('../db');

async function ensureDepartmentsTable() {
	// Create departments table if it doesn't exist
	await query(`
		CREATE TABLE IF NOT EXISTS departments (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(100) NOT NULL UNIQUE,
			description TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`);

	// Seed a few default departments if table is empty
	const rows = await query('SELECT COUNT(*) AS count FROM departments');
	const count = rows && rows[0] ? rows[0].count : 0;
	if (count === 0) {
		await query(
			`INSERT INTO departments (name, description) VALUES 
			('Library', 'Library clearance for books and fines'),
			('Finance', 'Financial clearance for outstanding fees'),
			('Registrar', 'Academic records and transcript clearance'),
			('IT Department', 'Computer and network access clearance'),
			('Security', 'Security clearance and access cards'),
			('Health Center', 'Medical clearance and health records'),
			('Student Affairs', 'Student conduct and activities clearance'),
			('Laboratory', 'Laboratory equipment and safety clearance')`
		);
	}
}

async function listDepartments() {
	return query('SELECT id, name, description FROM departments ORDER BY name ASC');
}

module.exports = { ensureDepartmentsTable, listDepartments };


