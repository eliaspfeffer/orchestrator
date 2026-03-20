import React, { useState, useEffect } from 'react';
import MindmapCanvas from './components/MindmapCanvas';
import LoginPage from './components/LoginPage';
import './App.css';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp: number };
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const App: React.FC = () => {
  const [authed, setAuthed] = useState<boolean>(() => {
    const token = localStorage.getItem('auth_token');
    return token ? isTokenValid(token) : false;
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token || !isTokenValid(token)) {
      setAuthed(false);
    }
  }, []);

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="app">
      <MindmapCanvas />
    </div>
  );
};

export default App;
