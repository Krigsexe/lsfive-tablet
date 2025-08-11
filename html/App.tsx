

import React, { useState, useEffect, useMemo } from 'react';
import { AppType, type Contact, type AppInfo, type CallRecord, type Conversation, type UserData, type Song, type Wallpaper, type Vehicle, type BankAccount, type Business, type Mail as MailType, DispatchAlert, SocialPost, PhoneSettings, CallDirection, MdtCitizen, MdtIncident, MedicalRecord, MechanicInvoice, OnDutyUnit, MusicState, Folder, type BrowserTab } from './types';
import PhoneShell from './components/PhoneShell';
import HomeScreen from './components/HomeScreen';
import MessagesApp from './components/apps/MessagesApp';
import PhoneApp from './components/apps/PhoneApp';
import SettingsApp from './components/apps/SettingsApp';
import MarketplaceApp from './components/apps/MarketplaceApp';
import InCallUI from './components/InCallUI';
import IncomingCall from './components/IncomingCall';
import { ALL_APPS, DEFAULT_WALLPAPERS, DEFAULT_DOCK_APP_IDS } from '../constants';
import { fetchNui } from './nui';
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


const DEFAULT_SETTINGS: PhoneSettings = {
    theme: 'dark',
    airplaneMode: false,
    clockWidgetVisible: true,
    folders: [],
    homeScreenOrder: [],
};

