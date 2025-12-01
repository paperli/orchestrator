/**
 * Figma Plugin UI Thread
 * Runs in an iframe with React, no access to Figma API
 */

console.log('[UI Script] Script loaded!');

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import './styles/globals.css';

console.log('[UI Script] Imports successful');

const root = document.getElementById('root');
console.log('[UI Script] Root element:', root);

if (root) {
  console.log('[UI Script] Creating React root');
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('[UI Script] React app rendered');
} else {
  console.error('[UI Script] No root element found!');
}
