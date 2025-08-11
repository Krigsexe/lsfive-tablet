

import React, { useState, useRef } from 'react';
import type { AppInfo, Folder } from '../types';
import { AppType } from '../types';
import AppIcon from './AppIcon';
import { MAX_DOCK_APPS } from '../constants';
import ClockWidget from './ClockWidget';
import { useLocale } from '../i18n';
import { XCircle } from 'lucide-react';
import FolderIcon from './FolderIcon';
import FolderView from './FolderView';

interface HomeScreenProps {
    apps: AppInfo[];
    dockAppIds: AppType[];
    setDockAppIds: (ids: AppType[]) => void;
    onOpenApp: (appId: AppType) => void;
    onUninstallApp: (app: AppInfo) => void;
    clockWidgetVisible: boolean;
    onSetClockWidgetVisible: (isVisible: boolean) => void;
    folders: Folder[];
    homeScreenOrder: string[];
    onReorderHome: (order: string[]) => void;
    onCreateFolder: (droppedAppId: AppType, targetAppId: AppType) => void;
    onAddToFolder: (folderId: string, appId: AppType) => void;
    onRemoveFromFolder: (folderId: string, appId: AppType) => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onUpdateFolderApps: (folderId: string, newAppIds: AppType[]) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = (props) => {
    const {
        apps, dockAppIds, setDockAppIds, onOpenApp, onUninstallApp,
        clockWidgetVisible, onSetClockWidgetVisible, folders, homeScreenOrder,
        onReorderHome, onCreateFolder, onAddToFolder, onRemoveFromFolder,
        onRenameFolder, onUpdateFolderApps
    } = props;
    
    const [draggedItem, setDraggedItem] = useState<{ id: string, type: 'app' | 'folder' } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openFolder, setOpenFolder] = useState<Folder | null>(null);
    const { t, locale } = useLocale();

    const allItemsMap = new Map<string, AppInfo | Folder>();
    apps.forEach(app => allItemsMap.set(app.id, app));
    folders.forEach(folder => allItemsMap.set(folder.id, folder));
    
    const homeScreenItems = homeScreenOrder
        .map(id => ({ id, item: allItemsMap.get(id) }))
        .filter(data => dockAppIds.indexOf(data.id as AppType) === -1 && data.item)

    const dockApps = dockAppIds.map(id => apps.find(app => app.id === id)).filter((app): app is AppInfo => !!app);
    
    const longPressTimer = useRef<number | null>(null);
    const pressDidFire = useRef(false);

    const handleEnterEditMode = () => setIsEditing(true);

    const handleWidgetMouseDown = (e: React.MouseEvent) => {
        pressDidFire.current = false;
        longPressTimer.current = window.setTimeout(() => {
            handleEnterEditMode();
            pressDidFire.current = true;
        }, 700);
    };

