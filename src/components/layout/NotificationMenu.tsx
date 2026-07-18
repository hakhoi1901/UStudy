import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, CheckCircle2, Info, Trash2, XCircle } from 'lucide-react';
import { useAppNotification } from '../../context/NotificationContext';
import type { AppNotification } from '../../context/NotificationContext';
import { MobileBottomSheet } from '../ui/overlays/mobile-bottom-sheet';

export function NotificationMenu() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useAppNotification();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const updateViewport = () => setIsMobile(mediaQuery.matches);
        updateViewport();
        mediaQuery.addEventListener('change', updateViewport);
        return () => mediaQuery.removeEventListener('change', updateViewport);
    }, []);

    useEffect(() => {
        if (!isOpen || isMobile) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isOpen]);

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
            case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
            default: return <Info className="h-5 w-5 text-[#004A98]" />;
        }
    };

    const getIconBackground = (type: AppNotification['type']) => {
        switch (type) {
            case 'success': return 'bg-emerald-50';
            case 'warning': return 'bg-amber-50';
            case 'error': return 'bg-red-50';
            default: return 'bg-blue-50';
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Vài giây trước';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    };

    const notificationList = (mobile = false) => {
        if (notifications.length === 0) {
            return (
                <div className={`flex flex-col items-center justify-center px-6 text-center ${mobile ? 'min-h-72 py-12' : 'py-12'}`}>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                        <Bell className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-gray-900">Không có thông báo</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">Các cập nhật mới sẽ xuất hiện tại đây.</p>
                </div>
            );
        }

        return (
            <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                    <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                            if (!notification.isRead) markAsRead(notification.id);
                        }}
                        className={`flex w-full gap-3 text-left transition-colors hover:bg-gray-50 ${mobile ? 'px-4 py-4' : 'px-4 py-3'} ${
                            notification.isRead ? 'bg-white' : 'bg-[#F4F8FF]'
                        }`}
                    >
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getIconBackground(notification.type)}`}>
                            {getIcon(notification.type)}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className={`block text-sm leading-5 text-gray-900 ${notification.isRead ? 'font-medium' : 'font-semibold'}`}>
                                {notification.title}
                            </span>
                            <span className={`mt-1 block text-xs leading-5 text-gray-600 ${mobile ? '' : 'line-clamp-2'}`}>
                                {notification.message}
                            </span>
                            <span className="mt-2 block text-[11px] font-medium text-gray-400">
                                {formatTime(notification.timestamp)}
                            </span>
                        </span>
                        {!notification.isRead && (
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#004A98]" aria-label="Chưa đọc" />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
                aria-label="Mở thông báo"
                aria-expanded={isOpen}
            >
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-gray-900" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] translate-x-1 -translate-y-1 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-semibold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && !isMobile && (
                <div className="absolute right-0 z-50 mt-2 flex max-h-[420px] w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/70 px-4 py-3">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
                            <p className="mt-0.5 text-[11px] text-gray-500">{unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Đã đọc tất cả'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#004A98] hover:bg-blue-50"
                                    title="Đánh dấu tất cả đã đọc"
                                    aria-label="Đánh dấu tất cả đã đọc"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                                    title="Xóa tất cả thông báo"
                                    aria-label="Xóa tất cả thông báo"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
                        {notificationList()}
                    </div>
                </div>
            )}

            {isOpen && isMobile && (
                <MobileBottomSheet
                    title="Thông báo"
                    eyebrow={unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc tất cả'}
                    onClose={() => setIsOpen(false)}
                    className="md:hidden"
                    contentClassName="bg-white"
                    sheetId="notifications"
                >
                    {notifications.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-[#004A98] disabled:text-gray-400"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Đọc tất cả
                            </button>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                                Xóa tất cả
                            </button>
                        </div>
                    )}
                    {notificationList(true)}
                </MobileBottomSheet>
            )}
        </div>
    );
}
