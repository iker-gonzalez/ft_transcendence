import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/normalize.css'; // Keep this first
import './styles/globals.css';
import './styles/typography.css';
import 'animate.css';
import './index.css'; // Keep this last
import App from './App';
import { StrictMode } from 'react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
