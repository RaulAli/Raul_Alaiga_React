import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth/AuthPage';
import JokesPage from './pages/jokes/JokesPage';
import Login from './shared/Login';
import Register from './shared/Register';
import Header from './shared/layout/header';
import Footer from './shared/layout/footer';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <Header />
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/jokes" element={<JokesPage />} />
            <Route path="*" element={<Navigate to="/jokes" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<AuthPage />}>
              <Route index element={<Navigate to="/login" />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
