import * as React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';

// Silence benign development errors from Vite HMR
if (typeof window !== 'undefined') {
  const isBenignError = (message: any) => {
    const msg = String(message);
    return msg.includes('WebSocket closed without opened') ||
           msg.includes('[vite] failed to connect to websocket') ||
           msg.includes('failed to connect to websocket') ||
           msg.includes('WebSocket connection to') ||
           msg.includes('[vite] connecting...') ||
           msg.includes('CONNECTED');
  };

  // Override console methods to silence benign errors
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  const originalInfo = console.info;

  console.error = (...args) => {
    if (args.some(arg => isBenignError(arg))) return;
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    if (args.some(arg => isBenignError(arg))) return;
    originalWarn.apply(console, args);
  };

  console.log = (...args) => {
    if (args.some(arg => isBenignError(arg))) return;
    originalLog.apply(console, args);
  };

  console.info = (...args) => {
    if (args.some(arg => isBenignError(arg))) return;
    originalInfo.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && isBenignError(event.reason.message)) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (isBenignError(event.message)) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <App />
);
