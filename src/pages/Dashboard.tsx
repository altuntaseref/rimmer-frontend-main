
import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [carImage, setCarImage] = useState<File | null>(null);
  const [rimImage, setRimImage] = useState<File | null>(null);
  const [carImagePreview, setCarImagePreview] = useState<string | null>(null);
  const [rimImagePreview, setRimImagePreview] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'car' | 'rim') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === 'car') {
          setCarImage(file);
          setCarImagePreview(reader.result as string);
        } else {
          setRimImage(file);
          setRimImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!carImage || !rimImage) {
      setError('Please upload both a car and a rim image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImageUrl(null);

    try {
      const formData = new FormData();
      // Backend alan isimleri: car_file ve rim_file
      formData.append('car_file', carImage);
      formData.append('rim_file', rimImage);

      // 1. Upload images (Authorization header, AuthContext üzerinden axios.defaults ile ayarlı)
      const uploadResponse = await axios.post('/api/generations/upload', formData);

      const { id: generationId } = uploadResponse.data;

      // 2. Process images
      const processResponse = await axios.post(`/api/generations/${generationId}/process`);

      setResultImageUrl(processResponse.data.result_image_url);

    } catch (err: unknown) {
      console.error('Generation failed:', err);
      let message = 'An unexpected error occurred.';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (typeof detail === 'string') {
          // FastAPI / API string detail
          message = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI 422 genelde dizi döner: [{loc, msg, type, input}, ...]
          message = detail
            .map((d: any) => (typeof d === 'string' ? d : d?.msg || JSON.stringify(d)))
            .join(', ');
        } else if (detail && typeof detail === 'object') {
          // Tekil nesne dönerse
          const maybeMsg = (detail as any).msg || (detail as any).message;
          message = typeof maybeMsg === 'string' ? maybeMsg : JSON.stringify(detail);
        } else if (typeof err.message === 'string') {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      // Her zaman string set et
      setError(String(message));
    } finally {
      setIsLoading(false);
    }
  };
  
  const style = `
    body {
        font-family: 'Inter', sans-serif;
    }
    .font-display {
        font-family: 'Space Grotesk', sans-serif;
    }
    ::-webkit-scrollbar {
        width: 6px;
    }
    ::-webkit-scrollbar-track {
        background: #0A0A0A;
    }
    ::-webkit-scrollbar-thumb {
        background: #262626;
        border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #333;
    }
    .drop-zone:hover {
        border-color: #DFFF00;
        background-color: rgba(223, 255, 0, 0.02);
    }
    .drop-zone-preview {
        background-size: cover;
        background-position: center;
    }
  `;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex overflow-hidden w-full">
      <style>{style}</style>
      <aside className="w-64 border-r border-slate-200 dark:border-border-dark flex flex-col bg-white dark:bg-background-dark z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-icons-outlined text-black font-bold">tire_repair</span>
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight">WheelDrop</h1>
          </div>
          <nav className="space-y-1">
            <a className="flex items-center gap-3 px-3 py-2 text-primary bg-primary/10 rounded-lg group" href="#">
              <span className="material-icons-outlined text-[20px]">auto_awesome</span>
              <span className="font-medium">Wheel Studio</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark rounded-lg transition-colors group" href="#">
              <span className="material-icons-outlined text-[20px]">history</span>
              <span className="font-medium">History</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark rounded-lg transition-colors group justify-between" href="#">
              <div className="flex items-center gap-3">
                <span className="material-icons-outlined text-[20px]">brush</span>
                <span className="font-medium">Wrap Studio</span>
              </div>
              <span className="text-[10px] font-bold bg-primary text-black px-1.5 py-0.5 rounded leading-none">NEW</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark rounded-lg transition-colors group" href="#">
              <span className="material-icons-outlined text-[20px]">public</span>
              <span className="font-medium">Community</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-card-dark rounded-lg transition-colors group" href="#">
              <span className="material-icons-outlined text-[20px]">settings</span>
              <span className="font-medium">Settings</span>
            </a>
          </nav>
          <div className="mt-8 flex items-center gap-2 px-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-500">All operational</span>
          </div>
        </div>
        <div className="mt-auto p-4 space-y-4">
          <div className="bg-slate-100 dark:bg-card-dark border border-slate-200 dark:border-border-dark p-4 rounded-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Free Plan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Unlock 50 renders every month with no watermark.
              <span className="block mt-1 text-primary">Starter • $4.99/mo</span>
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all">
              <span className="material-icons-outlined text-sm">bolt</span>
              Upgrade Now
            </button>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-border-dark text-slate-400 font-bold">
              Ş
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Şerafettin Altuntaş</p>
              <p className="text-[11px] text-slate-500">4 credits left</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-white transition-colors">
              <span className="material-icons-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen bg-slate-50 dark:bg-background-dark overflow-y-auto">
        <header className="h-16 border-b border-slate-200 dark:border-border-dark flex items-center justify-between px-8 bg-white dark:bg-background-dark sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-card-dark rounded border border-slate-200 dark:border-border-dark">
              <span className="material-icons-outlined text-lg text-slate-400">chevron_left</span>
            </button>
            <h2 className="font-display font-bold text-lg">Workspace</h2>
          </div>
          <button className="text-sm font-semibold bg-blue-600/10 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600/20 transition-all">
            View Pricing
          </button>
        </header>
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#DFFF00 0.5px, transparent 0.5px)', backgroundSize: '20px 20px'}}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl font-display font-bold tracking-tight">Upload assets</h1>
                <span className="material-icons-outlined text-slate-400 cursor-help text-lg">info</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-xl">
                Drag and Drop (or click and select) your car and wheel imagery so we can blend them together.
              </p>
              {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-lg mb-6">{error}</p>}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div onClick={() => document.getElementById('car-input')?.click()}>
                  <input type="file" id="car-input" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'car')} />
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
                    <span className="font-bold text-sm tracking-wide">Car photo</span>
                  </div>
                  <div 
                    className={`drop-zone border-2 border-dashed border-slate-200 dark:border-border-dark rounded-2xl aspect-[4/3] flex flex-col items-center justify-center group cursor-pointer transition-all ${carImagePreview ? 'drop-zone-preview' : ''}`}
                    style={{backgroundImage: carImagePreview ? `url(${carImagePreview})` : 'none'}}
                  >
                    {!carImagePreview && (
                      <>
                        <div className="w-16 h-16 bg-slate-100 dark:bg-background-dark rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-border-dark group-hover:scale-110 transition-transform">
                          <span className="material-icons-outlined text-slate-400 group-hover:text-primary">directions_car</span>
                        </div>
                        <h4 className="font-bold mb-1">Car reference</h4>
                        <p className="text-xs text-slate-500">PNG, JPG, or WebP</p>
                      </>
                    )}
                  </div>
                </div>
                <div onClick={() => document.getElementById('rim-input')?.click()}>
                  <input type="file" id="rim-input" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'rim')} />
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">2</span>
                      <span className="font-bold text-sm tracking-wide">Wheel image</span>
                    </div>
                    <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark px-3 py-1.5 rounded-lg hover:border-primary transition-colors">
                      <span className="material-icons-outlined text-xs">grid_view</span>
                      Wheel library
                    </button>
                  </div>
                  <div 
                    className={`drop-zone border-2 border-dashed border-slate-200 dark:border-border-dark rounded-2xl aspect-[4/3] flex flex-col items-center justify-center group cursor-pointer transition-all ${rimImagePreview ? 'drop-zone-preview' : ''}`}
                    style={{backgroundImage: rimImagePreview ? `url(${rimImagePreview})` : 'none'}}
                  >
                    {!rimImagePreview && (
                      <>
                        <div className="w-16 h-16 bg-slate-100 dark:bg-background-dark rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-border-dark group-hover:scale-110 transition-transform">
                          <span className="material-icons-outlined text-slate-400 group-hover:text-primary">motion_photos_on</span>
                        </div>
                        <h4 className="font-bold mb-1">Wheel reference</h4>
                        <p className="text-xs text-slate-500">PNG preferred • JPG/WebP ok</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-border-dark pt-8">
                <button className="w-full flex items-center justify-between text-left group">
                  <div>
                    <h3 className="font-bold mb-1">Optional Settings</h3>
                    <p className="text-sm text-slate-500">Fine-tune your swap with additional settings</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-background-dark flex items-center justify-center border border-slate-200 dark:border-border-dark">
                    <span className="material-icons-outlined text-slate-400 group-hover:text-white transition-colors">expand_more</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Available Credits</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold">4</span>
                  <span className="text-[10px] text-slate-500">Plan: 4 • Add-on: 0</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg p-2 flex flex-col items-center min-w-[80px] opacity-50">
                  <span className="text-[10px] font-bold">Standard</span>
                  <span className="text-[10px] text-slate-500">1K • 2 credits</span>
                </div>
                <div className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg p-2 flex flex-col items-center min-w-[80px] opacity-50">
                  <span className="text-[10px] font-bold">High Res</span>
                  <span className="text-[10px] text-slate-500">2K • 4 credits</span>
                </div>
                <div className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-lg p-2 flex flex-col items-center min-w-[80px] opacity-50">
                  <span className="text-[10px] font-bold">4K/Ultra</span>
                  <span className="text-[10px] text-slate-500">4K • 10 credits</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="px-8 py-4 bg-primary hover:brightness-110 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>GENERATING...</span>
                        </>
                    ) : (
                        'GENERATE PREVIEW'
                    )}
                </button>
              <button className="p-4 bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl font-bold hover:border-primary transition-all">
                V2 <span className="material-icons-outlined text-xs align-middle">expand_more</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <aside className="w-80 border-l border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark hidden xl:flex flex-col">
        <div className="p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Renders</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Some renders can be unreliable or miss the wheel design. Check the tips guide for best results.
          </p>
          <div className="bg-slate-50 dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-2xl p-6 flex flex-col items-center text-center aspect-[3/4] justify-center">
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center">
                  <svg className="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <h4 className="font-bold mb-2">Processing Image...</h4>
                  <p className="text-[11px] text-slate-500 mb-6 px-4">Our AI is working its magic. This may take a moment.</p>
              </div>
            )}

            {resultImageUrl && !isLoading && (
                <img src={resultImageUrl} alt="Generated wheel swap" className="w-full h-full object-cover rounded-lg" />
            )}
            
            {!isLoading && !resultImageUrl && (
              <div className="flex flex-col items-center text-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-background-dark flex items-center justify-center mb-4 border border-slate-200 dark:border-border-dark">
                  <span className="material-icons-outlined text-slate-500">image</span>
                </div>
                <h4 className="font-bold mb-2">Generate your first render</h4>
                <p className="text-[11px] text-slate-500 mb-6 px-4">
                  Upload a car photo and a wheel image, then hit generate. The better your input the better your results.
                </p>
                <div className="space-y-2 w-full">
                  <button className="w-full py-2.5 text-xs font-bold border border-slate-200 dark:border-border-dark hover:border-primary rounded-lg transition-all bg-white dark:bg-background-dark">
                    Browse wheel library
                  </button>
                  <button className="w-full py-2.5 text-xs font-bold border border-slate-200 dark:border-border-dark hover:border-primary rounded-lg transition-all bg-white dark:bg-background-dark">
                    Tips for better results
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;
