const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const usersRoutes = require('./routes/usersRoutes');
const authRoutes = require('./routes/authRoutes');
const meRoutes = require('./routes/meRoutes');
const departmentsRoutes = require('./routes/departmentsRoutes');
const requirementsRoutes = require('./routes/requirementsRoutes');
const { ensureTable } = require('./repositories/usersRepository');
const { ensureDepartmentsTable } = require('./repositories/departmentsRepository');
const { ensureRequirementsTable } = require('./repositories/requirementsRepository');
const { ensureSubmissionsTable } = require('./repositories/submissionsRepository');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use('/users', usersRoutes);
app.use('/departments', departmentsRoutes);
app.use('/requirements', requirementsRoutes);

const port = Number(process.env.PORT || 3000);

async function start() {
	// Ensure base tables exist in correct order
	await ensureDepartmentsTable();
	await ensureTable();
	await ensureRequirementsTable();
	await ensureSubmissionsTable();
	app.listen(port, () => {
		console.log(`API listening on http://localhost:${port}`);
	});
}

start();


