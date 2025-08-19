# Deployment Guide for Bolt/GitHub

This guide will help you deploy the Cybercrime Portal on Bolt or similar platforms.

## 🚀 Quick Deployment Steps

### 1. Repository Setup

Your repository is already configured for easy deployment:

- ✅ `.gitignore` excludes `node_modules/` and `.env` files
- ✅ `package.json` and `package-lock.json` are committed
- ✅ `env.example` provides environment variable template
- ✅ `setup.js` automates initial configuration

### 2. Local Testing Before Deployment

```bash
# Clone your repository
git clone <your-repo-url>
cd Sentineltofumisosoup101

# Backend setup
cd backend
npm install
npm run setup  # Creates .env from template
# Edit .env with your actual values
npm start

# Test the API
curl http://localhost:5001/health
```

### 3. Environment Variables for Production

You'll need to set these environment variables on your deployment platform:

#### Required Variables
```
DATABASE_URL=postgresql://username:password@host:port/database
CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
FINGERPRINT_KEY=your_fingerprintjs_key
IPINFO_TOKEN=your_ipinfo_token
JWT_SECRET=your_jwt_secret
```

#### Email Configuration
```
MAILERSEND_SMTP_USER=your_username
MAILERSEND_SMTP_PASS=your_password
MAILERSEND_SMTP_HOST=smtp.mailersend.net
MAILERSEND_SMTP_PORT=587
MAILERSEND_FROM=noreply@yourdomain.com
MAILERSEND_TO=admin@yourdomain.com
```

#### Optional AI Configuration
```
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
```

### 4. Database Setup

#### Option A: Use Bolt's PostgreSQL (if available)
- Create a PostgreSQL database on Bolt
- Use the provided connection string as `DATABASE_URL`

#### Option B: External Database
- Use services like Neon, Supabase, or Railway
- Update `DATABASE_URL` with your external database

### 5. Platform-Specific Instructions

#### For Bolt
1. Connect your GitHub repository
2. Set environment variables in Bolt dashboard
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Set port: `5001`

#### For Railway
1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Railway will auto-detect Node.js and run `npm start`

#### For Render
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Set build command: `npm install`
4. Set start command: `npm start`

#### For Heroku
1. Connect your GitHub repository
2. Add environment variables in Heroku dashboard
3. Set buildpacks: `heroku/nodejs`
4. Heroku will auto-detect and run `npm start`

### 6. Post-Deployment Verification

After deployment, test these endpoints:

```bash
# Health check
curl https://your-app-url/health

# API documentation
curl https://your-app-url/api/ai/docs

# Test a simple endpoint
curl https://your-app-url/api/collect
```

### 7. Mobile App Deployment

For the mobile app:

```bash
cd mobile
npm install
npx expo build:android  # or build:ios
```

Or use Expo's cloud build service.

## 🔧 Troubleshooting

### Common Deployment Issues

1. **Build fails with "module not found"**
   - Ensure all dependencies are in `package.json`
   - Check that `node_modules/` is in `.gitignore`

2. **Environment variables not working**
   - Verify all required variables are set
   - Check variable names match exactly
   - Restart the application after setting variables

3. **Database connection fails**
   - Verify `DATABASE_URL` format
   - Check database is accessible from deployment platform
   - Ensure database exists and is running

4. **Port issues**
   - Most platforms use `process.env.PORT`
   - The app will automatically use the platform's port

5. **AI features not working**
   - Python models require Python runtime
   - Consider using external AI services instead
   - Or deploy Python models separately

### Platform Limitations

- **Python Models**: Most Node.js platforms don't support Python
- **File Uploads**: Use cloud storage (AWS S3, Cloudinary) for file uploads
- **Background Jobs**: Use external services (Upstash QStash, BullMQ)

## 📝 Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `UPSTASH_REDIS_REST_URL` | Yes | Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Redis token |
| `FINGERPRINT_KEY` | Yes | FingerprintJS secret key |
| `IPINFO_TOKEN` | Yes | IPInfo API token |
| `JWT_SECRET` | Yes | JWT signing secret |
| `MAILERSEND_SMTP_USER` | Yes | SMTP username |
| `MAILERSEND_SMTP_PASS` | Yes | SMTP password |
| `MAILERSEND_SMTP_HOST` | Yes | SMTP host |
| `MAILERSEND_SMTP_PORT` | Yes | SMTP port |
| `MAILERSEND_FROM` | Yes | From email |
| `MAILERSEND_TO` | Yes | Admin email |
| `GROQ_API_KEY` | No | Groq API key for AI |
| `TAVILY_API_KEY` | No | Tavily API key for search |

## 🎯 Success Checklist

- [ ] Repository cloned successfully
- [ ] Environment variables configured
- [ ] Database connected and tables created
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] API endpoints working
- [ ] Mobile app builds successfully

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Test locally first
4. Check the main README.md for detailed setup instructions
