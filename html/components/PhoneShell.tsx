
import React, { ReactNode, useState, useRef } from 'react';
import StatusBar from './StatusBar';
import ControlCenter from './shell/ControlCenter';
import type { Contact, PhoneSettings, MusicState, CallRecord, Conversation } from '../types';

interface PhoneShellProps {
    children: ReactNode;
    onHomeClick: () => void;
    callState: 'idle' | 'incoming' | 'active';
    activeCallContact: Contact | null;
    locale: 'en' | 'fr';
    wallpaperUrl: string;
    settings: PhoneSettings;
    onUpdateSettings: (settings: Partial<PhoneSettings>) => void;
    musicState: MusicState;
    setMusicState: (state: MusicState) => void;
    notifications: {
        missedCalls: CallRecord[];
        unreadMessages: Conversation[];
    };
    onClearMissedCalls: () => void;
    onClearUnreadMessages: (phoneNumber: string) => void;
}

const PhoneShell: React.FC<PhoneShellProps> = (props) => {
    const { children, onHomeClick, wallpaperUrl, locale } = props;
    const [isControlCenterOpen, setControlCenterOpen] = useState(false);
    const swipeStartY = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        swipeStartY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (swipeStartY.current === null) return;
        
        const deltaY = e.touches[0].clientY - swipeStartY.current;
        if (deltaY > 50) { // Swipe down threshold
            setControlCenterOpen(true);
            swipeStartY.current = null;
        }
    };

    const handleTouchEnd = () => {
        swipeStartY.current = null;
    };

    return (
        <div 
            className="w-[1400px] h-[940px] rounded-[60px] shadow-2xl shadow-black/80 border-4 border-neutral-800 flex flex-col relative p-2 bg-cover bg-center"
            style={{ backgroundImage: `url('${wallpaperUrl}')` }}
        >
            <div className="relative w-full h-full bg-transparent rounded-[52px] flex flex-col overflow-hidden">
                <div 
                    className="absolute top-0 left-0 right-0 h-12 z-20"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
                
                <ControlCenter
                    isOpen={isControlCenterOpen}
                    onClose={() => setControlCenterOpen(false)}
                    {...props}
                />
                
                <StatusBar locale={locale} />
                
                <main className="flex-grow bg-transparent overflow-y-auto">
                    {children}
                </main>
                
                {/* Home Bar */}
                <div className="h-10 flex-shrink-0 flex items-center justify-center pt-2 pb-4">
                     <button
                        onClick={onHomeClick}
                        className="w-64 h-2 bg-white/60 rounded-full hover:bg-white/90 transition-colors"
                        aria-label="Home"
                    ></button>
                </div>
            </div>
        </div>
    );
};

export default PhoneShell;