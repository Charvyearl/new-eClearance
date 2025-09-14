const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Personnel = require('../models/Personnel');
const { validate } = require('../utils/validation');
const { studentSchemas, personnelSchemas } = require('../utils/validation');
const { verifyToken } = require('../utils/jwt');

// Middleware to verify admin access
const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Handle mock tokens for development
    if (token.startsWith('mock-jwt-token-')) {
      const userId = token.replace('mock-jwt-token-', '');
      // Mock admin user for development
      req.user = {
        userId: parseInt(userId),
        userType: 'admin'
      };
      return next();
    }
    
    // Handle real JWT tokens
    const decoded = verifyToken(token);
    
    // Check if user is admin
    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Apply admin middleware to all routes
router.use(verifyAdmin);

// ========== STUDENT MANAGEMENT ==========

// Create new student account
router.post('/students', validate(studentSchemas.create), async (req, res) => {
  try {
    const { rfid_card_id, first_name, last_name, email, password, balance } = req.body;
    
    // Check if RFID card already exists in students table
    const existingStudent = await Student.findByRfidCardId(rfid_card_id);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'RFID card already registered for a student'
      });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Student.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered for a student'
        });
      }
    }
    
    // Create new student
    const student = await Student.create({
      rfid_card_id,
      first_name,
      last_name,
      email,
      password,
      balance
    });
    
    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: student.getProfile()
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student account',
      error: error.message
    });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const { page = 1, limit = 10, is_active } = req.query;
    
    const students = await Student.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      is_active: is_active !== undefined ? is_active === 'true' : undefined
    });
    
    res.json({
      success: true,
      data: students.map(student => student.getProfile())
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students',
      error: error.message
    });
  }
});

// Get student by ID
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      data: student.getProfile()
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student',
      error: error.message
    });
  }
});

// Update student
router.put('/students/:id', validate(studentSchemas.update), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    await student.update(req.body);
    
    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student.getProfile()
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student',
      error: error.message
    });
  }
});

// Update student password
router.put('/students/:id/password', validate(studentSchemas.updatePassword), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    await student.updatePassword(req.body.password);
    
    res.json({
      success: true,
      message: 'Student password updated successfully'
    });
  } catch (error) {
    console.error('Update student password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student password',
      error: error.message
    });
  }
});

// Delete student (soft delete)
router.delete('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    await student.delete();
    
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message
    });
  }
});

// ========== PERSONNEL MANAGEMENT ==========

// Create new personnel account
router.post('/personnel', validate(personnelSchemas.create), async (req, res) => {
  try {
    const { rfid_card_id, first_name, last_name, email, password, balance } = req.body;
    
    // Check if RFID card already exists in personnel table
    const existingPersonnel = await Personnel.findByRfidCardId(rfid_card_id);
    if (existingPersonnel) {
      return res.status(400).json({
        success: false,
        message: 'RFID card already registered for personnel'
      });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Personnel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered for personnel'
        });
      }
    }
    
    // Create new personnel
    const personnel = await Personnel.create({
      rfid_card_id,
      first_name,
      last_name,
      email,
      password,
      balance
    });
    
    res.status(201).json({
      success: true,
      message: 'Personnel account created successfully',
      data: personnel.getProfile()
    });
  } catch (error) {
    console.error('Create personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create personnel account',
      error: error.message
    });
  }
});

// Get all personnel
router.get('/personnel', async (req, res) => {
  try {
    const { page = 1, limit = 10, is_active } = req.query;
    
    const personnel = await Personnel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      is_active: is_active !== undefined ? is_active === 'true' : undefined
    });
    
    res.json({
      success: true,
      data: personnel.map(person => person.getProfile())
    });
  } catch (error) {
    console.error('Get personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personnel',
      error: error.message
    });
  }
});

// Get personnel by ID
router.get('/personnel/:id', async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }
    
    res.json({
      success: true,
      data: personnel.getProfile()
    });
  } catch (error) {
    console.error('Get personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personnel',
      error: error.message
    });
  }
});

// Update personnel
router.put('/personnel/:id', validate(personnelSchemas.update), async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }
    
    await personnel.update(req.body);
    
    res.json({
      success: true,
      message: 'Personnel updated successfully',
      data: personnel.getProfile()
    });
  } catch (error) {
    console.error('Update personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personnel',
      error: error.message
    });
  }
});

// Update personnel password
router.put('/personnel/:id/password', validate(personnelSchemas.updatePassword), async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }
    
    await personnel.updatePassword(req.body.password);
    
    res.json({
      success: true,
      message: 'Personnel password updated successfully'
    });
  } catch (error) {
    console.error('Update personnel password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update personnel password',
      error: error.message
    });
  }
});

// Delete personnel (soft delete)
router.delete('/personnel/:id', async (req, res) => {
  try {
    const personnel = await Personnel.findById(req.params.id);
    
    if (!personnel) {
      return res.status(404).json({
        success: false,
        message: 'Personnel not found'
      });
    }
    
    await personnel.delete();
    
    res.json({
      success: true,
      message: 'Personnel deleted successfully'
    });
  } catch (error) {
    console.error('Delete personnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete personnel',
      error: error.message
    });
  }
});

module.exports = router;
