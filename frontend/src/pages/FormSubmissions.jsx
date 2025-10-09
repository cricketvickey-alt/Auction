import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function FormSubmissions() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadData();
  }, [formId]);

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

  const loadData = async () => {
    try {
      // Load form config
      const formResponse = await fetch(`/api/forms/${formId}`, {
        headers: getAuthHeaders()
      });
      if (formResponse.ok) {
        const formData = await formResponse.json();
        setForm(formData);
      }

      // Load submissions
      const submissionsResponse = await fetch(`/api/forms/${formId}/submissions`, {
        headers: getAuthHeaders()
      });
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!form || submissions.length === 0) return;

    // Get all field names
    const fieldNames = form.fields.map(f => f.name);
    const headers = ['Submission ID', 'Submitted At', ...form.fields.map(f => f.label)];

    // Create CSV rows
    const rows = submissions.map(sub => {
      const row = [
        sub._id,
        new Date(sub.submittedAt).toLocaleString(),
        ...fieldNames.map(name => sub.data[name] || '')
      ];
      return row.map(cell => `"${cell}"`).join(',');
    });

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, '_')}_submissions.csv`;
    a.click();
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!form) {
    return <div style={{ padding: 20 }}>Form not found</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <button onClick={() => navigate('/admin/form-builder')} style={backButtonStyle}>
            ← Back to Form Builder
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>{form.title} - Submissions</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            Total submissions: {submissions.length}
          </p>
        </div>
        <button onClick={exportToCSV} disabled={submissions.length === 0} style={exportButtonStyle}>
          📥 Export to CSV
        </button>
      </div>

      {submissions.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>
            No submissions yet
          </p>
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2e4370' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Submitted At</th>
                  {form.fields.map(field => (
                    <th key={field.name} style={thStyle}>{field.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr key={submission._id} style={{ borderBottom: '1px solid #1f2a44' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    {form.fields.map(field => (
                      <td key={field.name} style={tdStyle}>
                        {formatValue(submission.data[field.name], field.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function formatValue(value, type) {
  if (value === null || value === undefined || value === '') return '-';
  if (type === 'checkbox') return value ? '✓' : '✗';
  if (type === 'date') return new Date(value).toLocaleDateString();
  return String(value);
}

const cardStyle = {
  background: '#0f1728',
  border: '1px solid #1f2a44',
  borderRadius: 12,
  padding: 20
};

const backButtonStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  border: '1px solid #2e4370',
  background: 'transparent',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer'
};

const exportButtonStyle = {
  padding: '10px 20px',
  borderRadius: 6,
  border: 'none',
  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer'
};

const thStyle = {
  padding: 12,
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 700,
  color: '#9ca3af',
  textTransform: 'uppercase'
};

const tdStyle = {
  padding: 12,
  fontSize: 14,
  color: '#e5e7eb'
};
