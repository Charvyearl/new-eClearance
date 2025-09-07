const Joi = require('joi');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    rfid_card_id: Joi.string().required().min(5).max(50),
    student_id: Joi.string().optional().min(3).max(20),
    first_name: Joi.string().required().min(2).max(100),
    last_name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional().min(10).max(20),
    user_type: Joi.string().valid('student', 'staff', 'admin').default('student')
  }),
  
  update: Joi.object({
    first_name: Joi.string().min(2).max(100),
    last_name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().min(10).max(20),
    is_active: Joi.boolean()
  })
};

// Wallet validation schemas
const walletSchemas = {
  topUp: Joi.object({
    amount: Joi.number().positive().precision(2).max(10000).required(),
    description: Joi.string().optional().max(255)
  }),
  
  transfer: Joi.object({
    recipient_rfid: Joi.string().required().min(5).max(50),
    amount: Joi.number().positive().precision(2).required(),
    description: Joi.string().optional().max(255)
  })
};

// Menu validation schemas
const menuSchemas = {
  createItem: Joi.object({
    category_id: Joi.number().integer().positive().required(),
    name: Joi.string().required().min(2).max(200),
    description: Joi.string().optional().max(1000),
    price: Joi.number().positive().precision(2).max(1000).required(),
    image_url: Joi.string().uri().optional(),
    is_available: Joi.boolean().default(true)
  }),
  
  updateItem: Joi.object({
    category_id: Joi.number().integer().positive(),
    name: Joi.string().min(2).max(200),
    description: Joi.string().max(1000),
    price: Joi.number().positive().precision(2).max(1000),
    image_url: Joi.string().uri(),
    is_available: Joi.boolean()
  }),
  
  createCategory: Joi.object({
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().optional().max(500)
  })
};

// Order validation schemas
const orderSchemas = {
  create: Joi.object({
    items: Joi.array().items(
      Joi.object({
        menu_item_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().max(10).required()
      })
    ).min(1).required(),
    payment_method: Joi.string().valid('rfid', 'cash').default('rfid')
  })
};

// Reservation validation schemas
const reservationSchemas = {
  create: Joi.object({
    menu_item_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().max(5).required(),
    reservation_date: Joi.date().min('now').required()
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  userSchemas,
  walletSchemas,
  menuSchemas,
  orderSchemas,
  reservationSchemas,
  validate
};
