import React from 'react';
import {  Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Admin from './Pages/Admin';
import AdminLogin from './Pages/AdminLogin';
import ResetPassword from './Pages/ResetPassword';

function App() {
  return (

      <Routes> 
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        <Route path="/user/:userId/dashboard" element={<Dashboard />} />
        <Route path="/admin/:adminId/dashboard" element={<Admin />} />
      </Routes>
 
  );
}

export default App;
