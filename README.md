# Cybercrime Portal - Sentinel System

A comprehensive cybercrime reporting and analysis platform with AI-powered features for law enforcement and citizens.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended) or 16+
- PostgreSQL database
- Python 3.8+ (for AI features)
- FFmpeg (for media processing)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Sentineltofumisosoup101
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your actual values
   # See backend/env.example for all required variables
   ```

4. **Set up your database**
   - Create a PostgreSQL database
   - Update `DATABASE_URL` in your `.env` file
   - The server will automatically create tables on first run

5. **Start the server**
   ```bash
   npm start
   ```

   The server will run on `http://localhost:5001`

### Mobile App Setup

1. **Install dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

## 📋 Environment Variables

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_PUBLISHABLE_KEY` - Clerk authentication public key
- `CLERK_SECRET_KEY` - Clerk authentication secret key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL for rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `FINGERPRINT_KEY` - FingerprintJS secret key
- `IPINFO_TOKEN` - IPInfo API token
- `JWT_SECRET` - Secret key for JWT tokens

### Email Configuration (MailerSend)
- `MAILERSEND_SMTP_USER` - SMTP username
- `MAILERSEND_SMTP_PASS` - SMTP password
- `MAILERSEND_SMTP_HOST` - SMTP host (smtp.mailersend.net)
- `MAILERSEND_SMTP_PORT` - SMTP port (587)
- `MAILERSEND_FROM` - From email address
- `MAILERSEND_TO` - Admin email address

### Optional AI Configuration
- `GROQ_API_KEY` - Groq API key for AI analysis
- `TAVILY_API_KEY` - Tavily API key for web search

## 🏗️ Project Structure

```
Sentineltofumisosoup101/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── config/         # Database and service configs
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # AI models (Python)
│   │   ├── services/       # Business logic services
│   │   └── server.js       # Main server file
│   ├── package.json        # Backend dependencies
│   └── env.example         # Environment variables template
├── mobile/                  # React Native mobile app
│   ├── app/                # App screens and navigation
│   ├── components/         # Reusable components
│   └── package.json        # Mobile dependencies
└── README.md               # This file
```

## 🔧 Features

### Backend API Endpoints

#### Authentication & User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/officer/login` - Officer authentication

#### Cybercrime Reporting
- `POST /api/reports` - Submit new report
- `GET /api/reports` - Get reports (with filtering)
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

#### AI-Powered Analysis
- `POST /api/ai/detect-call-scam` - Analyze audio for scams
- `POST /api/ai/complete-analysis` - Full incident analysis
- `POST /api/ai/analyze-audio` - Audio transcription
- `POST /api/ai/analyze-video` - Video analysis
- `POST /api/ai/analyze-image` - Image text extraction
- `POST /api/ai/analyze-pdf` - PDF text extraction
- `POST /api/ai/check-similarity-advanced` - Database similarity check
- `POST /api/ai/chat-enhanced` - AI chatbot

#### Law Enforcement
- `POST /api/data-request` - Create data request
- `GET /api/data-requests` - Get data requests
- `GET /api/admin/dashboard` - Admin dashboard stats

#### Visitor Analytics
- `GET /api/collect` - Collect visitor fingerprinting data

### Mobile App Features
- User authentication
- Report submission with media upload
- Real-time chat with AI assistant
- Report tracking and status updates
- Push notifications

## 🐳 Docker Support

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run
```

## 🔍 Health Check

Check if the server is running:
```bash
curl http://localhost:5001/health
```

## 📝 API Documentation

Once the server is running, visit:
- `http://localhost:5001/api/ai/docs` - AI service documentation
- `http://localhost:5001/api/ai/help` - API help

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use (EADDRINUSE)**
   - Change the `PORT` in your `.env` file
   - Or kill the process using port 5001

2. **Database connection failed**
   - Verify your `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check database permissions

3. **AI features not working**
   - Ensure Python 3.8+ is installed
   - Install required Python packages: `pip install -r models/*/requirements.txt`
   - Verify API keys for Groq/Tavily are set

4. **Email not sending**
   - Check MailerSend credentials
   - Verify SMTP settings
   - Check firewall/network restrictions

### Development Commands

```bash
# Backend development
npm run dev          # Start with nodemon
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation at `/api/ai/docs`