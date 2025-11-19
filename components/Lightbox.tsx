import React from 'react';
import { CloseIcon, DownloadIcon } from './Icons';
import { motion } from 'framer-motion';

interface LightboxProps {
    imageUrl: string;
    onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ imageUrl, onClose }) => {
    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `capture-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" 
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative max-w-full max-h-full group" 
                onClick={e => e.stopPropagation()}
            >
                <img src={imageUrl} alt="Enlarged view" className="max-w-[90vw] max-h-[90vh] object-contain border border-[#333] rounded shadow-2xl" />
                
                {/* Controls */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={handleDownload} className="p-3 bg-black/50 border border-white/20 text-white rounded-full hover:bg-[#d4ff00] hover:text-black hover:border-[#d4ff00] transition-all">
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-3 bg-black/50 border border-white/20 text-white rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Metadata Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 border border-white/10 rounded text-xs font-mono text-gray-300">
                    RAW_IMAGE_DATA // 24MP // IR_NIGHT
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Lightbox;