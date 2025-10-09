import express from 'express';
import { FormConfig } from '../models/FormConfig.js';
import { FormSubmission } from '../models/FormSubmission.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all form configs (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const forms = await FormConfig.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get published form config (public)
router.get('/published', async (req, res) => {
  try {
    const form = await FormConfig.findOne({ isPublished: true }).sort({ publishedAt: -1 });
    if (!form) {
      return res.status(404).json({ error: 'No published form found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Error fetching published form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Get single form config
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const form = await FormConfig.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Create form config
router.post('/', authenticateToken, async (req, res) => {
  try {
    const formData = {
      ...req.body,
      createdBy: req.user.userId
    };
    const form = await FormConfig.create(formData);
    res.status(201).json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Update form config
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const form = await FormConfig.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Publish/unpublish form
router.patch('/:id/publish', authenticateToken, async (req, res) => {
  try {
    const { isPublished } = req.body;
    
    // If publishing, unpublish all other forms first
    if (isPublished) {
      await FormConfig.updateMany({}, { isPublished: false });
    }
    
    const form = await FormConfig.findByIdAndUpdate(
      req.params.id,
      { 
        isPublished,
        publishedAt: isPublished ? new Date() : null
      },
      { new: true }
    );
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Error publishing form:', error);
    res.status(500).json({ error: 'Failed to publish form' });
  }
});

// Delete form config
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const form = await FormConfig.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Submit form (public)
router.post('/:id/submit', async (req, res) => {
  try {
    const form = await FormConfig.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    if (!form.isPublished) {
      return res.status(403).json({ error: 'Form is not published' });
    }
    
    const submission = await FormSubmission.create({
      formConfigId: req.params.id,
      data: req.body.data,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({ 
      message: 'Form submitted successfully',
      submissionId: submission._id
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Get submissions for a form (admin only)
router.get('/:id/submissions', authenticateToken, async (req, res) => {
  try {
    const submissions = await FormSubmission.find({ formConfigId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;
