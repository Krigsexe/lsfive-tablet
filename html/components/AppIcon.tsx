

import React, { useRef } from 'react';
import type { AppInfo } from '../types';
import { useLocale } from '../i18n';
import { XCircle } from 'lucide-react';

interface AppIconProps {
    app: AppInfo;
    onClick: () => void;
    isDocked?: boolean;
    isDraggable?: boolean;
    isEditing?: boolean;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
    onDragEnd?: () => void;
    onEnterEditMode: () => void;
    onDelete: () => void;
}

const AppIcon: React.FC<AppIconProps> = (props) => {
    const { 
        app, onClick, isDocked = false, isDraggable = false, isEditing = false, isDragging = false,
        onDragStart, onDragEnd, onEnterEditMode, onDelete
    } = props;
    const { t } = useLocale();
    const longPressTimer = useRef<number | null>(null);
    const pressDidFire = useRef(false);

    const handleMouseDown = () => {
        pressDidFire.current = false;
        const enterEditMode = () => {
            onEnterEditMode();
            pressDidFire.current = true;
        };
        longPressTimer.current = window.setTimeout(enterEditMode, 700);
    };

    const handleMouseUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleClick = () => {
        if (!pressDidFire.current) {
            onClick();
        }
    };

    const renderIcon = () => {
        const IconComponent = app.icon;
        return <IconComponent className={`${app.color} w-12 h-12`} style={{ filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.4))' }} />;
    };

    return (
        <button 
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            data-appid={app.id}
            data-dropzone={isDocked ? 'dock' : 'main'}
            className={`flex flex-col items-center group w-24 h-28 transition-transform duration-200 ease-in-out relative ${isDocked ? 'justify-center' : 'justify-start gap-2'} ${isDragging ? 'opacity-30 scale-110' : ''} ${isEditing ? 'jiggle' : ''}`}
            aria-label={t(app.name)}
        >
            {isEditing && app.isRemovable && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-0 left-0 z-10 text-white"
                    aria-label={`Delete ${t(app.name)}`}
                >
                    <XCircle size={28} className="bg-neutral-600 fill-neutral-800 rounded-full" />
                </button>
            )}
            <div className={`w-20 h-20 rounded-[1.3rem] flex items-center justify-center relative transition-transform duration-200 group-active:scale-95 overflow-hidden pointer-events-none ${app.bgColor || 'bg-neutral-800'}`}>
                {renderIcon()}
                 
                {app.notificationCount > 0 && !isEditing && (
                     <div 
                        className="absolute top-1 right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-[var(--bg-primary)]"
                        role="status"
                        aria-label="New notification"
                     ></div>
                )}
            </div>
            {!isDocked && <span className="text-white text-sm font-medium drop-shadow-lg pointer-events-none" style={{textShadow: '0 1px 2px rgb(0 0 0 / 0.7)'}}>{t(app.name)}</span>}
        </button>
    );
};

export default AppIcon;