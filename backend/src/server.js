const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const usersRoutes = require('./routes/usersRoutes');
const authRoutes = require('./routes/authRoutes');
const meRoutes = require('./routes/meRoutes');
const { ensureTable } = require('./repositories/usersRepository');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/me', meRoutes);
app.use('/users', usersRoutes);

const port = Number(process.env.PORT || 3000);

async function start() {
	await ensureTable();
	app.listen(port, () => {
		console.log(`API listening on http://localhost:${port}`);
	});
}

start();


