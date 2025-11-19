import React from 'react';
import { 
    Camera, Upload, Sparkles, Download, Plus, Coins, X, Mic, Send, Volume2, 
    Square, Link as LinkIconLucide, User, AlertTriangle, Activity, Grid, List, 
    MapPin, ChevronRight, BarChart3, Settings, FileText, Search
} from 'lucide-react';

export const CameraIcon = Camera;
export const UploadIcon = Upload;
export const SparklesIcon = Sparkles;
export const DownloadIcon = Download;
export const NewAnalysisIcon = Plus;
export const TokenIcon = Coins;
export const EuroIcon = (props: any) => <span {...props} className={`font-mono font-bold ${props.className}`}>$</span>;
export const CloseIcon = X;
export const MicIcon = Mic;
export const SendIcon = Send;
export const SpeakerIcon = Volume2;
export const StopIcon = Square;
export const LinkIcon = LinkIconLucide;
export const UserIcon = User;
export const AlertIcon = AlertTriangle;
export const ActivityIcon = Activity;
export const GridIcon = Grid;
export const ListIcon = List;
export const MapPinIcon = MapPin;
export const ArrowRightIcon = ChevronRight;
export const ChartIcon = BarChart3;
export const SettingsIcon = Settings;
export const FileIcon = FileText;
export const SearchIcon = Search;