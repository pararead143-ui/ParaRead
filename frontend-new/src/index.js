import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MaterialProvider } from './context/MaterialContext'; // import your context provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MaterialProvider>
      <App />
    </MaterialProvider>
  </React.StrictMode>
);

reportWebVitals();
