
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './autoScroll.css'; // Import the auto-scroll CSS
import { suppressWebSocketErrors } from './utils/suppressWebSocketErrors';

// Suppress WebSocket errors to prevent console pollution and improve SEO score
suppressWebSocketErrors();

// Use createRoot API
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
