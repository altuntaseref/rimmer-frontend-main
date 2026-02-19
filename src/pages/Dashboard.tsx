import React, { useState, useEffect, ChangeEvent } from 'react'; // useEffect eklendi
import axios from 'axios';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// API Response Interface
interface Generation {
  id: number;
  status: string;
  car_image_url: string;
  rim_image_url: string;
  processed_image_url: string | null;
  error_message: string | null;
  created_at: string;
}

// Basic toggle component for settings
const Toggle: React.FC<{ label: string; sublabel?: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, sublabel, checked, onChange }) => {
    const { t } = useTranslation();
    return (
        <label className="flex items-center justify-between cursor-pointer">
            <div>
                <span className="font-bold text-white">{label}</span>
                {sublabel && <span className="text-xs text-gray-400 block">{t(sublabel)}</span>}
            </div>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition-all ${checked ? 'bg-primary' : 'bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}></div>
            </div>
        </label>
    );
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  
  // State for Inputs
  const [carImage, setCarImage] = useState<File | null>(null);
  const [rimImage, setRimImage] = useState<File | null>(null);
  const [carImagePreview, setCarImagePreview] = useState<string | null>(null);
  const [rimImagePreview, setRimImagePreview] = useState<string | null>(null);
  
  // State for Processing
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for Settings
  const [autoDetectHubs, setAutoDetectHubs] = useState(true);
  const [lowerSuspension, setLowerSuspension] = useState(false);

  // State for History (New)
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  // Fetch recent generations on mount
  useEffect(() => {
    fetchRecentGenerations();
  }, []);

  const fetchRecentGenerations = async () => {
    try {
        const response = await axios.get<Generation[]>('/api/generations?status=completed');
        // İsteğe bağlı: En yeniden en eskiye sıralama veya slice ile son 5 tanesini alma
        setRecentGenerations(response.data.reverse()); 
    } catch (err) {
        console.error("Failed to fetch history", err);
    }
  };

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
      setError(t('error_upload'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImageUrl(null);

    try {
      const formData = new FormData();
      formData.append('car_file', carImage);
      formData.append('rim_file', rimImage);

      const uploadResponse = await axios.post('/api/generations/upload', formData);
      const { id: generationId } = uploadResponse.data;
      const processResponse = await axios.post(`/api/generations/${generationId}/process`);
      
      setResultImageUrl(processResponse.data.processed_image_url);
      
      // İşlem başarılı olduğunda listeyi güncelle
      fetchRecentGenerations();

    } catch (err: unknown) {
      console.error('Generation failed:', err);
      let message = t('error_generic');
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') message = detail;
        else if (Array.isArray(detail)) message = detail.map((d: Record<string, unknown>) => d?.msg || JSON.stringify(d)).join(', ');
        else if (detail && typeof detail === 'object') {
          const maybeMsg = (detail as Record<string, unknown>).msg || (detail as Record<string, unknown>).message;
          message = typeof maybeMsg === 'string' ? maybeMsg : JSON.stringify(detail);
        } else if (typeof err.message === 'string') message = err.message;
      } else if (err instanceof Error) message = err.message;
      setError(String(message));
    } finally {
      setIsLoading(false);
    }
  };
  
  const style = `
    body { font-family: 'Inter', sans-serif; }
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    :root { --primary-color: #DFFF00; }
    .bg-primary { background-color: var(--primary-color); }
    .text-primary { color: var(--primary-color); }
    .border-primary { border-color: var(--primary-color); }
    .shadow-primary { box-shadow: 0 0 15px 0 rgba(223, 255, 0, 0.3); }
    .drop-zone:hover { border-color: var(--primary-color); }
    
    /* Scrollbar styling for history */
    .history-scroll::-webkit-scrollbar { height: 6px; }
    .history-scroll::-webkit-scrollbar-track { background: #1A1A1A; }
    .history-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  `;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="bg-[#101010] text-white min-h-screen flex text-sm font-sans">
      <style>{style}</style>
      
      {/* --- DETAIL MODAL --- */}
      {selectedGeneration && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setSelectedGeneration(null)}
        >
            <div 
                className="bg-[#1A1A1A] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800 flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedGeneration(null)}
                    className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white transition-colors"
                >
                    <span className="material-icons-outlined">close</span>
                </button>

                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <h3 className="font-display font-bold text-xl text-white">Generation #{selectedGeneration.id}</h3>
                    <p className="text-gray-400 text-xs">{new Date(selectedGeneration.created_at).toLocaleString()}</p>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">
                    {/* Main Result */}
                    <div className="w-full bg-[#101010] rounded-xl overflow-hidden border border-gray-700">
                        <div className="text-xs font-bold text-gray-500 uppercase p-3 border-b border-gray-800 bg-[#0a0a0a]">Processed Result</div>
                        {selectedGeneration.processed_image_url ? (
                             <img src={selectedGeneration.processed_image_url} alt="Result" className="w-full h-auto object-contain max-h-[500px]" />
                        ) : (
                            <div className="p-10 text-center text-gray-500">Image not available</div>
                        )}
                    </div>

                    {/* Source Images */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#101010] rounded-xl overflow-hidden border border-gray-700">
                            <div className="text-xs font-bold text-gray-500 uppercase p-3 border-b border-gray-800 bg-[#0a0a0a]">Original Vehicle</div>
                            <img src={selectedGeneration.car_image_url} alt="Car" className="w-full h-40 object-cover" />
                        </div>
                        <div className="bg-[#101010] rounded-xl overflow-hidden border border-gray-700">
                            <div className="text-xs font-bold text-gray-500 uppercase p-3 border-b border-gray-800 bg-[#0a0a0a]">Rim Design</div>
                            <img src={selectedGeneration.rim_image_url} alt="Rim" className="w-full h-40 object-cover" />
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Optional) */}
                <div className="p-6 border-t border-gray-800 bg-[#151515] flex justify-end">
                     <a 
                        href={selectedGeneration.processed_image_url || '#'} 
                        download={`generation_${selectedGeneration.id}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-black transition-all flex items-center gap-2"
                     >
                         <span className="material-icons-outlined text-sm">download</span> Download
                     </a>
                </div>
            </div>
        </div>
      )}
      {/* --- END MODAL --- */}


      {/* Left Sidebar */}
      <aside className="w-[380px] bg-[#1A1A1A] p-8 flex flex-col gap-6 overflow-y-auto border-r border-gray-800">
        <header>
            <h1 className="text-lg font-bold font-display">{t('input_configuration')}</h1>
            <p className="text-gray-400 text-xs">{t('input_config_subtitle')}</p>
        </header>

        {/* Vehicle Profile Dropzone */}
        <div>
            <h2 className="text-xs font-bold uppercase text-gray-400 mb-3 flex justify-between items-center">
                {t('vehicle_profile')}
                <span className="text-[10px] text-yellow-300 bg-yellow-300/10 px-2 py-0.5 rounded">{t('required')}</span>
            </h2>
            <div 
                className={`drop-zone aspect-video bg-[#101010] rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${carImagePreview ? 'bg-cover bg-center' : ''}`}
                onClick={() => document.getElementById('car-input')?.click()}
                style={{backgroundImage: carImagePreview ? `url(${carImagePreview})` : 'none'}}
            >
                <input type="file" id="car-input" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'car')} />
                {!carImagePreview && (
                <>
                    <span className="material-icons-outlined text-4xl text-gray-500 mb-2">directions_car</span>
                    <p className="font-semibold">{t('drop_side_profile')}</p>
                    <p className="text-xs text-gray-500">{t('supports_png_jpg')}</p>
                </>
                )}
            </div>
        </div>

        {/* Wheel Design Dropzone */}
        <div>
            <h2 className="text-xs font-bold uppercase text-gray-400 mb-3 flex justify-between items-center">
                {t('wheel_design')}
                <span className="text-[10px] text-yellow-300 bg-yellow-300/10 px-2 py-0.5 rounded">{t('required')}</span>
            </h2>
            <div 
                className={`drop-zone aspect-video bg-[#101010] rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${rimImagePreview ? 'bg-cover bg-center' : ''}`}
                onClick={() => document.getElementById('rim-input')?.click()}
                style={{backgroundImage: rimImagePreview ? `url(${rimImagePreview})` : 'none'}}
            >
                <input type="file" id="rim-input" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'rim')} />
                {!rimImagePreview && (
                <>
                     <span className="material-icons-outlined text-4xl text-gray-500 mb-2">motion_photos_on</span>
                    <p className="font-semibold">{t('upload_rim_photo')}</p>
                    <p className="text-xs text-gray-500">{t('front_facing_preferred')}</p>
                </>
                )}
            </div>
        </div>

        {/* Placement Settings */}
        <div className="flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase text-gray-400">{t('placement_settings')}</h2>
            <Toggle label={t('auto_detect_hubs')} checked={autoDetectHubs} onChange={setAutoDetectHubs} />
            <Toggle label={t('lower_suspension')} sublabel="beta" checked={lowerSuspension} onChange={setLowerSuspension} />
        </div>

        {/* Generate Button */}
        <button 
            onClick={handleGenerate} 
            disabled={isLoading || !carImage || !rimImage}
            className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold text-base py-4 rounded-lg transition-all hover:brightness-110 shadow-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
            <span className="material-icons-outlined">bolt</span>
            {isLoading ? t('generating') : t('generate_preview')}
        </button>

        {/* Recently Uploaded Section (UPDATED) */}
        <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-gray-800">
            <div>
                <h2 className="text-xs font-bold uppercase text-gray-400 mb-3">{t('recently_uploaded')}</h2>
                {recentGenerations.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto history-scroll pb-2">
                        {recentGenerations.map((gen) => (
                            <div 
                                key={gen.id} 
                                onClick={() => setSelectedGeneration(gen)}
                                className="w-16 h-16 min-w-[64px] bg-[#101010] rounded-md flex items-center justify-center border border-gray-700 overflow-hidden cursor-pointer hover:border-primary transition-all hover:scale-105"
                            > 
                                {gen.processed_image_url ? (
                                    <img src={gen.processed_image_url} alt={`Gen ${gen.id}`} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-icons-outlined text-gray-600">image</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-600 italic">No history yet.</p>
                )}
            </div>
            
             <div className="flex items-center gap-2">
                <button onClick={() => changeLanguage('tr')} className={`p-2 rounded-md ${i18n.language === 'tr' ? 'bg-primary/20 text-primary' : 'text-gray-400'}`}><span className="text-xs font-bold">TR</span></button>
                <button onClick={() => changeLanguage('en')} className={`p-2 rounded-md ${i18n.language === 'en' ? 'bg-primary/20 text-primary' : 'text-gray-400'}`}><span className="text-xs font-bold">EN</span></button>
                <button onClick={logout} className="ml-auto p-2 rounded-md text-gray-400 flex items-center gap-1 text-xs hover:text-white transition-colors"><span className="material-icons-outlined text-base">logout</span>{t('logout')}</button>
            </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col">
        <div className="flex-1 bg-[#1A1A1A] rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-800">
            {error && <div className="absolute top-4 left-4 right-4 bg-red-500/20 text-red-400 border border-red-500 p-3 rounded-lg z-20">Error: {error}</div>}
            
            {isLoading ? (
                <div className="flex flex-col items-center text-center">
                    <svg className="animate-spin h-8 w-8 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h4 className="font-bold font-display text-lg mb-2">{t('processing_image')}</h4>
                    <p className="text-xs text-gray-400">{t('processing_subtitle')}</p>
                </div>
            ) : resultImageUrl ? (
                <img src={resultImageUrl} alt="Generated wheel swap" className="w-full h-full object-contain" />
            ) : (
                <div className="text-center text-gray-500">
                    <div style={{ backgroundImage: 'url(https://storage.googleapis.com/maker-studio-5929b.appspot.com/Users/2498/Projects/63319/wheel-visualizer-final.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.1}} className="absolute inset-0 z-0 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="material-icons-outlined text-5xl mb-4 text-primary">auto_awesome</span>
                        <h2 className="text-2xl font-bold font-display text-white mb-2">{t('ready_for_visualization')}</h2>
                        <p className="max-w-md mx-auto text-gray-400">
                            <Trans i18nKey="ready_for_vis_subtitle">
                                Upload your images on the left and click <b className="text-white">GENERATE</b> to see the transformation.
                            </Trans>
                        </p>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;