
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from 'google-one-tap';
import axios from 'axios';

const Landing: React.FC = () => {
  const { login, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const apiUrl = '/api/auth/google';
      // Log the intended full backend URL to the console for debugging
      console.log(`Attempting to send request to backend via proxy. Target URL: ${import.meta.env.VITE_API_BASE_URL}${apiUrl}`);

      const res = await axios.post(apiUrl, {
        id_token: credentialResponse.credential,
      });
      const { access_token } = res.data;
      login(access_token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleGoogleFailure = () => {
    console.error('Google login failed');
  };

  const style = `
    :root {
        --accent-neon: #DFFF00;
        --bg-deep-black: #000000;
        --bg-charcoal: #0A0A0A;
        --bg-card: #111111;
        --text-primary: #FFFFFF;
        --text-secondary: #A1A1AA;
    }
    body {
        font-family: 'Inter', sans-serif;
        background-color: var(--bg-deep-black);
        color: var(--text-primary);
    }
    .placeholder-img {
        background-color: var(--bg-charcoal);
        border: 1px solid #222;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    .neon-border {
        border: 1px solid var(--accent-neon);
    }
    .neon-text {
        color: var(--accent-neon);
    }
    .neon-bg {
        background-color: var(--accent-neon);
    }
    .btn-primary {
        background-color: var(--accent-neon);
        color: #000000;
        transition: all 0.2s ease;
    }
    .btn-primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
    .nav-link:hover {
        color: var(--accent-neon);
    }
  `;

  return (
    <div className="antialiased">
      <style>{style}</style>
      <header className="border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 neon-bg rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-black font-bold">directions_car</span>
            </div>
            <span className="font-extrabold text-xl tracking-tighter">WHEELDROP</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <a className="nav-link transition-colors" href="#">Features</a>
            <a className="nav-link transition-colors" href="#">How it Works</a>
            <a className="nav-link transition-colors" href="#">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <button onClick={logout} className="text-sm font-bold text-zinc-300 px-4 py-2 hover:text-white">Logout</button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                theme="outline"
                size="medium"
              />
            )}
            <Link to="/dashboard">
              <button className="btn-primary text-sm font-extrabold px-5 py-2.5 rounded-sm">GET STARTED</button>
            </Link>
          </div>
        </div>
      </header>
       <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
              VISUALIZE ANY <span className="neon-text">WHEEL</span> ON YOUR CAR INSTANTLY.
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-lg">
              Upload a photo and swap rims in seconds using our proprietary high-fidelity AI engine. No photoshop required.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="btn-primary px-8 py-4 rounded-sm font-black text-lg tracking-tight uppercase">Try Visualizer Now</button>
              <button className="border border-white/20 text-white hover:bg-white/5 px-8 py-4 rounded-sm font-black text-lg tracking-tight uppercase">Watch Demo</button>
            </div>
          </div>
          <div className="relative">
            <div className="placeholder-img aspect-[16/9] rounded-sm relative shadow-2xl shadow-neon-500/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 to-black"></div>
              <span className="material-symbols-outlined text-8xl text-zinc-800 absolute opacity-50">photo_library</span>
              <div className="absolute inset-y-0 left-1/2 w-[2px] neon-bg shadow-[0_0_15px_rgba(223,255,0,0.5)] z-10 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full neon-bg flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-black text-xl font-bold">unfold_more</span>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] px-3 py-1.5 rounded uppercase tracking-widest font-black z-20">Stock Configuration</div>
              <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md border border-neon-500/50 text-white text-[10px] px-3 py-1.5 rounded uppercase tracking-widest font-black z-20">AI Visualized</div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-white/5 py-12 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-10">Trusted by top-tier automotive ateliers</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-40 grayscale contrast-125">
            <div className="h-6 bg-white rounded-sm mx-auto w-24"></div>
            <div className="h-6 bg-white rounded-sm mx-auto w-32"></div>
            <div className="h-6 bg-white rounded-sm mx-auto w-20"></div>
            <div className="h-6 bg-white rounded-sm mx-auto w-28"></div>
            <div className="h-6 bg-white rounded-sm mx-auto w-24"></div>
            <div className="h-6 bg-white rounded-sm mx-auto w-32"></div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl font-black mb-4 tracking-tight uppercase">How It Works</h2>
          <p className="text-zinc-400">Transform your vehicle's aesthetic in three high-speed steps.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="w-20 h-20 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-all group-hover:border-neon-500/50">
              <span className="material-symbols-outlined text-4xl neon-text">add_a_photo</span>
            </div>
            <h3 className="text-xl font-black mb-3 uppercase tracking-tight">1. Upload Base</h3>
            <p className="text-zinc-500 text-sm leading-relaxed px-4">Take a high-res side profile shot of your vehicle in any environment.</p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-all group-hover:border-neon-500/50">
              <span className="material-symbols-outlined text-4xl neon-text">adjust</span>
            </div>
            <h3 className="text-xl font-black mb-3 uppercase tracking-tight">2. Select Spec</h3>
            <p className="text-zinc-500 text-sm leading-relaxed px-4">Browse our master database or upload custom rim designs.</p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-all group-hover:border-neon-500/50">
              <span className="material-symbols-outlined text-4xl neon-text">auto_awesome</span>
            </div>
            <h3 className="text-xl font-black mb-3 uppercase tracking-tight">3. Neural Render</h3>
            <p className="text-zinc-500 text-sm leading-relaxed px-4">Our AI computes perspective and light for a pixel-perfect finish.</p>
          </div>
        </div>
      </section>
      <section className="bg-zinc-900/50 py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 border border-white/20 text-[10px] font-black uppercase tracking-widest rounded">Ray-Traced Fidelity</div>
              <h2 className="text-5xl font-black tracking-tight leading-tight">PERFECT LIGHTING <br/>MATCH</h2>
              <p className="text-zinc-400 leading-relaxed text-lg">Our AI analyzes shadows, global illumination, and reflections on your bodywork to ensure every spoke looks authentic.</p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                  <span className="material-symbols-outlined neon-text text-xl">check_circle</span> Dynamic ambient occlusion
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                  <span className="material-symbols-outlined neon-text text-xl">check_circle</span> Real-time environment mapping
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                  <span className="material-symbols-outlined neon-text text-xl">check_circle</span> Automated color grading
                </li>
              </ul>
            </div>
            <div className="placeholder-img aspect-square rounded-sm shadow-2xl">
              <span className="material-symbols-outlined text-8xl text-zinc-800">wb_sunny</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="placeholder-img aspect-square rounded-sm md:order-1 order-2 shadow-2xl">
              <span className="material-symbols-outlined text-8xl text-zinc-800">view_in_ar</span>
            </div>
            <div className="space-y-6 md:order-2 order-1">
              <div className="inline-block px-3 py-1 border border-white/20 text-[10px] font-black uppercase tracking-widest rounded">Spatial Intelligence</div>
              <h2 className="text-5xl font-black tracking-tight leading-tight">ANY ANGLE, <br/>ANY DISTANCE</h2>
              <p className="text-zinc-400 leading-relaxed text-lg">Low angles, wide shots, or tight crops — the engine warps geometry to match your car's exact stance and wheel well depth.</p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                  <span className="material-symbols-outlined neon-text text-xl">check_circle</span> Sub-pixel alignment accuracy
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                  <span className="material-symbols-outlined neon-text text-xl">check_circle</span> 3D spatial orientation
                </li>
                <li className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                  <span className="material-symbols-outlined neon-text text-xl">check_circle</span> Adaptive focal length adjustment
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">Community Renders</h2>
          <p className="text-zinc-400">High-fidelity visualizations generated by our users.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group cursor-pointer">
            <div className="placeholder-img aspect-[4/3] rounded-sm mb-4 border-zinc-800 transition-all group-hover:border-zinc-500">
              <span className="material-symbols-outlined text-4xl text-zinc-800">minor_crash</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Luxury Sedan</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">20" Monoblock Forged</p>
              </div>
              <span className="material-symbols-outlined text-zinc-600 text-lg">open_in_full</span>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="placeholder-img aspect-[4/3] rounded-sm mb-4 border-zinc-800 transition-all group-hover:border-zinc-500">
              <span className="material-symbols-outlined text-4xl text-zinc-800">airport_shuttle</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Off-road SUV</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">17" Beadlock Style</p>
              </div>
              <span className="material-symbols-outlined text-zinc-600 text-lg">open_in_full</span>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="placeholder-img aspect-[4/3] rounded-sm mb-4 border-zinc-800 transition-all group-hover:border-zinc-500">
              <span className="material-symbols-outlined text-4xl text-zinc-800">directions_car</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Classic Coupe</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">18" Deep Dish Mesh</p>
              </div>
              <span className="material-symbols-outlined text-zinc-600 text-lg">open_in_full</span>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="placeholder-img aspect-[4/3] rounded-sm mb-4 border-zinc-800 transition-all group-hover:border-zinc-500">
              <span className="material-symbols-outlined text-4xl text-zinc-800">bolt</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Electric Hatchback</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">19" Aero Design</p>
              </div>
              <span className="material-symbols-outlined text-zinc-600 text-lg">open_in_full</span>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="placeholder-img aspect-[4/3] rounded-sm mb-4 border-zinc-800 transition-all group-hover:border-zinc-500">
              <span className="material-symbols-outlined text-4xl text-zinc-800">speed</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Track Special</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">18" Lightweight Multi-spoke</p>
              </div>
              <span className="material-symbols-outlined text-zinc-600 text-lg">open_in_full</span>
            </div>
          </div>
          <div className="group cursor-pointer">
            <div className="placeholder-img aspect-[4/3] rounded-sm mb-4 border-zinc-800 transition-all group-hover:border-zinc-500">
              <span className="material-symbols-outlined text-4xl text-zinc-800">sports_score</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Modern Sports Car</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">21" Directional Cut</p>
              </div>
              <span className="material-symbols-outlined text-zinc-600 text-lg">open_in_full</span>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-black py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-6 uppercase tracking-tight">Tiered Access</h2>
            <div className="flex items-center justify-center gap-6">
              <span className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Monthly</span>
              <button className="w-14 h-7 border-2 border-zinc-800 rounded-full relative p-1 flex items-center">
                <div className="w-4 h-4 neon-bg rounded-full shadow-[0_0_10px_rgba(223,255,0,0.4)]"></div>
              </button>
              <span className="text-sm font-bold uppercase tracking-widest neon-text">Credits</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/50 p-10 rounded-sm border border-white/5 space-y-8">
              <div>
                <h3 className="font-black text-lg mb-2 uppercase tracking-tighter">Starter</h3>
                <div className="text-5xl font-black">$0</div>
                <p className="text-[10px] text-zinc-500 font-bold mt-4 uppercase tracking-widest">Free tier limited access</p>
              </div>
              <ul className="space-y-4 text-sm font-semibold text-zinc-400">
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> 3 High-res Renders / mo</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> Standard Lighting</li>
                <li className="flex items-center gap-3 opacity-30"><span className="material-symbols-outlined text-lg">close</span> 4K Resolution</li>
              </ul>
              <button className="w-full py-4 border border-white/20 text-white rounded-sm font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-colors">Select Tier</button>
            </div>
            <div className="bg-black p-10 rounded-sm neon-border shadow-[0_0_30px_rgba(223,255,0,0.1)] space-y-8 transform md:scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 neon-bg text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Most Popular</div>
              <div>
                <h3 className="font-black text-lg mb-2 uppercase tracking-tighter">Pro Visualizer</h3>
                <div className="text-5xl font-black neon-text">$29</div>
                <p className="text-[10px] text-zinc-400 font-bold mt-4 uppercase tracking-widest">Per month, unlimited usage</p>
              </div>
              <ul className="space-y-4 text-sm font-semibold text-white">
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> Unlimited Renders</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> 4K Ultra-Res Output</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> Advanced Lighting AI</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> Early Access Wheels</li>
              </ul>
              <button className="w-full py-4 btn-primary rounded-sm font-black uppercase text-xs tracking-widest">Start Pro Trial</button>
            </div>
            <div className="bg-zinc-900/50 p-10 rounded-sm border border-white/5 space-y-8">
              <div>
                <h3 className="font-black text-lg mb-2 uppercase tracking-tighter">Enterprise</h3>
                <div className="text-5xl font-black">$99</div>
                <p className="text-[10px] text-zinc-500 font-bold mt-4 uppercase tracking-widest">Professional fleet solutions</p>
              </div>
              <ul className="space-y-4 text-sm font-semibold text-zinc-400">
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> API Access</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> Custom Wheel Libraries</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-lg neon-text">check</span> White-label Embeds</li>
              </ul>
              <button className="w-full py-4 border border-white/20 text-white rounded-sm font-black uppercase text-xs tracking-widest hover:bg-white/5 transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-white/10 bg-black pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 neon-bg rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-black text-[14px] font-black">directions_car</span>
                </div>
                <span className="font-extrabold text-sm tracking-tighter">WHEELDROP</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">The world's most advanced AI-driven spatial visualization tool for the automotive industry.</p>
            </div>
            <div>
              <h4 className="font-black text-xs mb-6 uppercase tracking-widest text-white">Product</h4>
              <ul className="text-xs space-y-3 text-zinc-500 font-bold uppercase tracking-widest">
                <li><a className="hover:text-white transition-colors" href="#">Features</a></li>
                <li><a className="hover:text-white transition-colors" href="#">API Core</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Mobile App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs mb-6 uppercase tracking-widest text-white">Company</h4>
              <ul className="text-xs space-y-3 text-zinc-500 font-bold uppercase tracking-widest">
                <li><a className="hover:text-white transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Laboratory</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs mb-6 uppercase tracking-widest text-white">Legal</h4>
              <ul className="text-xs space-y-3 text-zinc-500 font-bold uppercase tracking-widest">
                <li><a className="hover:text-white transition-colors" href="#">Privacy</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Terms</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Safety</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">© 2024 WHEELDROP LABS INC. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8 text-zinc-500">
              <span className="material-symbols-outlined text-xl cursor-pointer hover:text-white transition-colors">language</span>
              <span className="material-symbols-outlined text-xl cursor-pointer hover:text-white transition-colors">hub</span>
              <span className="material-symbols-outlined text-xl cursor-pointer hover:text-white transition-colors">alternate_email</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
