import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import Login from './shared/Login';
import Register from './shared/Register';
import Home from './pages/home/HomePage';
import Header from './shared/layout/header';
import Footer from './shared/layout/footer';
import './App.css';
import { useAuth } from './shared/AuthContext'; // Import useAuth

function App() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <Header />
      {isAuthenticated ? (
        <>

          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/" element={<AuthPage />}>
            <Route index element={<Navigate to="/login" />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
      <Footer />
    </div>
  );
}

export default App;
