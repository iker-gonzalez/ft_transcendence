import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/fonts/Dogica.ttf';
import './assets/fonts/DogicaBold.ttf';
import './styles/normalize.css'; // Keep this first
import './styles/globals.css';
import './styles/typography.css';
import 'animate.css';
import './index.css'; // Keep this last
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(<App />);
