import React, { useState, useCallback, useRef } from 'react';
import { editImageWithPrompt } from './services/geminiService';
import type { ImageData } from './types';

// --- TYPES ---
type Page = 'edit' | 'hd' | 'expand' | 'frame';

// --- ICONS ---
const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
);

const HdIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
    </svg>
);

const FrameIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.19c0-.868.351-1.666.935-2.25.456-.455.735-1.05.735-1.676v-1.05a.75.75 0 01.75-.75z" clipRule="evenodd" />
    <path d="M3 19.5a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-.008zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zM6 4.5a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V4.5zM3.75 7.5a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75V7.5zM3.75 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H4.5a.75.75 0 01-.75-.75v-.008zM15 4.5a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H15.75a.75.75 0 01-.75-.75V4.5z" />
  </svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const ExchangeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

// --- HELPERS ---
const fileToData = (file: File): Promise<{ dataUrl: string, imageData: ImageData }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                const [header, base64] = dataUrl.split(',');
                const mimeType = header.match(/:(.*?);/)?.[1];
                if (base64 && mimeType) {
                    resolve({ dataUrl, imageData: { base64, mimeType } });
                } else {
                    reject(new Error("Invalid file format."));
                }
            } else {
                reject(new Error("Failed to read file."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const mimeType = imageUrl.match(/data:(.*);base64,/)?.[1] || 'image/png';
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `generated-image.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// --- GENERIC COMPONENTS ---
const Loader: React.FC = () => (
    <div className="flex justify-center items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" style={{animation: 'spin 1s linear infinite', height: '1.25rem', width: '1.25rem', marginRight: '0.75rem', marginLeft: '-0.25rem'}} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Generating...</span>
    </div>
);
interface ImageCardProps {
  title: string;
  imageUrl: string | null;
  children?: React.ReactNode;
  onDownload?: () => void;
  onExchange?: () => void;
  isLoading?: boolean;
}
const ImageCard: React.FC<ImageCardProps> = ({ title, imageUrl, onDownload, onExchange, isLoading, children }) => (
  <div className="glass-card flex flex-col p-4 h-full aspect-square">
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-200">{title}</h2>
        <div className="flex items-center gap-2">
            {imageUrl && onExchange && (
                <button
                    onClick={onExchange}
                    className="btn btn-secondary"
                    style={{padding: '0.375rem 0.75rem', fontSize: '0.875rem'}}
                    aria-label="Use as original"
                    title="Use this image as the new original for further edits"
                >
                    <ExchangeIcon className="w-4 h-4" />
                    <span>Use as Original</span>
                </button>
            )}
            {imageUrl && onDownload && (
                <button
                    onClick={onDownload}
                    className="btn btn-secondary"
                    style={{padding: '0.375rem 0.75rem', fontSize: '0.875rem'}}
                    aria-label="Download edited image"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download</span>
                </button>
            )}
        </div>
    </div>
    <div className={`w-full flex-grow flex items-center justify-center overflow-hidden transition-colors ${imageUrl ? 'rounded-lg' : 'image-placeholder'} ${isLoading ? 'loading' : ''}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain animate-fade-in" />
      ) : (
        children
      )}
    </div>
  </div>
);
interface LoginModalProps {
    onLogin: (success: boolean) => void;
    onClose: () => void;
}
const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Charlie' && password === '23303383') {
            onLogin(true);
        } else {
            setError('Invalid username or password.');
            onLogin(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="glass-card p-8 w-full max-w-sm animate-modal-pop" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-6">
                    <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Login
                    </span>
                </h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-300 mb-2">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="custom-input"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="custom-input"
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                    <button type="submit" className="w-full btn btn-primary py-3 text-lg">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};
interface HistoryItem {
    id: number;
    originalImageUrl: string;
    prompt: string;
    editedImageUrl: string;
}
interface AdminHistoryPanelProps {
    history: HistoryItem[];
    onRemove: (id: number) => void;
}
const AdminHistoryPanel: React.FC<AdminHistoryPanelProps> = ({ history, onRemove }) => {
    if (history.length === 0) {
        return (
            <div className="mt-12 text-center text-gray-500">
                <h2 className="text-3xl font-bold text-gray-400 mb-4">Generation History</h2>
                <p>No images have been generated in this session yet.</p>
            </div>
        )
    }
    return (
        <div className="mt-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-3xl font-bold text-center mb-8">
                <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Generation History
                </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {history.slice().reverse().map((item) => (
                    <div key={item.id} className="glass-card p-4 flex flex-col gap-4 animate-fade-in-up">
                        <div className="grid grid-cols-2 gap-3">
                            <img src={item.originalImageUrl} alt="Original" className="rounded-lg aspect-square object-contain bg-black/30" />
                            <img src={item.editedImageUrl} alt="Edited" className="rounded-lg aspect-square object-contain bg-black/30" />
                        </div>
                        <p className="text-sm text-gray-300 bg-black/30 p-2 rounded-md italic">
                           &quot;{item.prompt}&quot;
                        </p>
                        <button 
                            onClick={() => onRemove(item.id)}
                            className="mt-auto w-full btn btn-danger py-2 text-sm"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
const PageHeader: React.FC<{title: string, subtitle: string}> = ({title, subtitle}) => (
    <header className="page-header animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
          <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {title}
          </span>
        </h1>
        <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">
          {subtitle}
        </p>
    </header>
);

// --- Image Editor Page ---
const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setEditedImage(null);
      try {
        const { dataUrl, imageData } = await fileToData(file);
        setOriginalImage(imageData);
        setOriginalImageUrl(dataUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred during file processing.");
        setOriginalImage(null);
        setOriginalImageUrl(null);
      }
    }
  }, []);

  const handleGenerateClick = async () => {
    if (!originalImage || !prompt.trim() || !originalImageUrl) {
      setError("Please upload an image and enter an editing prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const resultImageUrl = await editImageWithPrompt(originalImage, prompt);
      setEditedImage(resultImageUrl);
      setHistory(prev => [...prev, {
          id: Date.now(),
          originalImageUrl: originalImageUrl,
          prompt: prompt,
          editedImageUrl: resultImageUrl
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageExchange = useCallback(() => {
    if (!editedImage) return;
    const [header, base64] = editedImage.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (base64 && mimeType) {
      setOriginalImage({ base64, mimeType });
      setOriginalImageUrl(editedImage);
      setEditedImage(null);
      setPrompt('');
      setError(null);
    } else {
      setError("Could not process the edited image to use as a new original.");
    }
  }, [editedImage]);

  const handleLogin = (success: boolean) => {
      if (success) {
          setIsAdminLoggedIn(true);
          setShowLoginModal(false);
      }
  };
  
  const handleLogout = () => setIsAdminLoggedIn(false);
  const handleRemoveHistoryItem = (id: number) => setHistory(prev => prev.filter(item => item.id !== id));
  const isGenerateDisabled = isLoading || !originalImage || !prompt.trim();

  return (
    <div className="flex flex-col">
      {showLoginModal && <LoginModal onLogin={handleLogin} onClose={() => setShowLoginModal(false)} />}
      <PageHeader title="Gemini Image Editor" subtitle="Transform your images with AI. Upload, describe your edit, and let Gemini bring it to life."/>
      
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6 p-6 glass-card opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div>
            <label className="text-lg font-semibold text-gray-200 mb-2 block">1. Upload Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full btn btn-primary py-3">
              <UploadIcon className="w-6 h-6" />
              <span>{originalImage ? 'Change Image' : 'Select an Image'}</span>
            </button>
          </div>
          <div>
            <label htmlFor="prompt" className="text-lg font-semibold text-gray-200 mb-2 block">2. Describe Your Edit</label>
            <textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'Make it photorealistic with natural afternoon lighting', 'Change the background and match the lighting', 'Add a retro filter', 'Do not change the face'" className="w-full h-32 p-3 custom-textarea" />
          </div>
          <div className="mt-auto pt-6">
              <button onClick={handleGenerateClick} disabled={isGenerateDisabled} className="w-full btn btn-primary py-4 text-lg">
                  {isLoading ? <Loader /> : <> <SparklesIcon className="w-6 h-6" /> Generate</>}
              </button>
              {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <ImageCard title="Original" imageUrl={originalImageUrl}>
            <div className="flex flex-col items-center">
              <UploadIcon className="w-12 h-12 mb-2" />
              <span>Upload an image to get started</span>
            </div>
          </ImageCard>
          <ImageCard title="Edited" imageUrl={editedImage} onDownload={() => editedImage && downloadImage(editedImage)} onExchange={handleImageExchange} isLoading={isLoading}>
              <div className="flex flex-col items-center">
                  <SparklesIcon className="w-12 h-12 mb-2" />
                  <span>Your generated image will appear here</span>
              </div>
          </ImageCard>
        </div>
      </main>
      {isAdminLoggedIn && <AdminHistoryPanel history={history} onRemove={handleRemoveHistoryItem} />}
      <footer className="text-center py-6 mt-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          {isAdminLoggedIn ? (
              <button onClick={handleLogout} className="btn btn-secondary text-sm">Logout</button>
          ) : (
              <button onClick={() => setShowLoginModal(true)} className="btn btn-secondary text-sm">Admin Login</button>
          )}
      </footer>
    </div>
  );
};

// --- Other Pages ---

const HdConverter: React.FC = () => {
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [hdImageUrl, setHdImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setHdImageUrl(null);
      try {
        const { dataUrl } = await fileToData(file);
        setOriginalImageUrl(dataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred during file processing.");
        setOriginalImageUrl(null);
      }
    }
  }, []);

  const handleGenerate = () => {
    if (!originalImageUrl) return;
    setIsLoading(true);
    setError(null);
    setHdImageUrl(null);
    // Simulate API call
    setTimeout(() => {
      setHdImageUrl(originalImageUrl);
      setIsLoading(false);
    }, 2000);
  };
  
  return (
    <div>
      <PageHeader title="AI HD Converter" subtitle="Upscale your images to high definition with the power of AI. (Simulation)"/>
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6 p-6 glass-card opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full btn btn-primary py-3">
                <UploadIcon className="w-6 h-6" />
                <span>{originalImageUrl ? 'Change Image' : 'Select an Image'}</span>
            </button>
            <div className="mt-auto pt-6">
                <button onClick={handleGenerate} disabled={isLoading || !originalImageUrl} className="w-full btn btn-primary py-4 text-lg">
                    {isLoading ? <Loader /> : <> <HdIcon className="w-6 h-6" /> Convert to HD</>}
                </button>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <ImageCard title="Original" imageUrl={originalImageUrl}>
              <div className="flex flex-col items-center"><UploadIcon className="w-12 h-12 mb-2" /><span>Upload an image</span></div>
            </ImageCard>
            <ImageCard title="HD Result" imageUrl={hdImageUrl} isLoading={isLoading} onDownload={() => hdImageUrl && downloadImage(hdImageUrl)}>
              <div className="flex flex-col items-center"><SparklesIcon className="w-12 h-12 mb-2" /><span>Your HD image will appear here</span></div>
            </ImageCard>
          </div>
      </main>
    </div>
  );
};

const PicExpander: React.FC = () => {
    type ExpandDirection = 'all' | 'horizontal' | 'vertical';
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [expandDirection, setExpandDirection] = useState<ExpandDirection>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError(null);
            setExpandedImageUrl(null);
            try {
                const { dataUrl } = await fileToData(file);
                setOriginalImageUrl(dataUrl);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
                setOriginalImageUrl(null);
            }
        }
    }, []);

    const handleGenerate = () => {
        if (!originalImageUrl) return;
        setIsLoading(true);
        setError(null);
        setExpandedImageUrl(null);

        // Simulate API call with canvas
        setTimeout(() => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                const paddingH = expandDirection === 'all' || expandDirection === 'horizontal' ? img.width * 0.25 : 0;
                const paddingV = expandDirection === 'all' || expandDirection === 'vertical' ? img.height * 0.25 : 0;

                canvas.width = img.width + paddingH * 2;
                canvas.height = img.height + paddingV * 2;
                
                ctx.fillStyle = '#111017'; // A dark color matching theme
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, paddingH, paddingV);

                setExpandedImageUrl(canvas.toDataURL());
                setIsLoading(false);
            };
            img.src = originalImageUrl;
        }, 2000);
    };
  
    return (
        <div>
            <PageHeader title="AI Pic Expand" subtitle="Expand the boundaries of your photos and let AI fill in the rest. (Simulation)"/>
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6 p-6 glass-card opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full btn btn-primary py-3">
                        <UploadIcon className="w-6 h-6" />
                        <span>{originalImageUrl ? 'Change Image' : 'Select an Image'}</span>
                    </button>

                    <div>
                      <label className="text-lg font-semibold text-gray-200 mb-2 block">Expansion Style</label>
                      <div className="radio-group">
                        <input type="radio" id="expand-all" name="expand" value="all" checked={expandDirection === 'all'} onChange={() => setExpandDirection('all')} />
                        <label htmlFor="expand-all">All Sides</label>
                        <input type="radio" id="expand-h" name="expand" value="horizontal" checked={expandDirection === 'horizontal'} onChange={() => setExpandDirection('horizontal')} />
                        <label htmlFor="expand-h">Horizontal</label>
                        <input type="radio" id="expand-v" name="expand" value="vertical" checked={expandDirection === 'vertical'} onChange={() => setExpandDirection('vertical')} />
                        <label htmlFor="expand-v">Vertical</label>
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                        <button onClick={handleGenerate} disabled={isLoading || !originalImageUrl} className="w-full btn btn-primary py-4 text-lg">
                            {isLoading ? <Loader /> : <> <ExpandIcon className="w-6 h-6" /> Expand Image</>}
                        </button>
                        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <ImageCard title="Original" imageUrl={originalImageUrl}>
                      <div className="flex flex-col items-center"><UploadIcon className="w-12 h-12 mb-2" /><span>Upload an image</span></div>
                    </ImageCard>
                    <ImageCard title="Expanded Result" imageUrl={expandedImageUrl} isLoading={isLoading} onDownload={() => expandedImageUrl && downloadImage(expandedImageUrl)}>
                      <div className="flex flex-col items-center"><SparklesIcon className="w-12 h-12 mb-2" /><span>Your expanded image will appear here</span></div>
                    </ImageCard>
                </div>
            </main>
        </div>
    );
};

const AutoFramer: React.FC = () => {
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [framedImageUrl, setFramedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError(null);
            setFramedImageUrl(null);
            try {
                const { dataUrl } = await fileToData(file);
                setOriginalImageUrl(dataUrl);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
                setOriginalImageUrl(null);
            }
        }
    }, []);

    const handleGenerate = () => {
        if (!originalImageUrl) return;
        setIsLoading(true);
        setError(null);
        setFramedImageUrl(null);

        // Simulate API call with canvas
        setTimeout(() => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                
                const padding = Math.min(img.width, img.height) * 0.05;
                canvas.width = img.width + padding * 2;
                canvas.height = img.height + padding * 2;

                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#8E44AD');
                gradient.addColorStop(1, '#3498DB');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, padding, padding, img.width, img.height);

                setFramedImageUrl(canvas.toDataURL());
                setIsLoading(false);
            };
            img.src = originalImageUrl;
        }, 2000);
    };

    return (
        <div>
            <PageHeader title="Auto Frame" subtitle="Automatically add stylish and context-aware frames to your images. (Simulation)"/>
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col gap-6 p-6 glass-card opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                    {/* Fix: Corrected typo from `fileInput` to `fileInputRef`. */}
                    <button onClick={() => fileInputRef.current?.click()} className="w-full btn btn-primary py-3">
                        <UploadIcon className="w-6 h-6" />
                        <span>{originalImageUrl ? 'Change Image' : 'Select an Image'}</span>
                    </button>
                    <div className="mt-auto pt-6">
                        <button onClick={handleGenerate} disabled={isLoading || !originalImageUrl} className="w-full btn btn-primary py-4 text-lg">
                            {isLoading ? <Loader /> : <> <FrameIcon className="w-6 h-6" /> Generate Frame</>}
                        </button>
                        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <ImageCard title="Original" imageUrl={originalImageUrl}>
                      <div className="flex flex-col items-center"><UploadIcon className="w-12 h-12 mb-2" /><span>Upload an image</span></div>
                    </ImageCard>
                    <ImageCard title="Framed Result" imageUrl={framedImageUrl} isLoading={isLoading} onDownload={() => framedImageUrl && downloadImage(framedImageUrl)}>
                      <div className="flex flex-col items-center"><SparklesIcon className="w-12 h-12 mb-2" /><span>Your framed image will appear here</span></div>
                    </ImageCard>
                </div>
            </main>
        </div>
    );
};


