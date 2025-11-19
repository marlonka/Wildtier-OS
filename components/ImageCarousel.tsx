
import React from 'react';

interface ImageCarouselProps {
    imageUrls: string[];
    onImageClick: (url: string) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ imageUrls, onImageClick }) => {
    return (
        <div className="mt-4 not-prose">
            <div className="flex overflow-x-auto space-x-3 pb-3">
                {imageUrls.map((url, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden cursor-pointer group shadow-md"
                        onClick={() => onImageClick(url)}
                    >
                        <img
                            src={url}
                            alt={`Referenced image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageCarousel;
