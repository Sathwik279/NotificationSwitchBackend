# Deployment Guide for Render

This guide will help you deploy the Notification Switch Backend to Render with PostgreSQL and Firebase Authentication.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **Firebase Project**: Set up Firebase project with Authentication enabled
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing project
3. Enable Authentication and configure your preferred sign-in methods
4. Go to Project Settings > Service Accounts
5. Click "Generate new private key" to download the service account JSON
6. Save the following values from the JSON file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `client_id` → `FIREBASE_CLIENT_ID`

## Step 2: Deploy to Render

### Create PostgreSQL Database

1. Log in to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Choose a name for your database (e.g., `notification-switch-db`)
4. Select the region closest to your users
5. Choose the free tier for testing
6. Click "Create Database"
7. Once created, copy the "Internal Database URL" (starts with `postgresql://`)

### Create Web Service

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `notification-switch-backend`
   - **Environment**: `Node`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Configure Environment Variables

In the web service settings, add these environment variables:

```bash
# Node Environment
NODE_ENV=production

# Database
DATABASE_URL=<Your Internal Database URL from Step 1>

# Firebase Configuration
FIREBASE_PROJECT_ID=<your_firebase_project_id>
FIREBASE_PRIVATE_KEY_ID=<your_private_key_id>
FIREBASE_PRIVATE_KEY=<your_private_key_wrapped_in_quotes>
FIREBASE_CLIENT_EMAIL=<firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com>
FIREBASE_CLIENT_ID=<your_client_id>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Security
JWT_SECRET=<generate_a_strong_random_string>

# CORS
FRONTEND_URL=<your_frontend_domain_or_*_for_all>
```

**Important Notes:**
- Wrap `FIREBASE_PRIVATE_KEY` in quotes to preserve line breaks
- Generate a strong random string for `JWT_SECRET`
- Set `FRONTEND_URL` to your actual frontend domain or use `*` for development

### Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the deploy logs for any errors
4. Once deployed, test your endpoints:
   - Health check: `https://your-service.onrender.com/health`
   - API root: `https://your-service.onrender.com/`

## Step 3: Test the Deployment

### Test Health Check
```bash
curl https://your-service.onrender.com/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Notification Switch Backend is running",
  "timestamp": "2025-06-26T..."
}
```

### Test Firebase Authentication
You can test the auth endpoints using a Firebase ID token from your frontend application.

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-12345` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk-xxx@project.iam.gserviceaccount.com` |
| `JWT_SECRET` | Secret for additional JWT tokens | `your-secret-key` |
| `FRONTEND_URL` | Frontend domain for CORS | `https://myapp.com` |

## Troubleshooting

### Database Connection Issues
- Verify the `DATABASE_URL` is correct
- Check that the database service is running
- Ensure both services are in the same region

### Firebase Authentication Issues
- Verify all Firebase environment variables are set correctly
- Check that the private key is properly formatted with quotes
- Ensure Firebase Authentication is enabled in your project

### CORS Issues
- Set `FRONTEND_URL` to your actual frontend domain
- For development, you can use `*` but this is not recommended for production

### Build Failures
- Check that all dependencies are listed in `package.json`
- Verify the Node.js version compatibility
- Check build logs for specific error messages

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Access**: Use strong passwords and limit access
3. **CORS**: Set specific frontend URLs in production
4. **Rate Limiting**: Monitor API usage and adjust rate limits as needed
5. **Firebase Rules**: Configure appropriate security rules in Firebase Console

## Monitoring and Maintenance

- Monitor application logs in Render Dashboard
- Set up health check monitoring
- Regularly update dependencies for security patches
- Monitor database usage and performance
- Consider setting up automated backups for production data