// --- Sidebar Component ---
interface SidebarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}
const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isOpen, setIsOpen }) => {
    const navItems = [
        { id: 'edit', label: 'Pic Edit', icon: <EditIcon className="w-6 h-6" /> },
        { id: 'hd', label: 'AI HD Convert', icon: <HdIcon className="w-6 h-6" /> },
        { id: 'expand', label: 'AI Pic Expand', icon: <ExpandIcon className="w-6 h-6" /> },
        { id: 'frame', label: 'Auto Frame', icon: <FrameIcon className="w-6 h-6" /> },
    ];
    const handleNavigation = (page: Page) => {
        onNavigate(page);
        if (window.innerWidth < 1024) { setIsOpen(false); }
    };
    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-purple-400" />
                    <span className="text-xl font-bold">Gemini Suite</span>
                </div>
                 <button className="lg:hidden btn-icon" onClick={() => setIsOpen(false)}>
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <nav>
                <ul className="nav-list">
                    {navItems.map(item => (
                        <li key={item.id}>
                            <a 
                                href="#"
                                className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavigation(item.id as Page);
                                }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

// --- MAIN APP component for layout and routing ---
const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('edit');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'edit': return <ImageEditor />;
      case 'hd': return <HdConverter />;
      case 'expand': return <PicExpander />;
      case 'frame': return <AutoFramer />;
      default: return <ImageEditor />;
    }
  };

  return (
    <div className="app-container">
        <Sidebar activePage={activePage} onNavigate={setActivePage} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="main-content">
            <button className="hamburger-menu lg:hidden" onClick={() => setSidebarOpen(true)}>
                <MenuIcon className="w-6 h-6" />
            </button>
            <div className="page-content">
                {renderPage()}
            </div>
        </main>
    </div>
  );
};

export default App;