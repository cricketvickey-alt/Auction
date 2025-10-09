import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'number', label: 'Number' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkbox' }
];

export default function FormBuilder() {
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: [],
    submitButton: {
      text: 'Submit',
      successMessage: 'Form submitted successfully!',
      errorMessage: 'Submission failed. Please try again.'
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadForms();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadForms = async () => {
    try {
      const response = await fetch('/api/forms', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const addField = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        {
          name: '',
          label: '',
          type: 'text',
          required: false,
          placeholder: '',
          description: '',
          options: [],
          order: formData.fields.length
        }
      ]
    });
  };

  const updateField = (index, key, value) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  const moveField = (index, direction) => {
    const newFields = [...formData.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFormData({ ...formData, fields: newFields });
  };

  const addOption = (fieldIndex) => {
    const newFields = [...formData.fields];
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options.push({ value: '', label: '' });
    setFormData({ ...formData, fields: newFields });
  };

  const updateOption = (fieldIndex, optionIndex, key, value) => {
    const newFields = [...formData.fields];
    newFields[fieldIndex].options[optionIndex][key] = value;
    setFormData({ ...formData, fields: newFields });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const newFields = [...formData.fields];
    newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, fields: newFields });
  };

  const saveForm = async () => {
    try {
      const url = editing ? `/api/forms/${currentForm._id}` : '/api/forms';
      const method = editing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Form saved successfully!');
        loadForms();
        resetForm();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form');
    }
  };

  const publishForm = async (formId, isPublished) => {
    try {
      const response = await fetch(`/api/forms/${formId}/publish`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isPublished })
      });

      if (response.ok) {
        alert(isPublished ? 'Form published!' : 'Form unpublished!');
        loadForms();
      }
    } catch (error) {
      console.error('Error publishing form:', error);
    }
  };

  const deleteForm = async (formId) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Form deleted!');
        loadForms();
      }
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const editForm = (form) => {
    setFormData(form);
    setCurrentForm(form);
    setEditing(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fields: [],
      submitButton: {
        text: 'Submit',
        successMessage: 'Form submitted successfully!',
        errorMessage: 'Submission failed. Please try again.'
      }
    });
    setCurrentForm(null);
    setEditing(false);
  };

  const viewSubmissions = (formId) => {
    navigate(`/admin/submissions/${formId}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>📝 Form Builder</h1>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Form Editor */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            {editing ? 'Edit Form' : 'Create New Form'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Form Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Player Registration"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Form description..."
                rows={2}
                style={inputStyle}
              />
            </div>

            <div style={{ borderTop: '1px solid #2e4370', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Form Fields</h3>
                <button onClick={addField} style={addButtonStyle}>
                  + Add Field
                </button>
              </div>

              {formData.fields.map((field, index) => (
                <div key={index} style={fieldCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Field {index + 1}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => moveField(index, 'up')} disabled={index === 0} style={iconButtonStyle}>↑</button>
                      <button onClick={() => moveField(index, 'down')} disabled={index === formData.fields.length - 1} style={iconButtonStyle}>↓</button>
                      <button onClick={() => removeField(index)} style={deleteButtonStyle}>×</button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={smallLabelStyle}>Field Name</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(index, 'name', e.target.value)}
                        placeholder="e.g., firstName"
                        style={smallInputStyle}
                      />
                    </div>
                    <div>
                      <label style={smallLabelStyle}>Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                        placeholder="e.g., First Name"
                        style={smallInputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                    <div>
                      <label style={smallLabelStyle}>Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, 'type', e.target.value)}
                        style={smallInputStyle}
                      >
                        {FIELD_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(index, 'required', e.target.checked)}
                        />
                        Required
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <label style={smallLabelStyle}>Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                      placeholder="Placeholder text..."
                      style={smallInputStyle}
                    />
                  </div>

                  {(field.type === 'select' || field.type === 'radio') && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <label style={smallLabelStyle}>Options</label>
                        <button onClick={() => addOption(index)} style={smallAddButtonStyle}>+ Option</button>
                      </div>
                      {field.options?.map((option, optIndex) => (
                        <div key={optIndex} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) => updateOption(index, optIndex, 'value', e.target.value)}
                            placeholder="Value"
                            style={{ ...smallInputStyle, flex: 1 }}
                          />
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => updateOption(index, optIndex, 'label', e.target.value)}
                            placeholder="Label"
                            style={{ ...smallInputStyle, flex: 1 }}
                          />
                          <button onClick={() => removeOption(index, optIndex)} style={deleteButtonStyle}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={saveForm} style={saveButtonStyle}>
                {editing ? 'Update Form' : 'Save Form'}
              </button>
              {editing && (
                <button onClick={resetForm} style={cancelButtonStyle}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Saved Forms</h2>
          
          {forms.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>No forms created yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {forms.map(form => (
                <div key={form._id} style={formItemStyle}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{form.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {form.fields.length} fields • {form.isPublished ? '✅ Published' : '⚪ Draft'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => editForm(form)} style={actionButtonStyle}>Edit</button>
                    <button 
                      onClick={() => publishForm(form._id, !form.isPublished)} 
                      style={form.isPublished ? unpublishButtonStyle : publishButtonStyle}
                    >
                      {form.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => viewSubmissions(form._id)} style={actionButtonStyle}>
                      Submissions
                    </button>
                    <button onClick={() => deleteForm(form._id)} style={deleteButtonStyle}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const cardStyle = {
  background: '#0f1728',
  border: '1px solid #1f2a44',
  borderRadius: 12,
  padding: 20,
  maxHeight: 'calc(100vh - 120px)',
  overflowY: 'auto'
};

const labelStyle = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
  color: '#e5e7eb'
};

const smallLabelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  color: '#9ca3af'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #2e4370',
  background: '#1a2942',
  color: '#fff',
  fontSize: 14
};

const smallInputStyle = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: 4,
  border: '1px solid #2e4370',
  background: '#1a2942',
  color: '#fff',
  fontSize: 12
};

const fieldCardStyle = {
  background: '#1a2942',
  border: '1px solid #2e4370',
  borderRadius: 8,
  padding: 12,
  marginBottom: 12
};

const addButtonStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  border: 'none',
  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  color: '#fff',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer'
};

const smallAddButtonStyle = {
  padding: '4px 8px',
  borderRadius: 4,
  border: 'none',
  background: '#2e4370',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer'
};

const saveButtonStyle = {
  flex: 1,
  padding: '10px 20px',
  borderRadius: 6,
  border: 'none',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer'
};

const cancelButtonStyle = {
  flex: 1,
  padding: '10px 20px',
  borderRadius: 6,
  border: '1px solid #2e4370',
  background: 'transparent',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer'
};

const iconButtonStyle = {
  padding: '2px 8px',
  borderRadius: 4,
  border: 'none',
  background: '#2e4370',
  color: '#fff',
  fontSize: 12,
  cursor: 'pointer'
};

const deleteButtonStyle = {
  padding: '2px 8px',
  borderRadius: 4,
  border: 'none',
  background: '#f87171',
  color: '#fff',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer'
};

const formItemStyle = {
  background: '#1a2942',
  border: '1px solid #2e4370',
  borderRadius: 8,
  padding: 12,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const actionButtonStyle = {
  padding: '6px 12px',
  borderRadius: 4,
  border: 'none',
  background: '#2e4370',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer'
};

const publishButtonStyle = {
  padding: '6px 12px',
  borderRadius: 4,
  border: 'none',
  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer'
};

const unpublishButtonStyle = {
  padding: '6px 12px',
  borderRadius: 4,
  border: 'none',
  background: '#6b7280',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer'
};

const logoutButtonStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  border: '1px solid #2e4370',
  background: 'transparent',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer'
};
