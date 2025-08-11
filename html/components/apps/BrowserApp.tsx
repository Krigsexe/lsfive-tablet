import React, { useState, useRef, KeyboardEvent, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Lock, Share, Bookmark, X, Home, Plus } from 'lucide-react';
import type { BrowserTab as Tab } from '../../types';

interface BrowserAppProps {
    initialState?: {
        tabs: Tab[];
        activeTabId: string | null;
    };
    onStateChange: (newState: { tabs: Tab[], activeTabId: string | null }) => void;
}

const HOME_URL = 'https://www.google.com/webhp?igu=1';

const getInitialState = (initialStateFromProps?: BrowserAppProps['initialState']): { tabs: Tab[], activeTabId: string | null } => {
    if (initialStateFromProps && Array.isArray(initialStateFromProps.tabs) && initialStateFromProps.tabs.length > 0) {
         const activeTabExists = initialStateFromProps.tabs.some(t => t.id === initialStateFromProps.activeTabId);
        return {
            tabs: initialStateFromProps.tabs,
            activeTabId: activeTabExists ? initialStateFromProps.activeTabId : initialStateFromProps.tabs[0]?.id || null,
        };
    }
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = { id: newTabId, title: 'New Tab', url: HOME_URL, history: [HOME_URL], historyIndex: 0 };
    return { tabs: [newTab], activeTabId: newTabId };
}


