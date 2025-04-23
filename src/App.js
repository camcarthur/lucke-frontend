import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import AuthPage from './pages/AuthPage';
import AdminPortal from './pages/adminPortal';
import BettingPortal from './pages/bettorPortal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          }
        />
        <Route
          path="/betting"
          element={
            <ProtectedRoute>
              <BettingPortal />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
