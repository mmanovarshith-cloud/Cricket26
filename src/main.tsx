
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/index.css';

/**
 * WORLD CRICKET ZENITH
 * Main Application Entry Point
 *
 * Initializes React and mounts the game interface.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'World Cricket Zenith: Root application element not found.'
  );
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
