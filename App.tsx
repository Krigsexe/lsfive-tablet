

import React, { useState, useEffect, useMemo } from 'react';
import { AppType, type Contact, type AppInfo, type CallRecord, type Conversation, type Song, type Wallpaper, type Vehicle, type BankAccount, type Business, type Mail as MailType, DispatchAlert, SocialPost, PhoneSettings, CallDirection, MdtCitizen, MdtIncident, MedicalRecord, MechanicInvoice, OnDutyUnit, MusicState, Folder, HomeScreenItem } from './types';
import PhoneShell from './components/PhoneShell';
import HomeScreen from './components/HomeScreen';
import MessagesApp from './components/apps/MessagesApp';
import PhoneApp from './components/apps/PhoneApp';
import SettingsApp from './components/apps/SettingsApp';
import MarketplaceApp from './components/apps/MarketplaceApp';
import InCallUI from './components/InCallUI';
import IncomingCall from './components/IncomingCall';
import { ALL_APPS, DEFAULT_WALLPAPERS, MY_PHONE_NUMBER, DEFAULT_DOCK_APP_IDS } from './constants';
import { useLocale } from './i18n';
import BrowserApp from './components/apps/BrowserApp';
import CameraApp from './components/apps/CameraApp';
import PlaceholderApp from './components/apps/PlaceholderApp';
import MusicApp from './components/apps/MusicApp';
import BootScreen from './components/BootScreen';
import GarageApp from './components/apps/GarageApp';
import BankApp from './components/apps/BankApp';
import BusinessApp from './components/apps/BusinessApp';
import DispatchApp from './components/apps/DispatchApp';
import WeatherApp from './components/apps/WeatherApp';
import MailApp from './components/apps/MailApp';
import SocialApp from './components/apps/SocialApp';
import MdtApp from './components/apps/MdtApp';
import MediTab from './components/apps/MediTab';
import MechaTab from './components/apps/MechaTab';

const getInitialApps = (): AppInfo[] => {
    // For simplicity, we assume all available apps are "installed" in standalone.
    // The marketplace app will filter what's visible.
    return ALL_APPS;
};

const getInitialDock = (): AppType[] => {
    try {
        const storedDock = localStorage.getItem('phone_dock_order');
        if (storedDock) return JSON.parse(storedDock);
    } catch (e) { console.error(e); }
    return DEFAULT_DOCK_APP_IDS;
};

const getInitialSettings = (): PhoneSettings => {
    try {
        const stored = localStorage.getItem('phone_settings');
        if (stored) {
            const parsed = JSON.parse(stored);
            const defaultSettings: PhoneSettings = {
                theme: 'dark',
                airplaneMode: false,
                clockWidgetVisible: true,
                folders: [],
                homeScreenOrder: [],
            };
            return { ...defaultSettings, ...parsed };
        }
    } catch (e) { console.error(e); }
    return { theme: 'dark', airplaneMode: false, clockWidgetVisible: true, folders: [], homeScreenOrder: [] };
};

