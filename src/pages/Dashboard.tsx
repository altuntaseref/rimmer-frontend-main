import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
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

// --- YENİ BİLEŞEN: BEFORE / AFTER SLIDER ---
interface CompareSliderProps {
    originalImage: string;
    processedImage: string;
    rimImage?: string; // Sağ altta çıkacak jant görseli için
}

const CompareSlider: React.FC<CompareSliderProps> = ({ originalImage, processedImage, rimImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = () => setIsResizing(true);
    const handleMouseUp = () => setIsResizing(false);
    
    // Mouse veya Dokunmatik hareketi takip et
    const handleMove = (clientX: number) => {
        if (!isResizing || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;
        // 0 ile 100 arasında sınırla
        const percent = Math.max(0, Math.min(100, (x / width) * 100));
        setSliderPosition(percent);
    };

    const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

    // Kaydırma bitince eventleri temizle
    useEffect(() => {
        const stopResizing = () => setIsResizing(false);
        window.addEventListener('mouseup', stopResizing);
        window.addEventListener('touchend', stopResizing);
        return () => {
            window.removeEventListener('mouseup', stopResizing);
            window.removeEventListener('touchend', stopResizing);
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full select-none overflow-hidden cursor-ew-resize group"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            {/* 1. KATMAN: PROCESS EDİLMİŞ GÖRSEL (Arka Plan - Tam Görünür) */}
            {/* Not: Before/After mantığında genelde Before altta olur ama burada Sonucu tam göstermek için Processed'i alta, Original'i üste koyuyoruz veya tam tersi. Kullanıcı genelde sağa çekince sonucu görmek ister. */}
            
            {/* Alttaki Resim (SONUÇ / AFTER) */}
            <img 
                src={processedImage} 
                alt="After" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" 
            />

            {/* 2. KATMAN: ORİJİNAL GÖRSEL (Üst Katman - Maskelenmiş) */}
            <div 
                className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-primary"
                style={{ width: `${sliderPosition}%` }}
            >
                {/* Orijinal resim (BEFORE) - Genişliği parent ile aynı kalmalı ki kesilmesin, sadece maskelensin */}
                <img 
                    src={originalImage} 
                    alt="Before" 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none max-w-none" 
                    // max-w-none önemli: resmi kapsayıcı küçüldüğünde sıkıştırmaması için
                    style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%' }}
                />
                 
                 {/* "ORIGINAL" Etiketi */}
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                    ORIGINAL
                 </div>
            </div>

            {/* "PROCESSED" Etiketi (Sağ üst) */}
            <div className="absolute top-4 right-4 bg-primary/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(223,255,0,0.5)]">
                WHEELDROP AI
            </div>

            {/* 3. KATMAN: SLIDER BUTONU (HANDLE) */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-transparent z-20 flex items-center justify-center pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
            >
                {/* Yuvarlak Tutamaç */}
                <div className="w-10 h-10 -ml-1 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-white relative z-30">
                    <span className="material-icons text-black text-lg"></span>
                </div>
            </div>
            
            {/* 4. KATMAN: FLOATING RIM (Sağ Alt Köşe Jantı) - Gönderdiğin resimdeki gibi */}
            {rimImage && (
                <div className="absolute bottom-6 right-6 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl z-10 hover:scale-110 transition-transform duration-300">
                    <img src={rimImage} alt="Rim" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center text-white py-1">
                        USED RIM
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MEVCUT COMPONENTLER ---
const Toggle: React.FC<{ label: string; sublabel?: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, sublabel, checked, onChange }) => {
    const { t } = useTranslation();
    return (
        <label className="flex items-center justify-between cursor-pointer py-2">
            <div>
                <span className="font-bold text-white text-sm">{label}</span>
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
  
  // State
  const [carImage, setCarImage] = useState<File | null>(null);
  const [rimImage, setRimImage] = useState<File | null>(null);
  const [carImagePreview, setCarImagePreview] = useState<string | null>(null);
  const [rimImagePreview, setRimImagePreview] = useState<string | null>(null);
  
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [autoDetectHubs, setAutoDetectHubs] = useState(true);
  const [lowerSuspension, setLowerSuspension] = useState(false);

  // History & Display Logic
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  // selectedGeneration artık sadece Modal için değil, ana ekran gösterimi için de kullanılabilir
  // Ancak yapıyı bozmamak için: Eğer bir history item seçilirse onu ana ekrana (resultImageUrl) basacağız.
  const [currentViewData, setCurrentViewData] = useState<{
      processed: string | null,
      original: string | null,
      rim: string | null
  }>({ processed: null, original: null, rim: null });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchRecentGenerations();
  }, []);

  const fetchRecentGenerations = async () => {
    try {
        const response = await axios.get<Generation[]>('/api/generations?status=completed');
        const sortedData = response.data.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentGenerations(sortedData); 
    } catch (err) {
        console.error("Failed to fetch history", err);
    }
  };

  const handleDownload = () => {
    const url = currentViewData.processed;
    if (!url) return;

    // Çoğu tarayıcıda (mobil + web) en sağlam yöntem:
    // - Eğer download attribute destekleniyorsa direkt indirir
    // - Desteklenmiyorsa yeni sekmede/görselde açılır, kullanıcı kaydedebilir
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wheeldrop_design.png';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'car' | 'rim') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === 'car') {
            setCarImage(file);
            setCarImagePreview(reader.result as string);
            // Yeni resim yüklenince slider modundan çık, önizleme moduna geç
            setCurrentViewData({ ...currentViewData, processed: null });
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
    setIsSidebarOpen(false);
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
      
      const processedUrl = processResponse.data.processed_image_url;
      setResultImageUrl(processedUrl);
      
      // İşlem bitince Slider'ı gösterecek veriyi ayarla
      setCurrentViewData({
          processed: processedUrl,
          original: carImagePreview, // O anki yüklenen resim
          rim: rimImagePreview
      });

      fetchRecentGenerations();

    } catch (err: unknown) {
      console.error('Generation failed:', err);
      // ... Error handling logic ...
      setError("Failed to generate image.");
      setIsSidebarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Geçmişten bir öğeye tıklayınca
  const handleHistoryClick = (gen: Generation) => {
      setCurrentViewData({
          processed: gen.processed_image_url,
          original: gen.car_image_url,
          rim: gen.rim_image_url
      });
      setIsSidebarOpen(false); // Mobilde menüyü kapat
  };
  
  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  const style = `
    body { font-family: 'Inter', sans-serif; background-color: #101010; }
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    :root { --primary-color: #DFFF00; }
    .bg-primary { background-color: var(--primary-color); }
    .text-primary { color: var(--primary-color); }
    .border-primary { border-color: var(--primary-color); }
    .shadow-primary { box-shadow: 0 0 15px 0 rgba(223, 255, 0, 0.3); }
    /* Gizli scrollbar */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  return (
    <div className="bg-[#101010] text-white min-h-screen flex flex-col lg:flex-row text-sm font-sans overflow-hidden">
      <style>{style}</style>
      
      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-gray-800 z-30">
        <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-icons-outlined text-black font-bold">tire_repair</span>
             </div>
             <h1 className="font-display font-bold text-lg">WheelDrop</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white hover:bg-gray-800 rounded-lg">
            <span className="material-icons-outlined text-2xl">menu</span>
        </button>
      </header>

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm animate-fade-in" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[85vw] max-w-[380px] lg:w-[380px] bg-[#1A1A1A] border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col gap-5 p-6 overflow-y-auto`}
      >
        <header className="flex justify-between items-center">
            <div>
                <h1 className="text-lg font-bold font-display">{t('input_configuration')}</h1>
                <p className="text-gray-400 text-xs">{t('input_config_subtitle')}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                <span className="material-icons-outlined">close</span>
            </button>
        </header>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
            <div>
                <h2 className="text-xs font-bold uppercase text-gray-400 mb-2 flex justify-between">
                    {t('vehicle_profile')} <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">REQ</span>
                </h2>
                <div 
                    className={`drop-zone aspect-video bg-[#101010] rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${carImagePreview ? 'bg-cover bg-center' : ''}`}
                    onClick={() => document.getElementById('car-input')?.click()}
                    style={{backgroundImage: carImagePreview ? `url(${carImagePreview})` : 'none'}}
                >
                    <input type="file" id="car-input" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'car')} />
                    {!carImagePreview && <span className="material-icons-outlined text-3xl text-gray-500">directions_car</span>}
                    {!carImagePreview && <p className="text-xs text-gray-500 mt-2 text-center">{t('drop_side_profile')}</p>}
                </div>
            </div>

            <div>
                <h2 className="text-xs font-bold uppercase text-gray-400 mb-2 flex justify-between">
                    {t('wheel_design')} <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">REQ</span>
                </h2>
                <div 
                    className={`drop-zone aspect-video bg-[#101010] rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${rimImagePreview ? 'bg-cover bg-center' : ''}`}
                    onClick={() => document.getElementById('rim-input')?.click()}
                    style={{backgroundImage: rimImagePreview ? `url(${rimImagePreview})` : 'none'}}
                >
                    <input type="file" id="rim-input" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'rim')} />
                    {!rimImagePreview && <span className="material-icons-outlined text-3xl text-gray-500">motion_photos_on</span>}
                    {!rimImagePreview && <p className="text-xs text-gray-500 mt-2 text-center">{t('upload_rim_photo')}</p>}
                </div>
            </div>
        </div>

        {/* Settings */}
        <div className="bg-[#151515] p-4 rounded-lg border border-gray-800">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-2">{t('placement_settings')}</h2>
            <Toggle label={t('auto_detect_hubs')} checked={autoDetectHubs} onChange={setAutoDetectHubs} />
            <div className="h-px bg-gray-800 my-1"></div>
            <Toggle label={t('lower_suspension')} sublabel="beta" checked={lowerSuspension} onChange={setLowerSuspension} />
        </div>

        <button 
            onClick={handleGenerate} 
            disabled={isLoading || !carImage || !rimImage}
            className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold text-base py-4 rounded-xl shadow-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
        >
            {isLoading ? <span className="animate-spin material-icons-outlined">refresh</span> : <span className="material-icons-outlined">bolt</span>}
            {isLoading ? t('generating') : t('generate_preview')}
        </button>
        
        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-gray-800 flex items-center gap-2 justify-between">
            <div className="flex gap-2">
                <button onClick={() => changeLanguage('tr')} className={`px-2 py-1 rounded ${i18n.language === 'tr' ? 'text-primary bg-primary/10' : 'text-gray-500'}`}>TR</button>
                <div className="w-px h-4 bg-gray-700 my-auto"></div>
                <button onClick={() => changeLanguage('en')} className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'text-primary bg-primary/10' : 'text-gray-500'}`}>EN</button>
            </div>
            <button onClick={logout} className="p-2 rounded-md text-gray-400 hover:text-white transition-colors">
                <span className="material-icons-outlined text-xl">logout</span>
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-8 flex flex-col h-[calc(100vh-65px)] lg:h-screen gap-4">
        {/* GÖRSEL ALANI (SLIDER) */}
        <div className="flex-1 bg-[#1A1A1A] rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-800 shadow-inner group">
            {error && <div className="absolute top-4 left-4 right-4 bg-red-500/20 text-red-400 border border-red-500 p-3 rounded-lg z-20 text-center text-xs lg:text-sm animate-shake">Error: {error}</div>}
            
            {isLoading ? (
                <div className="flex flex-col items-center text-center p-6">
                    <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <h4 className="font-bold font-display text-lg mb-2 animate-pulse">{t('processing_image')}</h4>
                    <p className="text-xs text-gray-400">{t('processing_subtitle')}</p>
                </div>
            ) : currentViewData.processed && currentViewData.original ? (
                // --- BURADA COMPARE SLIDER KULLANIYORUZ ---
                <>
                     <CompareSlider 
                        originalImage={currentViewData.original} 
                        processedImage={currentViewData.processed}
                        rimImage={currentViewData.rim || undefined} 
                     />
                     
                     {/* Download Button (Overlay on Slider) */}
                     <button 
                        type="button"
                        onClick={handleDownload}
                        className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg flex items-center gap-2 transition-all z-30"
                     >
                        <span className="material-icons-outlined">download</span> 
                        <span className="hidden sm:inline">Download Result</span>
                     </button>
                </>
            ) : (
                // --- BOŞ EKRAN ---
                <div className="text-center text-gray-500 p-6">
                    <div style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2}} className="absolute inset-0 z-0 pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#151515] rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-gray-800">
                            <span className="material-icons-outlined text-4xl text-primary">auto_awesome</span>
                        </div>
                        <h2 className="text-xl lg:text-2xl font-bold font-display text-white mb-2">{t('ready_for_visualization')}</h2>
                        <p className="max-w-md mx-auto text-gray-400 text-sm">
                            <Trans i18nKey="ready_for_vis_subtitle">Upload images on the left.</Trans>
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* ALT KISIM: RECENTLY UPDATED (GALLERY STRIP) */}
        {/* Gönderdiğin görseldeki gibi altta şerit halinde duran galeri */}
        <div className="h-24 bg-[#1A1A1A] rounded-xl border border-gray-800 p-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="px-2">
                <span className="text-xs font-bold text-gray-500 uppercase block">History</span>
                <span className="text-[10px] text-gray-600">{recentGenerations.length} Items</span>
            </div>
            <div className="w-px h-10 bg-gray-800 mx-1"></div>
            
            {recentGenerations.length > 0 ? (
                recentGenerations.map((gen) => (
                    <div 
                        key={gen.id} 
                        onClick={() => handleHistoryClick(gen)}
                        className={`
                            relative w-20 h-20 min-w-[80px] rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                            ${currentViewData.processed === gen.processed_image_url ? 'border-primary scale-105' : 'border-transparent hover:border-gray-600'}
                        `}
                    >
                        {/* Arka plan processed image */}
                        <img src={gen.processed_image_url || ''} className="w-full h-full object-cover" alt="Gen" />
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        
                        {/* Küçük Rim İkonu (Sol alt) */}
                        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border border-white/30 overflow-hidden bg-black">
                             <img src={gen.rim_image_url} className="w-full h-full object-cover" alt="Rim" />
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-xs text-gray-600 italic px-4">No history found. Generate something!</div>
            )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;