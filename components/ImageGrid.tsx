import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from './Lightbox';

interface ImageGridProps {
    images: { url: string; index: number }[];
    speciesName: string | null;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, speciesName }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            {/* Auto-fill Grid: Creates as many columns as fit with min width of 120px, then stretches them to fill space */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
                <AnimatePresence>
                    {images.map((img) => (
                        <motion.div
                            key={img.index}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSelectedImage(img.url)}
                            className="aspect-square relative group cursor-pointer rounded-lg overflow-hidden border border-[#27272a] bg-[#18181b] hover:border-[#d4ff00]/50 transition-colors"
                        >
                            <img 
                                src={img.url} 
                                alt={`Capture ${img.index}`} 
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                                <span className="text-[9px] font-mono text-[#d4ff00] tracking-wider">IMG_{String(img.index).padStart(4, '0')}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {selectedImage && (
                <Lightbox imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
            )}
        </>
    );
};

export default ImageGrid;