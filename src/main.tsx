import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AdminApp from './admin/AdminApp'
import './index.css'

const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>,
)
