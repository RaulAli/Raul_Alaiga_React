import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './AuthPage.css';

const HomePage = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsersAndDecodeToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No estás autenticado.');
                return;
            }

            try {
                const decoded = jwtDecode(token);
                setCurrentUser(decoded.user.username);

                const response = await fetch('http://localhost:5000/api/auth/list', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Error al obtener los usuarios.');
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUsersAndDecodeToken();
    }, []);

    const handleUserClick = async (username) => {
        setSelectedUser(username);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No estás autenticado.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/message/conversation/${username}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al obtener los mensajes.');
            const data = await response.json();
            setMessages(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSendMessage = async () => {

        if (!newMessage.trim()) return;
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No estás autenticado.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/message/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    senderUsername: currentUser,
                    receiverUsername: selectedUser,
                    body: newMessage
                })
            });

            if (!response.ok) throw new Error('Error al enviar el mensaje.');
            const sentMessage = await response.json();

            setNewMessage('');
            setMessages(prev => [...prev, sentMessage]);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="home-page">
            <div className="home-container">
                <header className="home-header">
                    <h1>Listado de usuarios</h1>
                    {currentUser && <p>Bienvenido, {currentUser}!</p>}
                </header>
                <main>
                    {error && <p className="error-message">{error}</p>}
                    <ul>
                        {users.map(user => (
                            <li
                                key={user._id}
                                onClick={() => handleUserClick(user.username)}
                                style={{ cursor: 'pointer' }}
                            >
                                {user.username}
                            </li>
                        ))}
                    </ul>

                    <ul>
                        {messages.map(message => {
                            const hora = message.date.slice(11, 19);
                            return (
                                <li key={message._id}>
                                    {message.body} {hora}
                                </li>
                            );
                        })}
                    </ul>

                    {selectedUser && (
                        <div style={{ marginTop: '20px' }}>
                            <h3>Enviar mensaje a {selectedUser}</h3>
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe tu mensaje..."
                                rows="3"
                                style={{ width: '100%', resize: 'none' }}
                            />
                            <button onClick={handleSendMessage}>Enviar</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default HomePage;
