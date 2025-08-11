
# LSFive Tablet - Documentation de Développement

Ce document sert de guide central pour les développeurs souhaitant comprendre, personnaliser ou étendre la ressource LSFive Tablet.

## Architecture Générale

La ressource est bâtie sur une architecture moderne séparant clairement l'interface utilisateur de la logique serveur :

1.  **Frontend (UI) :** Un projet en **React + TypeScript** situé dans le dossier `/html`. Il gère tout l'affichage et les interactions utilisateur. Il est conçu pour être une Single-Page Application (SPA).
2.  **Backend (Logique Serveur) :** Des scripts **Lua** situés dans les dossiers `/client` et `/server`. Ils gèrent la logique côté jeu, les interactions avec la base de données et l'intégration avec le framework du serveur (ESX, QBCore).
3.  **Pont NUI :** La communication entre le Frontend et le Backend se fait exclusivement via le [pont NUI de FiveM](https://docs.fivem.net/docs/scripting-reference/nui/messaging/). Le fichier `html/nui.ts` abstrait cette communication avec une fonction `fetchNui`.

### Flux de Données Typique

1.  **Ouverture :** Le joueur ouvre la tablette. `client/main.lua` envoie un message NUI (`setVisible`) et demande les données au serveur (`phone:server:requestData`).
2.  **Chargement :** `server/main.lua` reçoit la demande, récupère toutes les données du joueur (contacts, messages, réglages, données métiers, etc.) depuis la base de données.
3.  **Hydratation :** Le serveur envoie un événement client (`phone:client:loadData`) avec toutes les données. Le client relaie ces données à l'UI React via un message NUI (`loadData`).
4.  **Rendu :** Le composant principal `html/App.tsx` reçoit les données, met à jour son état, et passe les informations aux applications enfants, qui se rendent avec les bonnes données.
5.  **Interaction :** L'utilisateur clique sur un bouton (ex: "Transférer" dans la banque). L'application React appelle `fetchNui('bank:transfer', { ... })`.
6.  **Action :** `client/main.lua` reçoit le callback NUI et le transmet à `server/main.lua`. Le serveur exécute la logique (vérifie le solde, met à jour la base de données) et retourne une réponse de succès ou d'échec.

---

## Guide : Ajouter une Nouvelle Application

Voici les étapes pour ajouter une nouvelle application simple à la tablette.

1.  **Définir le Type d'App (`html/types.ts`)**
    Ajoutez une nouvelle entrée à l'énumération `AppType`.
    ```ts
    export enum AppType {
        // ... autres apps
        REPORTS = 'reports' // Notre nouvelle app
    }
    ```

2.  **Créer le Composant React (`html/components/apps/`)**
    Créez un nouveau fichier `ReportsApp.tsx`.
    ```tsx
    import React from 'react';
    import { FileText } from 'lucide-react';

    const ReportsApp: React.FC = () => {
        return (
            <div className="h-full bg-transparent flex flex-col items-center justify-center text-white">
                <FileText size={64} className="text-neutral-500 mb-4" />
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-slate-400 mt-2">View incident reports here.</p>
            </div>
        );
    };

    export default ReportsApp;
    ```

3.  **Enregistrer l'Application (`html/constants.ts`)**
    Ajoutez votre nouvelle application à la liste `ALL_APPS`. C'est ici que vous définissez son icône, son nom (clé de traduction), sa couleur, et si elle est désinstallable.
    ```ts
    import { FileText } from 'lucide-react';
    
    export const ALL_APPS: AppInfo[] = [
        // ... autres apps
        { id: AppType.REPORTS, name: 'reports_title', icon: FileText, color: 'text-white', bgColor: 'bg-slate-600', isRemovable: true, requiredJobs: ['lspd'] },
    ];
    ```

4.  **Ajouter la Traduction (`html/locales/`)**
    Ajoutez la clé `reports_title` dans `en.json` et `fr.json`.
    ```json
    // en.json
    {
        "reports_title": "Reports",
        // ...
    }
    ```

5.  **Intégrer dans le "Router" (`html/App.tsx`)**
    Importez votre composant et ajoutez un `case` au `switch` dans la fonction `renderAppContent`.
    ```tsx
    // ... imports
    import ReportsApp from './components/apps/ReportsApp';

    const renderAppContent = () => {
        switch (activeApp) {
            // ... autres cases
            case AppType.REPORTS: return <ReportsApp />;
            default:
                return <HomeScreen ... />;
        }
    };
    ```
Et voilà ! Votre application est maintenant intégrée. Pour ajouter une logique backend, utilisez `fetchNui` dans votre composant et ajoutez les gestionnaires correspondants dans les fichiers Lua.

---

## Fichiers Clés de Référence (Version Tablette)

Voici le contenu des fichiers les plus importants comme référence pour le développement.

### `html/App.tsx` (Logique principale de l'UI)
```tsx
import React, { useState, useEffect, useMemo } from 'react';
import { AppType, type Contact, type AppInfo, type CallRecord, type Conversation, type UserData, type Song, type Wallpaper, type Vehicle, type BankAccount, type Business, type Mail as MailType, DispatchAlert, SocialPost, PhoneSettings, CallDirection, MdtCitizen, MdtIncident, MedicalRecord, MechanicInvoice, OnDutyUnit } from './types';
import PhoneShell from './components/PhoneShell';
import HomeScreen from './components/HomeScreen';
import MessagesApp from './components/apps/MessagesApp';
import PhoneApp from './components/apps/PhoneApp';
import SettingsApp from './components/apps/SettingsApp';
import MarketplaceApp from './components/apps/MarketplaceApp';
import InCallUI from './components/InCallUI';
import IncomingCall from './components/IncomingCall';
import { ALL_APPS, DEFAULT_WALLPAPERS, DEFAULT_DOCK_APP_IDS } from './constants';
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
};

const App: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isBooting, setIsBooting] = useState(true);
    const [activeApp, setActiveApp] = useState<AppType | null>(null);
    
    // Data states, populated from NUI
    const [userData, setUserData] = useState<UserData | null>(null);
    const [installedApps, setInstalledApps] = useState<AppInfo[]>([]);
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

    // Job-specific data
    const [mdtIncidents, setMdtIncidents] = useState<MdtIncident[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [mechanicInvoices, setMechanicInvoices] = useState<MechanicInvoice[]>([]);
    const [onDutyUnits, setOnDutyUnits] = useState<OnDutyUnit[]>([]);

    // Call states
    const [callState, setCallState] = useState<'idle' | 'incoming' | 'active'>('idle');
    const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);

    const { locale, setLocale } = useLocale();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }, [settings.theme]);

    useEffect(() => {
        const handleNuiMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;
            switch (type) {
                case 'setVisible':
                    if (payload && isVisible === false) { // Phone is being opened
                        setIsBooting(true);
                        setTimeout(() => setIsBooting(false), 2500);
                        fetchNui('phone:server:requestData');
                    }
                    setIsVisible(payload);
                    if (!payload) goHome(); // Go home when phone is closed
                    break;
                case 'loadData':
                    const { userData: loadedUserData, contacts: loadedContacts, calls: loadedCalls, messages: loadedMessages, vehicles, bank, businesses, mails, songs: loadedSongs, alerts: loadedAlerts, social_posts, mdt_incidents, medical_records, mechanic_invoices } = payload;
                    
                    setUserData(loadedUserData);
                    setOnDuty(loadedUserData.onduty || false);
                    setCurrentWallpaperUrl(loadedUserData.wallpaper || DEFAULT_WALLPAPERS[0].url);
                    setLocale(loadedUserData.language || 'fr');

                    try {
                        const parsedSettings = JSON.parse(loadedUserData.settings);
                        setSettings(parsedSettings);
                    } catch (e) {
                        setSettings(DEFAULT_SETTINGS);
                    }

                    try {
                        const installedIds = JSON.parse(loadedUserData.installed_apps);
                        const allAvailableApps = ALL_APPS.filter(app => !app.requiredJobs || app.requiredJobs.includes(loadedUserData.job));
                        const appsMap = new Map(allAvailableApps.map(app => [app.id, app]));
                        
                        const orderedApps = installedIds
                            .map((id: AppType) => appsMap.get(id))
                            .filter((app: AppInfo | undefined): app is AppInfo => !!app);
                        
                        const presentAppIds = new Set(orderedApps.map(app => app.id));
                        const missingApps = allAvailableApps.filter(app => !presentAppIds.has(app.id) && !app.isRemovable);

                        setInstalledApps([...orderedApps, ...missingApps]);
                    } catch (e) {
                        const defaultApps = ALL_APPS.filter(app => !app.isRemovable && (!app.requiredJobs || app.requiredJobs.includes(loadedUserData.job)));
                        setInstalledApps(defaultApps);
                    }
                    
                    try {
                        const storedDock = JSON.parse(loadedUserData.dock_order);
                        setDockAppIds(storedDock);
                    } catch(e) {
                        setDockAppIds(DEFAULT_DOCK_APP_IDS);
                    }
                    
                    setContacts(loadedContacts || []);
                    setCallHistory(loadedCalls || []);
                    setConversations(loadedMessages || []);
                    setVehicles(vehicles || []);
                    setBankAccount(bank || null);
                    setBusinesses(businesses || []);
                    setMails(mails || []);
                    setSongs(loadedSongs || []);
                    setAlerts(loadedAlerts || []);
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
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                fetchNui('close');
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('message', handleNuiMessage);
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isVisible, setLocale]);

    const openApp = (app: AppType) => setActiveApp(app);
    const goHome = () => setActiveApp(null);

    // Call Actions
    const handleAcceptCall = () => { setCallState('active'); fetchNui('call:accept'); };
    const handleDeclineCall = () => { setCallState('idle'); setActiveCallContact(null); fetchNui('call:decline'); };
    const handleEndCall = () => { setCallState('idle'); setActiveCallContact(null); fetchNui('call:end'); goHome(); };
    const handlePlaceCall = (contact: Contact) => { setActiveCallContact(contact); setCallState('active'); setActiveApp(AppType.PHONE); fetchNui('call:start', { phoneNumber: contact.phoneNumber }); };

    // Settings Actions
    const handleUpdateSettings = (newSettings: Partial<PhoneSettings>) => {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        fetchNui('phone:updateSettings', { settings: JSON.stringify(updatedSettings) });
    };
    const handleSetWallpaper = (url: string) => { setCurrentWallpaperUrl(url); fetchNui('updateWallpaper', { wallpaperUrl: url }); }
    const handleSetLanguage = (lang: 'en' | 'fr') => { setLocale(lang); fetchNui('updateLanguage', { lang }); }
    const handleSetApps = (newApps: AppInfo[]) => { setInstalledApps(newApps); const appIds = newApps.map(app => app.id); fetchNui('updateInstalledApps', { apps: JSON.stringify(appIds) }); }
    const handleSetDockAppIds = (newDockIds: AppType[]) => { setDockAppIds(newDockIds); fetchNui('updateDockOrder', { dock_order: JSON.stringify(newDockIds) }); };
    const handleBackup = () => fetchNui('phone:backupData');

    // App-specific Actions
    const handleBankTransfer = (data: { recipient: string, amount: string, reason: string }) => fetchNui('bank:transfer', data);
    const handleRequestVehicle = (vehicleId: string) => fetchNui('garage:requestVehicle', { vehicleId });
    const handleSetBusinessGPS = (location: Business['location']) => fetchNui('business:setWaypoint', { location });
    const handleCreateAlert = (data: { title: string, details: string, location: string }) => fetchNui('dispatch:createAlert', data);
    const handleSendMail = (data: { to: string, subject: string, body: string }) => fetchNui('mail:send', data);
    const handleDeleteMail = (mailId: string) => fetchNui('mail:delete', { mailId });
    const handleSetSongs = (newSongs: Song[]) => { setSongs(newSongs); fetchNui('updateSongs', { songs: newSongs }); }
    const handleCreatePost = (data: { imageUrl: string, caption: string }) => fetchNui('social:createPost', data);
    const handleLikePost = (postId: string) => {
        setSocialPosts(socialPosts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
        fetchNui('social:likePost', { postId });
    }
    const handleSetDuty = (status: boolean) => { setOnDuty(status); fetchNui('phone:setDuty', { status }); }

    // Job-specific action handlers
    const handleSearchCitizens = async (query: string): Promise<MdtCitizen[]> => (await fetchNui<MdtCitizen[]>('mdt:searchCitizens', { query })) || [];
    const handleCreateIncident = (data: any) => fetchNui('mdt:createIncident', data);
    const handleSearchMedicalRecords = async (query: string): Promise<MedicalRecord[]> => (await fetchNui<MedicalRecord[]>('meditab:searchRecords', { query })) || [];
    const handleCreateMedicalRecord = (data: any) => fetchNui('meditab:createRecord', data);
    const handleSearchVehicleInfo = async (plate: string): Promise<any> => (await fetchNui('mechatab:searchVehicle', { plate })) || null;
    const handleCreateInvoice = (data: any) => fetchNui('mechatab:createInvoice', data);


    // Notification Handlers
    const handleClearMissedCalls = () => {
        if (callHistory.some(c => c.isNew && c.direction === CallDirection.MISSED)) {
            setCallHistory(prev => prev.map(call => ({ ...call, isNew: false })));
            fetchNui('phone:clearMissedCalls');
        }
    };
    const handleClearUnreadMessages = (phoneNumber: string) => {
        setConversations(prev => prev.map(convo => convo.phoneNumber === phoneNumber ? { ...convo, unread: 0 } : convo));
        fetchNui('phone:clearUnreadMessages', { phoneNumber });
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
            case AppType.SETTINGS:
                return <SettingsApp myPhoneNumber={userData?.phone_number || "N/A"} currentLanguage={locale as 'en' | 'fr'} onSetLanguage={handleSetLanguage} setCurrentWallpaper={handleSetWallpaper} wallpapers={wallpapers} setWallpapers={(newWallpapers) => { setWallpapers(newWallpapers); fetchNui('updateWallpapers', { wallpapers: newWallpapers }); }} onOpenMarketplace={() => openApp(AppType.MARKETPLACE)} settings={settings} onUpdateSettings={handleUpdateSettings} onBackup={handleBackup} />;
            case AppType.MARKETPLACE: return <MarketplaceApp installedApps={installedApps} setInstalledApps={handleSetApps} userJob={userData?.job || 'unemployed'} />;
            case AppType.BROWSER: return <BrowserApp initialState={settings.browserState} onStateChange={(browserState) => handleUpdateSettings({ browserState })} />;
            case AppType.CAMERA: return <CameraApp />;
            case AppType.MUSIC: return <MusicApp songs={songs} setSongs={handleSetSongs} />;
            case AppType.GARAGE: return <GarageApp vehicles={vehicles} onRequestVehicle={handleRequestVehicle} />;
            case AppType.BANK: return <BankApp account={bankAccount} onTransfer={handleBankTransfer} />;
            case AppType.BUSINESSES: return <BusinessApp businesses={businesses} onSetGPS={handleSetBusinessGPS} />;
            case AppType.DISPATCH: return <DispatchApp alerts={alerts} onCreateAlert={handleCreateAlert} />;
            case AppType.WEATHER: return <WeatherApp locale={locale as 'en' | 'fr'} />;
            case AppType.MAIL: return <MailApp mails={mails} myEmailAddress={userData?.email || "me@ls.mail"} onSend={handleSendMail} onDelete={handleDeleteMail} />;
            case AppType.SOCIAL: return <SocialApp posts={socialPosts} onCreatePost={handleCreatePost} onLikePost={handleLikePost} />;
            
            // Job Apps
            case AppType.MDT: return <MdtApp onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchCitizens={handleSearchCitizens} onCreateIncident={handleCreateIncident} />;
            case AppType.MEDITAB: return <MediTab onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchRecords={handleSearchMedicalRecords} onCreateRecord={handleCreateMedicalRecord} />;
            case AppType.MECHATAB: return <MechaTab onSetDuty={handleSetDuty} onDuty={onDuty} onDutyUnits={onDutyUnits} onSearchVehicle={handleSearchVehicleInfo} onCreateInvoice={handleCreateInvoice} invoices={mechanicInvoices} />;

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
                    setApps={handleSetApps} 
                    dockAppIds={dockAppIds}
                    setDockAppIds={handleSetDockAppIds}
                    onOpenApp={openApp} 
                    locale={locale as 'en' | 'fr'} 
                />;
        }
    };

    if (!isVisible) return null;

    if (isBooting) {
        return <BootScreen />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <PhoneShell 
                onHomeClick={goHome} 
                callState={callState} 
                activeCallContact={activeCallContact}
                locale={locale as 'en' | 'fr'}
                wallpaperUrl={currentWallpaperUrl}
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
```
