import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';

const SessionTimer = () => {
    const { admin } = useAuth();
    const [secondsLeft, setSecondsLeft] = useState(0);

    useEffect(() => {
        if (!admin?.expiresAt) {
            setSecondsLeft(0);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((admin.expiresAt - Date.now()) / 1000));
            setSecondsLeft(remaining);
        };

        // Initial update
        updateTimer();

        // Update every second
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [admin]);

    const formatTime = (sec: number) => {
        if (sec <= 0) return '00:00';
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getTimeColor = () => {
        if (secondsLeft > 600) return 'bg-success'; // > 10 min - green
        if (secondsLeft > 300) return 'bg-warning'; // > 5 min - yellow
        return 'bg-danger'; // <= 5 min - red
    };

    if (!admin) return null;

    return (
        <div className="session-timer">
            <span className={`badge ${getTimeColor()} text-white`}>
                🕐 Sesja: {formatTime(secondsLeft)}
            </span>
        </div>
    );
};

export default SessionTimer;
