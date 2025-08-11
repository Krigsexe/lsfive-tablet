
import React from 'react';
import type { Folder, AppInfo } from '../types';
import { useLocale } from '../i18n';

interface FolderIconProps {
    folder: Folder;
    apps: AppInfo[];
    onClick: () => void;
    isEditing?: boolean;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd?: () => void;
}

const FolderIcon: React.FC<FolderIconProps> = (props) => {
    const { folder, apps, onClick, isEditing, isDragging, onDragStart, onDragEnd } = props;
    const { t } = useLocale();

    return (
        <button
            onClick={onClick}
            draggable={isEditing}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            data-id={folder.id}
            data-type="folder"
            className={`flex flex-col items-center group w-24 h-28 justify-start gap-2 transition-transform duration-200 ease-in-out relative ${isDragging ? 'opacity-30 scale-110' : ''} ${isEditing ? 'jiggle' : ''}`}
            aria-label={folder.name}
        >
            <div className="w-20 h-20 bg-neutral-700/80 rounded-[1.3rem] flex items-center justify-center relative transition-transform duration-200 group-active:scale-95 p-1.5 pointer-events-none">
                <div className="grid grid-cols-3 gap-1 w-full h-full">
                    {apps.slice(0, 9).map((app, index) => {
                        const Icon = app.icon;
                        return (
                             <div key={app.id + index} className={`w-full h-full rounded-md flex items-center justify-center overflow-hidden ${app.bgColor}`}>
                                <Icon className={app.color} size={12} />
                            </div>
                        )
                    })}
                </div>
            </div>
            <span className="text-white text-sm font-medium drop-shadow-lg pointer-events-none" style={{textShadow: '0 1px 2px rgb(0 0 0 / 0.7)'}}>{folder.name}</span>
        </button>
    );
};

export default FolderIcon;