const BrowserApp: React.FC<BrowserAppProps> = ({ initialState, onStateChange }) => {
    const [browserInitState] = useState(() => getInitialState(initialState));
    const [tabs, setTabs] = useState<Tab[]>(browserInitState.tabs);
    const [activeTabId, setActiveTabId] = useState<string | null>(browserInitState.activeTabId);
    
    const [urlBarInput, setUrlBarInput] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // This effect will notify the parent component (App.tsx) of state changes
    useEffect(() => {
        onStateChange({ tabs, activeTabId });
    }, [tabs, activeTabId]);

    const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId), [tabs, activeTabId]);

    // Effect to sync URL bar with active tab's URL
    useEffect(() => {
        if (activeTab) {
            setUrlBarInput(activeTab.url);
        }
    }, [activeTab]);

    const updateTab = (tabId: string, updates: Partial<Tab>) => {
        setTabs(prevTabs => prevTabs.map(t => t.id === tabId ? { ...t, ...updates } : t));
    };

    const navigate = (url: string) => {
        if (!activeTab) return;

        let fullUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            try {
                new URL(`https://${url}`);
                fullUrl = `https://${url}`;
            } catch (e) {
                fullUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            }
        }
        
        const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
        newHistory.push(fullUrl);

        updateTab(activeTab.id, {
            url: fullUrl,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            title: "Loading..." // temporary title
        });
    };

    const handleNewTab = () => {
        const newTabId = `tab-${Date.now()}`;
        const newTab: Tab = {
            id: newTabId,
            title: 'New Tab',
            url: HOME_URL,
            history: [HOME_URL],
            historyIndex: 0
        };
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTabId);
    };

    const handleCloseTab = (e: React.MouseEvent, tabIdToClose: string) => {
        e.stopPropagation(); // prevent switching to the tab before closing it
        const tabIndex = tabs.findIndex(t => t.id === tabIdToClose);
        const newTabs = tabs.filter(t => t.id !== tabIdToClose);

        if (newTabs.length === 0) {
            // If all tabs are closed, create a new fresh one
            const newTabId = `tab-${Date.now()}`;
            const newTab: Tab = { id: newTabId, title: 'New Tab', url: HOME_URL, history: [HOME_URL], historyIndex: 0 };
            setTabs([newTab]);
            setActiveTabId(newTabId);
        } else if (activeTabId === tabIdToClose) {
            // If the active tab is closed, activate the one before it, or the first one
            const newActiveIndex = Math.max(0, tabIndex - 1);
            setActiveTabId(newTabs[newActiveIndex].id);
            setTabs(newTabs);
        } else {
            setTabs(newTabs);
        }
    };

    const goBack = () => {
        if (activeTab && activeTab.historyIndex > 0) {
            const newHistoryIndex = activeTab.historyIndex - 1;
            updateTab(activeTab.id, {
                historyIndex: newHistoryIndex,
                url: activeTab.history[newHistoryIndex]
            });
        }
    };

    const goForward = () => {
        if (activeTab && activeTab.historyIndex < activeTab.history.length - 1) {
            const newHistoryIndex = activeTab.historyIndex + 1;
            updateTab(activeTab.id, {
                historyIndex: newHistoryIndex,
                url: activeTab.history[newHistoryIndex]
            });
        }
    };

    const reload = () => {
        if (iframeRef.current) {
            iframeRef.current.src = 'about:blank';
            setTimeout(() => {
                if (iframeRef.current && activeTab) iframeRef.current.src = activeTab.url;
            }, 10);
        }
    };
    
    const goHome = () => {
        if (activeTab) {
            navigate(HOME_URL);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate(urlBarInput);
            e.currentTarget.blur();
        }
    };
    
    const displayUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.protocol === 'https:' || urlObj.protocol === 'http:') {
                return urlObj.hostname.replace('www.', '');
            }
        } catch (e) {}
        return "Loading...";
    }

    const handleIframeLoad = () => {
        if (!activeTab || !iframeRef.current) return;
        try {
            const title = iframeRef.current.contentDocument?.title || displayUrl(activeTab.url);
            if (title && title !== activeTab.title) {
                updateTab(activeTab.id, { title: title.substring(0, 25) + (title.length > 25 ? '...' : '') });
            }
        } catch (e) {
            // Cross-origin error, fallback to URL
             updateTab(activeTab.id, { title: displayUrl(activeTab.url) });
        }
    };

    return (
        <div className="h-full bg-neutral-200 flex flex-col">
            <div className="flex-shrink-0 bg-neutral-300/80 backdrop-blur-sm p-1 pt-2 flex items-center gap-1">
                <div className="flex-grow flex items-center overflow-x-auto">
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTabId(tab.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer border-b-2 transition-colors flex-shrink-0 max-w-[180px] ${
                                activeTabId === tab.id ? 'bg-neutral-200 border-blue-500' : 'bg-transparent border-transparent hover:bg-black/5'
                            }`}
                        >
                            <span className="text-sm font-medium text-neutral-800 truncate">{tab.title}</span>
                             <button onClick={(e) => handleCloseTab(e, tab.id)} className="p-0.5 rounded-full hover:bg-black/10 text-neutral-600">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                 <button onClick={handleNewTab} className="p-2 rounded-md hover:bg-black/10 text-neutral-600 flex-shrink-0">
                    <Plus size={18} />
                </button>
            </div>
            
            <header className="flex-shrink-0 p-3 bg-neutral-100 border-b border-neutral-200 flex items-center gap-2">
                <div className="flex items-center gap-1 text-neutral-600">
                    <button onClick={goBack} disabled={!activeTab || activeTab.historyIndex === 0} className="p-1 disabled:text-neutral-300"><ChevronLeft size={24} /></button>
                    <button onClick={goForward} disabled={!activeTab || activeTab.historyIndex >= activeTab.history.length - 1} className="p-1 disabled:text-neutral-300"><ChevronRight size={24} /></button>
                </div>
                <div className="flex-grow bg-neutral-200 rounded-lg text-sm text-neutral-800 flex items-center px-2 py-1.5 relative">
                    <Lock size={14} className="mr-2 text-neutral-500" />
                    <input 
                        type="text"
                        value={urlBarInput}
                        onChange={(e) => setUrlBarInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent w-full focus:outline-none"
                        placeholder="Search or type URL"
                        disabled={!activeTab}
                    />
                </div>
                <button onClick={reload} disabled={!activeTab} className="text-neutral-600 p-1 disabled:text-neutral-300">
                    <RefreshCw size={20} />
                </button>
            </header>
            
            <main className="flex-grow overflow-hidden bg-neutral-50">
                 <iframe 
                    key={activeTab?.url}
                    ref={iframeRef}
                    src={activeTab?.url || 'about:blank'}
                    className="w-full h-full border-none"
                    title="Browser"
                    onLoad={handleIframeLoad}
                    sandbox="allow-scripts allow-forms allow-same-origin"
                ></iframe>
            </main>
             <footer className="flex-shrink-0 flex justify-around items-center py-2 bg-neutral-100/80 backdrop-blur-sm border-t border-neutral-200 text-blue-500">
                 <button onClick={goHome} className="p-2"><Home size={24} /></button>
                 <button className="p-2"><Share size={24} /></button>
                 <button className="p-2"><Bookmark size={24} /></button>
            </footer>
        </div>
    );
};

export default BrowserApp;