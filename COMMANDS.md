# Command Reference - Quick Commands

## 🚀 Installation

```bash
# Install backend dependencies
cd backend
npm install bcryptjs jsonwebtoken

# Install all dependencies (if needed)
npm install
```

## 👤 Admin User Management

```bash
# Create admin user with defaults (admin/admin123)
cd backend
npm run create-admin

# Create admin user with custom credentials
npm run create-admin myusername admin@email.com mypassword super_admin

# Or use node directly
node scripts/createAdminUser.js username email password role
```

## 🏃 Running the Application

```bash
# Start backend (development)
cd backend
npm run dev

# Start backend (production)
npm start

# Start frontend
cd frontend
npm run dev
```

## 📊 Database Scripts

```bash
# Import players from Excel
cd backend
npm run import-players

# Update phone numbers
node scripts/updatePhoneNumbers.js

# Create indexes
npm run create-indexes
```

## 🔧 Development Commands

```bash
# Backend with auto-reload
cd backend
npm run dev

# Frontend with hot reload
cd frontend
npm run dev

# Build frontend for production
cd frontend
npm run build
```

## 🌐 Access URLs

```bash
# Frontend (default)
http://localhost:5173

# Backend API (default)
http://localhost:4000

# Admin Login
http://localhost:5173/admin/login

# Form Builder
http://localhost:5173/admin/form-builder

# Registration Form
http://localhost:5173/register

# Teams View
http://localhost:5173/teams
```

## 🔐 Default Credentials

```
Username: admin
Password: admin123
Email: admin@auction.com
```

**⚠️ Change these immediately in production!**

## 📝 Common Tasks

### Create a New Admin
```bash
cd backend
npm run create-admin newadmin admin2@email.com securepass123 admin
```

### Check if Server is Running
```bash
curl http://localhost:4000/api/health
```

### View Backend Logs
```bash
cd backend
npm run dev
# Logs appear in terminal
```

### Test API Endpoints
```bash
# Get published form
curl http://localhost:4000/api/forms/published

# Health check
curl http://localhost:4000/api/health

# Login (returns JWT token)
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🗄️ MongoDB Commands

```bash
# Connect to MongoDB (if local)
mongosh

# Show databases
show dbs

# Use your database
use auction

# Show collections
show collections

# Find admin users
db.adminusers.find()

# Find forms
db.formconfigs.find()

# Find submissions
db.formsubmissions.find()
```

## 🧹 Cleanup Commands

```bash
# Clear node_modules and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## 🐛 Debugging

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check if ports are in use
lsof -i :4000  # Backend
lsof -i :5173  # Frontend

# Kill process on port
kill -9 $(lsof -t -i:4000)
```

## 📦 Package Management

```bash
# Update all packages
npm update

# Check for outdated packages
npm outdated

# Install specific version
npm install package@version
```

## 🔄 Git Commands (if using version control)

```bash
# Initial commit
git add .
git commit -m "Add form builder system"

# Create branch for features
git checkout -b feature/form-builder

# Push changes
git push origin main
```

## 🚨 Emergency Commands

```bash
# Stop all Node processes
pkill -f node

# Clear npm cache
npm cache clean --force

# Reset to clean state
rm -rf node_modules package-lock.json
npm install

# Check MongoDB connection
mongosh "your-connection-string"
```

## 📋 Quick Setup (Copy-Paste)

```bash
# Complete setup in one go
cd backend && \
npm install bcryptjs jsonwebtoken && \
npm run create-admin && \
npm run dev &

cd ../frontend && \
npm run dev
```

## 🎯 Testing Workflow

```bash
# 1. Start backend
cd backend && npm run dev

# 2. In new terminal, start frontend
cd frontend && npm run dev

# 3. In browser, go to:
# http://localhost:5173/admin/login

# 4. Login with admin/admin123

# 5. Create and publish a form

# 6. Test at:
# http://localhost:5173/register
```

## 💾 Backup Commands

```bash
# Export MongoDB data
mongodump --uri="your-connection-string" --out=./backup

# Import MongoDB data
mongorestore --uri="your-connection-string" ./backup

# Backup .env file
cp backend/.env backend/.env.backup
```

## 🔍 Logs & Monitoring

```bash
# View backend logs
cd backend
npm run dev | tee logs.txt

# View frontend logs
cd frontend
npm run dev | tee logs.txt

# Monitor API requests (if using curl)
curl -v http://localhost:4000/api/health
```

---

**Pro Tip**: Bookmark this file for quick reference! 📌
