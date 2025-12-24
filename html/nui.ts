/**
 * LSFIVE TABLET - NUI Bridge
 * Communication layer between React UI and FiveM client
 */

// Check if we're running in FiveM NUI context
const isInGame = (): boolean => {
    return typeof (window as any).GetParentResourceName === 'function';
};

// Get resource name
const getResourceName = (): string => {
    if (isInGame()) {
        return (window as any).GetParentResourceName();
    }
    return 'lsfive-tablet';
};

/**
 * Send a request to the FiveM client
 * @param eventName - The name of the NUI callback event
 * @param data - The data to be sent to the NUI callback
 * @returns - A promise resolving with the response data
 */
export async function fetchNui<T>(eventName: string, data: unknown = {}): Promise<T | null> {
    const resourceName = getResourceName();

    if (!isInGame()) {
        // Browser dev mode - return mock data or null
        console.log(`[NUI Dev] ${eventName}:`, data);
        return null;
    }

    try {
        const resp = await fetch(`https://${resourceName}/${eventName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(data),
        });

        if (!resp.ok) {
            console.error(`[NUI] Failed to fetch ${eventName}. Status: ${resp.status}`);
            return null;
        }

        const responseData = await resp.json();
        return responseData as T;
    } catch (e) {
        // Expected in browser environment
        console.log(`[NUI] ${eventName} - Browser mode`);
        return null;
    }
}

/**
 * Register a NUI message listener
 * @param handler - Callback function to handle incoming messages
 */
export function useNuiEvent<T = any>(
    action: string,
    handler: (data: T) => void
): void {
    const eventListener = (event: MessageEvent) => {
        const { type, ...data } = event.data;

        if (type === action) {
            handler(data.data || data);
        }
    };

    window.addEventListener('message', eventListener);
}

/**
 * Close the tablet (send close request to client)
 */
export async function closeTablet(): Promise<void> {
    await fetchNui('closeTablet');
}

/**
 * Get player data from client
 */
export interface PlayerData {
    job: string;
    jobGroup: string | null;
    identifier: string;
    onDuty: boolean;
}

export async function getPlayerData(): Promise<PlayerData | null> {
    return fetchNui<PlayerData>('getPlayerData');
}

// =====================================================
// CONTACTS
// =====================================================

export interface NuiContact {
    id: number;
    name: string;
    phone_number: string;
    avatar_url?: string;
}

export async function getContacts(): Promise<NuiContact[]> {
    const result = await fetchNui<NuiContact[]>('getContacts');
    return result || [];
}

export async function addContact(data: { name: string; phoneNumber: string; avatarUrl?: string }): Promise<void> {
    await fetchNui('addContact', data);
}

export async function deleteContact(id: number): Promise<void> {
    await fetchNui('deleteContact', { id });
}

// =====================================================
// MESSAGES
// =====================================================

export interface NuiMessage {
    id: number;
    content: string;
    timestamp: string;
    isSender: boolean;
}

export interface NuiConversation {
    phoneNumber: string;
    contactName: string;
    avatarUrl?: string;
    messages: NuiMessage[];
    lastMessage: string;
    timestamp: string;
    unread: number;
}

export async function getConversations(): Promise<NuiConversation[]> {
    const result = await fetchNui<NuiConversation[]>('getConversations');
    return result || [];
}

export async function sendMessage(data: { phoneNumber: string; content: string }): Promise<void> {
    await fetchNui('sendMessage', data);
}

// =====================================================
// CALLS
// =====================================================

export interface NuiCallRecord {
    id: number;
    contact: {
        id: number;
        name: string;
        phoneNumber: string;
        avatarUrl?: string;
    };
    direction: 'incoming' | 'outgoing' | 'missed';
    timestamp: string;
    isNew: boolean;
}

export async function getCallHistory(): Promise<NuiCallRecord[]> {
    const result = await fetchNui<NuiCallRecord[]>('getCallHistory');
    return result || [];
}

export async function makeCall(phoneNumber: string): Promise<void> {
    await fetchNui('makeCall', { phoneNumber });
}

export async function endCall(): Promise<void> {
    await fetchNui('endCall');
}

// =====================================================
// BANK
// =====================================================

export interface NuiTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
}

export interface NuiBankAccount {
    balance: number;
    transactions: NuiTransaction[];
}

export async function getBankAccount(): Promise<NuiBankAccount> {
    const result = await fetchNui<NuiBankAccount>('getBankAccount');
    return result || { balance: 0, transactions: [] };
}

export async function transferMoney(data: { phoneNumber: string; amount: number }): Promise<void> {
    await fetchNui('transferMoney', data);
}

// =====================================================
// VEHICLES
// =====================================================

export interface NuiVehicle {
    id: string;
    name: string;
    plate: string;
    status: 'garaged' | 'out' | 'impounded';
    imageUrl?: string;
}

export async function getVehicles(): Promise<NuiVehicle[]> {
    const result = await fetchNui<NuiVehicle[]>('getVehicles');
    return result || [];
}

export async function requestVehicle(id: string): Promise<void> {
    await fetchNui('requestVehicle', { id });
}

// =====================================================
// DISPATCH
// =====================================================

export interface NuiDispatchAlert {
    id: number;
    department: 'police' | 'ambulance' | 'fire' | 'citizen';
    title: string;
    details: string;
    location: string;
    timestamp: string;
}

export async function getDispatchAlerts(): Promise<NuiDispatchAlert[]> {
    const result = await fetchNui<NuiDispatchAlert[]>('getDispatchAlerts');
    return result || [];
}

export async function createDispatchAlert(data: {
    department: string;
    title: string;
    details: string;
    location: string;
}): Promise<void> {
    await fetchNui('createDispatchAlert', data);
}

// =====================================================
// MUSIC
// =====================================================

export interface NuiSong {
    id: string;
    title: string;
    artist: string;
    url: string;
}

export async function getSongs(): Promise<NuiSong[]> {
    const result = await fetchNui<NuiSong[]>('getSongs');
    return result || [];
}

export async function addSong(data: { title: string; artist: string; url: string }): Promise<void> {
    await fetchNui('addSong', data);
}

export async function deleteSong(id: string): Promise<void> {
    await fetchNui('deleteSong', { id });
}

// =====================================================
// MAIL
// =====================================================

export interface NuiMail {
    id: string;
    from: string;
    subject: string;
    body: string;
    timestamp: string;
    isRead: boolean;
}

export async function getMails(): Promise<NuiMail[]> {
    const result = await fetchNui<NuiMail[]>('getMails');
    return result || [];
}

export async function sendMail(data: { to: string; subject: string; body: string }): Promise<void> {
    await fetchNui('sendMail', data);
}

export async function deleteMail(id: string): Promise<void> {
    await fetchNui('deleteMail', { id });
}

// =====================================================
// SOCIAL
// =====================================================

export interface NuiSocialPost {
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    imageUrl?: string;
    caption: string;
    likes: number;
    isLiked: boolean;
    timestamp: string;
}

export async function getSocialPosts(): Promise<NuiSocialPost[]> {
    const result = await fetchNui<NuiSocialPost[]>('getSocialPosts');
    return result || [];
}

export async function createSocialPost(data: { caption: string; imageUrl?: string }): Promise<void> {
    await fetchNui('createSocialPost', data);
}

export async function toggleLikePost(id: string): Promise<void> {
    await fetchNui('toggleLikePost', { id });
}

// =====================================================
// BUSINESSES
// =====================================================

export interface NuiBusiness {
    id: string;
    name: string;
    type: string;
    owner: string;
    logoUrl?: string;
    description: string;
    location: { x: number; y: number; z: number };
}

export async function getBusinesses(): Promise<NuiBusiness[]> {
    const result = await fetchNui<NuiBusiness[]>('getBusinesses');
    return result || [];
}

export async function setGPS(coords: { x: number; y: number }): Promise<void> {
    await fetchNui('setGPS', coords);
}

// =====================================================
// MDT (Law Enforcement)
// =====================================================

export interface NuiMdtCitizen {
    identifier: string;
    name: string;
    dateofbirth: string;
    gender: 'Male' | 'Female' | 'Other';
    image_url?: string;
    phone_number?: string;
}

export interface NuiOnDutyUnit {
    identifier: string;
    name: string;
    pos: { x: number; y: number; z: number };
}

export async function mdtSearchCitizens(query: string): Promise<NuiMdtCitizen[]> {
    const result = await fetchNui<NuiMdtCitizen[]>('mdtSearchCitizens', { query });
    return result || [];
}

export async function getOnDutyUnits(): Promise<NuiOnDutyUnit[]> {
    const result = await fetchNui<NuiOnDutyUnit[]>('getOnDutyUnits');
    return result || [];
}

export async function mdtCreateIncident(data: {
    title: string;
    officers: string[];
    civilians: string[];
}): Promise<void> {
    await fetchNui('mdtCreateIncident', data);
}

export async function toggleDuty(): Promise<void> {
    await fetchNui('toggleDuty');
}

// =====================================================
// MEDITAB (EMS)
// =====================================================

export interface NuiMedicalRecord {
    id: number;
    patient_identifier: string;
    timestamp: string;
    doctor: string;
    diagnosis: string;
    treatment: string;
    notes: string;
}

export async function mediSearchRecords(query: string): Promise<NuiMedicalRecord[]> {
    const result = await fetchNui<NuiMedicalRecord[]>('mediSearchRecords', { query });
    return result || [];
}

export async function mediCreateRecord(data: {
    patientId: string;
    patientName: string;
    diagnosis: string;
    treatment: string;
    notes: string;
}): Promise<void> {
    await fetchNui('mediCreateRecord', data);
}

// =====================================================
// MECHATAB (Mechanics)
// =====================================================

export interface NuiMechaVehicle {
    plate: string;
    model: string;
    owner: string;
}

export interface NuiMechaInvoice {
    id: number;
    customer_name: string;
    vehicle_plate: string;
    mechanic: string;
    timestamp: string;
    services: { name: string; price: number }[];
    total: number;
    is_paid: boolean;
}

export async function mechaSearchVehicle(plate: string): Promise<NuiMechaVehicle | null> {
    return fetchNui<NuiMechaVehicle>('mechaSearchVehicle', { plate });
}

export async function mechaCreateInvoice(data: {
    customerName: string;
    vehiclePlate: string;
    services: { name: string; price: number }[];
    total: number;
}): Promise<void> {
    await fetchNui('mechaCreateInvoice', data);
}

export async function mechaGetInvoices(): Promise<NuiMechaInvoice[]> {
    const result = await fetchNui<NuiMechaInvoice[]>('mechaGetInvoices');
    return result || [];
}

// =====================================================
// SETTINGS
// =====================================================

export interface NuiSettings {
    settings: Record<string, any>;
    installedApps: string[];
    dockOrder: string[];
}

export async function getSettings(): Promise<NuiSettings> {
    const result = await fetchNui<NuiSettings>('getSettings');
    return result || { settings: {}, installedApps: [], dockOrder: [] };
}

export async function saveSettings(data: NuiSettings): Promise<void> {
    await fetchNui('saveSettings', data);
}

// =====================================================
// CAMERA
// =====================================================

export interface PhotoResult {
    success: boolean;
    url?: string;
    message?: string;
}

export async function takePhoto(): Promise<PhotoResult> {
    const result = await fetchNui<PhotoResult>('takePhoto');
    return result || { success: false, message: 'Failed to take photo' };
}

// =====================================================
// KEYBOARD HANDLER
// =====================================================

/**
 * Set up keyboard listener for closing tablet with Escape
 */
export function setupKeyboardHandler(): void {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeTablet();
        }
    });
}

// Initialize keyboard handler
if (typeof window !== 'undefined') {
    setupKeyboardHandler();
}
