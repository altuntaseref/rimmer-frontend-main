import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Sizin çalışan backend mantığınız (id_token kullanır)
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const apiUrl = '/api/auth/google';
            
            // Backend'e id_token (credential) gönderiyoruz
            const res = await axios.post(apiUrl, {
                id_token: credentialResponse.credential,
            });

            // Login fonksiyonuna token'ı iletiyoruz
            const { access_token, refresh_token } = res.data;
            // Not: login fonksiyonunuz obje bekliyorsa { accessToken: ... } şeklinde gönderin,
            // Sadece token string bekliyorsa direkt access_token gönderin.
            // Sizin son gönderdiğiniz örnekte login(access_token) vardı, 
            // ama AuthContext genelde obje bekler. Context yapınıza göre burayı düzenleyin:
            login({ accessToken: access_token, refreshToken: refresh_token } as any); 
            
            navigate('/dashboard');
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    };

    const handleGoogleError = () => {
        console.error('Google login failed.');
    };

    // CSS Stilleri
    const style = `
      body { font-family: 'Inter', sans-serif; background-color: #101010; }
      .font-display { font-family: 'Space Grotesk', sans-serif; }
      :root { --primary-color: #DFFF00; }
      
      /* Grid Animasyonu */
      @keyframes moveGrid {
        0% { transform: translateY(0); }
        100% { transform: translateY(40px); }
      }
      .grid-bg {
        background-image: radial-gradient(rgba(223, 255, 0, 0.15) 1px, transparent 1px);
        background-size: 40px 40px;
        animation: moveGrid 15s linear infinite;
      }
    `;

  return (
    <div className="bg-[#101010] text-white min-h-screen flex flex-col font-sans overflow-hidden relative">
      <style>{style}</style>
      
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#101010] via-transparent to-[#101010] pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#DFFF00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(223,255,0,0.3)]">
            <span className="material-icons-outlined text-black font-bold text-2xl">tire_repair</span>
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-white">WheelDrop</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center animate-fade-in-up">
            
            {/* Etiket */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#DFFF00] mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse"></span>
                Yapay Zeka Destekli Araç Asistanı
            </div>

            {/* Başlık */}
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-6 leading-[1.1]">
                Lastiklerinizi Yönetmenin <br/>
                <span className="text-[#DFFF00] relative inline-block drop-shadow-[0_0_15px_rgba(223,255,0,0.3)]">
                    En Akıllı Yolu
                </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                Aşınmayı takip edin, rotasyonları planlayın ve aracınız için en şık jantları 
                saniyeler içinde deneyerek performansınızı zirveye taşıyın.
            </p>

            {/* Google Butonu Alanı */}
            {/* Not: Standart buton sarı olamaz ama etrafına sarı "glow" ekleyerek temaya uydurduk */}
            <div className="relative group transform transition-transform hover:scale-105">
                {/* Arkadaki Sarı Parlama Efekti */}
                <div className="absolute -inset-1 bg-[#DFFF00] rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                
                {/* Butonun Kendisi */}
                <div className="relative bg-black rounded-full p-1">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_black" // Siyah tema (Background ile uyumlu)
                        shape="pill"         // Yuvarlak kenarlar
                        text="continue_with" // "Google ile devam et" yazar
                        size="large"
                        width="300"          // Geniş buton
                        locale="tr"          // Türkçe dil desteği
                    />
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-600 font-medium">
                Kayıt olarak <a href="#" className="underline hover:text-gray-400">Hizmet Şartları</a>'nı kabul etmiş sayılırsınız.
            </p>
        </div>
      </main>
    </div>
  );
};

export default Landing;