    const handleWidgetMouseUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLElement>, id: string, type: 'app' | 'folder') => {
        if (!isEditing) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('itemId', id);
        e.dataTransfer.setData('itemType', type);
        setDraggedItem({ id, type });
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('itemId');
        const sourceType = e.dataTransfer.getData('itemType') as 'app' | 'folder';
        if (!sourceId || !sourceType) return;
        
        setDraggedItem(null);

        const dropElement = document.elementFromPoint(e.clientX, e.clientY);
        const targetButton = dropElement?.closest('button[data-id]');
        const targetDropzoneDiv = dropElement?.closest('div[data-dropzone]');
        
        const targetId = targetButton?.getAttribute('data-id');
        const targetType = targetButton?.getAttribute('data-type') as 'app' | 'folder' | undefined;
        const dropZone = targetDropzoneDiv?.getAttribute('data-dropzone') as 'main' | 'dock' | null;
        
        if (sourceType === 'app' && targetType === 'app' && sourceId !== targetId) {
            onCreateFolder(sourceId as AppType, targetId as AppType);
        } else if (sourceType === 'app' && targetType === 'folder' && targetId) {
            onAddToFolder(targetId, sourceId as AppType);
        } else if (dropZone === 'main') {
             if (!targetId || targetId === sourceId) { // Dropped on empty space
                if (dockAppIds.includes(sourceId as AppType)) { // Dock -> Main
                    setDockAppIds(dockAppIds.filter(id => id !== sourceId));
                    onReorderHome([...homeScreenOrder, sourceId]);
                }
                return;
             }
             const reordered = [...homeScreenOrder];
             const sourceIdx = reordered.indexOf(sourceId);
             if (sourceIdx !== -1) reordered.splice(sourceIdx, 1);
             const targetIdx = reordered.indexOf(targetId);
             reordered.splice(targetIdx, 0, sourceId);
             onReorderHome(reordered);

        } else if (dropZone === 'dock' && sourceType === 'app') {
            const currentDockIds = [...dockAppIds];
            const sourceIsDocked = currentDockIds.includes(sourceId as AppType);
            
            if (sourceIsDocked) { // Reorder Dock -> Dock
                 const sourceIdx = currentDockIds.indexOf(sourceId as AppType);
                 currentDockIds.splice(sourceIdx, 1);
            } else { // Move Main -> Dock
                 if (currentDockIds.length >= MAX_DOCK_APPS) return;
                 onReorderHome(homeScreenOrder.filter(id => id !== sourceId));
            }

            const targetIdx = targetId ? currentDockIds.indexOf(targetId as AppType) : currentDockIds.length;
            currentDockIds.splice(targetIdx, 0, sourceId as AppType);
            setDockAppIds(currentDockIds);
        }
    };
    
    const handleDragEnd = () => setDraggedItem(null);

    return (
        <div className="px-2 pt-1 pb-2 h-full flex flex-col justify-between">
            {openFolder && (
                 <FolderView
                    folder={openFolder}
                    allApps={apps}
                    onClose={() => setOpenFolder(null)}
                    onRenameFolder={onRenameFolder}
                    onUpdateFolderApps={onUpdateFolderApps}
                    onRemoveFromFolder={onRemoveFromFolder}
                    onUninstallApp={onUninstallApp}
                    isEditing={isEditing}
                 />
            )}
            <div className="pt-12 px-10 flex justify-between items-start min-h-[150px]">
                {clockWidgetVisible && (
                    <div className={`relative ${isEditing ? 'jiggle' : ''}`} onMouseDown={handleWidgetMouseDown} onMouseUp={handleWidgetMouseUp} onMouseLeave={handleWidgetMouseUp}>
                         {isEditing && (
                            <button onClick={(e) => { e.stopPropagation(); onSetClockWidgetVisible(false); }} className="absolute -top-2 -left-2 z-10 text-white" aria-label={`Delete Clock Widget`}>
                                <XCircle size={28} className="bg-neutral-600 fill-neutral-800 rounded-full" />
                            </button>
                        )}
                        <ClockWidget locale={locale as 'en' | 'fr'} />
                    </div>
                )}
                {isEditing && (
                    <button onClick={() => setIsEditing(false)} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg self-center">
                        {t('done_button')}
                    </button>
                )}
            </div>
            <div className="flex-grow grid grid-cols-10 gap-y-6 gap-x-4 content-start pt-12 px-8" onDrop={handleDrop} onDragOver={handleDragOver} data-dropzone="main">
                {homeScreenItems.map(({ id, item }) => {
                    if (item && 'appIds' in item) { // It's a Folder
                        const folderApps = item.appIds.map(appId => apps.find(a => a.id === appId)).filter((app): app is AppInfo => !!app);
                        return <FolderIcon 
                            key={id} 
                            folder={item} 
                            apps={folderApps} 
                            isEditing={isEditing} 
                            isDragging={draggedItem?.id === id}
                            onClick={() => !isEditing && setOpenFolder(item)} 
                            onDragStart={(e) => handleDragStart(e, id, 'folder')}
                            onDragEnd={handleDragEnd}
                        />
                    }
                    if (item && 'icon' in item) { // It's an App
                        return <AppIcon
                            key={id}
                            app={item}
                            isDraggable={isEditing} isEditing={isEditing}
                            isDragging={draggedItem?.id === id}
                            onClick={() => !isEditing && onOpenApp(item.id)}
                            onDragStart={(e) => handleDragStart(e, id, 'app')}
                            onDragEnd={handleDragEnd}
                            onEnterEditMode={handleEnterEditMode}
                            onDelete={() => onUninstallApp(item)}
                        />
                    }
                    return null;
                })}
            </div>
            <div className="mb-1 p-2 bg-white/10 backdrop-blur-3xl rounded-3xl" onDrop={handleDrop} onDragOver={handleDragOver} data-dropzone="dock">
                <div className="flex flex-row justify-center items-center gap-x-2">
                    {dockApps.map((app) => (
                         <AppIcon
                            key={app.id} app={app}
                            isDraggable={isEditing} isEditing={isEditing} isDocked={true}
                            isDragging={draggedItem?.id === app.id}
                            onClick={() => !isEditing && onOpenApp(app.id)}
                            onDragStart={(e) => handleDragStart(e, app.id, 'app')}
                            onDragEnd={handleDragEnd}
                            onEnterEditMode={handleEnterEditMode}
                            onDelete={() => onUninstallApp(app)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;