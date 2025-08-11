

import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCcw, User, VideoOff, AlertTriangle } from 'lucide-react';

type CameraError = 'permission-denied' | 'not-found' | 'generic' | null;

const CameraApp: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<CameraError>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getCameraStream = async () => {
            setIsLoading(true);
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setCameraError('generic');
                setIsLoading(false);
                return;
            }

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setCameraError(null);
            } catch (err) {
                console.error("Error accessing camera:", err);
                if (err instanceof DOMException) {
                    if (err.name === 'NotFoundError') {
                        setCameraError('not-found');
                    } else if (err.name === 'NotAllowedError') {
                        setCameraError('permission-denied');
                    } else {
                        setCameraError('generic');
                    }
                } else {
                    setCameraError('generic');
                }
            } finally {
                setIsLoading(false);
            }
        };

        getCameraStream();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const ErrorDisplay: React.FC<{ type: CameraError }> = ({ type }) => {
        switch (type) {
            case 'not-found':
                return (
                    <div className="text-center text-white p-4">
                        <VideoOff size={48} className="mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-bold">No Camera Found</h2>
                        <p className="text-sm text-slate-400 mt-2">A camera device could not be found. Please ensure one is connected and enabled.</p>
                    </div>
                );
            case 'permission-denied':
                return (
                    <div className="text-center text-white p-4">
                        <Camera size={48} className="mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-bold">Camera Access Denied</h2>
                        <p className="text-sm text-slate-400 mt-2">Please enable camera permissions in your browser settings to use this app.</p>
                    </div>
                );
            case 'generic':
            default:
                 return (
                    <div className="text-center text-white p-4">
                        <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-bold">Could Not Start Camera</h2>
                        <p className="text-sm text-slate-400 mt-2">An unexpected error occurred. Please try again.</p>
                    </div>
                );
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-white animate-pulse">Starting Camera...</p>;
        }
        if (cameraError) {
            return <ErrorDisplay type={cameraError} />;
        }
        return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-[1.3]"></video>;
    }


    return (
        <div className="h-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {renderContent()}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/30 backdrop-blur-xl flex justify-between items-center z-10">
                <div className="w-12 h-12 bg-neutral-500/30 backdrop-blur-md rounded-lg flex items-center justify-center">
                    <User size={24} className="text-white" />
                </div>
                <button className="w-[72px] h-[72px] rounded-full border-4 border-white bg-transparent flex items-center justify-center active:scale-95 transition-transform">
                    <div className="w-[60px] h-[60px] rounded-full bg-white"></div>
                </button>
                 <button className="w-12 h-12 bg-neutral-500/30 backdrop-blur-md rounded-full flex items-center justify-center">
                    <RefreshCcw size={22} className="text-white" />
                </button>
            </div>
        </div>
    );
};

export default CameraApp;