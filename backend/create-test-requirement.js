// Script to create a test requirement with file upload fields
const { query } = require('./src/db');

async function createTestRequirement() {
	try {
		// Create a requirement with both checkbox and file upload fields
		const requiredDocuments = [
			{
				name: 'Certificate of Good Moral',
				type: 'file'  // This will show file upload button
			},
			{
				name: 'Clearance Form',
				type: 'file'  // This will show file upload button
			},
			{
				name: 'ID Picture',
				type: 'file'  // This will show file upload button
			},
			{
				name: 'I confirm all information is correct',
				type: 'checkbox'  // This will show checkbox
			}
		];

		const result = await query(
			`INSERT INTO requirements 
			(title, description, due_date, required_documents, department_id, created_by) 
			VALUES (?, ?, ?, ?, ?, ?)`,
			[
				'Graduation Clearance',
				'Submit required documents for graduation clearance',
				'2025-12-31',
				JSON.stringify(requiredDocuments),
				null,  // null = applies to all departments
				null   // null = system created
			]
		);

		console.log('✅ Test requirement created successfully!');
		console.log('Requirement ID:', result.insertId);
		console.log('\nThis requirement includes:');
		console.log('- 3 file upload fields (Certificate, Clearance Form, ID Picture)');
		console.log('- 1 checkbox field (Confirmation)');
		console.log('\nStudents will see file upload buttons in the Requirements screen.');
		
		process.exit(0);
	} catch (error) {
		console.error('❌ Error creating test requirement:', error);
		process.exit(1);
	}
}

createTestRequirement();