const App: React.FC = () => {
    const { t, locale, setLocale } = useLocale();

    const [isVisible, setIsVisible] = useState(false);
    const [isBooting, setIsBooting] = useState(true);
    const [activeApp, setActiveApp] = useState<AppType | null>(null);
    
    // Data states, populated from NUI
    const [userData, setUserData] = useState<UserData | null>(null);
    const [installedAppIds, setInstalledAppIds] = useState<AppType[]>([]);
    const [dockAppIds, setDockAppIds] = useState<AppType[]>([]);
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
    const [settings, setSettings] = useState<PhoneSettings>(DEFAULT_SETTINGS);
    const [onDuty, setOnDuty] = useState(false);
    
    // Layout states
    const [folders, setFolders] = useState<Folder[]>([]);
    const [homeScreenOrder, setHomeScreenOrder] = useState<string[]>([]);

    // Job-specific data
    const [mdtIncidents, setMdtIncidents] = useState<MdtIncident[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [mechanicInvoices, setMechanicInvoices] = useState<MechanicInvoice[]>([]);
    const [onDutyUnits, setOnDutyUnits] = useState<OnDutyUnit[]>([]);

    // Shared state for music player
    const [musicState, setMusicState] = useState<MusicState>({ currentSong: null, isPlaying: false, progress: 0, duration: 0 });

    // Call states
    const [callState, setCallState] = useState<'idle' | 'incoming' | 'active'>('idle');
    const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);

    const allApps = useMemo(() => ALL_APPS.filter(app => !app.requiredJobs || app.requiredJobs.includes(userData?.job || '')), [userData?.job]);
    const installedApps = useMemo(() => {
        const appMap = new Map(allApps.map(app => [app.id, app]));
        return installedAppIds.map(id => appMap.get(id)).filter((a): a is AppInfo => !!a);
    }, [installedAppIds, allApps]);


    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }, [settings.theme]);

    useEffect(() => {
        const handleNuiMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;
            switch (type) {
                case 'setVisible':
                    if (payload && !isVisible) {
                        setIsBooting(true);
                        setTimeout(() => setIsBooting(false), 2500);
                        fetchNui('phone:server:requestData');
                    }
                    setIsVisible(payload);
                    if (!payload) goHome();
                    break;
                case 'loadData':
                    const { userData: ud, contacts, calls, messages, vehicles, bank, businesses, mails, songs, alerts, social_posts, mdt_incidents, medical_records, mechanic_invoices } = payload;
                    
                    setUserData(ud);
                    setOnDuty(ud.onduty || false);
                    setCurrentWallpaperUrl(ud.wallpaper || DEFAULT_WALLPAPERS[0].url);
                    setLocale(ud.language || 'fr');

                    try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(ud.settings) }); } catch (e) { setSettings(DEFAULT_SETTINGS); }
                    try { setInstalledAppIds(JSON.parse(ud.installed_apps)); } catch (e) { setInstalledAppIds(allApps.filter(a => !a.isRemovable).map(a => a.id)); }
                    try { setDockAppIds(JSON.parse(ud.dock_order)); } catch(e) { setDockAppIds(DEFAULT_DOCK_APP_IDS); }
                    try { setFolders(JSON.parse(ud.folders)); } catch(e) { setFolders([]); }
                    try { 
                        const order = JSON.parse(ud.home_screen_order);
                        setHomeScreenOrder(order.length > 0 ? order : installedApps.map(a => a.id));
                    } catch(e) { setHomeScreenOrder(installedApps.map(a => a.id)); }

                    setContacts(contacts || []);
                    setCallHistory(calls || []);
                    setConversations(messages || []);
                    setVehicles(vehicles || []);
                    setBankAccount(bank || null);
                    setBusinesses(businesses || []);
                    setMails(mails || []);
                    setSongs(songs || []);
                    setAlerts(alerts || []);
                    setSocialPosts(social_posts || []);
                    setMdtIncidents(mdt_incidents || []);
                    setMedicalRecords(medical_records || []);
                    setMechanicInvoices(mechanic_invoices || []);
                    break;
                case 'incomingCall':
                    setActiveCallContact(payload.contact);
                    setCallState('incoming');
                    setIsVisible(true);
                    break;
                case 'updateUnits':
                    setOnDutyUnits(payload.units || []);
                    break;
            }
        };
        window.addEventListener('message', handleNuiMessage);
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') fetchNui('close'); };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('message', handleNuiMessage);
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isVisible, setLocale, allApps, installedApps]);

    const openApp = (app: AppType) => setActiveApp(app);
    const goHome = () => setActiveApp(null);

    const handleAcceptCall = () => { setCallState('active'); fetchNui('call:accept'); };
    const handleDeclineCall = () => { setCallState('idle'); setActiveCallContact(null); fetchNui('call:decline'); };
    const handleEndCall = () => { setCallState('idle'); setActiveCallContact(null); fetchNui('call:end'); goHome(); };
    const handlePlaceCall = (contact: Contact) => { setActiveCallContact(contact); setCallState('active'); setActiveApp(AppType.PHONE); fetchNui('call:start', { phoneNumber: contact.phoneNumber }); };
    const handleUpdateSettings = (newSettings: Partial<PhoneSettings>) => { const updated = { ...settings, ...newSettings }; setSettings(updated); fetchNui('phone:updateSettings', { settings: JSON.stringify(updated) }); };
    const handleSetWallpaper = (url: string) => { setCurrentWallpaperUrl(url); fetchNui('updateWallpaper', { wallpaperUrl: url }); }
    const handleSetLanguage = (lang: 'en' | 'fr') => { setLocale(lang); fetchNui('updateLanguage', { lang }); }
    
    const persistInstalledApps = (newAppIds: AppType[]) => fetchNui('updateInstalledApps', { apps: JSON.stringify(newAppIds) });
    
    const handleInstallApp = (app: AppInfo) => {
        const newAppIds = [...installedAppIds, app.id];
        setInstalledAppIds(newAppIds);
        setHomeScreenOrder(prev => [...prev, app.id]);
        persistInstalledApps(newAppIds);
    };

    const handleUninstallApp = (appToUninstall: AppInfo) => {
        if (!appToUninstall.isRemovable) return;
        const newAppIds = installedAppIds.filter(id => id !== appToUninstall.id);
        setInstalledAppIds(newAppIds);
        persistInstalledApps(newAppIds);

        setDockAppIds(prev => prev.filter(id => id !== appToUninstall.id));
        setHomeScreenOrder(prev => prev.filter(id => id !== appToUninstall.id));
        setFolders(prev => {
            const newFolders = prev.map(f => ({ ...f, appIds: f.appIds.filter(id => id !== appToUninstall.id) }));
            const foldersToDissolve = newFolders.filter(f => f.appIds.length < 2);
            const remainingFolders = newFolders.filter(f => f.appIds.length >= 2);
            const appsFromDissolved = foldersToDissolve.flatMap(f => f.appIds);
            setHomeScreenOrder(p => [...p.filter(id => !foldersToDissolve.some(f => f.id === id)), ...appsFromDissolved]);
            return remainingFolders;
        });
    };
    
    const handleSetDockAppIds = (newDockIds: AppType[]) => { setDockAppIds(newDockIds); fetchNui('updateDockOrder', { dock_order: JSON.stringify(newDockIds) }); };
    
    useEffect(() => { fetchNui('phone:updateLayout', { folders: JSON.stringify(folders), home_screen_order: JSON.stringify(homeScreenOrder) }); }, [folders, homeScreenOrder]);

    const handleCreateFolder = (droppedAppId: AppType, targetAppId: AppType) => { const newFolder: Folder = { id: `folder-${Date.now()}`, name: t('default_folder_name'), appIds: [targetAppId, droppedAppId] }; setFolders(p => [...p, newFolder]); setHomeScreenOrder(p => p.filter(id => id !== droppedAppId).map(id => id === targetAppId ? newFolder.id : id)); setDockAppIds(p => p.filter(id => id !== droppedAppId && id !== targetAppId)); };
    const handleAddToFolder = (folderId: string, appId: AppType) => { setFolders(p => p.map(f => f.id === folderId ? { ...f, appIds: [...f.appIds, appId] } : f)); setHomeScreenOrder(p => p.filter(id => id !== appId)); setDockAppIds(p => p.filter(id => id !== appId)); };
    const handleRemoveFromFolder = (folderId: string, appId: AppType) => { let dissolved = false; setFolders(p => { const nfs = p.map(f => f.id === folderId ? { ...f, appIds: f.appIds.filter(id => id !== appId) } : f); const f = nfs.find(f => f.id === folderId); if (f && f.appIds.length < 2) { dissolved = true; setHomeScreenOrder(po => { const fi = po.indexOf(folderId); const no = [...po]; if (fi !== -1) no.splice(fi, 1, ...f.appIds, appId); else no.push(...f.appIds, appId); return no; }); return nfs.filter(f => f.id !== folderId); } return nfs; }); if (!dissolved) setHomeScreenOrder(p => [...p, appId]); };
    const handleRenameFolder = (folderId: string, newName: string) => setFolders(p => p.map(f => f.id === folderId ? { ...f, name: newName } : f));
    const handleUpdateFolderApps = (folderId: string, newAppIds: AppType[]) => setFolders(p => p.map(f => f.id === folderId ? { ...f, appIds: newAppIds } : f));

    const handleBackup = () => fetchNui('phone:backupData');
    const handleBankTransfer = (data: any) => fetchNui('bank:transfer', data);
    const handleRequestVehicle = (vehicleId: string) => fetchNui('garage:requestVehicle', { vehicleId });
    const handleSetBusinessGPS = (location: Business['location']) => fetchNui('business:setWaypoint', { location });
    const handleCreateAlert = (data: any) => fetchNui('dispatch:createAlert', data);
    const handleSendMail = (data: any) => fetchNui('mail:send', data);
    const handleDeleteMail = (mailId: string) => fetchNui('mail:delete', { mailId });
    const handleSetSongs = (newSongs: Song[]) => { setSongs(newSongs); fetchNui('updateSongs', { songs: newSongs }); }
    const handleCreatePost = (data: any) => fetchNui('social:createPost', data);
    const handleLikePost = (postId: string) => { setSocialPosts(p => p.map(post => post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post)); fetchNui('social:likePost', { postId }); }
    const handleSetDuty = (status: boolean) => { setOnDuty(status); fetchNui('phone:setDuty', { status }); }
    const handleSearchCitizens = async (query: string): Promise<MdtCitizen[]> => (await fetchNui<MdtCitizen[]>('mdt:searchCitizens', { query })) || [];
    const handleCreateIncident = (data: any) => fetchNui('mdt:createIncident', data);
    const handleSearchMedicalRecords = async (query: string): Promise<MedicalRecord[]> => (await fetchNui<MedicalRecord[]>('meditab:searchRecords', { query })) || [];
    const handleCreateMedicalRecord = (data: any) => fetchNui('meditab:createRecord', data);
    const handleSearchVehicleInfo = async (plate: string): Promise<any> => (await fetchNui('mechatab:searchVehicle', { plate })) || null;
    const handleCreateInvoice = (data: any) => fetchNui('mechatab:createInvoice', data);
    const handleClearMissedCalls = () => { if (callHistory.some(c => c.isNew && c.direction === CallDirection.MISSED)) { setCallHistory(p => p.map(call => ({ ...call, isNew: false }))); fetchNui('phone:clearMissedCalls'); } };
    const handleClearUnreadMessages = (phoneNumber: string) => { setConversations(p => p.map(convo => convo.phoneNumber === phoneNumber ? { ...convo, unread: 0 } : convo)); fetchNui('phone:clearUnreadMessages', { phoneNumber }); };
    const handleBrowserStateChange = (newState: { tabs: BrowserTab[], activeTabId: string | null }) => {
        handleUpdateSettings({ browserState: newState });
    };

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
            case AppType.MESSAGES: return <MessagesApp conversations={conversations} myNumber={userData?.phone_number || ""} onViewConversation={handleClearUnreadMessages} />;
            case AppType.SETTINGS: return <SettingsApp myPhoneNumber={userData?.phone_number || "N/A"} currentLanguage={locale as 'en' | 'fr'} onSetLanguage={handleSetLanguage} setCurrentWallpaper={handleSetWallpaper} wallpapers={wallpapers} setWallpapers={(newWallpapers) => { setWallpapers(newWallpapers); fetchNui('updateWallpapers', { wallpapers: newWallpapers }); }} onOpenMarketplace={() => openApp(AppType.MARKETPLACE)} settings={settings} onUpdateSettings={handleUpdateSettings} onBackup={handleBackup} />;
            case AppType.MARKETPLACE: return <MarketplaceApp installedAppIds={installedAppIds} onInstallApp={handleInstallApp} onUninstallApp={handleUninstallApp} userJob={userData?.job || ''} />;
            case AppType.BROWSER: return <BrowserApp initialState={settings.browserState} onStateChange={handleBrowserStateChange} />;
            case AppType.CAMERA: return <CameraApp />;
            case AppType.MUSIC: return <MusicApp songs={songs} setSongs={handleSetSongs} musicState={musicState} setMusicState={setMusicState} />;
            case AppType.GARAGE: return <GarageApp vehicles={vehicles} onRequestVehicle={handleRequestVehicle} />;
            case AppType.BANK: return <BankApp account={bankAccount} onTransfer={handleBankTransfer} />;
            case AppType.BUSINESSES: return <BusinessApp businesses={businesses} onSetGPS={handleSetBusinessGPS} />;
            case AppType.DISPATCH: return <DispatchApp alerts={alerts} onCreateAlert={handleCreateAlert} />;
            case AppType.WEATHER: return <WeatherApp locale={locale as 'en' | 'fr'} />;
            case AppType.MAIL: return <MailApp mails={mails} myEmailAddress={userData?.email || "me@ls.mail"} onSend={handleSendMail} onDelete={handleDeleteMail} />;
            case AppType.SOCIAL: return <SocialApp posts={socialPosts} onCreatePost={handleCreatePost} onLikePost={handleLikePost} />;
            case AppType.MDT: return <MdtApp onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchCitizens={handleSearchCitizens} onCreateIncident={handleCreateIncident} />;
            case AppType.MEDITAB: return <MediTab onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchRecords={handleSearchMedicalRecords} onCreateRecord={handleCreateMedicalRecord} />;
            case AppType.MECHATAB: return <MechaTab onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchVehicle={handleSearchVehicleInfo} onCreateInvoice={handleCreateInvoice} invoices={mechanicInvoices} />;
            case AppType.PHOTOS: case AppType.CLOCK: case AppType.NOTES: case AppType.REMINDERS: case AppType.STOCKS: case AppType.HEALTH: case AppType.WALLET: return <PlaceholderApp appNameKey={activeApp + '_title'} />;
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
                onHomeClick={goHome} callState={callState} activeCallContact={activeCallContact} locale={locale as 'en' | 'fr'} wallpaperUrl={currentWallpaperUrl}
                settings={settings} onUpdateSettings={handleUpdateSettings} musicState={musicState} setMusicState={setMusicState}
                notifications={{ missedCalls: callHistory.filter(c => c.isNew && c.direction === CallDirection.MISSED), unreadMessages: conversations.filter(c => c.unread > 0) }}
                onClearMissedCalls={handleClearMissedCalls} onClearUnreadMessages={handleClearUnreadMessages}
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