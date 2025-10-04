const jwt = require('jsonwebtoken');
const { getUserById } = require('../repositories/usersRepository');

const authMiddleware = async (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');
		
		if (!token) {
			return res.status(401).json({ message: 'No token provided' });
		}
		
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
		const user = await getUserById(decoded.userId);
		
		if (!user) {
			return res.status(401).json({ message: 'Invalid token' });
		}
		
		req.user = user;
		next();
	} catch (error) {
		console.error('Auth middleware error:', error);
		res.status(401).json({ message: 'Invalid token' });
	}
};

const adminMiddleware = async (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');
		
		if (!token) {
			return res.status(401).json({ message: 'No token provided' });
		}
		
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
		const user = await getUserById(decoded.userId);
		
		if (!user) {
			return res.status(401).json({ message: 'Invalid token' });
		}
		
		if (user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin access required' });
		}
		
		req.user = user;
		next();
	} catch (error) {
		console.error('Admin middleware error:', error);
		res.status(401).json({ message: 'Invalid token' });
	}
};

module.exports = { authMiddleware, adminMiddleware };
