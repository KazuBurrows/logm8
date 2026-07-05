import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './shared/components/Toast/ToastProvider';
import './index.css';
import './shared/styles/_fonts.scss'

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <ToastProvider>
    <App />
  </ToastProvider>
);
