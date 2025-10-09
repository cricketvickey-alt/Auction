# Form Builder System - Complete Guide

## Overview
A complete dynamic form builder system with admin authentication that allows admins to create, configure, and publish registration forms without writing code.

## Features

### ✅ Admin Authentication
- Secure login system with JWT tokens
- Password hashing with bcryptjs
- Role-based access (admin, super_admin)

### ✅ Form Builder
- Drag-and-drop field ordering
- Support for 10+ field types:
  - Text, Email, Phone, Number, URL, Date
  - Textarea, Dropdown, Radio, Checkbox
- Field validation (required, min/max)
- Custom placeholders and descriptions
- Dynamic options for select/radio fields

### ✅ Form Management
- Create multiple forms
- Edit existing forms
- Publish/unpublish forms (only one published at a time)
- Delete forms

### ✅ Submissions
- View all form submissions
- Export to CSV
- Track submission metadata (IP, timestamp, user agent)

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### 2. Create First Admin User

```bash
cd backend
node scripts/createAdminUser.js [username] [email] [password] [role]
```

Example:
```bash
node scripts/createAdminUser.js admin admin@auction.com admin123 super_admin
```

Default values if not provided:
- Username: `admin`
- Email: `admin@auction.com`
- Password: `admin123`
- Role: `super_admin`

### 3. Environment Variables

Add to your `.env` file:
```
JWT_SECRET=your-secret-key-change-in-production
```

### 4. Start the Application

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Usage Guide

### For Admins

#### 1. Login
1. Navigate to `/admin/login`
2. Enter your credentials
3. You'll be redirected to the form builder

#### 2. Create a Form
1. Go to `/admin/form-builder`
2. Enter form title and description
3. Click "Add Field" to add form fields
4. Configure each field:
   - Field name (e.g., `firstName`)
   - Label (e.g., "First Name")
   - Type (text, email, etc.)
   - Required checkbox
   - Placeholder text
   - For select/radio: Add options
5. Reorder fields using ↑↓ buttons
6. Click "Save Form"

#### 3. Publish a Form
1. Find your form in the "Saved Forms" list
2. Click "Publish"
3. Only one form can be published at a time
4. The published form will appear at `/register`

#### 4. View Submissions
1. Click "Submissions" on any form
2. View all submitted data in a table
3. Click "Export to CSV" to download

### For Users

#### Register
1. Navigate to `/register`
2. Fill out the published registration form
3. Submit
4. Success message will appear

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Create admin user
- `GET /api/auth/verify` - Verify token

### Form Configuration
- `GET /api/forms` - List all forms (admin)
- `GET /api/forms/published` - Get published form (public)
- `GET /api/forms/:id` - Get form by ID (admin)
- `POST /api/forms` - Create form (admin)
- `PUT /api/forms/:id` - Update form (admin)
- `PATCH /api/forms/:id/publish` - Publish/unpublish (admin)
- `DELETE /api/forms/:id` - Delete form (admin)

### Submissions
- `POST /api/forms/:id/submit` - Submit form (public)
- `GET /api/forms/:id/submissions` - Get submissions (admin)

## Database Models

### AdminUser
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (admin | super_admin),
  isActive: Boolean
}
```

### FormConfig
```javascript
{
  title: String,
  description: String,
  fields: [{
    name: String,
    label: String,
    type: String,
    required: Boolean,
    placeholder: String,
    description: String,
    options: [{ value, label }],
    min: Number,
    max: Number,
    order: Number
  }],
  submitButton: {
    text: String,
    successMessage: String,
    errorMessage: String
  },
  isPublished: Boolean,
  publishedAt: Date,
  createdBy: ObjectId
}
```

### FormSubmission
```javascript
{
  formConfigId: ObjectId,
  data: Mixed (dynamic based on form),
  submittedAt: Date,
  ipAddress: String,
  userAgent: String
}
```

## Field Types Reference

| Type | Description | Additional Props |
|------|-------------|------------------|
| text | Single line text | placeholder |
| email | Email with validation | placeholder |
| tel | Phone number | placeholder |
| number | Numeric input | min, max |
| url | URL with validation | placeholder |
| date | Date picker | - |
| textarea | Multi-line text | rows, placeholder |
| select | Dropdown menu | options[] |
| radio | Radio buttons | options[] |
| checkbox | Single checkbox | - |

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Protected admin routes
- ✅ Token expiration (7 days)
- ✅ Role-based access control

## Tips & Best Practices

1. **Field Names**: Use camelCase without spaces (e.g., `firstName`, `phoneNumber`)
2. **Required Fields**: Mark essential fields as required
3. **Validation**: Use appropriate field types for automatic validation
4. **Testing**: Test your form before publishing
5. **Backups**: Export submissions regularly
6. **Security**: Change default admin password immediately

## Troubleshooting

### Can't login?
- Check if admin user exists in database
- Verify JWT_SECRET is set in .env
- Check browser console for errors

### Form not showing at /register?
- Ensure form is published
- Only one form can be published at a time
- Check browser network tab for API errors

### Submissions not saving?
- Check form is published
- Verify all required fields are filled
- Check backend logs for errors

## Future Enhancements

- [ ] File upload support
- [ ] Conditional field visibility
- [ ] Email notifications on submission
- [ ] Form templates
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Duplicate detection
- [ ] Bulk import/export

## Support

For issues or questions, check:
1. Browser console for frontend errors
2. Backend logs for API errors
3. Database connection status
4. JWT token validity
