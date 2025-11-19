import { GoogleGenAI, Modality, Type, Schema } from "@google/genai";
import { AnalysisResult, AnalysisData } from "../types";
import { decode, decodeAudioData } from './audioUtils';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

// JSON Schema for the structured output
const analysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "Eine prägnante Zusammenfassung der Ergebnisse auf Deutsch." },
        totalAnimals: { type: Type.NUMBER, description: "Gesamtanzahl aller erkannten Tiere." },
        speciesAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    speciesName: { type: Type.STRING, description: "Deutscher Name der Tierart." },
                    count: { type: Type.NUMBER },
                    behavior: { type: Type.STRING, description: "Beobachtung zu Verhalten, Gesundheit oder Gruppierung auf Deutsch." },
                    imageIndices: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Null-basierte Indizes der Bilder." },
                },
                required: ["speciesName", "count", "behavior", "imageIndices"]
            }
        },
        anomalies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING, description: "Beschreibung der Auffälligkeit auf Deutsch (Verletzungen, fremde Objekte, Krankheiten)." },
                    imageIndices: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
                },
                required: ["description", "imageIndices", "severity"]
            }
        },
        nonWildlifeIndices: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "Indizes von Bildern mit Menschen, Fahrzeugen oder Leere." }
    },
    required: ["summary", "totalAnimals", "speciesAnalysis", "anomalies", "nonWildlifeIndices"]
};

export const analyzeImages = async (files: File[], onProgress: (progress: number) => void): Promise<AnalysisResult> => {
    // Initial rapid progress to engage user
    onProgress(5);
    
    const imageParts = await Promise.all(files.map(fileToGenerativePart));
    onProgress(15);

    const model = 'gemini-2.5-pro';
    
    const prompt = `
    Analysiere diese Wildkamera-Bilder für einen Förster im deutschen Wald-Kontext.
    Erstelle eine strukturierte Analyse.
    Identifiziere Tierarten (nutze präzise deutsche Namen, z.B. Rothirsch, Wildschwein, Reh), zähle Individuen und notiere Verhaltensweisen.
    Identifiziere Auffälligkeiten (Verletzungen, Räude, seltene Arten, Zäune/Infrastruktur).
    Klassifiziere Bilder ohne Wildtiere (Menschen, Fahrzeuge, Leeraufnahmen).
    Die Bild-Indizes entsprechen der Reihenfolge der hochgeladenen Dateien (0-basiert).
    Antworte ausschließlich im definierten JSON-Format.
    `;

    // Realistic Asymptotic Loading Simulation
    let currentProgress = 15;
    const progressInterval = setInterval(() => {
        if (currentProgress < 60) {
            currentProgress += Math.random() * 3;
        } else if (currentProgress < 85) {
            currentProgress += Math.random() * 1.5;
        } else if (currentProgress < 95) {
            currentProgress += Math.random() * 0.2;
        }
        
        if (currentProgress > 95) currentProgress = 95;
        onProgress(currentProgress);
    }, 250);

    try {
        const response = await ai.models.generateContent({
          model: model,
          contents: [{ parts: [{ text: prompt }, ...imageParts] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
            systemInstruction: "Du bist ein erfahrener Wildbiologe und Forstwirt. Sei präzise, fachlich korrekt und nutze waidmännische Fachbegriffe wenn passend."
          }
        });

        clearInterval(progressInterval);
        onProgress(100);
        
        const tokens = response.usageMetadata?.totalTokenCount ?? 0;
        // Estimated cost calculation
        const estimatedCost = ((tokens / 1000000) * 2.00).toFixed(2); 

        let data: AnalysisData;
        try {
            if (response.text) {
                 data = JSON.parse(response.text);
            } else {
                throw new Error("Empty response");
            }
        } catch (e) {
            console.error("Failed to parse JSON", e);
            data = { summary: "Fehler bei der Datenverarbeitung.", totalAnimals: 0, speciesAnalysis: [], anomalies: [], nonWildlifeIndices: [] };
        }

        return {
            data,
            rawMarkdown: JSON.stringify(data, null, 2),
            tokens,
            estimatedCost: `$${estimatedCost}`,
        };

    } catch (error) {
        clearInterval(progressInterval);
        throw error;
    }
};

export const continueChat = async (reportContext: string, history: {role: string, parts: {text: string}[]}[], message: string) => {
    const model = 'gemini-2.5-flash';
    
    const systemContext = `
    Du bist ein intelligenter Assistent für ein Wildtier-Überwachungssystem für Förster.
    Du hast Zugriff auf folgende Analysedaten im JSON-Format:
    ${reportContext}
    
    Beantworte die Fragen des Nutzers basierend auf diesen Daten. 
    Antworte immer auf Deutsch. Sei kurz, prägnant und hilfreich für den Arbeitseinsatz im Revier.
    `;

    const chat = ai.chats.create({
      model: model,
      history: [
          { role: 'user', parts: [{ text: "System initialisierung." }] },
          { role: 'model', parts: [{ text: "System bereit. Warte auf Eingabe." }] },
          ...history
      ],
      config: {
          systemInstruction: systemContext,
          tools: [{googleSearch: {}}],
      },
    });

    const response = await chat.sendMessage({message});
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter(Boolean)
        .map((web: any) => ({ title: web.title, uri: web.uri }));

    return {
        text: response.text,
        sources: sources.length > 0 ? sources : undefined,
    };
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const audioB64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(audioBlob);
    });

    const audioPart = {
        inlineData: {
            data: audioB64,
            mimeType: audioBlob.type,
        },
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: [{parts: [{text: "Transkribiere diese Audioaufnahme direkt auf Deutsch, ohne Einleitung."}, audioPart]}]
    });

    return response.text;
};

export const generateSpeech = async (text: string): Promise<AudioBuffer> => {
    const model = 'gemini-2.5-flash-preview-tts';

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deeper, more serious voice
            },
        },
      },
    });
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("No audio data returned from API.");
    }
    
    const audioData = decode(base64Audio);
    return await decodeAudioData(audioData, audioContext, 24000, 1);
};