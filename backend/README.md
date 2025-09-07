# Cashless Canteen Backend

A Node.js backend API for a cashless canteen payment system using RFID technology.

## Features

- **User Management**: Student, staff, and admin user types with RFID card authentication
- **Wallet System**: Secure balance management with transaction logging
- **Menu Management**: Dynamic menu with categories and items
- **Transaction Processing**: Real-time payment processing and history
- **Authentication**: JWT-based authentication with role-based access control
- **Real-time Logging**: Comprehensive transaction and activity logging

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
backend/
├── config/
│   ├── config.js          # Application configuration
│   └── database.js        # Database connection setup
├── database/
│   └── schema.sql         # Database schema and initial data
├── middleware/
│   └── auth.js           # Authentication middleware
├── models/
│   ├── User.js           # User model and operations
│   ├── Wallet.js         # Wallet model and operations
│   ├── Menu.js           # Menu and menu items models
│   └── Transaction.js    # Transaction model and operations
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── wallets.js        # Wallet management routes
│   ├── transactions.js   # Transaction routes
│   └── menu.js           # Menu management routes
├── utils/
│   ├── jwt.js            # JWT utility functions
│   └── validation.js     # Input validation schemas
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=cashless_canteen
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   ```

4. **Set up MySQL database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (admin only)
- `POST /api/auth/login` - Login with RFID card
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/profile` - Get user profile

### Wallets
- `GET /api/wallets/balance` - Get wallet balance
- `GET /api/wallets/summary` - Get wallet summary
- `GET /api/wallets/transactions` - Get transaction history
- `POST /api/wallets/top-up` - Top up wallet (staff/admin)
- `POST /api/wallets/transfer` - Transfer money to another user
- `GET /api/wallets/rfid/:rfid_card_id` - Get wallet by RFID (staff)
- `POST /api/wallets/payment` - Process payment (staff)

### Menu
- `GET /api/menu` - Get full menu
- `GET /api/menu/items` - Get menu items with filters
- `GET /api/menu/search` - Search menu items
- `GET /api/menu/categories` - Get menu categories
- `GET /api/menu/items/:id` - Get single menu item
- `POST /api/menu/categories` - Create category (staff/admin)
- `PUT /api/menu/categories/:id` - Update category (staff/admin)
- `DELETE /api/menu/categories/:id` - Delete category (staff/admin)
- `POST /api/menu/items` - Create menu item (staff/admin)
- `PUT /api/menu/items/:id` - Update menu item (staff/admin)
- `PATCH /api/menu/items/:id/availability` - Toggle availability (staff/admin)
- `DELETE /api/menu/items/:id` - Delete menu item (staff/admin)

### Transactions
- `GET /api/transactions/my-transactions` - Get user's transactions
- `GET /api/transactions` - Get all transactions (admin)
- `GET /api/transactions/:id` - Get transaction by ID
- `GET /api/transactions/stats/overview` - Get transaction statistics (admin)
- `GET /api/transactions/stats/daily/:date` - Get daily summary (admin)
- `PATCH /api/transactions/:id/status` - Update transaction status (admin)
- `GET /api/transactions/transaction/:transaction_id` - Get transaction by transaction ID

## User Types

### Student
- View menu and check balance
- Make payments using RFID
- View transaction history
- Transfer money to other users

### Staff
- All student permissions
- Process payments for students
- Manage menu items and categories
- Top up student wallets

### Admin
- All staff permissions
- View all transactions and statistics
- Manage users and system settings
- Generate reports

## Database Schema

The system uses the following main tables:
- `users` - User information and RFID cards
- `wallets` - User wallet balances
- `transactions` - All financial transactions
- `menu_categories` - Menu categories
- `menu_items` - Individual menu items
- `orders` - Order records
- `order_items` - Order line items
- `reservations` - Food reservations
- `transaction_types` - Transaction type definitions
- `system_settings` - System configuration

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation with Joi
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention with parameterized queries

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time

## Health Check

The server provides a health check endpoint:
```
GET /health
```

Returns server status, uptime, and environment information.

## Error Handling

All API endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if applicable)
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
