import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import Login from './shared/Login';
import Register from './shared/Register';
import Home from './pages/home/HomePage';
import Header from './shared/layout/header';
import Footer from './shared/layout/footer';
import './App.css';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<AuthPage />}>
          <Route index element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="home" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
