import { useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../auth/useAuth';

export const useActivityTracker = () => {
    const { admin, refreshExpiry } = useAuth();

    const handleActivity = useCallback(() => {
        if (admin) {
            refreshExpiry();
        }
    }, [refreshExpiry, admin]);

    useEffect(() => {
        if (!admin) return;

        // Only click events reset session timer
        const events = [
            'click',
            'touchstart'
        ];

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
        };
    }, [handleActivity, admin]);

    return handleActivity;
};

// Provider component to wrap the app and enable activity tracking
interface ActivityTrackerProviderProps {
    children: ReactNode;
}

export const ActivityTrackerProvider = ({ children }: ActivityTrackerProviderProps) => {
    useActivityTracker();
    return <>{children}</>;
};
