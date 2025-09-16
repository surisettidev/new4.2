# CYB Guide - Production Deployment Instructions

## 🚀 Ready for Cloudflare Pages Deployment

The CYB Guide application is now fully built and ready for production deployment to Cloudflare Pages.

### ✅ Current Status
- **GitHub Repository**: https://github.com/surisettidev/new4.2 ✅ Pushed
- **Build Status**: ✅ Successfully built and tested
- **Development URL**: https://3000-inarlleudsr458nehklae-6532622b.e2b.dev
- **Project Name**: `cyb-guide` (stored in meta_info)

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] Project structure with Hono + TypeScript
- [x] Dark cybersecurity UI with Deke Shaw personality
- [x] Responsibility modal with ethical use policy
- [x] Google/Discord OAuth authentication setup
- [x] Language toggle (Casual ↔ Professional)
- [x] Learning guide with step-by-step roadmap
- [x] AI Assistant (DEKE-AI) with predefined responses
- [x] Events & competitions section
- [x] Announcements system
- [x] Community hub with Discord integration placeholder
- [x] Admin dashboard with password protection
- [x] Google Sheets logging integration ready
- [x] Terms & Privacy Policy pages
- [x] Comprehensive error handling and logging
- [x] Mobile-responsive design
- [x] Git repository initialized and pushed to GitHub

### ⏳ Required for Production
- [ ] Cloudflare API key configuration (via Deploy tab)
- [ ] Environment variables setup in Cloudflare Secrets
- [ ] OAuth application credentials (Google & Discord)
- [ ] Google Sheets API configuration (optional)

## 🔧 Cloudflare Pages Deployment

### Step 1: Configure Cloudflare API Key
1. Go to the **Deploy** tab in the sidebar
2. Follow instructions to create Cloudflare API token
3. Configure with these permissions:
   - Zone:Zone Settings:Read
   - Zone:Zone:Read
   - User:User Details:Read
   - Account:Cloudflare Pages:Edit

### Step 2: Deploy Application
Run these commands after API key setup:

```bash
# 1. Setup Cloudflare authentication
setup_cloudflare_api_key  # Use the tool

# 2. Verify authentication
npx wrangler whoami

# 3. Build project
cd /home/user/webapp
npm run build

# 4. Create Cloudflare Pages project
npx wrangler pages project create cyb-guide \
  --production-branch main \
  --compatibility-date 2025-09-16

# 5. Deploy to production  
npx wrangler pages deploy dist --project-name cyb-guide
```

### Step 3: Configure Environment Variables

Set these secrets in Cloudflare Pages:

```bash
# Admin password (change from default!)
npx wrangler pages secret put ADMIN_PASSWORD --project-name cyb-guide
# Enter: YourNewSecurePassword (not the default 'Yethical')

# Google OAuth (get from Google Developer Console)
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name cyb-guide
npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name cyb-guide

# Discord OAuth (get from Discord Developer Portal)  
npx wrangler pages secret put DISCORD_CLIENT_ID --project-name cyb-guide
npx wrangler pages secret put DISCORD_CLIENT_SECRET --project-name cyb-guide

# Google Sheets API (optional - for logging)
npx wrangler pages secret put GOOGLE_SHEETS_API_KEY --project-name cyb-guide
npx wrangler pages secret put GOOGLE_SHEET_ID --project-name cyb-guide

# JWT Secret (generate secure random string)
npx wrangler pages secret put JWT_SECRET --project-name cyb-guide
```

## 🔐 OAuth Application Setup

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `https://cyb-guide.pages.dev/auth/google/callback`
   - `http://localhost:3000/auth/google/callback` (for testing)

### Discord OAuth Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 → General
4. Set redirect URIs:
   - `https://cyb-guide.pages.dev/auth/discord/callback`
   - `http://localhost:3000/auth/discord/callback` (for testing)

## 📊 Google Sheets Integration (Optional)

### Setup Steps
1. Create new Google Sheet for activity logging
2. Go to Extensions → Apps Script
3. Replace code with contents from `logger.js` file
4. Deploy as web app with "Anyone" permissions
5. Get the web app URL and Sheet ID
6. Set GOOGLE_SHEET_ID and GOOGLE_SHEETS_API_KEY secrets

### Sheet Structure
The logging sheet will have these columns:
- Timestamp
- User Email  
- Action
- Extra Info

## 🎯 Expected Production URLs

After deployment, the application will be available at:
- **Primary**: `https://cyb-guide.pages.dev`
- **Branch**: `https://main.cyb-guide.pages.dev`

### Key Endpoints
- `/` - Main application with responsibility modal
- `/login` - OAuth authentication
- `/admin` - Admin dashboard (password: configurable)
- `/api/ai-assistant` - AI assistant API
- `/terms` - Terms & Conditions
- `/privacy` - Privacy Policy

## ⚠️ Security Checklist

### Before Going Live
- [ ] Change admin password from default `Yethical`
- [ ] Configure proper OAuth redirect URIs for production domain
- [ ] Set up strong JWT_SECRET (32+ character random string)
- [ ] Review and test all authentication flows
- [ ] Verify Google Sheets logging works (if enabled)
- [ ] Test responsibility modal and language toggle functionality
- [ ] Ensure all API endpoints respond correctly
- [ ] Verify Terms & Privacy Policy content is appropriate

### Post-Deployment
- [ ] Test application functionality on production URL
- [ ] Verify OAuth login flows work correctly
- [ ] Test admin dashboard access and logging
- [ ] Check AI assistant responses
- [ ] Validate mobile responsiveness
- [ ] Monitor error logs and user activity

## 🔍 Testing Checklist

### Core Functionality
- [ ] Responsibility modal appears and accepts user agreement
- [ ] Language toggle switches between Casual/Professional correctly
- [ ] Navigation between sections works smoothly
- [ ] AI assistant responds to queries with Deke Shaw personality
- [ ] Admin login works with configured password
- [ ] OAuth authentication flows complete successfully
- [ ] Activity logging captures user actions
- [ ] Terms and Privacy pages load correctly

### UI/UX
- [ ] Dark cybersecurity theme displays properly
- [ ] All icons and fonts load correctly
- [ ] Mobile responsiveness works on different screen sizes
- [ ] Animations and transitions are smooth
- [ ] Error messages display appropriately
- [ ] Loading states work correctly

## 📞 Support Information

### Default Credentials
- **Admin Email**: surisettidev@gmail.com  
- **Default Admin Password**: `Yethical` (⚠️ CHANGE THIS!)
- **Project Name**: `cyb-guide`

### Key Files
- `src/index.tsx` - Main application
- `src/routes/auth.tsx` - Authentication handlers
- `src/routes/api.tsx` - API endpoints  
- `src/routes/admin.tsx` - Admin dashboard
- `public/static/app.js` - Frontend JavaScript
- `public/static/style.css` - Custom styling
- `logger.js` - Google Sheets integration
- `README.md` - Comprehensive documentation

### Troubleshooting
- Check PM2 logs: `pm2 logs cyb-guide --nostream`
- Verify build: `npm run build`
- Test locally: `npx wrangler pages dev dist`
- Check wrangler status: `npx wrangler whoami`

---

**The CYB Guide is ready for deployment! 🛡️**

*Remember: This platform teaches ethical hacking for educational purposes only. All techniques should be practiced in authorized lab environments.*