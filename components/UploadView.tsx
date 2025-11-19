import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, CameraIcon, ActivityIcon } from './Icons';
import { motion } from 'framer-motion';

interface UploadViewProps {
    onFilesSelect: (files: File[]) => void;
    error?: string | null;
}

const UploadView: React.FC<UploadViewProps> = ({ onFilesSelect, error }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFilesSelect(Array.from(event.target.files));
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            onFilesSelect(Array.from(event.dataTransfer.files));
        }
    }, [onFilesSelect]);

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

    return (
        <div className="h-[100dvh] w-full flex flex-col p-4 md:p-6 relative z-10 overflow-hidden">
            {/* Decorative Grid Background */}
            <div className="absolute inset-0 pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(50, 50, 50, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(50, 50, 50, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Content Container - Flex Column to fill height */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto relative"
            >
                {/* Header Section - Compacts on small screens */}
                <div className="flex-none flex flex-col items-center justify-center py-4 md:py-8">
                    <motion.div 
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="inline-flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-xl bg-[#1a1a1a] border border-gray-800 shadow-2xl mb-3 md:mb-4 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-lime-500/10 blur-md group-hover:bg-lime-500/20 transition-all duration-500"></div>
                        <CameraIcon className="w-5 h-5 md:w-7 md:h-7 text-[#d4ff00] relative z-10" />
                    </motion.div>
                    <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-1 font-sans">
                        WILDTIER <span className="text-[#d4ff00]">OS</span>
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm font-mono tracking-wide uppercase">
                        Forstliche Bildanalyse & Auswertung v2.5
                    </p>
                </div>

                {/* Error Display - Conditional */}
                {error && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="flex-none w-full max-w-lg mx-auto mb-4 bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg backdrop-blur-md flex items-center justify-center"
                    >
                        <ActivityIcon className="w-4 h-4 mr-2 text-red-500" />
                        <span className="font-mono text-xs md:text-sm">{error}</span>
                    </motion.div>
                )}

                {/* Upload Zone - Grows to fill remaining space */}
                <div className="flex-1 w-full min-h-[200px] relative mb-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            absolute inset-0 w-full h-full
                            rounded-xl border-2 border-dashed transition-all duration-500 cursor-pointer group
                            bg-[#0f0f11]/50 backdrop-blur-sm flex flex-col items-center justify-center
                            ${isDragging 
                                ? 'border-[#d4ff00] shadow-[0_0_40px_-10px_rgba(212,255,0,0.3)] bg-[#121214]' 
                                : 'border-gray-800 hover:border-gray-600 hover:bg-[#121214]/50'
                            }
                        `}
                    >
                        {/* Scanning Line Animation */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-[#d4ff00] shadow-[0_0_15px_rgba(212,255,0,0.8)] opacity-0 transition-opacity duration-300 ${isDragging ? 'animate-[scan_2s_ease-in-out_infinite] opacity-100' : 'group-hover:opacity-50'}`}></div>
                        
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <div className="relative z-10 flex flex-col items-center p-4 text-center">
                            <div className={`p-4 rounded-full bg-[#1a1a1a] mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
                                <UploadIcon className={`w-6 h-6 md:w-8 md:h-8 transition-colors duration-300 ${isDragging ? 'text-[#d4ff00]' : 'text-gray-400 group-hover:text-gray-200'}`} />
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold text-white mb-1 font-sans">Bilder hier ablegen</h3>
                            <p className="text-gray-500 font-mono text-[10px] md:text-xs">Unterstützt JPG, PNG (Max 3000 Dateien)</p>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-4 h-4 md:w-8 md:h-8 border-l-2 border-t-2 border-gray-600 group-hover:border-[#d4ff00] transition-colors duration-300 m-2 md:m-4"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 md:w-8 md:h-8 border-r-2 border-t-2 border-gray-600 group-hover:border-[#d4ff00] transition-colors duration-300 m-2 md:m-4"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 md:w-8 md:h-8 border-l-2 border-b-2 border-gray-600 group-hover:border-[#d4ff00] transition-colors duration-300 m-2 md:m-4"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 md:w-8 md:h-8 border-r-2 border-b-2 border-gray-600 group-hover:border-[#d4ff00] transition-colors duration-300 m-2 md:m-4"></div>
                    </div>
                </div>
                
                {/* Footer Status */}
                <div className="flex-none w-full flex justify-between text-[10px] font-mono text-gray-600 uppercase tracking-widest px-1">
                    <span>System Status: Online</span>
                    <span className="hidden md:inline">Sichere Verbindung Aktiv</span>
                    <span>Ver. 2.5.1-DE</span>
                </div>
            </motion.div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default UploadView;