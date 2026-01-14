import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Maximize2, Send } from 'lucide-react';
import './ChatPage.css';
import './ChatWindow.css';

interface Message {
    id: string;
    content: string;
    type: 'text' | 'file' | 'image';
    senderId: string;
    senderName: string;
    senderAvatar: string;
    createdAt: string;
    editedAt?: string;
    isOwn: boolean;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen: string;
    currentChatRoom?: string;
}

interface ChatRoom {
    id: string;
    name: string;
    type: string;
    createdAt: string;
    otherUser: User;
    lastMessage?: Message;
    unreadCount: number;
}

const ChatPage = () => {
    const [conversations, setConversations] = useState<ChatRoom[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [isTyping, setIsTyping] = useState<Set<string>>(new Set());
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isConnected, setIsConnected] = useState(false);

    // WebSocket/Mercure connection
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:3000/.well-known/mercure?topic=chat/user/123');
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'new_message':
                    if (data.message.roomId === selectedConversation) {
                        setMessages(prev => [...prev, data.message]);
                    }
                    break;
                case 'presence_update':
                    setOnlineUsers(prev => {
                        const updated = prev.filter(u => u.id !== data.user.id);
                        return [...updated, data.user];
                    });
                    break;
                case 'typing_indicator':
                    setIsTyping(prev => {
                        const updated = new Set(prev);
                        if (data.isTyping) {
                            updated.add(data.userId);
                        } else {
                            updated.delete(data.userId);
                        }
                        return updated;
                    });
                    break;
            }
        };

        eventSource.onerror = () => setIsConnected(false);
        eventSource.onopen = () => setIsConnected(true);

        return () => {
            eventSource.close();
        };
    }, [selectedConversation]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const response = await fetch('http://localhost:80/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    recipientId: selectedConversation,
                    content: newMessage,
                    type: 'text'
                })
            });

            if (response.ok) {
                const message = await response.json();
                setMessages(prev => [...prev, message.data]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const markAsRead = async (roomId: string) => {
        try {
            await fetch(`http://localhost:80/api/chat/messages/${roomId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    return (
        <div className="chat-container">
            <div className="row">
                {/* Lista rozmów */}
                <div className="col-md-4 border-end">
                    <h5>Conversations</h5>
                    <div className="list-group">
                        {conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`list-group-item list-group-item-action ${selectedConversation === conv.id ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedConversation(conv.id);
                                    markAsRead(conv.id);
                                }}
                            >
                                <div className="d-flex w-100 justify-content-between">
                                    <h6 className="mb-1">{conv.otherUser.fullName}</h6>
                                    <small>{conv.otherUser.status}</small>
                                </div>
                                {conv.lastMessage && (
                                    <small className="text-muted">{conv.lastMessage.content}</small>
                                )}
                                {conv.unreadCount > 0 && (
                                    <span className="badge bg-danger rounded-pill">{conv.unreadCount}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Okno chatu */}
                <div className="col-md-8">
                    <div className={`card chat-window ${isMinimized ? 'minimized' : ''}`}>
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                {conversations.find(c => c.id === selectedConversation)?.otherUser.fullName || 'Select conversation'}
                            </h5>
                            <div className="d-flex align-items-center">
                                {!isConnected && <span className="badge bg-warning me-2">Disconnected</span>}
                                <button 
                                    className="btn btn-outline-secondary minimize-btn" 
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    title={isMinimized ? "Rozwiń" : "Zminimalizuj"}
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="card-body messages-container" ref={messagesEndRef}>
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`message ${message.isOwn ? 'own-message' : 'other-message'}`}
                                >
                                    <div className="message-header">
                                        <strong>{message.senderName}</strong>
                                        <small className="text-muted">
                                            {new Date(message.createdAt).toLocaleTimeString()}
                                        </small>
                                    </div>
                                    <div className="message-content">
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="card-footer">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Type a message..."
                                />
                                <button className="btn btn-primary" onClick={sendMessage}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista użytkowników online */}
                <div className="col-md-12">
                    <h5>Online Users</h5>
                    <div className="list-group">
                        {onlineUsers.map(user => (
                            <div key={user.id} className="list-group-item">
                                <div className="d-flex align-items-center">
                                    <div className={`status-indicator ${user.status}`}></div>
                                    <img
                                        src={user.avatar || '/default-avatar.png'}
                                        alt={user.fullName}
                                        className="rounded-circle me-2"
                                        width="32"
                                        height="32"
                                    />
                                    <span>{user.fullName}</span>
                                    {isTyping.has(user.id) && (
                                        <small className="text-muted ms-2">is typing...</small>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
