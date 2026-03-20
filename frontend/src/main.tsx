import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has <div id="root">');
}

// StrictMode intentionally disabled: it double-invokes useEffect in dev,
// which causes xterm.js to mount twice on the same DOM node, breaking
// mouse state tracking (manifests as everything turning blue on hover).
ReactDOM.createRoot(rootElement).render(
  <App />
);
