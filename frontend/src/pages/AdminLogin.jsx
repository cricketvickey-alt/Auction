import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user info
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      // Redirect to form builder
      navigate('/admin/form-builder');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🏏 Admin Login</h1>
        <p style={subtitleStyle}>Access the form builder and admin panel</p>

        {error && (
          <div style={errorBoxStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={inputStyle}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20
};

const cardStyle = {
  maxWidth: 400,
  width: '100%',
  background: '#0f1728',
  border: '1px solid #1f2a44',
  borderRadius: 16,
  padding: 40
};

const titleStyle = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 8,
  textAlign: 'center'
};

const subtitleStyle = {
  color: '#9ca3af',
  textAlign: 'center',
  marginBottom: 32,
  fontSize: 14
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: '#e5e7eb'
};

const inputStyle = {
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid #2e4370',
  background: '#1a2942',
  color: '#fff',
  fontSize: 14,
  outline: 'none'
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
  marginTop: 8
};

const errorBoxStyle = {
  padding: 12,
  borderRadius: 8,
  background: 'rgba(248, 113, 113, 0.1)',
  border: '1px solid #f87171',
  color: '#f87171',
  fontSize: 14,
  marginBottom: 20
};
