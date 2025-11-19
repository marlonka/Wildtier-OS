import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, ChatMessageSender } from '../types';
import { continueChat, generateSpeech, transcribeAudio } from '../services/geminiService';
import { MicIcon, SendIcon, SpeakerIcon, StopIcon, CloseIcon } from './Icons';

interface ChatProps {
    reportContext: string;
    onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ reportContext, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const newUserMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: ChatMessageSender.USER,
            text,
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        const chatHistory = messages.map(msg => ({
            role: msg.sender === ChatMessageSender.USER ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        try {
            const response = await continueChat(reportContext, chatHistory, text);
            const newAssistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: ChatMessageSender.ASSISTANT,
                text: response.text,
                sources: response.sources
            };
            setMessages(prev => [...prev, newAssistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now().toString(), sender: ChatMessageSender.ASSISTANT, text: "Übertragung fehlgeschlagen. Bitte wiederholen." }]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, reportContext]);
    
    const handleMicClick = async () => {
        if (isListening) {
            mediaRecorderRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    setIsLoading(true);
                    try {
                        const transcript = await transcribeAudio(audioBlob);
                        if(transcript) handleSendMessage(transcript);
                    } catch (error) {
                        console.error("Transcription error:", error);
                    } finally {
                       setIsLoading(false);
                    }
                };
                mediaRecorderRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error("Mic Access Denied", error);
            }
        }
    };

    const handleSpeakClick = async (messageId: string, text: string) => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        if (isSpeaking === messageId) {
            setIsSpeaking(null);
            return;
        }
        setIsSpeaking(messageId);
        try {
            if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioContext = audioContextRef.current;
            if (audioContext.state === 'suspended') await audioContext.resume();
            const audioBuffer = await generateSpeech(text);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.onended = () => { if (audioSourceRef.current === source) { setIsSpeaking(null); audioSourceRef.current = null; }};
            source.start(0);
            audioSourceRef.current = source;
        } catch (error) { setIsSpeaking(null); }
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#121214] text-gray-200 border-l border-[#27272a]">
            {/* Header */}
            <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#18181b]">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#d4ff00] rounded-full animate-pulse"></div>
                    <h2 className="text-sm font-bold font-sans tracking-widest text-white">FUNKVERBINDUNG</h2>
                </div>
                {/* Mobile only close button */}
                <button onClick={onClose} className="md:hidden text-gray-500 hover:text-white transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-hide bg-[#09090b]/50">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                        <div className="w-12 h-12 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center mb-2">
                            <MicIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-mono">KANAL OFFEN</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === ChatMessageSender.USER ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-lg border shadow-sm ${msg.sender === ChatMessageSender.USER 
                            ? 'bg-[#d4ff00]/10 border-[#d4ff00]/30 text-[#d4ff00] rounded-br-none' 
                            : 'bg-[#27272a] border-gray-700 text-gray-200 rounded-bl-none'}`}>
                            <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            
                            {msg.sender === ChatMessageSender.ASSISTANT && (
                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                                     <button onClick={() => handleSpeakClick(msg.id, msg.text)} className={`hover:text-[#d4ff00] transition ${isSpeaking === msg.id ? 'text-[#d4ff00]' : 'text-gray-500'}`}>
                                        <SpeakerIcon className="w-3.5 h-3.5" />
                                     </button>
                                     {msg.sources && (
                                         <div className="flex gap-2">
                                             {msg.sources.map((s, i) => (
                                                 <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="text-[10px] text-gray-500 hover:text-[#d4ff00] truncate max-w-[80px] block border border-gray-700 px-1 rounded">QUELLE {i+1}</a>
                                             ))}
                                         </div>
                                     )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-[#27272a] p-3 rounded-lg rounded-bl-none border border-gray-700">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[#27272a] bg-[#18181b]">
                <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] rounded-lg p-1">
                    <button onClick={handleMicClick} className={`p-2 rounded-md transition-colors flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white'}`}>
                        {isListening ? <StopIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(input)}
                        placeholder="Befehl eingeben..."
                        className="flex-grow w-full bg-transparent border-none focus:ring-0 text-sm font-mono text-white placeholder-gray-600 min-w-0"
                        disabled={isLoading || isListening}
                    />
                    <button onClick={() => handleSendMessage(input)} className="p-2 bg-[#d4ff00] text-black rounded-md hover:bg-[#b5d600] transition-colors disabled:opacity-50 flex-shrink-0">
                        <SendIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;