import { createContext, useContext, useState, useEffect } from 'react';
import { readPlain, savePlain } from '../helpers/localStorage/save';
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

/**
 * Interface cho NotificationType
 */
export type NotificationType = 'success' | 'warning' | 'info' | 'error';

/**
 * Interface cho AppNotification
 */
export interface AppNotification {
    /**
     * ID
     */
    id: string;
    /**
     * Tiêu đề
     */
    title: string;
    /**
     * Nội dung
     */
    message: string;
    /**
     * Loại
     */
    type: NotificationType;
    /**
     * Đã đọc
     */
    isRead: boolean;
    /**
     * Thời gian
     */
    timestamp: Date;
    /**
     * Dữ liệu
     */
    data?: any;
}

/**
 * Interface cho NotificationContextType
 */
interface NotificationContextType {
    /**
     * Danh sách thông báo
     */
    notifications: AppNotification[];
    /**
     * Số thông báo chưa đọc
     */
    unreadCount: number;
    /**
     * Thêm thông báo
     */
    addNotification: (notification: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'>) => void;
    /**
     * Đánh dấu đã đọc
     */
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        const saved = readPlain<any[]>('app_notifications', []);
        if (saved) {
            return saved.map((n: any) => ({
                ...n,
                timestamp: new Date(n.timestamp)
            }));
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
        savePlain('app_notifications', notifications);
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
