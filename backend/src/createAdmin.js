const bcrypt = require('bcryptjs');
const { createUser, getUserByEmail } = require('./repositories/usersRepository');
const { ensureTable } = require('./repositories/usersRepository');

async function createAdmin() {
	try {
		// Ensure tables exist
		await ensureTable();
		
		const adminEmail = 'admin@eclearance.com';
		const adminPassword = 'admin123';
		
		// Check if admin already exists
		const existingAdmin = await getUserByEmail(adminEmail);
		if (existingAdmin) {
			console.log('Admin user already exists');
			return;
		}
		
		// Hash password
		const password_hash = await bcrypt.hash(adminPassword, 10);
		
		// Create admin user
		const admin = await createUser({
			name: 'System Administrator',
			email: adminEmail,
			password_hash,
			role: 'admin'
		});
		
		console.log('Admin user created successfully:');
		console.log('Email:', adminEmail);
		console.log('Password:', adminPassword);
		console.log('ID:', admin.id);
		
	} catch (error) {
		console.error('Error creating admin:', error);
	} finally {
		process.exit(0);
	}
}

createAdmin();
