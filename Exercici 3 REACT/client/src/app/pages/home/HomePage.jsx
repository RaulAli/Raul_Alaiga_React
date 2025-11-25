import React, { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { useAuth } from '../../shared/AuthContext';
import NewChatModal from '../chat/NewChatModal';
import './HomePage.css';

// Reducer for managing messages state
const messagesReducer = (state, action) => {
    switch (action.type) {
        case 'SET_MESSAGES':
            return {
                messages: action.payload.messages,
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
            };
        case 'LOAD_MORE_MESSAGES':
            return {
                ...state,
                messages: [...action.payload.messages, ...state.messages],
                currentPage: action.payload.currentPage,
            };
        case 'ADD_MESSAGE':
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };
        case 'RESET':
            return { messages: [], currentPage: 1, totalPages: 1 };
        default:
            return state;
    }
};

const HomePage = () => {
    const { user, token, logout, socket } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});

    const [messagesState, dispatch] = useReducer(messagesReducer, {
        messages: [],
        currentPage: 1,
        totalPages: 1,
    });

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesState.messages]);

    const fetchConversations = useCallback(async () => {
        if (!token) return;
        try {
            setError('');
            const response = await fetch('http://localhost:5000/api/conversations', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Error al cargar las conversaciones.');
            const data = await response.json();
            setConversations(data);
        } catch (err) {
            setError(err.message);
        }
    }, [token]);

    const fetchUnreadCounts = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:5000/api/messages/unread-counts', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Error al cargar contadores de no leídos.');
            const data = await response.json();
            const countsMap = data.reduce((acc, item) => {
                acc[item.conversationId] = item.unread;
                return acc;
            }, {});
            setUnreadCounts(countsMap);
        } catch (err) {
            console.error(err.message);
        }
    }, [token]);

    const markMessagesAsRead = useCallback(async (messagesToMark) => {
        if (!token || !user) return;
        const unreadMessageIds = messagesToMark
            .filter(msg => !msg.readBy.includes(user.id))
            .map(msg => msg._id);

        if (unreadMessageIds.length === 0) return;

        try {
            for (const messageId of unreadMessageIds) {
                await fetch('http://localhost:5000/api/messages/read', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ messageId }),
                });
            }
            fetchUnreadCounts();
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    }, [token, user, fetchUnreadCounts]);

    useEffect(() => {
        fetchConversations();
        fetchUnreadCounts();
    }, [fetchConversations, fetchUnreadCounts]);

    useEffect(() => { //Primeros 20 mensajes
        const fetchInitialMessages = async () => {
            if (!token || !selectedConversation) {
                dispatch({ type: 'RESET' });
                return;
            }
            try {
                setError('');
                const response = await fetch(`http://localhost:5000/api/messages/${selectedConversation._id}?page=1&limit=20`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Error al cargar los mensajes.');
                const data = await response.json();
                dispatch({ type: 'SET_MESSAGES', payload: data });
                markMessagesAsRead(data.messages);
                fetchUnreadCounts();
            } catch (err) {
                setError(err.message);
            }
        };
        fetchInitialMessages();
    }, [selectedConversation, token, fetchUnreadCounts, markMessagesAsRead]);

    const handleLoadMoreMessages = async () => {
        if (messagesState.currentPage >= messagesState.totalPages) return;

        const nextPage = messagesState.currentPage + 1;
        try {
            const response = await fetch(`http://localhost:5000/api/messages/${selectedConversation._id}?page=${nextPage}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Error al cargar más mensajes.');
            const data = await response.json();
            dispatch({ type: 'LOAD_MORE_MESSAGES', payload: data });
            markMessagesAsRead(data.messages);
        } catch (err) {
            setError(err.message);
        }
    };


    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (incomingMessage) => {
            if (incomingMessage.conversation === selectedConversation?._id) {
                dispatch({ type: 'ADD_MESSAGE', payload: incomingMessage });
                markMessagesAsRead([incomingMessage]);
            }
            fetchUnreadCounts();
        };

        const handleNewConversation = () => {
            fetchConversations();
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('newConversation', handleNewConversation);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('newConversation', handleNewConversation);
        };
    }, [socket, selectedConversation, fetchConversations, fetchUnreadCounts, markMessagesAsRead]);

    useEffect(() => {
        if (socket && selectedConversation) {
            socket.emit('joinConversation', selectedConversation._id);
        }
    }, [socket, selectedConversation]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;
        try {
            await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ conversationId: selectedConversation._id, body: newMessage }),
            });
            setNewMessage('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleChatCreated = (newChat) => {
        fetchConversations();
        setSelectedConversation(newChat);
    };

    const getConversationName = (conv) => {
        if (!conv) return '';
        if (conv.type === 'general') return 'General';
        if (conv.type === 'group') return conv.name;
        if (conv.type === 'private') {
            const otherMember = conv.members.find(member => member._id !== user.id);
            return otherMember ? otherMember.username : 'Chat Privado';
        }
        return 'Conversación';
    };

    return (
        <>
            <NewChatModal show={showNewChatModal} onClose={() => setShowNewChatModal(false)} onChatCreated={handleChatCreated} />
            <div className="chat-container">
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h3>Chats de {user?.username}</h3>
                        <button onClick={logout} className="logout-button">Logout</button>
                    </div>
                    <div className="new-chat-button-container">
                        <button onClick={() => setShowNewChatModal(true)} className="new-chat-button">+ Nuevo Chat</button>
                    </div>
                    <ul className="conversation-list">
                        {conversations.map(conv => (
                            <li key={conv._id} className={selectedConversation?._id === conv._id ? 'selected' : ''} onClick={() => setSelectedConversation(conv)}>
                                <span className="conversation-name">{getConversationName(conv)}</span>
                                {unreadCounts[conv._id] > 0 && (
                                    <span className="unread-badge">{unreadCounts[conv._id]}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="chat-area">
                    {selectedConversation ? (
                        <>
                            <div className="chat-header"><h3>{getConversationName(selectedConversation)}</h3></div>
                            <div className="messages">
                                {error && <p className="error-message">{error}</p>}
                                {messagesState.currentPage < messagesState.totalPages && (
                                    <div className="load-more-container">
                                        <button onClick={handleLoadMoreMessages} className="load-more-button">Cargar más</button>
                                    </div>
                                )}
                                {messagesState.messages.map(msg => (
                                    <div key={msg._id} className={`message ${msg.sender.username === user.username ? 'sent' : 'received'}`}>
                                        <div className="message-sender">{msg.sender.username !== user.username && msg.sender.username}</div>
                                        <div className="message-bubble">{msg.body}</div>
                                        <div className="message-time">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form className="message-input" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                />
                                <button type="submit">Enviar</button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <h3>Bienvenido al Chat</h3>
                            <p>Selecciona una conversación o crea una nueva para empezar.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HomePage;
