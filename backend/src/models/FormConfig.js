import mongoose from 'mongoose';

const formFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'email', 'tel', 'number', 'url', 'textarea', 'select', 'radio', 'checkbox', 'date']
  },
  required: { type: Boolean, default: false },
  placeholder: { type: String },
  description: { type: String },
  options: [{ value: String, label: String }], // For select, radio
  min: { type: Number }, // For number fields
  max: { type: Number }, // For number fields
  rows: { type: Number }, // For textarea
  order: { type: Number, default: 0 } // Field order
}, { _id: false });

const formConfigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    fields: [formFieldSchema],
    submitButton: {
      text: { type: String, default: 'Submit' },
      successMessage: { type: String, default: 'Form submitted successfully!' },
      errorMessage: { type: String, default: 'Submission failed. Please try again.' }
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
  },
  { timestamps: true }
);

export const FormConfig = mongoose.model('FormConfig', formConfigSchema);
