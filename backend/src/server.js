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

// Debug endpoint to test authentication
app.post('/debug/login', async (req, res) => {
  try {
    console.log('Debug login - Raw body:', req.body);
    console.log('Debug login - Headers:', req.headers);
    
    const { email, password } = req.body;
    console.log('Debug login - Parsed email:', email);
    console.log('Debug login - Parsed password:', password);
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email, password }
      });
    }
    
    // Test database connection
    const { query } = require('./db');
    const users = await query('SELECT id, name, email, role, password_hash FROM users WHERE email = ?', [email]);
    console.log('Debug login - Database query result:', users);
    
    if (users.length === 0) {
      return res.status(401).json({ 
        message: 'User not found',
        email: email,
        allUsers: await query('SELECT email FROM users')
      });
    }
    
    const user = users[0];
    console.log('Debug login - Found user:', user);
    
    // Test password comparison
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Debug login - Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid password',
        email: email,
        passwordHash: user.password_hash
      });
    }
    
    res.json({
      message: 'Debug login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Debug login error:', error);
    res.status(500).json({ 
      message: 'Debug login failed',
      error: error.message
    });
  }
});

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


