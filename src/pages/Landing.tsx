
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        // The user's backend code from the previous turn showed that the AuthContext
        // login function expects an object with accessToken and refreshToken properties.
        // The backend is also expected to return an object with access_token and
        // refresh_token properties.
        try {
            const res = await axios.post('/api/auth/google', {
                id_token: credentialResponse.credential,
            });

            const { access_token, refresh_token } = res.data;
            login({ accessToken: access_token, refreshToken: refresh_token });
            
            navigate('/dashboard');
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    };

    const handleError = () => {
        console.error('Google login failed.');
    };

  return (
    <div className="bg-background-dark text-white min-h-screen flex flex-col font-sans">
      <header className="fixed top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-10 bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-icons-outlined text-black font-bold">tire_repair</span>
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">WheelDrop</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 pt-24">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#DFFF00 0.5px, transparent 0.5px)', backgroundSize: '30px 30px'}}></div>
        <div className="max-w-4xl mx-auto relative">
            <h1 className="text-5xl sm:text-7xl font-display font-bold tracking-tighter mb-4">
                The best way to manage your tires
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                Track wear, schedule rotations, and get the most out of your tires with our smart management platform.
            </p>
            <div className="flex justify-center gap-4">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    theme="filled_black"
                    text="continue_with"
                    shape="pill"
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
