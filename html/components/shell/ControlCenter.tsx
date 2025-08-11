
import React from 'react';
import type { PhoneSettings, MusicState, CallRecord, Conversation } from '../../types';
import { useLocale } from '../../i18n';
import SettingsSwitch from '../apps/SettingsSwitch';
import MiniMusicPlayer from './MiniMusicPlayer';
import NotificationsPanel from './NotificationsPanel';
import { Plane, SunMoon, Sun, Moon, Volume2, AppWindow } from 'lucide-react';

interface ControlCenterProps {
    isOpen: boolean;
    onClose: () => void;
    settings: PhoneSettings;
    onUpdateSettings: (settings: Partial<PhoneSettings>) => void;
    musicState: MusicState;
    setMusicState: (state: MusicState | ((prevState: MusicState) => MusicState)) => void;
     notifications: {
        missedCalls: CallRecord[];
        unreadMessages: Conversation[];
    };
    onClearMissedCalls: () => void;
    onClearUnreadMessages: (phoneNumber: string) => void;
}

const ControlCenter: React.FC<ControlCenterProps> = (props) => {
    const { isOpen, onClose, settings, onUpdateSettings, musicState, setMusicState, notifications } = props;
    const { t } = useLocale();

    return (
        <div
            className={`absolute inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className={`absolute top-0 left-4 right-4 bg-neutral-800/60 backdrop-blur-2xl rounded-3xl p-3 transform transition-all duration-300 ease-out ${isOpen ? 'translate-y-4' : '-translate-y-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-2 gap-3">
                    {/* Left Side: Toggles & Sliders */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-neutral-700/50 rounded-2xl p-3 flex flex-col justify-between aspect-square">
                                <Plane size={24} className="text-orange-400" />
                                <span className="font-semibold">{t('airplane_mode')}</span>
                            </div>
                             <div className="bg-neutral-700/50 rounded-2xl p-3 flex flex-col justify-between aspect-square">
                                <SunMoon size={24} className="text-blue-400" />
                                <span className="font-semibold">{t('dark_mode')}</span>
                            </div>
                        </div>
                        <div className="bg-neutral-700/50 rounded-2xl p-3 space-y-2">
                             <div className="flex items-center gap-2">
                                <Sun size={16} />
                                <input type="range" className="w-full h-1.5 bg-neutral-600 rounded-full appearance-none" style={{accentColor: 'white'}} />
                             </div>
                             <div className="flex items-center gap-2">
                                <Volume2 size={16} />
                                <input type="range" className="w-full h-1.5 bg-neutral-600 rounded-full appearance-none" style={{accentColor: 'white'}} />
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Music & Notifications */}
                    <div className="space-y-3 flex flex-col">
                        <MiniMusicPlayer musicState={musicState} setMusicState={setMusicState} />
                        <NotificationsPanel notifications={props.notifications} onClearMissedCalls={props.onClearMissedCalls} onClearUnreadMessages={props.onClearUnreadMessages} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlCenter;
