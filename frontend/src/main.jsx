import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Warmup serverless backend saat app load agar cold start tidak terjadi saat user klik
const API_URL = import.meta.env.VITE_API_URL || 'https://ipb-food-hub-api.vercel.app';
fetch(`${API_URL}/api/health`, { method: 'GET' }).catch(() => {});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
