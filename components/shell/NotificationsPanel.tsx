
import React from 'react';
import type { CallRecord, Conversation } from '../../types';
import { useLocale } from '../../i18n';
import { PhoneMissed, MessageSquare, X } from 'lucide-react';

interface NotificationsPanelProps {
    notifications: {
        missedCalls: CallRecord[];
        unreadMessages: Conversation[];
    };
    onClearMissedCalls: () => void;
    onClearUnreadMessages: (phoneNumber: string) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClearMissedCalls, onClearUnreadMessages }) => {
    const { t } = useLocale();
    const { missedCalls, unreadMessages } = notifications;

    const allNotifications = [
        ...missedCalls.map(c => ({ ...c, type: 'call' })),
        ...unreadMessages.map(m => ({ ...m, type: 'message' }))
    ];

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClearMissedCalls();
        unreadMessages.forEach(m => onClearUnreadMessages(m.phoneNumber));
    };

    return (
        <div className="bg-neutral-700/50 rounded-2xl p-3 flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">{t('notifications_center_title')}</h3>
                {allNotifications.length > 0 && (
                     <button onClick={handleClearAll} className="text-xs text-blue-400 hover:underline">{t('clear_all')}</button>
                )}
            </div>
            <div className="overflow-y-auto flex-grow space-y-1 pr-1 -mr-1">
                {allNotifications.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-neutral-400">
                        <p>{t('no_notifications')}</p>
                    </div>
                ) : (
                    allNotifications.map((notif: any) => (
                        <div key={`${notif.type}-${notif.id || notif.phoneNumber}`} className="bg-black/20 p-2 rounded-lg flex items-center gap-2 text-sm">
                            {notif.type === 'call' ? <PhoneMissed size={16} className="text-red-400 flex-shrink-0" /> : <MessageSquare size={16} className="text-blue-400 flex-shrink-0" />}
                            <div className="flex-grow truncate">
                                <p className="font-semibold truncate">{notif.contact.name || notif.contactName}</p>
                                {notif.type === 'message' && <p className="text-xs text-neutral-300 truncate">{notif.lastMessage}</p>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
