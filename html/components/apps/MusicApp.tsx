

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Song, MusicState } from '../../types';
import { Play, Pause, Rewind, FastForward, Music2, MoreHorizontal, Plus, X, ListMusic, ChevronLeft, AlertCircle, SkipForward, SkipBack } from 'lucide-react';
import { useLocale } from '../../i18n';
import YouTube, { YouTubeEvent } from 'react-youtube';

interface YouTubePlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    stopVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    getCurrentTime: () => Promise<number>;
    getDuration: () => Promise<number>;
    getPlayerState: () => Promise<number>;
}

interface MusicAppProps {
    songs: Song[];
    setSongs: (songs: Song[]) => void;
    musicState: MusicState;
    setMusicState: (state: MusicState | ((prevState: MusicState) => MusicState)) => void;
}

const getYouTubeId = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
        if (urlObj.hostname.includes('youtube.com')) return urlObj.searchParams.get('v');
    } catch (e) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    return null;
};

const MusicApp: React.FC<MusicAppProps> = ({ songs, setSongs, musicState, setMusicState }) => {
    const { t } = useLocale();
    const { currentSong, isPlaying, progress, duration } = musicState;
    const [isLibraryView, setLibraryView] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playbackError, setPlaybackError] = useState<string | null>(null);
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const [ytPlayer, setYtPlayer] = useState<YouTubePlayer | null>(null);
    const progressIntervalRef = useRef<number | null>(null);
    
    const currentVideoId = useMemo(() => currentSong ? getYouTubeId(currentSong.url) : null, [currentSong]);

    useEffect(() => {
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    const updateState = (updates: Partial<MusicState>) => {
        setMusicState(prev => ({ ...prev, ...updates }));
    };

    useEffect(() => {
        if (isPlaying) {
            if (currentVideoId && ytPlayer) ytPlayer.playVideo();
            else if (audioRef.current) audioRef.current.play().catch(e => {
                setPlaybackError("Could not play this audio file.");
                updateState({ isPlaying: false });
            });
        } else {
            if (currentVideoId && ytPlayer) ytPlayer.pauseVideo();
            else if (audioRef.current) audioRef.current.pause();
        }
    }, [isPlaying, currentVideoId, ytPlayer]);
    
    useEffect(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if (isPlaying) {
            if (currentVideoId && ytPlayer) {
                progressIntervalRef.current = window.setInterval(async () => {
                    if (ytPlayer) updateState({ progress: await ytPlayer.getCurrentTime(), duration: await ytPlayer.getDuration() });
                }, 250);
            } else if (audioRef.current) {
                const audio = audioRef.current;
                const updateProgress = () => updateState({ progress: audio.currentTime });
                const updateDuration = () => updateState({ duration: audio.duration });
                audio.addEventListener('timeupdate', updateProgress);
                audio.addEventListener('loadedmetadata', updateDuration);
                return () => {
                    audio.removeEventListener('timeupdate', updateProgress);
                    audio.removeEventListener('loadedmetadata', updateDuration);
                }
            }
        }
    }, [isPlaying, currentVideoId, ytPlayer]);

    const selectSong = (song: Song) => {
        setPlaybackError(null);
        updateState({ currentSong: song, progress: 0, duration: 0, isPlaying: true });
        setLibraryView(false);
    };

    const playNext = () => {
        if (!currentSong) return;
        const currentIndex = songs.findIndex(s => s.id === currentSong.id);
        const nextIndex = (currentIndex + 1) % songs.length;
        selectSong(songs[nextIndex]);
    };
    
    const playPrev = () => {
        if (!currentSong) return;
        const currentIndex = songs.findIndex(s => s.id === currentSong.id);
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        selectSong(songs[prevIndex]);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        updateState({ progress: time });
        if (currentVideoId && ytPlayer) ytPlayer.seekTo(time, true);
        else if (audioRef.current) audioRef.current.currentTime = time;
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const onPlayerReady = (event: YouTubeEvent<any>) => setYtPlayer(event.target);
    const onPlayerStateChange = (event: YouTubeEvent<number>) => { if (event.data === 0) playNext(); };
    const onAudioEnded = () => playNext();
    const onPlayerError = () => setPlaybackError("This YouTube video could not be played.");
    const onAudioError = () => setPlaybackError("Could not play audio. Link might be invalid or blocked.");

    const AddSongModal: React.FC = () => {
        const [url, setUrl] = useState('');
        const [title, setTitle] = useState('');
        const [artist, setArtist] = useState('');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (url && title && artist) {
                const newSong: Song = { id: Date.now().toString(), url, title, artist };
                setSongs([...songs, newSong]);
                setIsModalOpen(false);
            }
        };

        return (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4">
                <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-sm relative">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 p-2 text-neutral-400 hover:text-white"><X size={24}/></button>
                    <h2 className="text-xl font-bold text-white mb-4">Add New Song</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <input type="text" value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist" className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL (.mp3 or YouTube)" className="w-full bg-neutral-700 p-3 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors">Add Song</button>
                    </form>
                </div>
            </div>
        )
    };
    
    const PlayerView = () => (
        <div className="flex flex-col h-full">
            <header className="p-4 flex-shrink-0 flex justify-between items-center bg-black/20 backdrop-blur-lg">
                <button onClick={() => setLibraryView(true)} className="p-2 -ml-2"><ChevronLeft size={28} /></button>
                <h1 className="text-lg font-bold text-white uppercase tracking-wider">{t('music_title')}</h1>
                <button className="p-2"><MoreHorizontal size={24} /></button>
            </header>
            <div className="flex-grow overflow-y-auto px-4 flex flex-col items-center justify-center">
                <div className="w-96 h-96 bg-neutral-800/50 rounded-lg shadow-2xl shadow-black/50 flex items-center justify-center mt-8">
                    <Music2 className="text-red-400/50" size={128} />
                </div>
                <div className="text-center mt-6">
                    <p className="text-5xl font-bold">{currentSong?.title}</p>
                    <p className="text-3xl text-red-300">{currentSong?.artist}</p>
                </div>

                 {playbackError && (
                    <div className="mt-4 p-3 bg-red-500/20 text-red-200 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        {playbackError}
                    </div>
                )}

                <div className="w-full max-w-md mt-8">
                    <input type="range" min="0" max={duration || 0} value={progress || 0} onChange={handleSeek} disabled={!!playbackError} className="w-full h-1.5 bg-neutral-700 rounded-full appearance-none cursor-pointer range-lg disabled:cursor-not-allowed" style={{ accentColor: 'white' }} />
                    <div className="flex justify-between text-xs text-neutral-400 mt-1">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-8 mt-4">
                    <button onClick={playPrev} className="text-slate-300 hover:text-white transition-colors disabled:opacity-50" disabled={!!playbackError}><SkipBack size={44} fill="currentColor"/></button>
                    <button onClick={() => updateState({ isPlaying: !isPlaying })} disabled={!!playbackError} className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg disabled:bg-neutral-400 disabled:hover:scale-100">
                        {isPlaying ? <Pause size={48} fill="black" /> : <Play size={48} fill="black" className="ml-1" />}
                    </button>
                    <button onClick={playNext} className="text-slate-300 hover:text-white transition-colors disabled:opacity-50" disabled={!!playbackError}><SkipForward size={44} fill="currentColor" /></button>
                </div>
            </div>
        </div>
    );
    
    const LibraryView = () => (
         <div className="flex flex-col h-full">
             <header className="p-4 flex-shrink-0 flex justify-between items-center bg-black/30 backdrop-blur-xl sticky top-0 border-b border-neutral-800">
                <h1 className="text-3xl font-bold text-white">{t('music_title')}</h1>
                <button onClick={() => setIsModalOpen(true)} className="p-2 text-white bg-white/10 rounded-full hover:bg-white/20"><Plus size={24} /></button>
            </header>
             <div className="flex-grow overflow-y-auto px-2">
                {currentSong && (
                    <div onClick={() => setLibraryView(false)} className="sticky bottom-2 z-10 bg-neutral-800/80 backdrop-blur-lg p-3 rounded-lg flex items-center gap-3 cursor-pointer border border-neutral-700">
                        <Music2 className="text-red-400" />
                        <div className="flex-grow">
                            <p className="font-bold">{currentSong.title}</p>
                            <p className="text-sm text-neutral-300">{currentSong.artist}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); updateState({ isPlaying: !isPlaying });}} className="p-2">
                             {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                    </div>
                )}
                {songs.length > 0 ? (
                   <ul className="space-y-1">
                        {songs.map(song => (
                            <li key={song.id} onClick={() => selectSong(song)} className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg cursor-pointer">
                                <div className="w-12 h-12 bg-neutral-800/80 rounded-md flex items-center justify-center"><Music2 className="text-red-400" /></div>
                                <div>
                                    <p className="font-semibold text-white">{song.title}</p>
                                    <p className="text-sm text-neutral-400">{song.artist}</p>
                                </div>
                            </li>
                        ))}
                   </ul>
                ) : (
                    <div className="text-center text-neutral-500 flex flex-col items-center justify-center h-full -mt-16">
                        <ListMusic size={64} className="mx-auto mb-4" />
                        <p className="text-lg font-semibold">No Music</p>
                        <p className="text-sm max-w-xs">Tap the <Plus size={14} className="inline-block mx-1"/> button to add songs to your library.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-transparent text-white h-full flex flex-col relative">
            {isLibraryView ? <LibraryView /> : <PlayerView />}

            <div className="absolute opacity-0 pointer-events-none w-0 h-0">
                {!currentVideoId && currentSong && (
                    <audio 
                        ref={audioRef}
                        src={currentSong.url}
                        onEnded={onAudioEnded}
                        onError={onAudioError}
                        onLoadedMetadata={() => audioRef.current && updateState({ duration: audioRef.current.duration })}
                    />
                )}
                {currentVideoId && (
                    <YouTube
                        videoId={currentVideoId}
                        opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }}
                        onReady={onPlayerReady}
                        onStateChange={onPlayerStateChange}
                        onError={onPlayerError}
                    />
                )}
            </div>

            {isModalOpen && <AddSongModal />}
        </div>
    );
};

export default MusicApp;