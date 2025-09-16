# CYB Guide - Ethical Cybersecurity Learning Hub

## Project Overview
- **Name**: CYB Guide
- **Goal**: Educational cybersecurity platform inspired by Deke Shaw's analytical approach - calm, interactive, ethical hacking education
- **Features**: Responsibility modal, OAuth authentication, AI assistant, learning paths, events, community hub, admin dashboard

## 🛡️ Current Features

### ✅ Completed Features
1. **Responsibility Lesson Modal** - Users must accept ethical use policy before accessing content
2. **Professional Dark Cybersecurity UI** - Matrix-green theme with hacker aesthetics
3. **Language Toggle System** - Switch between Casual ↔ Professional language
4. **Authentication Routes** - Google OAuth and Discord OAuth integration ready
5. **Main Sections**:
   - Learning Guide/Path with step-by-step roadmap
   - AI Assistant (DEKE-AI) with Deke Shaw personality
   - Events & Competitions page
   - Announcements system
   - Community Hub with Discord integration placeholder
6. **Admin Dashboard** - Password-protected admin panel for management
7. **Logging System** - User action tracking ready for Google Sheets integration
8. **Terms & Privacy Policy** pages

### 🔄 Functional Entry Points

#### Public Routes
- `/` - Main application with responsibility modal
- `/login` - Authentication page (Google/Discord OAuth)
- `/terms` - Terms & Conditions page
- `/privacy` - Privacy Policy page

#### Authentication Routes
- `/auth/google` - Google OAuth initiation
- `/auth/google/callback` - Google OAuth callback
- `/auth/discord` - Discord OAuth initiation  
- `/auth/discord/callback` - Discord OAuth callback
- `/auth/logout` - User logout (POST)

#### API Routes
- `POST /api/log-acceptance` - Log responsibility acceptance
- `POST /api/log-action` - Log user actions
- `POST /api/ai-assistant` - AI assistant queries
- `GET /api/learning-guide` - Get learning guide data
- `GET /api/events` - Get events data
- `GET /api/announcements` - Get announcements data
- `GET /api/language-pairs` - Get language toggle pairs

#### Admin Routes
- `/admin` - Admin login page
- `POST /admin/login` - Admin authentication
- `/admin/dashboard` - Admin dashboard (requires authentication)
- `GET /admin/logs` - View user activity logs
- `GET /admin/export-logs` - Export logs as CSV
- `POST /admin/update-password` - Update admin password
- `POST /admin/logout` - Admin logout

## 🎯 Data Architecture

### Data Models
- **User**: email, name, provider (google/discord), avatar
- **Activity Log**: timestamp, userEmail, action, extraInfo
- **Learning Module**: title, description, topics, resources
- **Event**: name, description, date, location, type, status
- **Announcement**: title, content, type, timestamp, icon, color

### Storage Services
- **Google Sheets** (primary) - User activity logging
- **LocalStorage** - Responsibility acceptance, language preferences
- **Cookies** - Authentication tokens, admin sessions
- **Future**: Firebase integration option for enhanced data management

### Data Flow
1. User accepts responsibility → Logged to Google Sheets
2. User actions (navigation, AI queries, etc.) → Logged to Google Sheets
3. Admin views real-time logs through dashboard
4. Language preferences stored locally for immediate switching

## 🚀 URLs
- **Development**: http://localhost:3000 (sandbox environment)
- **Production**: Will be deployed to Cloudflare Pages
- **GitHub**: https://github.com/surisettidev/new4.2

## 👤 User Guide

### Getting Started
1. **Accept Responsibility** - Read and accept the ethical use policy
2. **Optional Login** - Use Google or Discord OAuth for personalized experience  
3. **Explore Learning Path** - Follow structured cybersecurity roadmap
4. **Chat with DEKE-AI** - Ask questions about ethical hacking techniques
5. **Join Community** - Connect with other ethical hackers
6. **Stay Updated** - Check events and announcements regularly

### Language Toggle
- **Professional Mode**: Formal, technical language suitable for educational institutions
- **Casual Mode**: Relaxed, conversational tone with hacker slang
- Toggle preserved across sessions in localStorage

### AI Assistant (DEKE-AI)
- Personality modeled after Deke Shaw - analytical, calm, problem-solving
- Provides ethical hacking guidance with lab-environment reminders
- Responds to queries about tools (nmap, Burp Suite), techniques (SQL injection), and general cybersecurity
- All interactions logged for educational tracking

### Admin Features
- **Default Credentials**: Password = `Yethical` (changeable)
- **Activity Monitoring**: Real-time user action logs
- **Content Management**: Language pairs, learning modules (expandable)
- **CSV Export**: Download activity logs for analysis

## 🛠️ Deployment

### Platform
- **Cloudflare Pages** - Edge deployment with global CDN
- **Status**: ✅ Ready for deployment
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Cloudflare Workers

### Required Environment Variables (Cloudflare Secrets)
Set these using `wrangler secret put VARIABLE_NAME`:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DISCORD_CLIENT_ID=your_discord_client_id  
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Admin Configuration
ADMIN_PASSWORD=Yethical  # Change this!

# Google Sheets Integration
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
GOOGLE_SHEET_ID=your_google_sheet_id

