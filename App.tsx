import React, { useState, useCallback } from 'react';
import { AppView, AnalysisResult } from './types';
import UploadView from './components/UploadView';
import ProcessingView from './components/ProcessingView';
import AnalysisView from './components/AnalysisView';
import { analyzeImages } from './services/geminiService';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>(AppView.UPLOAD);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        setUploadedImages(files);
        setView(AppView.PROCESSING);
        setProcessingError(null);
        setProgress(0);

        try {
            const result = await analyzeImages(files, (p) => setProgress(p));
            setAnalysisResult(result);
            // Add a small delay to let the user see 100%
            setTimeout(() => setView(AppView.ANALYSIS), 800);
        } catch (error) {
            console.error("Analysis failed:", error);
            setProcessingError("System Failure: Analysis module crashed.");
            setView(AppView.UPLOAD);
        }
    }, []);

    const handleNewAnalysis = () => {
        setView(AppView.UPLOAD);
        setUploadedImages([]);
        setAnalysisResult(null);
        setProcessingError(null);
        setProgress(0);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-gray-200 font-sans selection:bg-lime-900 selection:text-lime-200 overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-500/20 to-transparent"></div>
            
            <AnimatePresence mode="wait">
                {view === AppView.UPLOAD && (
                    <motion.div 
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full h-full"
                    >
                        <UploadView onFilesSelect={handleFilesSelected} error={processingError} />
                    </motion.div>
                )}
                {view === AppView.PROCESSING && (
                    <motion.div 
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                    >
                        <ProcessingView images={uploadedImages} progress={progress} />
                    </motion.div>
                )}
                {view === AppView.ANALYSIS && analysisResult && (
                    <motion.div 
                        key="analysis"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full"
                    >
                        <AnalysisView result={analysisResult} images={uploadedImages} onNewAnalysis={handleNewAnalysis} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default App;