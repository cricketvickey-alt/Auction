# Quick Start Guide - Form Builder System

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### Step 2: Create Admin User
```bash
npm run create-admin admin admin@auction.com admin123 super_admin
```

This creates:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@auction.com

### Step 3: Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 4: Login as Admin
1. Open browser to `http://localhost:5173/admin/login`
2. Login with:
   - Username: `admin`
   - Password: `admin123`

### Step 5: Create Your First Form
1. You'll be redirected to the Form Builder
2. Click "Add Field" to add fields
3. Configure each field (name, label, type, required)
4. Click "Save Form"
5. Click "Publish" to make it live

### Step 6: Test the Form
1. Navigate to `http://localhost:5173/register`
2. Fill out your form
3. Submit
4. View submissions in Form Builder → Submissions

## 📋 Example Form Configuration

Here's a sample player registration form:

**Form Title**: Player Registration  
**Description**: Register for the cricket auction

**Fields**:
1. **Name**
   - Type: text
   - Required: ✓
   - Placeholder: "Enter your full name"

2. **Email**
   - Type: email
   - Required: ✓
   - Placeholder: "your@email.com"

3. **Phone**
   - Type: tel
   - Required: ✓
   - Placeholder: "Enter phone number"

4. **Batch**
   - Type: number
   - Required: ✓
   - Min: 1, Max: 31

5. **House**
   - Type: select
   - Required: ✓
   - Options:
     - Aravali
     - Shivalik
     - Udaigiri
     - Nilgiri

6. **Playing Strength**
   - Type: select
   - Required: ✓
   - Options:
     - Batsman
     - Bowler
     - All Rounder

## 🎯 Common Use Cases

### Registration Form
Perfect for player/participant registration with custom fields

### Contact Form
Create contact forms with name, email, message fields

### Survey Form
Build surveys with radio buttons and checkboxes

### Feedback Form
Collect feedback with ratings and text areas

## 🔑 Key Features

✅ **No Code Required** - Build forms visually  
✅ **10+ Field Types** - Text, email, select, radio, etc.  
✅ **Validation** - Required fields, min/max values  
✅ **CSV Export** - Download all submissions  
✅ **Secure** - Admin authentication required  
✅ **Responsive** - Works on all devices  

## 📱 Navigation

- `/register` - Public registration form
- `/admin/login` - Admin login
- `/admin/form-builder` - Create/edit forms
- `/admin/submissions/:id` - View submissions

## 🛠️ Customization

### Change Submit Button Text
In form builder, scroll to bottom and edit:
- Button text
- Success message
- Error message

### Reorder Fields
Use ↑↓ buttons next to each field

### Add Options to Dropdown
For select/radio fields, click "+ Option" and add value/label pairs

## 💡 Pro Tips

1. **Test Before Publishing**: Create and test your form before publishing
2. **One Published Form**: Only one form can be published at a time
3. **Export Regularly**: Download submissions as CSV for backup
4. **Field Names**: Use camelCase (firstName, not "First Name")
5. **Required Fields**: Mark important fields as required

## 🆘 Need Help?

Check the full guide: `FORM_BUILDER_GUIDE.md`

## 🔒 Security Note

**⚠️ IMPORTANT**: Change the default admin password immediately after first login!

1. Create a new admin user with a strong password
2. Delete or disable the default admin account
3. Set a strong JWT_SECRET in your .env file

---

**Ready to build your first form? Let's go! 🚀**
