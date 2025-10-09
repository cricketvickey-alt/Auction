import React, { useState, useEffect } from 'react';

// Dynamic form configuration
const defaultFormConfig = {
  title: "Player Registration",
  description: "Register for the cricket auction",
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
      placeholder: "Enter your full name"
    },
    {
      name: "batch",
      label: "Batch",
      type: "number",
      required: true,
      min: 1,
      max: 31,
      placeholder: "Enter batch (1-31)"
    },
    {
      name: "house",
      label: "House",
      type: "select",
      required: true,
      options: [
        { value: "", label: "Select House" },
        { value: "Aravali", label: "Aravali" },
        { value: "Shivalik", label: "Shivalik" },
        { value: "Udaigiri", label: "Udaigiri" },
        { value: "Nilgiri", label: "Nilgiri" }
      ]
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      required: true,
      placeholder: "Enter phone number (registered with CricHeroes)"
    },
    {
      name: "strength",
      label: "Playing Strength",
      type: "select",
      required: true,
      options: [
        { value: "", label: "Select Strength" },
        { value: "Batsman", label: "Batsman" },
        { value: "BattingAllrounder", label: "Batting Allrounder" },
        { value: "Bowler", label: "Bowler" },
        { value: "Bowling allrounder", label: "Bowling Allrounder" },
        { value: "All rounder", label: "All Rounder" }
      ]
    },
    {
      name: "totalMatchPlayed",
      label: "Total Matches Played",
      type: "number",
      required: false,
      min: 0,
      placeholder: "Enter total matches played"
    },
    {
      name: "totalScore",
      label: "Total Runs Scored",
      type: "number",
      required: false,
      min: 0,
      placeholder: "Enter total runs scored"
    },
    {
      name: "totalWicket",
      label: "Total Wickets Taken",
      type: "number",
      required: false,
      min: 0,
      placeholder: "Enter total wickets taken"
    },
    {
      name: "photoUrl",
      label: "Photo URL",
      type: "url",
      required: false,
      placeholder: "Enter photo URL (optional)"
    }
  ],
  submitButton: {
    text: "Register",
    successMessage: "Registration successful!",
    errorMessage: "Registration failed. Please try again."
  }
};

export default function PlayerRegistration({ config, onSubmit }) {
  const [formConfig, setFormConfig] = useState(config || defaultFormConfig);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(!config);

  useEffect(() => {
    if (!config) {
      loadPublishedForm();
    }
  }, []);

  const loadPublishedForm = async () => {
    try {
      const response = await fetch('/api/forms/published');
      if (response.ok) {
        const data = await response.json();
        setFormConfig(data);
      }
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    formConfig.fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      // Type-specific validation
      if (formData[field.name]) {
        if (field.type === 'number') {
          const num = Number(formData[field.name]);
          if (field.min !== undefined && num < field.min) {
            newErrors[field.name] = `${field.label} must be at least ${field.min}`;
          }
          if (field.max !== undefined && num > field.max) {
            newErrors[field.name] = `${field.label} must be at most ${field.max}`;
          }
        }
        
        if (field.type === 'email' && formData[field.name]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData[field.name])) {
            newErrors[field.name] = 'Invalid email format';
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitStatus(null);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Submit to form config endpoint
        const response = await fetch(`/api/forms/${formConfig._id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: formData })
        });
        
        if (!response.ok) throw new Error('Registration failed');
      }
      
      setSubmitStatus('success');
      setFormData({});
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: (e) => handleChange(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      disabled: submitting
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps} style={inputStyle}>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea 
            {...commonProps} 
            rows={field.rows || 4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        );
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            {...commonProps}
            checked={formData[field.name] || false}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            style={{ width: 'auto', cursor: 'pointer' }}
          />
        );
      
      case 'radio':
        return (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {field.options?.map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={formData[field.name] === opt.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={submitting}
                  style={{ cursor: 'pointer' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type={field.type || 'text'}
            {...commonProps}
            min={field.min}
            max={field.max}
            style={inputStyle}
          />
        );
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={formCardStyle}>
          <p style={{ textAlign: 'center', color: '#9ca3af' }}>Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div style={containerStyle}>
        <div style={formCardStyle}>
          <p style={{ textAlign: 'center', color: '#f87171' }}>No registration form is currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={formCardStyle}>
        <h1 style={titleStyle}>{formConfig.title}</h1>
        {formConfig.description && (
          <p style={descriptionStyle}>{formConfig.description}</p>
        )}
        
        {submitStatus === 'success' && (
          <div style={successMessageStyle}>
            ✓ {formConfig.submitButton?.successMessage || 'Form submitted successfully!'}
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div style={errorMessageStyle}>
            ✗ {formConfig.submitButton?.errorMessage || 'Submission failed. Please try again.'}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={formStyle}>
          {formConfig.fields.map(field => (
            <div key={field.name} style={fieldGroupStyle}>
              <label htmlFor={field.name} style={labelStyle}>
                {field.label}
                {field.required && <span style={{ color: '#f87171' }}> *</span>}
              </label>
              
              {field.description && (
                <p style={fieldDescriptionStyle}>{field.description}</p>
              )}
              
              {renderField(field)}
              
              {errors[field.name] && (
                <span style={errorStyle}>{errors[field.name]}</span>
              )}
            </div>
          ))}
          
          <button 
            type="submit" 
            disabled={submitting}
            style={{
              ...buttonStyle,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : (formConfig.submitButton?.text || 'Submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  minHeight: '100vh',
  padding: '40px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start'
};

const formCardStyle = {
  maxWidth: 600,
  width: '100%',
  background: '#0f1728',
  border: '1px solid #1f2a44',
  borderRadius: 16,
  padding: 32
};

const titleStyle = {
  fontSize: 28,
  fontWeight: 800,
  marginBottom: 8,
  color: '#fff'
};

const descriptionStyle = {
  color: '#9ca3af',
  marginBottom: 24,
  fontSize: 14
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#e5e7eb'
};

const fieldDescriptionStyle = {
  fontSize: 12,
  color: '#9ca3af',
  marginTop: -2
};

const inputStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #2e4370',
  background: '#1a2942',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s'
};

const errorStyle = {
  color: '#f87171',
  fontSize: 12,
  marginTop: 2
};

const buttonStyle = {
  padding: '12px 24px',
  borderRadius: 8,
  border: 'none',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: 8,
  transition: 'transform 0.2s'
};

const successMessageStyle = {
  padding: 12,
  borderRadius: 8,
  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 16,
  textAlign: 'center'
};

const errorMessageStyle = {
  padding: 12,
  borderRadius: 8,
  background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 16,
  textAlign: 'center'
};
