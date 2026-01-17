import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Maximize2, Send, MessageCircle, Users } from 'lucide-react';
import './ChatWidget.css';
import { API_PLATFORM_URL } from '../config';

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

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [conversations, setConversations] = useState<ChatRoom[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isTyping, setIsTyping] = useState<Set<string>>(new Set());
    const [isConnected, setIsConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);
    const isCurrentlyTypingRef = useRef<boolean>(false);

    // Get current user ID from localStorage
    useEffect(() => {
        const admin = JSON.parse(localStorage.getItem('admin') || '{}');
        const userId = admin?.user_uuid;
        if (userId) {
            setCurrentUserId(userId);
        }
    }, []);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Krótki, cichy dźwięk "plumkanie"
            oscillator.frequency.value = 800; // Częstotliwość
            oscillator.type = 'sine'; // Typ fali
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Cicha głośność
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1); // Krótki dźwięk 100ms
        } catch (error) {
            console.error('Failed to play notification sound:', error);
        }
    };

    // Send typing indicator
    const sendTypingIndicator = async (isTyping: boolean) => {
        if (!selectedConversation) return;
        
        try {
            const admin = JSON.parse(localStorage.getItem('admin') || '{}');
            const token = typeof admin?.token === 'string' 
                ? admin.token 
                : admin?.token?.access_token;
            
            await fetch(`${API_PLATFORM_URL}/typing`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipientId: selectedConversation,
                    isTyping
                })
            });
        } catch (error) {
            console.error('Failed to send typing indicator:', error);
        }
    };

    // Fetch users and conversations on mount
    useEffect(() => {
        const initializeChat = async () => {
            const users = await fetchUsers();
            if (users.length > 0) {
                await fetchConversations(users);
            } else {
                console.log('ChatWidget: No users fetched, skipping conversations');
            }
        };
        
        initializeChat();
        
        // Odświeżaj statusy użytkowników co 30 sekund
        const refreshInterval = setInterval(async () => {
            console.log('ChatWidget: Refreshing user statuses...');
            const users = await fetchUsers();
            if (users.length > 0) {
                await fetchConversations(users);
            }
        }, 30000); // 30 sekund
        
        return () => clearInterval(refreshInterval);
    }, []);

    // WebSocket/Mercure connection
    useEffect(() => {
        if (!currentUserId) return;
        
        const eventSource = new EventSource(`http://localhost:3000/.well-known/mercure?topic=chat/user/${currentUserId}`);
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'new_message':
                    // Dodaj wiadomość jeśli jest od/do aktualnie wybranego użytkownika
                    const msg = data.message;
                    if (selectedConversation && 
                        (msg.senderId === selectedConversation || msg.recipientId === selectedConversation)) {
                        setMessages(prev => [...prev, msg]);
                        
                        // Odtwórz dźwięk tylko dla wiadomości od innych (nie własnych)
                        if (!msg.isOwn) {
                            playNotificationSound();
                        }
                    }
                    break;
                
                case 'typing_indicator':
                    if (data.isTyping) {
                        setIsTyping(prev => new Set(prev).add(data.userId));
                    } else {
                        setIsTyping(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(data.userId);
                            return newSet;
                        });
                    }
                    break;
                
                case 'presence_update':
                    // Aktualizuj status użytkownika
                    const presenceUser = data.user;
                    setAllUsers(prev => prev.map(u => 
                        u.id === presenceUser.id 
                            ? { ...u, status: presenceUser.status, lastSeen: presenceUser.lastSeen }
                            : u
                    ));
                    setOnlineUsers(prev => {
                        if (presenceUser.status === 'online') {
                            // Dodaj do online jeśli nie ma
                            if (!prev.find(u => u.id === presenceUser.id)) {
                                return [...prev, presenceUser];
                            }
                            return prev.map(u => u.id === presenceUser.id ? presenceUser : u);
                        } else {
                            // Usuń z online
                            return prev.filter(u => u.id !== presenceUser.id);
                        }
                    });
                    break;
            }
        };

        eventSource.onerror = () => setIsConnected(false);
        eventSource.onopen = () => setIsConnected(true);

        return () => {
            eventSource.close();
        };
    }, [selectedConversation, currentUserId]);

    const fetchUsers = async (): Promise<User[]> => {
        try {
            const admin = JSON.parse(localStorage.getItem('admin') || '{}');
            // Token może być stringiem lub obiektem z access_token
            const token = typeof admin?.token === 'string' 
                ? admin.token 
                : admin?.token?.access_token;
            
            if (!token) {
                console.error('No token available');
                return [];
            }
            const response = await fetch(`${API_PLATFORM_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const users = data.data || [];
                setAllUsers(users);
                setOnlineUsers(users.filter((u: User) => u.status === 'online'));
                return users;
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
        return [];
    };

    const fetchConversations = async (users?: User[]) => {
        try {
            const admin = JSON.parse(localStorage.getItem('admin') || '{}');
            const token = typeof admin?.token === 'string' 
                ? admin.token 
                : admin?.token?.access_token;
            if (!token) return;
            
            // Pobierz konwersacje
            const response = await fetch(`${API_PLATFORM_URL}/conversations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const conversations = data.data || [];
                
                // Użyj przekazanych użytkowników lub tych z state
                const usersList = users || allUsers;
                
                // Połącz dane konwersacji z danymi użytkowników
                const enrichedConversations = conversations.map((conv: ChatRoom) => {
                    const user = usersList.find((u: User) => u.id === conv.id);
                    if (user) {
                        return {
                            ...conv,
                            otherUser: user,
                            name: user.fullName
                        };
                    }
                    return conv;
                });
                
                setConversations(enrichedConversations);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        }
    };

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
            const admin = JSON.parse(localStorage.getItem('admin') || '{}');
            const token = typeof admin?.token === 'string' 
                ? admin.token 
                : admin?.token?.access_token;
            if (!token) return;
            
            // Resetuj flagę i wyślij typing indicator false
            isCurrentlyTypingRef.current = false;
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            sendTypingIndicator(false);
            
            const response = await fetch(`${API_PLATFORM_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    // Handle input change with typing indicator
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        if (value.trim()) {
            // Wyślij typing indicator tylko raz na początku pisania
            if (!isCurrentlyTypingRef.current) {
                isCurrentlyTypingRef.current = true;
                sendTypingIndicator(true);
            }
            
            // Reset timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            // Wyślij false po 2 sekundach bezczynności
            typingTimeoutRef.current = window.setTimeout(() => {
                isCurrentlyTypingRef.current = false;
                sendTypingIndicator(false);
            }, 2000);
        } else {
            // Jeśli pole jest puste, wyślij false
            if (isCurrentlyTypingRef.current) {
                isCurrentlyTypingRef.current = false;
                sendTypingIndicator(false);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const startConversation = (userId: string) => {
        setSelectedConversation(userId);
        setShowUserList(false);
        fetchMessages(userId);
    };

    const fetchMessages = async (userId: string) => {
        try {
            const admin = JSON.parse(localStorage.getItem('admin') || '{}');
            const token = typeof admin?.token === 'string' 
                ? admin.token 
                : admin?.token?.access_token;
            if (!token) return;
            const response = await fetch(`${API_PLATFORM_URL}/messages/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const markAsRead = async (roomId: string) => {
        try {
            const admin = JSON.parse(localStorage.getItem('admin') || '{}');
            const token = typeof admin?.token === 'string' 
                ? admin.token 
                : admin?.token?.access_token;
            if (!token) return;
            await fetch(`${API_PLATFORM_URL}/messages/${roomId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return '#28a745';
            case 'offline': return '#6c757d';
            case 'away': return '#ffc107';
            case 'busy': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (!isOpen) {
        return (
            <div className="chat-widget-bubble" onClick={() => setIsOpen(true)}>
                <MessageCircle size={24} />
                {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0) > 0 && (
                    <span className="notification-badge">
                        {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={`chat-widget ${isMinimized ? 'minimized' : ''}`}>
            <div className="chat-widget-header">
                <div className="chat-widget-title">
                    <MessageCircle size={18} />
                    <span>Chat</span>
                    {!isConnected && <span className="connection-status">Offline</span>}
                </div>
                <div className="chat-widget-controls">
                    <button 
                        className="control-btn"
                        onClick={() => setShowUserList(!showUserList)}
                        title="Użytkownicy"
                    >
                        <Users size={16} />
                    </button>
                    <button 
                        className="control-btn"
                        onClick={() => setIsMinimized(!isMinimized)}
                        title={isMinimized ? "Rozwiń" : "Zminimalizuj"}
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button 
                        className="control-btn close-btn"
                        onClick={() => setIsOpen(false)}
                        title="Zamknij"
                    >
                        ×
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <div className="chat-widget-body">
                    {showUserList ? (
                        <div className="user-list">
                            <div className="user-list-header">
                                <h6>Wszyscy użytkownicy</h6>
                            </div>
                            <div className="user-list-items">
                                {allUsers.map(user => (
                                    <div 
                                        key={user.id} 
                                        className="user-item"
                                        onClick={() => startConversation(user.id)}
                                    >
                                        <div className="user-avatar">
                                            <img
                                                src={user.avatar || '/default-avatar.png'}
                                                alt={user.fullName}
                                                width="32"
                                                height="32"
                                            />
                                            <div 
                                                className="status-dot"
                                                style={{ backgroundColor: getStatusColor(user.status) }}
                                            ></div>
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">{user.fullName}</div>
                                            <div className="user-status">{user.status}</div>
                                        </div>
                                        {isTyping.has(user.id) && (
                                            <small className="typing-indicator">pisze...</small>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedConversation ? (
                                <>
                                    <div className="chat-messages" ref={messagesEndRef}>
                                        {messages.map(message => (
                                            <div
                                                key={message.id}
                                                className={`message ${message.isOwn ? 'own' : 'other'}`}
                                            >
                                                <div className="message-content">{message.content}</div>
                                                <div className="message-time">
                                                    {new Date(message.createdAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping.has(selectedConversation || '') && (
                                            <div className="message other">
                                                <div className="message-content typing-animation">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="chat-input">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={handleInputChange}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    sendMessage();
                                                }
                                            }}
                                            placeholder="Napisz wiadomość..."
                                        />
                                        <button onClick={sendMessage}>
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="conversation-list">
                                    <div className="conversation-list-header">
                                        <h6>Rozmowy</h6>
                                        <button 
                                            className="new-chat-btn"
                                            onClick={() => setShowUserList(true)}
                                        >
                                            Nowa rozmowa
                                        </button>
                                    </div>
                                    <div className="conversation-items">
                                        {conversations.map(conv => (
                                            <div
                                                key={conv.id}
                                                className="conversation-item"
                                                onClick={() => {
                                                    setSelectedConversation(conv.id);
                                                    fetchMessages(conv.id);
                                                    markAsRead(conv.id);
                                                }}
                                            >
                                                <div className="conversation-avatar">
                                                    <img
                                                        src={conv.otherUser.avatar || '/default-avatar.png'}
                                                        alt={conv.otherUser.fullName}
                                                        width="40"
                                                        height="40"
                                                    />
                                                    <div 
                                                        className="status-dot"
                                                        style={{ backgroundColor: getStatusColor(conv.otherUser.status) }}
                                                    ></div>
                                                </div>
                                                <div className="conversation-info">
                                                    <div className="conversation-name">{conv.otherUser.fullName}</div>
                                                    {conv.lastMessage && (
                                                        <div className="last-message">{conv.lastMessage.content}</div>
                                                    )}
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <span className="unread-badge">{conv.unreadCount}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
