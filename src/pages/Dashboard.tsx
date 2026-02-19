
import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

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
  const [carImage, setCarImage] = useState<File | null>(null);
  const [rimImage, setRimImage] = useState<File | null>(null);
  const [carImagePreview, setCarImagePreview] = useState<string | null>(null);
  const [rimImagePreview, setRimImagePreview] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [autoDetectHubs, setAutoDetectHubs] = useState(true);
  const [lowerSuspension, setLowerSuspension] = useState(false);

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
  `;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="bg-[#101010] text-white min-h-screen flex text-sm font-sans">
      <style>{style}</style>
      {/* Left Sidebar */}
      <aside className="w-[380px] bg-[#1A1A1A] p-8 flex flex-col gap-6 overflow-y-auto">
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

        {/* Recently Uploaded & Language Buttons */}
        <div className="mt-auto flex justify-between items-end">
            <div>
                <h2 className="text-xs font-bold uppercase text-gray-400 mb-3">{t('recently_uploaded')}</h2>
                <div className="flex gap-2">
                    {/* Placeholder items */}
                    <div className="w-16 h-16 bg-[#101010] rounded-md flex items-center justify-center border border-gray-700"> <span className="material-icons-outlined text-gray-600">watch</span> </div>
                    <div className="w-16 h-16 bg-[#101010] rounded-md flex items-center justify-center border border-gray-700"> <span className="material-icons-outlined text-gray-600">sports_bar</span> </div>
                    <div className="w-16 h-16 bg-[#101010] rounded-md flex items-center justify-center border border-gray-700"> <span className="material-icons-outlined text-gray-600">star</span> </div>
                    <div className="w-16 h-16 bg-[#101010] rounded-md flex items-center justify-center border border-gray-700 text-gray-500">+</div>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <button onClick={() => changeLanguage('tr')} className={`p-2 rounded-md ${i18n.language === 'tr' ? 'bg-primary/20 text-primary' : 'text-gray-400'}`}><span className="text-xs font-bold">TR</span></button>
                <button onClick={() => changeLanguage('en')} className={`p-2 rounded-md ${i18n.language === 'en' ? 'bg-primary/20 text-primary' : 'text-gray-400'}`}><span className="text-xs font-bold">EN</span></button>
                <button onClick={logout} className="p-2 rounded-md text-gray-400 flex items-center gap-1 text-xs"><span className="material-icons-outlined text-base">logout</span>{t('logout')}</button>
            </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col">
        <div className="flex-1 bg-[#1A1A1A] rounded-2xl flex items-center justify-center relative overflow-hidden">
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
                    <div style={{ backgroundImage: 'url(https://storage.googleapis.com/maker-studio-5929b.appspot.com/Users/2498/Projects/63319/wheel-visualizer-final.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 0.2}} className="absolute inset-0 z-0"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="material-icons-outlined text-5xl mb-4 text-primary">auto_awesome</span>
                        <h2 className="text-2xl font-bold font-display text-white mb-2">{t('ready_for_visualization')}</h2>
                        <p>
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
