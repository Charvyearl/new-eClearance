const { query, pool } = require('./db');

async function main() {
	try {
		const rows = await query('SELECT 1 + 1 AS result');
		console.log('DB test result:', rows[0]?.result);
	} catch (error) {
		console.error('DB connection failed:', error.message);
		process.exitCode = 1;
	} finally {
		await pool.end();
	}
}

main();


