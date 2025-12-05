# Urban Vac Invoice System - Deployment Guide

This guide will help you deploy the Urban Vac Invoice System with the client and server as separate, independent applications.

## Project Structure

```
urbanvac/
├── client/          # React frontend (Vite)
├── server/          # Node.js/Express backend
└── DEPLOYMENT.md    # This file
```

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or MongoDB instance)
- **Cloudinary account (for PDF storage)** - Sign up at https://cloudinary.com
- Gmail account with App Password (for email functionality)
- Hosting accounts for both frontend and backend

---

## Part 1: Server (Backend) Deployment

### 1. Environment Configuration

Create a `.env` file in the `server/` directory with production values:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/urbanvac_invoices
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urbanvac_invoices

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=YOUR_SECURE_RANDOM_STRING_HERE_MINIMUM_32_CHARACTERS
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=Urban Vac <noreply@urbanvac.com>

# Frontend URL (your deployed frontend URL)
CLIENT_URL=https://your-frontend-domain.com

# Invoice Configuration
INVOICE_START_NUMBER=3000

# Cloudinary Configuration (for PDF storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**IMPORTANT: Cloudinary Setup**

PDFs are now stored in Cloudinary (cloud storage) instead of local filesystem. This is essential for deployment platforms like Render, Heroku, etc., which have ephemeral file systems.

To get your Cloudinary credentials:
1. Sign up at https://cloudinary.com (free tier is sufficient)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your environment variables

### 2. Deploy to Render (Recommended for Backend)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables from your `.env` file in the Render dashboard
6. Deploy

### 3. Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create a new project from GitHub
3. Select the `server` directory
4. Add environment variables
5. Deploy

### 4. Alternative: Deploy to Heroku

```bash
cd server
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
# ... add all other environment variables
git subtree push --prefix server heroku main
```

### 5. Important Notes for Server Deployment

- **Cloudinary**: PDFs are stored in Cloudinary (not local filesystem). Make sure to add Cloudinary credentials to environment variables.
- Ensure the `assets` folder is included in your deployment (contains Header.png, Footer.png, urbanvaclogo.png)
- **No need for `invoices` folder**: PDFs are stored in Cloudinary, not locally
- Make sure your MongoDB Atlas IP whitelist includes your hosting provider's IPs (or use 0.0.0.0/0 for all IPs)
- Set up Gmail App Password: Google Account > Security > 2-Step Verification > App Passwords

---

## Part 2: Client (Frontend) Deployment

### 1. Environment Configuration

Create a `.env` file in the `client/` directory:

```env
# API Configuration - Use your deployed backend URL
VITE_API_URL=https://your-backend-domain.com/api
```

### 2. Build the Client

```bash
cd client
npm install
npm run build
```

This creates a `dist/` folder with your production build.

### 3. Deploy to Vercel (Recommended for Frontend)

#### Option A: Using Vercel CLI

```bash
npm install -g vercel
cd client
vercel
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-domain.com/api`
5. Deploy

### 4. Alternative: Deploy to Netlify

#### Using Netlify CLI

```bash
npm install -g netlify-cli
cd client
npm run build
netlify deploy --prod
```

#### Using Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `client/dist` folder
3. Or connect to GitHub and configure:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-domain.com/api`

### 5. Alternative: Deploy to GitHub Pages

```bash
cd client
# Update vite.config.js with base path
npm run build
# Deploy dist folder to gh-pages branch
```

---

## Part 3: Post-Deployment Configuration

### 1. Update CORS Settings

Once your frontend is deployed, update the `CLIENT_URL` in your server's environment variables to match your frontend URL.

### 2. Test Email Functionality

Send a test invoice to verify email functionality is working with your production settings.

### 3. Database Setup

Ensure your MongoDB Atlas cluster:
- Has proper network access configured
- Has a database user created
- Has the correct connection string in your server environment variables

### 4. Security Checklist

- [ ] Changed JWT_SECRET to a secure random string
- [ ] Set NODE_ENV=production
- [ ] Updated CLIENT_URL to production frontend URL
- [ ] Configured CORS properly
- [ ] Gmail App Password is set up correctly
- [ ] MongoDB connection uses strong password
- [ ] .env files are not committed to Git
- [ ] All sensitive data is in environment variables

---

## Part 4: Common Deployment Platforms

### Recommended Combinations

| Frontend | Backend | Notes |
|----------|---------|-------|
| Vercel | Render | Best free tier combination |
| Netlify | Railway | Easy setup, good performance |
| Vercel | Railway | Fast deployment |
| GitHub Pages | Render | Completely free option |

---

## Part 5: Testing Your Deployment

1. **Test Health Endpoint**:
   ```bash
   curl https://your-backend-domain.com/health
   ```

2. **Test Frontend Loading**: Visit your frontend URL

3. **Test Authentication**: Try logging in

4. **Test Invoice Generation**: Create a test invoice

5. **Test Email**: Send an invoice to verify email functionality

---

## Part 6: Monitoring and Maintenance

### Logs

- **Render**: View logs in dashboard
- **Vercel**: View logs in dashboard
- **Railway**: View logs in dashboard

### Database Backups

Set up automated backups in MongoDB Atlas:
- Go to your cluster
- Click "Backup" tab
- Enable continuous backups

### Performance Monitoring

Consider adding:
- Sentry for error tracking
- LogRocket for frontend monitoring
- MongoDB Atlas monitoring for database performance

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify CLIENT_URL matches your frontend URL exactly
   - Check CORS configuration in server/app.js

2. **Database Connection Fails**
   - Verify MongoDB connection string
   - Check network access in MongoDB Atlas
   - Ensure IP whitelist is configured

3. **Email Not Sending**
   - Verify Gmail App Password is correct
   - Check EMAIL_USER and EMAIL_PASSWORD
   - Enable "Less secure app access" if using regular password (not recommended)

4. **Invoice PDF Images Not Loading**
   - Verify the `server/assets` folder contains: Header.png, Footer.png, urbanvaclogo.png
   - Check file permissions on deployment

5. **Environment Variables Not Working**
   - Restart your deployment after adding variables
   - Check variable names match exactly (case-sensitive)
   - For Vite variables, ensure they start with `VITE_`

---

## Scaling Considerations

As your application grows:

1. **Database**: Upgrade MongoDB Atlas tier for better performance
2. **CDN**: Use a CDN for static assets
3. **Caching**: Implement Redis for session management
4. **Load Balancing**: Use multiple server instances
5. **File Storage**: Move invoice PDFs to S3 or similar storage

---

## Support

For issues or questions:
1. Check the logs in your hosting dashboard
2. Review the troubleshooting section
3. Verify all environment variables are set correctly
4. Test the API endpoints directly using curl or Postman

---

## Quick Deployment Commands

```bash
# Server deployment test
cd server
npm install
npm start

# Client build test
cd client
npm install
npm run build
npm run preview

# Test API connection
curl http://localhost:5000/health
```

Good luck with your deployment!
