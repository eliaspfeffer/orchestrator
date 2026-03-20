import React, { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface Props {
  onLogin: () => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json() as { token: string };
        localStorage.setItem('auth_token', data.token);
        onLogin();
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch {
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #3c3c3c',
          borderRadius: '12px',
          padding: '40px 48px',
          width: '360px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#0e4c6e',
              border: '2px solid #1a7fb5',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '22px',
            }}
          >
            ⬡
          </div>
          <h1
            style={{
              color: '#d4d4d4',
              fontSize: '24px',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Orchestrator
          </h1>
          <p
            style={{
              color: '#666',
              fontSize: '13px',
              marginTop: '6px',
              marginBottom: 0,
            }}
          >
            Enter password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#2d2d2d',
                border: '1px solid #3c3c3c',
                borderRadius: '6px',
                color: '#d4d4d4',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#569cd6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#3c3c3c';
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#2d1a1a',
                border: '1px solid #5c2d2d',
                borderRadius: '6px',
                color: '#f44747',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: loading || !password ? '#1a3d52' : '#0e4c6e',
              color: loading || !password ? '#4a7a9b' : '#9cdcfe',
              border: '1px solid #1a7fb5',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!loading && password) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1a6a96';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && password) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#0e4c6e';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
