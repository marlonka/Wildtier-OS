export enum AppView {
    UPLOAD = 'UPLOAD',
    PROCESSING = 'PROCESSING',
    ANALYSIS = 'ANALYSIS',
}

export interface SpeciesData {
    speciesName: string;
    count: number;
    behavior: string;
    imageIndices: number[];
}

export interface AnomalyData {
    description: string;
    imageIndices: number[];
    severity: 'low' | 'medium' | 'high';
}

export interface AnalysisData {
    summary: string;
    totalAnimals: number;
    speciesAnalysis: SpeciesData[];
    anomalies: AnomalyData[];
    nonWildlifeIndices: number[];
}

export interface AnalysisResult {
    data: AnalysisData;
    rawMarkdown?: string; // Legacy fallback or for chat context
    tokens: number;
    estimatedCost: string;
}

export enum ChatMessageSender {
    USER = 'user',
    ASSISTANT = 'assistant',
}

export interface ChatMessage {
    id: string;
    sender: ChatMessageSender;
    text: string;
    sources?: { title: string; uri: string }[];
    isAudio?: boolean;
}