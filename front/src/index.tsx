import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/typography.css';
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
