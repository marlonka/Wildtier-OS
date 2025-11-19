import React, { useState } from 'react';
import { AnalysisResult, SpeciesData } from '../types';
import { NewAnalysisIcon, TokenIcon, EuroIcon, ChartIcon, AlertIcon, GridIcon, SettingsIcon, SearchIcon, DownloadIcon, ArrowRightIcon, MapPinIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import Chat from './Chat';
import ImageGrid from './ImageGrid';

interface AnalysisViewProps {
    result: AnalysisResult;
    images: File[];
    onNewAnalysis: () => void;
}

type ViewMode = 'dashboard' | 'alerts' | 'settings';

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, images, onNewAnalysis }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);

    const { data } = result;

    // Calculate filtered indices
    const filteredIndices = selectedSpecies
        ? data.speciesAnalysis.find(s => s.speciesName === selectedSpecies)?.imageIndices || []
        : (viewMode === 'alerts' 
            ? data.anomalies.reduce((acc, anomaly) => [...acc, ...anomaly.imageIndices], [] as number[]) 
            : Array.from({ length: images.length }, (_, i) => i));

    // Deduplicate indices for alerts view
    const uniqueFilteredIndices = [...new Set(filteredIndices)];
    
    const filteredImages = uniqueFilteredIndices.map((i: number) => ({ url: URL.createObjectURL(images[i]), index: i }));

    const downloadReport = () => {
        const blob = new Blob([result.rawMarkdown || JSON.stringify(result.data, null, 2)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wildtier-bericht-v2.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full h-[100dvh] bg-[#09090b] flex overflow-hidden text-gray-200 font-sans">
            {/* Sidebar Navigation - Fixed width */}
            <div className="hidden md:flex w-14 lg:w-16 flex-col items-center py-4 border-r border-[#27272a] bg-[#09090b] z-20 flex-shrink-0">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#d4ff00] rounded-lg flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(212,255,0,0.4)]">
                    <GridIcon className="w-5 h-5 text-black" />
                </div>
                <nav className="flex flex-col gap-3 w-full px-1.5">
                    <NavItem icon={ChartIcon} active={viewMode === 'dashboard'} onClick={() => { setViewMode('dashboard'); setSelectedSpecies(null); }} label="Übersicht" />
                    <NavItem icon={AlertIcon} active={viewMode === 'alerts'} onClick={() => { setViewMode('alerts'); setSelectedSpecies(null); }} label="Warnungen" alertCount={data.anomalies.length} />
                    <NavItem icon={SettingsIcon} active={viewMode === 'settings'} onClick={() => { setViewMode('settings'); setSelectedSpecies(null); }} label="Einstellungen" />
                </nav>
                <div className="mt-auto w-full px-1.5">
                     <button onClick={onNewAnalysis} className="w-full aspect-square rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all group" title="Neue Analyse">
                        <NewAnalysisIcon className="w-5 h-5 rotate-45 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Content & Chat Container - Flex Row */}
            <div className="flex-1 flex relative overflow-hidden">
                
                {/* Main Dashboard Area - Flex Grow */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] relative z-10">
                    {/* Top Bar */}
                    <header className="h-14 border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur flex items-center justify-between px-4 md:px-6 flex-shrink-0">
                        <div className="flex items-center gap-3 overflow-hidden">
                             <div className="md:hidden w-8 h-8 bg-[#d4ff00] rounded flex items-center justify-center flex-shrink-0">
                                 <GridIcon className="w-5 h-5 text-black" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h2 className="text-xs md:text-sm font-bold tracking-wide text-white truncate flex items-center gap-2">
                                    {viewMode === 'dashboard' && 'ÜBERSICHT'}
                                    {viewMode === 'alerts' && 'WARNUNGEN & AUFFÄLLIGKEITEN'}
                                    {viewMode === 'settings' && 'SYSTEM EINSTELLUNGEN'}
                                    
                                    <span className="text-[#27272a] font-light">/</span> 
                                    <span className="text-[#d4ff00] px-2 py-0.5 bg-[#d4ff00]/10 rounded border border-[#d4ff00]/20 uppercase">
                                        {selectedSpecies || "Revier Nord"}
                                    </span>
                                </h2>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-gray-500">
                                 <div className="flex items-center bg-[#18181b] px-2 py-1 rounded border border-[#27272a]">
                                    <TokenIcon className="w-3 h-3 mr-1.5 text-gray-400" />
                                    <span>{result.tokens.toLocaleString()} TKN</span>
                                </div>
                                <div className="flex items-center bg-[#18181b] px-2 py-1 rounded border border-[#27272a]">
                                    <EuroIcon className="w-3 h-3 mr-1.5 text-gray-400" />
                                    <span>{result.estimatedCost} EST</span>
                                </div>
                            </div>
                            <div className="h-4 w-px bg-[#27272a] hidden md:block"></div>
                            <button onClick={downloadReport} className="p-2 hover:bg-[#27272a] rounded-md transition-colors text-gray-400 hover:text-white" title="Bericht Herunterladen">
                                <DownloadIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setShowChat(!showChat)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold font-sans transition-all border ${showChat ? 'bg-[#d4ff00] border-[#d4ff00] text-black shadow-[0_0_15px_rgba(212,255,0,0.3)]' : 'bg-[#27272a] border-[#3f3f46] text-white hover:bg-[#3f3f46]'}`}
                            >
                                <SearchIcon className="w-3 h-3" />
                                <span className="hidden md:inline">{showChat ? 'FUNKVERBINDUNG' : 'FUNKVERBINDUNG'}</span>
                            </button>
                        </div>
                    </header>

                    {/* Scrollable Dashboard Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                        <div className="max-w-[2400px] mx-auto space-y-6">
                            
                            {viewMode === 'dashboard' && (
                                <>
                                    {/* Top Section: Auto-Responsive Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                                        {/* Key Metrics */}
                                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                                            <StatCard label="Gesamtanzahl" value={data.totalAnimals} sub="Erfasst" color="text-[#d4ff00]" />
                                            <StatCard label="Biodiversität" value={data.speciesAnalysis.length} sub="Arten" color="text-white" />
                                            <StatCard label="Auffälligkeiten" value={data.anomalies.length} sub="Gefunden" color="text-[#ff5500]" />
                                        </div>

                                        {/* Executive Summary - Spans 2 columns on large screens */}
                                        <div className="lg:col-span-2 p-5 rounded-xl bg-[#121214] border border-[#27272a] flex flex-col relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-50">
                                                <ArrowRightIcon className="w-5 h-5 text-[#d4ff00] opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0" />
                                            </div>
                                            <h3 className="text-[10px] font-mono text-gray-500 uppercase mb-3 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                                KI Zusammenfassung
                                            </h3>
                                            <p className="text-gray-300 text-sm md:text-base leading-relaxed flex-grow font-medium max-w-4xl">
                                                {data.summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Species Analysis Grid - Adaptive Columns */}
                                    <div>
                                        <h3 className="text-[10px] font-mono text-gray-500 uppercase mb-3 ml-1">Ökologische Aufschlüsselung</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 md:gap-4">
                                            {data.speciesAnalysis.map((species, idx) => (
                                                <SpeciesCard 
                                                    key={idx} 
                                                    data={species} 
                                                    isSelected={selectedSpecies === species.speciesName}
                                                    onClick={() => setSelectedSpecies(selectedSpecies === species.speciesName ? null : species.speciesName)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {viewMode === 'alerts' && (
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
                                        <AlertIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="text-orange-400 font-bold text-lg mb-1">Kritische Ereignisse</h3>
                                            <p className="text-sm text-orange-200/80">Das System hat {data.anomalies.length} Situationen identifiziert, die manuelle Überprüfung durch den Förster erfordern.</p>
                                        </div>
                                    </div>
                                    {data.anomalies.map((anomaly, idx) => (
                                        <div key={idx} className="p-5 bg-[#121214] border border-[#27272a] rounded-xl flex flex-col md:flex-row md:items-center gap-4 hover:border-gray-600 transition-colors">
                                            <div className={`p-2 rounded-lg ${anomaly.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'} self-start`}>
                                                <AlertIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 mb-1">
                                                     <span className={`text-[10px] font-bold font-mono px-1.5 rounded uppercase ${anomaly.severity === 'high' ? 'bg-red-500 text-black' : 'bg-yellow-500 text-black'}`}>
                                                        {anomaly.severity === 'high' ? 'HOCH' : 'MITTEL'}
                                                     </span>
                                                </div>
                                                <p className="text-gray-200">{anomaly.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-mono text-gray-500 block">BETROFFENE AUFNAHMEN</span>
                                                <span className="text-[#d4ff00] font-mono">{anomaly.imageIndices.length}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {data.anomalies.length === 0 && (
                                        <div className="p-10 text-center text-gray-500 bg-[#121214] border border-[#27272a] border-dashed rounded-xl">
                                            Keine Auffälligkeiten in diesem Datensatz gefunden.
                                        </div>
                                    )}
                                </div>
                            )}

                            {viewMode === 'settings' && (
                                <div className="max-w-2xl mx-auto bg-[#121214] border border-[#27272a] rounded-xl overflow-hidden">
                                    <div className="p-6 border-b border-[#27272a]">
                                        <h3 className="font-bold text-white text-lg">Systemkonfiguration</h3>
                                        <p className="text-sm text-gray-500">Einstellungen für die KI-Analyse und Benutzeroberfläche.</p>
                                    </div>
                                    <div className="divide-y divide-[#27272a]">
                                        <SettingRow label="Sprache" description="Standardsprache für Berichte und UI" control={<span className="text-[#d4ff00] font-mono text-sm">DEUTSCH (FORST)</span>} />
                                        <SettingRow label="Datenaufbewahrung" description="Automatisches Löschen lokaler Daten nach Sitzung" control={<Toggle active={true} />} />
                                        <SettingRow label="Hochauflösende Analyse" description="Verwendet Gemini Pro für maximale Detailgenauigkeit" control={<Toggle active={true} />} />
                                        <SettingRow label="Benachrichtigungen" description="Audio-Signal bei Abschluss der Analyse" control={<Toggle active={false} />} />
                                        <SettingRow label="Export Format" description="Standardformat für Berichte" control={<span className="text-gray-400 font-mono text-sm">JSON / PDF</span>} />
                                    </div>
                                    <div className="p-6 bg-[#18181b] text-center">
                                        <p className="text-xs text-gray-600 font-mono">WILDTIER OS v2.5.1 // BUILD 9942</p>
                                    </div>
                                </div>
                            )}

                            {/* Visual Log - Visible in Dashboard and Alerts */}
                            {(viewMode === 'dashboard' || viewMode === 'alerts') && (
                                <div className="pt-2 pb-10">
                                    <div className="flex justify-between items-end border-b border-[#27272a] pb-3 mb-5">
                                        <h3 className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#d4ff00]"></div>
                                            Bild-Logbuch
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-gray-400">FILTER: {selectedSpecies ? selectedSpecies.toUpperCase() : (viewMode === 'alerts' ? 'AUFFÄLLIGKEITEN' : 'ALLE')}</span>
                                            <span className="text-[10px] font-mono text-[#d4ff00] bg-[#d4ff00]/10 px-2 py-0.5 rounded border border-[#d4ff00]/20">
                                                {filteredImages.length} AUFNAHMEN
                                            </span>
                                        </div>
                                    </div>
                                    <ImageGrid images={filteredImages} speciesName={selectedSpecies} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat Panel - Desktop (Push Layout) */}
                <AnimatePresence>
                    {showChat && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 400, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="hidden md:flex flex-col border-l border-[#27272a] bg-[#121214] z-20 flex-shrink-0 h-full shadow-2xl overflow-hidden"
                        >
                            {/* Inner container with fixed width to prevent squashing */}
                            <div className="w-[400px] h-full flex flex-col">
                                <Chat reportContext={JSON.stringify(data)} onClose={() => setShowChat(false)} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Panel - Mobile (Overlay) */}
                <AnimatePresence>
                    {showChat && (
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: "0%" }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 h-full w-full md:hidden bg-[#121214] border-l border-[#27272a] z-50"
                        >
                           <Chat reportContext={JSON.stringify(data)} onClose={() => setShowChat(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const NavItem = ({ icon: Icon, active, onClick, label, alertCount }: any) => (
    <button 
        onClick={onClick} 
        className={`w-full aspect-square flex items-center justify-center rounded-lg transition-all duration-200 relative group ${active ? 'bg-[#27272a] text-white shadow-inner' : 'text-gray-600 hover:bg-[#1a1a1c] hover:text-gray-300'}`}
        title={label}
    >
        <Icon className="w-5 h-5" />
        {alertCount && alertCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff5500] rounded-full animate-pulse"></span>
        )}
        {/* Tooltip */}
        <span className="absolute left-full ml-4 bg-[#18181b] border border-[#27272a] text-xs text-gray-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            {label}
        </span>
    </button>
)

const SettingRow = ({ label, description, control }: any) => (
    <div className="p-4 flex items-center justify-between hover:bg-[#18181b]/50 transition-colors">
        <div>
            <div className="text-sm font-medium text-gray-200">{label}</div>
            <div className="text-xs text-gray-500">{description}</div>
        </div>
        <div>{control}</div>
    </div>
);

const Toggle = ({ active }: { active: boolean }) => (
    <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-[#d4ff00]' : 'bg-[#27272a]'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all ${active ? 'left-5' : 'left-0.5'}`}></div>
    </div>
);

const StatCard = ({ label, value, sub, color }: any) => (
    <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex flex-col justify-between items-start h-full hover:border-gray-700 transition-colors min-h-[100px]">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-bold font-sans tracking-tighter ${color}`}>{value}</span>
        </div>
        <span className="text-[9px] text-gray-600 font-medium mt-auto pt-2 border-t border-dashed border-gray-800 w-full">{sub}</span>
    </div>
);

interface SpeciesCardProps {
    data: SpeciesData;
    isSelected: boolean;
    onClick: () => void;
}

const SpeciesCard: React.FC<SpeciesCardProps> = ({ data, isSelected, onClick }) => (
    <div 
        onClick={onClick}
        className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden flex flex-col h-full min-h-[120px]
        ${isSelected ? 'bg-[#d4ff00]/5 border-[#d4ff00] shadow-[0_0_20px_-10px_rgba(212,255,0,0.2)]' : 'bg-[#18181b] border-[#27272a] hover:border-gray-600 hover:bg-[#1c1c20]'}`}
    >
        <div className="flex justify-between items-start mb-3">
            <h4 className={`font-bold text-sm tracking-tight truncate pr-2 ${isSelected ? 'text-[#d4ff00]' : 'text-gray-200 group-hover:text-white'}`}>
                {data.speciesName}
            </h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0 ${isSelected ? 'bg-[#d4ff00] text-black' : 'bg-[#27272a] text-gray-400 group-hover:text-gray-300'}`}>
                ANZ: {data.count}
            </span>
        </div>
        <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed flex-grow">{data.behavior}</p>
        
        {/* Hover effect decorative line */}
        <div className={`absolute bottom-0 left-0 h-0.5 bg-[#d4ff00] transition-all duration-300 ${isSelected ? 'w-full' : 'w-0 group-hover:w-full opacity-50'}`}></div>
    </div>
);

export default AnalysisView;