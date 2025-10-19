import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Header from './components/Header';
import NewUserPage from './components/NewUserPage';
import ProfilesListPage from './components/ProfilesListPage';
import ProfileDetailPage from './components/ProfileDetailPage';
import PolicyPage from './components/PolicyPage';
import AdminPage from './components/AdminPage';
import AdminLoginPage from './components/AdminLoginPage';
import ApplicationsPage from './components/ApplicationsPage';
import CustomersPage from './components/CustomersPage';

function AppWrapper() {
  const location = useLocation();

  {/* Prevents downloading of images and videos */}
  useEffect(() => {
    const blockContextMenu = e => e.preventDefault();
    document.addEventListener('contextmenu', blockContextMenu);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
    };
  }, []);

  return (
    <>
      <Header pathname={location.pathname} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/newuser" element={<NewUserPage />} />
        <Route path="/profiles" element={<ProfilesListPage />} />
        <Route path="/profiles/:id" element={<ProfileDetailPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/applications" element={<ApplicationsPage />} />
        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </Router>
  );
}

export default App;
