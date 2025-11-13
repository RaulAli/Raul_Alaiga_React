import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Error al iniciar sesión.');
            }

            localStorage.setItem('token', data.token);
            console.log('Inicio de sesión exitoso. Token:', data.token);
            setTimeout(() => {
                navigate('/home');
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login-username">Usuario</label>
                    <input
                        type="text"
                        id="login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">Contraseña</label>
                    <input
                        type="password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn">Entrar</button>
            </form>
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default Login;
