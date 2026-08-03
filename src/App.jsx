import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import SystemControls from './pages/SystemControls';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="organizations" element={<div className="p-6">Organization Management Coming Soon</div>} />
          <Route path="system-controls" element={<SystemControls />} />
          <Route path="apps" element={<div className="p-6">OAuth Apps Coming Soon</div>} />
          <Route path="audit-logs" element={<div className="p-6">Security Logs Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
