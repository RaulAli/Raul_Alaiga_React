import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/AuthContext.jsx';
import './NewChatModal.css';

const NewChatModal = ({ show, onClose, onChatCreated }) => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [chatType, setChatType] = useState('private');
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!show) return;

        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/list', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Error al cargar usuarios.');
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchUsers();
    }, [show, token]);

    const handleUserSelect = (userId) => {
        if (chatType === 'private') {
            setSelectedUsers([userId]);
        } else {
            setSelectedUsers(prev =>
                prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (selectedUsers.length === 0) {
            setError('Debes seleccionar al menos un usuario.');
            return;
        }
        if (chatType === 'group' && !groupName.trim()) {
            setError('El chat grupal debe tener un nombre.');
            return;
        }

        const memberUsernames = users
            .filter(u => selectedUsers.includes(u._id))
            .map(u => u.username);

        try {
            const response = await fetch('http://localhost:5000/api/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: chatType === 'group' ? groupName : null,
                    type: chatType,
                    memberUsernames,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.msg || 'Error al crear el chat.');
            }

            const newChat = await response.json();
            onChatCreated(newChat);
            onClose();

        } catch (err) {
            setError(err.message);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Crear Nuevo Chat</h2>
                <button className="close-button" onClick={onClose}>X</button>

                <form onSubmit={handleSubmit}>
                    <div className="chat-type-selector">
                        <label>
                            <input type="radio" value="private" checked={chatType === 'private'} onChange={() => { setChatType('private'); setSelectedUsers([]); }} />
                            Privado
                        </label>
                        <label>
                            <input type="radio" value="group" checked={chatType === 'group'} onChange={() => setChatType('group')} />
                            Grupal
                        </label>
                    </div>

                    {chatType === 'group' && (
                        <input
                            type="text"
                            placeholder="Nombre del grupo"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="group-name-input"
                        />
                    )}

                    <div className="user-list">
                        {users.map(user => (
                            <div key={user._id} className="user-item">
                                <label>
                                    <input
                                        type={chatType === 'private' ? 'radio' : 'checkbox'}
                                        name="userselect"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => handleUserSelect(user._id)}
                                    />
                                    {user.username}
                                </label>
                            </div>
                        ))}
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="create-button">Crear Chat</button>
                </form>
            </div>
        </div>
    );
};

export default NewChatModal;