const App: React.FC = () => {
    const { t, locale, setLocale } = useLocale();

    const [isBooting, setIsBooting] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [activeApp, setActiveApp] = useState<AppType | null>(null);

    // Call states
    const [callState, setCallState] = useState<'idle' | 'incoming' | 'active'>('idle');
    const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);

    // Settings & Layout
    const [settings, setSettings] = useState<PhoneSettings>(getInitialSettings());
    const [folders, setFolders] = useState<Folder[]>(settings.folders);
    const [homeScreenOrder, setHomeScreenOrder] = useState<string[]>(settings.homeScreenOrder);

    // Data states - Mock job for standalone
    const [userJob, setUserJob] = useState('sams');
    const [onDuty, setOnDuty] = useState(true);

    const allApps = useMemo(() => ALL_APPS.filter(app => !app.requiredJobs || app.requiredJobs.includes(userJob)), [userJob]);
    
    // Installed apps are all available apps minus those hidden by the user
    const [installedAppIds, setInstalledAppIds] = useState<AppType[]>(() => {
        try {
            const stored = localStorage.getItem('phone_installed_apps');
            if(stored) return JSON.parse(stored);
        } catch (e) { console.error(e); }
        return allApps.filter(app => !app.isRemovable).map(app => app.id);
    });

    const installedApps = useMemo(() => {
        const appMap = new Map(allApps.map(app => [app.id, app]));
        return installedAppIds.map(id => appMap.get(id)).filter((a): a is AppInfo => !!a);
    }, [installedAppIds, allApps]);

    const [dockAppIds, setDockAppIds] = useState<AppType[]>(getInitialDock());
    const [wallpapers, setWallpapers] = useState<Wallpaper[]>(DEFAULT_WALLPAPERS);
    const [currentWallpaperUrl, setCurrentWallpaperUrl] = useState<string>(DEFAULT_WALLPAPERS[0].url);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [mails, setMails] = useState<MailType[]>([]);
    const [alerts, setAlerts] = useState<DispatchAlert[]>([]);
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
    
    // Job-specific data
    const [mdtCitizens, setMdtCitizens] = useState<MdtCitizen[]>([]);
    const [mdtIncidents, setMdtIncidents] = useState<MdtIncident[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [mechanicInvoices, setMechanicInvoices] = useState<MechanicInvoice[]>([]);
    const [onDutyUnits, setOnDutyUnits] = useState<OnDutyUnit[]>([]);

    // Shared state for music player
    const [musicState, setMusicState] = useState<MusicState>({ currentSong: null, isPlaying: false, progress: 0, duration: 0 });

    useEffect(() => {
        if (homeScreenOrder.length === 0) {
            const defaultOrder = installedApps
                .filter(app => !dockAppIds.includes(app.id))
                .map(app => app.id);
            setHomeScreenOrder(defaultOrder);
        }
    }, [installedApps, dockAppIds]);
    
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
        try {
            const settingsToSave = { ...settings, folders, homeScreenOrder };
            localStorage.setItem('phone_settings', JSON.stringify(settingsToSave));
        } catch (e) { console.error("Failed to save settings to localStorage", e); }
    }, [settings, folders, homeScreenOrder]);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    const openApp = (app: AppType) => setActiveApp(app);
    const goHome = () => setActiveApp(null);

    const handleAcceptCall = () => { setCallState('active'); setActiveApp(AppType.PHONE); };
    const handleDeclineCall = () => { setCallState('idle'); setActiveCallContact(null); };
    const handleEndCall = () => { setCallState('idle'); setActiveCallContact(null); goHome(); };
    const handlePlaceCall = (contact: Contact) => { setActiveCallContact(contact); setCallState('active'); setActiveApp(AppType.PHONE); };
    
    const persistInstalledApps = (newAppIds: AppType[]) => {
        try {
            localStorage.setItem('phone_installed_apps', JSON.stringify(newAppIds));
        } catch (e) { console.error(e); }
    }

    const handleInstallApp = (app: AppInfo) => {
        const newAppIds = [...installedAppIds, app.id];
        setInstalledAppIds(newAppIds);
        setHomeScreenOrder(prev => [...prev, app.id]); // Add to end of home screen
        persistInstalledApps(newAppIds);
    };

    const handleUninstallApp = (appToUninstall: AppInfo) => {
        if (!appToUninstall.isRemovable) return;

        // Remove from installed apps
        const newAppIds = installedAppIds.filter(id => id !== appToUninstall.id);
        setInstalledAppIds(newAppIds);
        persistInstalledApps(newAppIds);

        // Remove from dock, home screen, and any folders
        setDockAppIds(prev => prev.filter(id => id !== appToUninstall.id));
        setHomeScreenOrder(prev => prev.filter(id => id !== appToUninstall.id));
        setFolders(prev => {
            const newFolders = prev.map(f => ({
                ...f,
                appIds: f.appIds.filter(id => id !== appToUninstall.id)
            }));
            // Dissolve folders that are now empty or have one app
            const foldersToDissolve = newFolders.filter(f => f.appIds.length < 2);
            const remainingFolders = newFolders.filter(f => f.appIds.length >= 2);
            
            const appsFromDissolvedFolders = foldersToDissolve.flatMap(f => f.appIds);
            const dissolvedFolderIds = foldersToDissolve.map(f => f.id);

            setHomeScreenOrder(prevOrder => {
                const newOrder = prevOrder.filter(id => !dissolvedFolderIds.includes(id));
                return [...newOrder, ...appsFromDissolvedFolders];
            });

            return remainingFolders;
        });
    };

    const handleSetDockAppIds = (newDockIds: AppType[]) => {
        setDockAppIds(newDockIds);
        try { localStorage.setItem('phone_dock_order', JSON.stringify(newDockIds)); } catch (e) { console.error(e); }
    };

    // FOLDER HANDLERS
    const handleCreateFolder = (droppedAppId: AppType, targetAppId: AppType) => {
        const newFolder: Folder = {
            id: `folder-${Date.now()}`,
            name: t('default_folder_name'),
            appIds: [targetAppId, droppedAppId],
        };
        setFolders(prev => [...prev, newFolder]);
        setHomeScreenOrder(prev => prev.filter(id => id !== droppedAppId).map(id => id === targetAppId ? newFolder.id : id));
        setDockAppIds(prev => prev.filter(id => id !== droppedAppId && id !== targetAppId));
    };
    
    const handleAddToFolder = (folderId: string, appId: AppType) => {
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, appIds: [...f.appIds, appId] } : f));
        setHomeScreenOrder(prev => prev.filter(id => id !== appId));
        setDockAppIds(prev => prev.filter(id => id !== appId));
    };

    const handleRemoveFromFolder = (folderId: string, appId: AppType) => {
        let wasDissolved = false;
        setFolders(prev => {
            const newFolders = prev.map(f => {
                if (f.id === folderId) {
                    return { ...f, appIds: f.appIds.filter(id => id !== appId) };
                }
                return f;
            });
            
            const folder = newFolders.find(f => f.id === folderId);
            if (folder && folder.appIds.length < 2) {
                wasDissolved = true;
                setHomeScreenOrder(prevOrder => {
                    const folderIndex = prevOrder.indexOf(folderId);
                    const newOrder = [...prevOrder];
                    if (folderIndex !== -1) {
                        newOrder.splice(folderIndex, 1, ...folder.appIds, appId);
                    } else {
                        newOrder.push(...folder.appIds, appId);
                    }
                    return newOrder;
                });
                return newFolders.filter(f => f.id !== folderId);
            }
            return newFolders;
        });

        if (!wasDissolved) {
            setHomeScreenOrder(prev => [...prev, appId]);
        }
    };
    
    const handleRenameFolder = (folderId: string, newName: string) => {
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
    };

    const handleUpdateFolderApps = (folderId: string, newAppIds: AppType[]) => {
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, appIds: newAppIds } : f));
    };

    const handleUpdateSettings = (updates: Partial<PhoneSettings>) => setSettings(prev => ({ ...prev, ...updates }));
    const handleBackup = () => alert('Phone data backup initiated!');
    const handleClearMissedCalls = () => setCallHistory(prev => prev.map(call => call.direction === CallDirection.MISSED ? { ...call, isNew: false } : call));
    const handleClearUnreadMessages = (phoneNumber: string) => setConversations(prev => prev.map(convo => convo.phoneNumber === phoneNumber ? { ...convo, unread: 0 } : convo));

    const appsWithNotifications = useMemo(() => {
        const unreadMessagesCount = conversations.reduce((sum, convo) => sum + convo.unread, 0);
        const missedCallsCount = callHistory.filter(call => call.isNew && call.direction === CallDirection.MISSED).length;
        return installedApps.map(app => {
            if (app.id === AppType.MESSAGES) return { ...app, notificationCount: unreadMessagesCount };
            if (app.id === AppType.PHONE) return { ...app, notificationCount: missedCallsCount };
            return app;
        });
    }, [installedApps, conversations, callHistory]);

    const renderAppContent = () => {
        if (callState === 'active' && activeApp === AppType.PHONE && activeCallContact) {
            return <InCallUI contact={activeCallContact} onEndCall={handleEndCall} />;
        }
        switch (activeApp) {
            case AppType.PHONE: return <PhoneApp onPlaceCall={handlePlaceCall} contacts={contacts} recentCalls={callHistory} onViewRecents={handleClearMissedCalls} />;
            case AppType.MESSAGES: return <MessagesApp conversations={conversations} myNumber={MY_PHONE_NUMBER} onViewConversation={handleClearUnreadMessages} />;
            case AppType.SETTINGS:
                return <SettingsApp myPhoneNumber={MY_PHONE_NUMBER} currentLanguage={locale as 'en' | 'fr'} onSetLanguage={setLocale} setCurrentWallpaper={setCurrentWallpaperUrl} wallpapers={wallpapers} setWallpapers={setWallpapers} onOpenMarketplace={() => openApp(AppType.MARKETPLACE)} settings={settings} onUpdateSettings={handleUpdateSettings} onBackup={handleBackup} />;
            case AppType.MARKETPLACE: return <MarketplaceApp installedAppIds={installedAppIds} onInstallApp={handleInstallApp} onUninstallApp={handleUninstallApp} userJob={userJob} />;
            case AppType.BROWSER: return <BrowserApp />;
            case AppType.CAMERA: return <CameraApp />;
            case AppType.MUSIC: return <MusicApp songs={songs} setSongs={setSongs} musicState={musicState} setMusicState={setMusicState} />;
            case AppType.GARAGE: return <GarageApp vehicles={vehicles} onRequestVehicle={(id) => console.log(id)} />;
            case AppType.BANK: return <BankApp account={bankAccount} onTransfer={(data) => console.log(data)} />;
            case AppType.BUSINESSES: return <BusinessApp businesses={businesses} onSetGPS={(loc) => console.log(loc)} />;
            case AppType.DISPATCH: return <DispatchApp alerts={alerts} onCreateAlert={(data) => console.log(data)} />;
            case AppType.WEATHER: return <WeatherApp locale={locale as 'en' | 'fr'} />;
            case AppType.MAIL: return <MailApp mails={mails} myEmailAddress="you@ls.mail" onSend={(data) => console.log(data)} onDelete={(id) => console.log(id)} />;
            case AppType.SOCIAL: return <SocialApp posts={socialPosts} onCreatePost={(data) => console.log(data)} onLikePost={(id) => console.log(id)} />;
            case AppType.MDT: return <MdtApp onSetDuty={setOnDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchCitizens={async () => []} onCreateIncident={(data) => console.log(data)} />;
            case AppType.MEDITAB: return <MediTab onSetDuty={setOnDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchRecords={async () => []} onCreateRecord={(data) => console.log(data)} />;
            case AppType.MECHATAB: return <MechaTab onSetDuty={setOnDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchVehicle={async () => null} onCreateInvoice={(data) => console.log(data)} invoices={mechanicInvoices} />;
            case AppType.PHOTOS:
            case AppType.CLOCK:
            case AppType.NOTES:
            case AppType.REMINDERS:
            case AppType.STOCKS:
            case AppType.HEALTH:
            case AppType.WALLET:
                return <PlaceholderApp appNameKey={activeApp + '_title'} />;
            default:
                return <HomeScreen 
                    apps={appsWithNotifications}
                    dockAppIds={dockAppIds}
                    setDockAppIds={handleSetDockAppIds}
                    onOpenApp={openApp}
                    onUninstallApp={handleUninstallApp}
                    clockWidgetVisible={settings.clockWidgetVisible}
                    onSetClockWidgetVisible={(isVisible) => handleUpdateSettings({ clockWidgetVisible: isVisible })}
                    folders={folders}
                    homeScreenOrder={homeScreenOrder}
                    onReorderHome={setHomeScreenOrder}
                    onCreateFolder={handleCreateFolder}
                    onAddToFolder={handleAddToFolder}
                    onRemoveFromFolder={handleRemoveFromFolder}
                    onRenameFolder={handleRenameFolder}
                    onUpdateFolderApps={handleUpdateFolderApps}
                />;
        }
    };

    if (!isVisible) return null;
    if (isBooting) return <BootScreen />;

    return (
        <div className="min-h-screen flex items-center justify-center">
            <PhoneShell 
                onHomeClick={goHome} 
                callState={callState} 
                activeCallContact={activeCallContact}
                locale={locale as 'en' | 'fr'}
                wallpaperUrl={currentWallpaperUrl}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                musicState={musicState}
                setMusicState={setMusicState}
                notifications={{
                    missedCalls: callHistory.filter(c => c.isNew && c.direction === CallDirection.MISSED),
                    unreadMessages: conversations.filter(c => c.unread > 0),
                }}
                onClearMissedCalls={handleClearMissedCalls}
                onClearUnreadMessages={handleClearUnreadMessages}
            >
                {callState === 'incoming' && activeCallContact ? (
                    <IncomingCall contact={activeCallContact} onAccept={handleAcceptCall} onDecline={handleDeclineCall} />
                ) : (
                    renderAppContent()
                )}
            </PhoneShell>
        </div>
    );
};

export default App;