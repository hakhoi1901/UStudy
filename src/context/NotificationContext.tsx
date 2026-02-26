import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/*
import { useAppNotification } from '../context/NotificationContext';

const { addNotification } = useAppNotification();

addNotification({ 
   title: 'Thành công', 
   message: 'Môn học abcxyz đã được thêm vào giỏ', 
   type: 'success' 
});
*/

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    timestamp: Date;
    data?: any;
}

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        try {
            const saved = localStorage.getItem('app_notifications');
            if (saved) {
                return JSON.parse(saved).map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }));
            }
        } catch (e) {
            console.error(e);
        }
        return [
            {
                id: '1',
                title: 'Chào mừng trở lại',
                message: 'Dữ liệu học tập của bạn đã được cập nhật mới nhất.',
                type: 'info',
                isRead: false,
                timestamp: new Date()
            }
        ]; // Dữ liệu mẫu ban đầu
    });

    useEffect(() => {
        localStorage.setItem('app_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (notif: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'>) => {
        const newNotification: AppNotification = {
            ...notif,
            id: Math.random().toString(36).substring(2, 9),
            isRead: false,
            timestamp: new Date(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useAppNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useAppNotification must be used within a NotificationProvider');
    }
    return context;
}
