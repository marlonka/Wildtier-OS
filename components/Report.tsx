
import React from 'react';
import ReactMarkdown from 'react-markdown';
import ImageCarousel from './ImageCarousel';
import Lightbox from './Lightbox';

interface ReportProps {
    markdown: string;
    imageUrls: string[];
}

const Report: React.FC<ReportProps> = ({ markdown, imageUrls }) => {
    const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);

    // Split markdown into sections based on h2 (##) headings
    const sections = markdown.split(/(?=^##\s)/m);

    const extractImageIndices = (text: string): number[] => {
        const regex = /\(Bild\s(\d+)\)/g;
        const indices: number[] = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            indices.push(parseInt(match[1], 10) - 1);
        }
        return [...new Set(indices)]; // Remove duplicates
    };
    
    return (
        <div className="prose prose-emerald max-w-none">
            {sections.map((section, index) => {
                const imageIndices = extractImageIndices(section);
                const sectionImageUrls = imageIndices.map(i => imageUrls[i]).filter(Boolean);

                return (
                    <div key={index} className="mb-8">
                        <ReactMarkdown>{section}</ReactMarkdown>
                        {sectionImageUrls.length > 0 && (
                            <ImageCarousel
                                imageUrls={sectionImageUrls}
                                onImageClick={setLightboxImage}
                            />
                        )}
                    </div>
                );
            })}
             {lightboxImage && (
                <Lightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
            )}
        </div>
    );
};

export default Report;
