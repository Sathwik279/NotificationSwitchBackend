# Notification Switch Backend
Basically this application is used to continously monitor the notifications occuring in the mobile and store them so that user dont miss any and also helps to search any  otps or information in the notifications.
A Node.js backend with PostgreSQL and Firebase Authentication for the Notification Switch Android app.

## Features

- � Firebase Authentication (Admin SDK)
- 🐘 PostgreSQL database with Sequelize ORM
- 🛡️ Firebase ID token verification
- 🚀 Easy deployment to Render
- 📊 RESTful API endpoints
- 🔒 Security middleware (Helmet, CORS, Rate limiting)

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Firebase project with Authentication enabled

## Setup

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

3. **Firebase Setup**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Enable Authentication and configure sign-in methods
   - Go to Project Settings > Service Accounts
   - Generate a new private key and download the JSON file
   - Extract the values for your environment variables

4. **Database Setup**
   ```bash
   # Run migrations to create tables
   npm run migrate
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
- `POST /auth/verify` - Verify Firebase ID token
- `POST /auth/logout` - Logout user
- `DELETE /auth/delete-account` - Delete user account

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `GET /api/users` - Get all users (requires auth)
- `DELETE /api/users/profile` - Delete user account (requires auth)

### Health
- `GET /health` - Health check
- `GET /` - API info

## Deployment to Render

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Setup:
1. Create PostgreSQL database on Render
2. Create web service connected to your GitHub repo
3. Set environment variables (see DEPLOYMENT.md for full list)
4. Deploy and test endpoints

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase private key ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `FIREBASE_CLIENT_ID` | Firebase client ID | Yes |
| `FIREBASE_AUTH_URI` | Firebase auth URI | Yes |
| `FIREBASE_TOKEN_URI` | Firebase token URI | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting (100 requests per 15 minutes per IP)
- Firebase ID token verification
- Input validation

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  profile_picture TEXT,
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## License

MIT License
