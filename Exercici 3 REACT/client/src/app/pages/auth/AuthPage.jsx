import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <header className="auth-header">
                    <h1>Bienvenido al Chat Interno</h1>
                    <nav>
                        <NavLink
                            to="/login"
                            className={({ isActive }) => isActive ? 'auth-tab active' : 'auth-tab'}
                        >
                            Iniciar Sesión
                        </NavLink>
                        <NavLink
                            to="/register"
                            className={({ isActive }) => isActive ? 'auth-tab active' : 'auth-tab'}
                        >
                            Registro
                        </NavLink>
                    </nav>
                </header>
                <main className="auth-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AuthPage;
