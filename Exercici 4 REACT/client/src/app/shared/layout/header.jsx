import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <div className="header">
            <div className="header-container">
                <header className="auth-header">
                    <h1>Chuck Norris Jokes</h1>
                    <div className="auth-controls">
                        {isAuthenticated ? (
                            <>
                                <span className="username">Hola, {user?.username}</span>
                                <button onClick={logout} className="btn btn-logout">
                                    Salir
                                </button>
                            </>
                        ) : null}
                    </div>
                </header>
            </div>
        </div>
    );
};

export default Header;
