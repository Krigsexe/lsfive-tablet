
import React, { useState, useRef, useEffect } from 'react';
import type { Folder, AppInfo, AppType } from '../types';
import AppIcon from './AppIcon';

interface FolderViewProps {
    folder: Folder;
    allApps: AppInfo[];
    onClose: () => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onUpdateFolderApps: (folderId: string, newAppIds: AppType[]) => void;
    onRemoveFromFolder: (folderId: string, appId: AppType) => void;
    onUninstallApp: (app: AppInfo) => void;
    isEditing: boolean;
}

const FolderView: React.FC<FolderViewProps> = (props) => {
    const { folder, allApps, onClose, onRenameFolder, onUpdateFolderApps, onRemoveFromFolder, onUninstallApp, isEditing } = props;
    
    const [isRenaming, setIsRenaming] = useState(false);
    const [folderName, setFolderName] = useState(folder.name);
    const inputRef = useRef<HTMLInputElement>(null);

    const folderApps = folder.appIds
        .map(id => allApps.find(app => app.id === id))
        .filter((app): app is AppInfo => !!app);

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);

    const handleRename = () => {
        if (folderName.trim()) {
            onRenameFolder(folder.id, folderName.trim());
        } else {
            setFolderName(folder.name);
        }
        setIsRenaming(false);
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, app: AppInfo) => {
        e.dataTransfer.setData('appIdFromFolder', app.id);
        e.dataTransfer.setData('folderIdSource', folder.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const appId = e.dataTransfer.getData('appIdFromFolder') as AppType;
        if (!appId) return;

        // Check if dropped outside the folder view
        const dropElement = document.elementFromPoint(e.clientX, e.clientY);
        if (!dropElement?.closest('[data-folder-view-content]')) {
            onRemoveFromFolder(folder.id, appId);
            onClose();
            return;
        }

        const targetButton = dropElement?.closest('button[data-appid]');
        const targetAppId = targetButton?.getAttribute('data-appid') as AppType | null;
        
        const reordered = [...folder.appIds];
        const sourceIdx = reordered.indexOf(appId);
        if (sourceIdx !== -1) reordered.splice(sourceIdx, 1);
        
        const targetIdx = targetAppId ? reordered.indexOf(targetAppId) : reordered.length;
        reordered.splice(targetIdx, 0, appId);
        onUpdateFolderApps(folder.id, reordered);
    };
    
    return (
        <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xl z-20 flex items-center justify-center p-8"
            onClick={onClose}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div
                data-folder-view-content
                onClick={e => e.stopPropagation()}
                className="bg-neutral-800/80 p-6 rounded-[2.5rem] w-full max-w-4xl min-h-[400px] flex flex-col items-center gap-4"
                style={{ animation: 'scale-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
            >
                {isRenaming ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={folderName}
                        onChange={e => setFolderName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={e => e.key === 'Enter' && handleRename()}
                        className="bg-neutral-700 text-white text-3xl font-bold text-center rounded-lg px-2 py-1 outline-none"
                    />
                ) : (
                    <h2 onClick={() => setIsRenaming(true)} className="text-white text-3xl font-bold">{folder.name}</h2>
                )}
                
                <div className="grid grid-cols-5 gap-y-6 gap-x-4 content-start pt-4">
                     {folderApps.map(app => (
                        <AppIcon
                            key={app.id}
                            app={app}
                            isDraggable={isEditing}
                            isEditing={isEditing}
                            onClick={() => { if(!isEditing) onClose(); /* open app here */ }}
                            onDragStart={e => handleDragStart(e, app)}
                            onEnterEditMode={() => {}}
                            onDelete={() => onUninstallApp(app)}
                        />
                    ))}
                </div>
            </div>
             <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default FolderView;
