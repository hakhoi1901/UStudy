import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Trash2, CheckCircle } from 'lucide-react';
import { useAppNotification } from '../context/NotificationContext';
import type { AppNotification } from '../context/NotificationContext';

/**
 * 
 * @returns hiển thị danh sách thông báo
 */
export function NotificationMenu() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useAppNotification();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `Vài giây trước`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
            >
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center px-1 font-semibold border-2 border-white translate-x-1 -translate-y-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[380px]">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-semibold text-gray-900">Thông báo</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-xs text-[#004A98] hover:text-[#003A78] font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Đọc hết
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => clearAll()}
                                    className="text-xs text-gray-500 hover:text-red-700 font-medium flex items-center gap-1 ml-2 bg-gray-100 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Xóa
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar max-h-80" style={{ maxHeight: '380px' }}>
                        {notifications.length === 0 ? (
                            <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                                <Bell className="w-12 h-12 text-gray-200 mb-3" />
                                <p className="text-sm font-medium text-gray-900">Không có thông báo mới</p>
                                <p className="text-xs text-gray-500 mt-1">Bạn đã xem hết tất cả thông báo.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notif: AppNotification) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => !notif.isRead && markAsRead(notif.id)}
                                        className={`px-4 py-3 flex gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/40' : 'bg-white'
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm text-gray-900 ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                                {formatTime(notif.timestamp)}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="flex-shrink-0 flex items-center justify-center w-3">
                                                <div className="w-2 h-2 bg-[#004A98] rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50/50 text-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-gray-500 hover:text-gray-900 font-medium w-full"
                            >
                                Đóng
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
