import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './shared/components/Toast/ToastProvider';
import { clearAllCached } from './shared/utils/sessionCache';
import './index.css';
import './shared/styles/_fonts.scss'

// index.tsx only re-executes on a full page load (initial visit or a hard
// reload), never on client-side route navigation. Clearing the cache here
// guarantees a reload always fetches fresh data, while in-app navigation
// keeps reusing the cache for the rest of the page's lifetime.
clearAllCached();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <ToastProvider>
    <App />
  </ToastProvider>
);
