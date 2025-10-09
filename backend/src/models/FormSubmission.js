import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema(
  {
    formConfigId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormConfig', required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // Dynamic data based on form config
    submittedAt: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

// Index for faster queries
formSubmissionSchema.index({ formConfigId: 1, createdAt: -1 });

export const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);
