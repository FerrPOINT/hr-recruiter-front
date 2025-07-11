import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initElevenLabsProxy } from './utils/elevenLabsProxy';

// Инициализируем ElevenLabs прокси при запуске приложения
if (process.env.NODE_ENV === 'development') {
  try {
    initElevenLabsProxy({
      backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080',
      originalElevenLabsUrl: 'https://api.elevenlabs.io'
    });
    console.log('✅ ElevenLabs proxy initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize ElevenLabs proxy:', error);
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 