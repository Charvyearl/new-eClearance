# eClearance Backend API

A Node.js backend API for an electronic clearance system for educational institutions.

## Features

- **User Management**: Student, department, and admin user types with role-based access
- **Requirements Management**: Department-specific clearance requirements
- **Document Submission**: Students can submit required documents with file uploads
- **Approval Workflow**: Department users can review and approve/reject submissions
- **Authentication**: JWT-based authentication with role-based access control
- **Real-time Status**: Track clearance status and progress

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Base64 encoding for document storage
- **Security**: CORS, JWT validation

## Project Structure

```
backend/
├── src/
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── repositories/
│   │   ├── usersRepository.js          # User operations
│   │   ├── departmentsRepository.js    # Department operations
│   │   ├── requirementsRepository.js   # Requirements operations
│   │   └── submissionsRepository.js    # Submissions operations
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── usersRoutes.js       # User management routes
│   │   ├── departmentsRoutes.js # Department routes
│   │   ├── requirementsRoutes.js # Requirements routes
│   │   └── meRoutes.js          # Current user routes
│   ├── db.js                    # Database connection
│   ├── server.js                # Main server file
│   ├── createAdmin.js           # Admin creation script
│   └── testDb.js                # Database test script
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment variables template
└── README.md                    # This file
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
   DB_NAME=eclearance
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   The server will automatically create the required database tables.

5. **Create an admin user**
   ```bash
   npm run create-admin
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user (admin only)
- `POST /auth/login` - Login with email and password
- `GET /me` - Get current user profile

### Users
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

### Departments
- `GET /departments` - Get all departments
- `GET /departments/:id` - Get department by ID
- `POST /departments` - Create department (admin only)
- `PUT /departments/:id` - Update department (admin only)
- `DELETE /departments/:id` - Delete department (admin only)

### Requirements
- `GET /requirements` - Get requirements (filtered by role)
- `POST /requirements` - Create requirement (department/admin)
- `PUT /requirements/:id` - Update requirement (department/admin)
- `DELETE /requirements/:id` - Delete requirement (department/admin)
- `POST /requirements/:id/submit` - Submit requirement (student)
- `DELETE /requirements/:id/submit` - Unsubmit requirement (student)
- `GET /requirements/submissions/mine` - Get my submissions (student)
- `GET /requirements/submissions` - Get department submissions (department/admin)
- `GET /requirements/submissions/:id` - Get submission details
- `POST /requirements/submissions/:id/approve` - Approve submission (department/admin)
- `POST /requirements/submissions/:id/reject` - Reject submission (department/admin)

## User Roles

### Student
- View all clearance requirements
- Submit required documents (checkbox and file upload)
- Track submission status
- View clearance progress

### Department
- Create and manage department-specific requirements
- Review student submissions
- Approve or reject clearance requests
- View department dashboard with statistics

### Admin
- All department permissions
- Manage users and departments
- View all submissions across departments
- System-wide administration

## Database Schema

The system uses the following main tables:
- `users` - User information (students, department users, admins)
- `departments` - Department information
- `requirements` - Clearance requirements
- `submissions` - Student submissions

## File Upload Support

The system supports file uploads for clearance requirements:
- **Supported formats**: Images (JPG, PNG) and PDFs
- **File size limit**: 2MB per file
- **Storage**: Base64 encoded in JSON responses field
- **Types**: File upload or checkbox confirmation

## Security Features

- JWT-based authentication
- Role-based access control (student, department, admin)
- Password hashing with bcryptjs
- SQL injection prevention with parameterized queries
- CORS protection

## Development

### Running the Server
```bash
npm start
```

### Testing Database Connection
```bash
npm run db:test
```

### Creating Admin User
```bash
npm run create-admin
```

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name (eclearance)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret

## Health Check

The server provides a health check endpoint:
```
GET /health
```

Returns: `{"status":"ok"}`

## Error Handling

All API endpoints return consistent error responses:
```json
{
  "message": "Error description"
}
```

## File Upload Guide

See `FILE_UPLOAD_GUIDE.md` for detailed information on implementing and using file upload features.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
