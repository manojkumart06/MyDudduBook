import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/fonts.css';
import App from './app/App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root element in index.html');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