# Security
JWT_SECRET=your_jwt_secret_key
```

### Deployment Steps

1. **Setup Cloudflare API Key**
   ```bash
   # Call setup_cloudflare_api_key first
   npx wrangler whoami  # Verify authentication
   ```

2. **Build the Project**
   ```bash
   cd /home/user/webapp
   npm run build
   ```

3. **Create Cloudflare Pages Project**
   ```bash
   npx wrangler pages project create cyb-guide \
     --production-branch main \
     --compatibility-date 2025-09-16
   ```

4. **Deploy to Production**
   ```bash
   npx wrangler pages deploy dist --project-name cyb-guide
   ```

5. **Set Environment Variables**
   ```bash
   npx wrangler pages secret put ADMIN_PASSWORD --project-name cyb-guide
   # Repeat for all required variables above
   ```

### Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/surisettidev/new4.2.git
   cd new4.2
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build Project**
   ```bash
   npm run build
   ```

4. **Start Development Server**
   ```bash
   # Using PM2 (recommended for sandbox)
   pm2 start ecosystem.config.cjs
   
   # Or using Wrangler directly
   npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
   ```

5. **Access Application**
   - Local: http://localhost:3000
   - Public (sandbox): Use `GetServiceUrl` tool

## ⚠️ Important Security Notes

### Ethical Boundaries
- **Lab Environment Only**: All techniques taught must be practiced in authorized lab environments
- **No Illegal Activity**: Platform strictly prohibits and discourages illegal hacking
- **Responsible Disclosure**: Vulnerabilities should be reported through proper channels
- **Educational Purpose**: All content is for educational and defensive security purposes

### Data Privacy
- **Activity Logging**: All user actions are logged for educational tracking
- **Anonymous Users**: Users can access most content without authentication
- **Data Retention**: Logs are retained for educational analytics only
- **No Data Selling**: User data is never sold or shared with third parties

### Admin Security
- **Change Default Password**: Update `ADMIN_PASSWORD` from default `Yethical`
- **Secure Environment Variables**: Store all secrets in Cloudflare Secrets, never in code
- **Session Management**: Admin sessions expire after 1 hour of inactivity
- **Access Logging**: All admin actions are logged for audit trails

## 🔧 Technical Implementation

### Frontend Architecture
- **Framework**: Pure JavaScript with Tailwind CSS
- **State Management**: Class-based architecture with localStorage persistence
- **UI Components**: Modular, responsive design with dark cybersecurity theme
- **Authentication**: Cookie-based sessions with JWT tokens
- **Real-time Features**: Dynamic content loading and language switching

### Backend Architecture  
- **Framework**: Hono (lightweight, fast web framework)
- **Runtime**: Cloudflare Workers (edge computing)
- **Authentication**: OAuth 2.0 (Google, Discord) with simplified JWT
- **API Design**: RESTful endpoints with JSON responses
- **Error Handling**: Comprehensive error responses with logging

### Database Integration
- **Primary**: Google Sheets API for activity logging
- **Local Storage**: Browser localStorage for user preferences
- **Future**: Firebase Firestore integration option
- **Caching**: Browser caching for static content and API responses

### AI Integration
- **Current**: Predefined response patterns matching Deke Shaw personality
- **Future**: OpenAI API integration for dynamic responses
- **Personality**: Analytical, calm, educational focus with ethical boundaries
- **Safety**: All responses include ethical use reminders and lab environment warnings

## 📈 Future Enhancements

### Not Yet Implemented
1. **Advanced AI Integration** - OpenAI API for dynamic responses
2. **Real-time Discord Widget** - Live community chat integration
3. **Progress Tracking** - User learning progress and achievements
4. **Interactive Labs** - Embedded practice environments
5. **Advanced Admin Features** - User management, content editing
6. **Mobile App** - React Native mobile application
7. **Multi-language Support** - Internationalization beyond casual/professional
8. **Gamification** - Points, badges, leaderboards for learning motivation

### Recommended Next Steps
1. **Setup OAuth Applications** - Configure Google and Discord developer accounts
2. **Create Google Sheets** - Set up activity logging spreadsheet with API access
3. **Deploy to Production** - Deploy to Cloudflare Pages with environment variables
4. **Test Authentication** - Verify OAuth flows work correctly
5. **Monitor User Activity** - Review logs and optimize user experience
6. **Expand Content** - Add more learning modules and resources
7. **Community Building** - Set up Discord server and integration
8. **Security Audit** - Review code for security vulnerabilities

## 📊 Analytics & Monitoring

### User Activity Tracking
- Page visits and navigation patterns
- AI assistant query patterns and topics
- Authentication method preferences
- Language toggle usage
- Time spent in different sections
- Resource access patterns

### Admin Dashboard Metrics
- Real-time user activity logs
- Popular learning topics and resources
- AI assistant query analytics
- Authentication success/failure rates
- Error rates and performance metrics

### Export & Analysis
- CSV export for detailed analysis
- Integration ready for Google Analytics
- Custom metrics dashboard in admin panel
- User behavior pattern analysis

---

## 🚨 Legal Disclaimer

**CYB Guide is strictly for educational purposes only.** This platform teaches cybersecurity concepts for defensive purposes and authorized testing only. Users are solely responsible for ensuring their activities comply with local laws and regulations. Unauthorized access to computer systems is illegal and strictly prohibited.

**Remember: Be like Deke Shaw - analytical, ethical, and always thinking about the bigger picture of digital security.**

---

*Last Updated: September 16, 2025*
*Project Status: ✅ Ready for Production Deployment*