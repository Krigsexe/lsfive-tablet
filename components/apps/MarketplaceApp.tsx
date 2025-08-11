

import React, { useState } from 'react';
import { ALL_APPS } from '../../constants';
import type { AppInfo, AppType } from '../../types';
import { useLocale } from '../../i18n';
import { LoaderCircle } from 'lucide-react';

interface MarketplaceAppProps {
    installedAppIds: AppType[];
    onInstallApp: (app: AppInfo) => void;
    onUninstallApp: (app: AppInfo) => void;
    userJob: string;
}

const MarketplaceApp: React.FC<MarketplaceAppProps> = ({ installedAppIds, onInstallApp, onUninstallApp, userJob }) => {
    const { t } = useLocale();
    const [installingAppId, setInstallingAppId] = useState<string | null>(null);
    
    const isInstalled = (appId: string) => {
        return installedAppIds.some(id => id === appId);
    };

    const handleInstall = (appToInstall: AppInfo) => {
        if (installingAppId) return; // Prevent multiple installs at once

        setInstallingAppId(appToInstall.id);

        // Simulate installation time
        setTimeout(() => {
            onInstallApp(appToInstall);
            setInstallingAppId(null);
        }, 1500); // 1.5 second delay
    };
    
    const renderIcon = (app: AppInfo) => {
        const IconComponent = app.icon;
        return <IconComponent className={app.color} size={32} />;
    };

    // Filter apps based on user's job
    const availableApps = ALL_APPS.filter(app => {
        if (!app.requiredJobs) {
            return true; // App is not job-restricted
        }
        return app.requiredJobs.includes(userJob);
    });

    return (
        <div className="bg-transparent text-white h-full overflow-y-auto">
            <header className="p-4 sticky top-0 bg-black/30 backdrop-blur-xl border-b border-neutral-800">
                <h1 className="text-3xl font-bold text-white">{t('app_store_title')}</h1>
            </header>
            <div className="p-2">
                <ul className="space-y-3">
                    {availableApps.map(app => {
                        const isInstalling = installingAppId === app.id;
                        return (
                            <li key={app.id} className="bg-neutral-900/70 p-3 rounded-xl flex items-center gap-4">
                                <div className={`w-14 h-14 flex items-center justify-center rounded-xl overflow-hidden ${app.bgColor || 'bg-neutral-800'}`}>
                                    {renderIcon(app)}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-bold text-lg">{t(app.name)}</p>
                                    <p className="text-sm text-neutral-400">
                                        {app.requiredJobs ? t('job_restricted_app') : (app.isRemovable ? t('standard_app') : t('system_app'))}
                                    </p>
                                </div>
                                {app.isRemovable ? (
                                    isInstalled(app.id) ? (
                                        <button 
                                            onClick={() => onUninstallApp(app)} 
                                            className="bg-red-500 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-red-600 transition-colors disabled:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!!installingAppId}
                                        >
                                            {t('uninstall')}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleInstall(app)} 
                                            className={`bg-blue-500 text-white text-sm font-semibold px-5 py-2 w-28 text-center rounded-full transition-colors ${isInstalling ? 'cursor-not-allowed' : 'hover:bg-blue-600'} ${installingAppId && !isInstalling ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!!installingAppId}
                                        >
                                            {isInstalling ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <LoaderCircle size={16} className="animate-spin" />
                                                    {t('installing')}
                                                </span>
                                            ) : (
                                                t('install')
                                            )}
                                        </button>
                                    )
                                ) : (
                                    <span className="text-neutral-500 text-sm font-medium pr-2">{t('installed')}</span>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
};

export default MarketplaceApp;