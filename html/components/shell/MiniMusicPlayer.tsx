
import React from 'react';
import type { MusicState } from '../../types';
import { useLocale } from '../../i18n';
import { Music, Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface MiniMusicPlayerProps {
    musicState: MusicState;
    setMusicState: (state: MusicState | ((prevState: MusicState) => MusicState)) => void;
    // In a real scenario, playNext/playPrev would be passed as props
}

const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({ musicState, setMusicState }) => {
    const { t } = useLocale();
    const { currentSong, isPlaying } = musicState;
    
    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMusicState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    };

    return (
        <div className="bg-neutral-700/50 rounded-2xl p-3 flex-grow flex flex-col justify-between">
            {currentSong ? (
                <>
                    <div>
                        <p className="font-bold text-white truncate">{currentSong.title}</p>
                        <p className="text-sm text-neutral-300 truncate">{currentSong.artist}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <button className="text-white"><SkipBack fill="currentColor" size={24} /></button>
                        <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>
                        <button className="text-white"><SkipForward fill="currentColor" size={24} /></button>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-neutral-400">
                    <div className="text-center">
                        <Music size={32} className="mx-auto" />
                        <p className="mt-1 text-sm font-semibold">{t('not_playing')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MiniMusicPlayer;
