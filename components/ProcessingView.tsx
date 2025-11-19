import React, { useEffect, useState } from 'react';
import { ActivityIcon } from './Icons';
import { motion } from 'framer-motion';

interface ProcessingViewProps {
    images: File[];
    progress: number;
}

const LOG_MESSAGES = [
    "Initialisiere neuronales Netzwerk...",
    "Lade Modelle für Wald-Vegetation...",
    "Importiere Bilddaten...",
    "Normalisiere Belichtungswerte...",
    "Detektiere Bewegungen in ROI...",
    "Klassifiziere Tierarten...",
    "Prüfe Taxonomie-Datenbank...",
    "Analysiere Verhaltensmuster...",
    "Markiere Auffälligkeiten...",
    "Erstelle JSON Abschlussbericht...",
    "Finalisiere Datenpaket..."
];

const ProcessingView: React.FC<ProcessingViewProps> = ({ images, progress }) => {
    const [logs, setLogs] = useState<string[]>([]);
    
    useEffect(() => {
        if (progress === 0) setLogs([]);
        const step = Math.floor((progress / 100) * LOG_MESSAGES.length);
        const currentMessage = LOG_MESSAGES[Math.min(step, LOG_MESSAGES.length - 1)];
        
        if (currentMessage && !logs.includes(currentMessage)) {
            setLogs(prev => [...prev, currentMessage]);
        }
    }, [progress, logs]);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-[#09090b] p-6 font-mono relative overflow-hidden">
             {/* Background Pulse */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-[600px] h-[600px] bg-lime-500/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="w-full max-w-2xl bg-[#121214] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl relative z-10">
                {/* Terminal Header */}
                <div className="bg-[#18181b] px-4 py-2 border-b border-[#27272a] flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">
                        VERARBEITUNG::BATCH_{images.length}
                    </div>
                </div>

                {/* Terminal Body */}
                <div className="p-6 min-h-[300px] flex flex-col">
                    <div className="flex-grow space-y-2 text-sm">
                        {logs.map((log, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center text-[#d4ff00]"
                            >
                                <span className="mr-2 text-gray-600">{`>`}</span>
                                <span className={i === logs.length - 1 ? 'animate-pulse' : 'opacity-70'}>{log}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-8">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-sans uppercase">
                            <span>Analyse Fortschritt</span>
                            <span className="text-[#d4ff00]">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-[#d4ff00] shadow-[0_0_10px_rgba(212,255,0,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "spring", stiffness: 100 }}
                            ></motion.div>
                        </div>
                    </div>
                </div>

                {/* Footer decoration */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent"></div>
            </div>
        </div>
    );
};

export default ProcessingView;