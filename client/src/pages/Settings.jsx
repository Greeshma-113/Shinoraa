import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleAudio, setFloatingEffect, toggleTheme, logout } from '../store/authSlice';
import { Settings as SettingsIcon, Volume2, Sparkles, Download, ShieldAlert, Palette, Languages } from 'lucide-react';
import confetti from 'canvas-confetti';

const EFFECTS = [
  { label: 'Sakura Petals 🌸', value: 'sakura' },
  { label: 'Cozy Rain 🌧️', value: 'rain' },
  { label: 'Soft Snow ❄️', value: 'snow' },
  { label: 'Glow Fireflies 🪰', value: 'fireflies' },
  { label: 'Floating Hearts ❤️', value: 'hearts' },
  { label: 'Disable Effects ✕', value: 'none' }
];

export default function Settings() {
  const dispatch = useDispatch();
  const { audioEnabled, floatingEffect, theme, token, user } = useSelector((state) => state.auth);

  // Backup Data exporter
  const handleBackupExport = async () => {
    try {
      const res = await fetch('/api/memories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const memoriesData = await res.json();
      
      const backupObj = {
        exportedAt: new Date().toISOString(),
        user: user.username,
        memories: memoriesData
      };

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `shinoraa_backup_${user.username}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({ particleCount: 40 });
    } catch (err) {
      console.log(err);
      alert('Backup failed to compile.');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: Are you absolutely sure you want to delete your Shinoraa account? This will erase all your shared memories and cannot be undone.')) {
      alert('Account deleted. Logging out...');
      dispatch(logout());
    }
  };

  return (
    <div className="flex-grow max-w-2xl mx-auto px-4 py-6 w-full flex flex-col gap-6 select-none text-left">
      
      <div className="flex items-center gap-2 border-b border-pink-100 dark:border-slate-800 pb-3">
        <SettingsIcon size={24} className="text-sakura-500 animate-spin-slow" />
        <h2 className="font-kosugi text-xl font-bold text-slate-800 dark:text-slate-200">Shinoraa Settings Panel</h2>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Theme Customizer & Ambient Effects */}
        <div className="glass-panel p-5 border-pink-200 dark:border-slate-800 flex flex-col gap-4">
          <h3 className="font-kosugi font-bold text-sm text-sakura-600 dark:text-sakura-400 flex items-center gap-1.5">
            <Palette size={16} /> Theme & Floating Effects
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-300">Light / Dark Mode Toggle</span>
              <button 
                onClick={() => dispatch(toggleTheme())}
                className="btn-cozy py-2 px-4 rounded-xl font-bold text-xs"
              >
                Switch to {theme === 'light' ? 'Dark Mode 🌙' : 'Light Mode 🌸'}
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Sparkles size={12} className="text-sakura-500" /> Background Overlay Atmosphere
              </span>
              <div className="grid grid-cols-2 gap-2">
                {EFFECTS.map((eff) => (
                  <button
                    key={eff.value}
                    onClick={() => {
                      dispatch(setFloatingEffect(eff.value));
                      confetti({ particleCount: 20, colors: ['#FFC1CC'] });
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                      floatingEffect === eff.value
                        ? 'bg-sakura-500 text-white border-sakura-600 shadow-md shadow-sakura-200'
                        : 'bg-white dark:bg-slate-900/40 text-slate-500 border-pink-100/50 dark:border-slate-800 hover:text-sakura-500 hover:bg-sakura-50/50'
                    }`}
                  >
                    {eff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sound Toggles */}
        <div className="glass-panel p-5 border-pink-200 dark:border-slate-800 flex flex-col gap-4">
          <h3 className="font-kosugi font-bold text-sm text-sakura-600 dark:text-sakura-400 flex items-center gap-1.5">
            <Volume2 size={16} /> Sound & Ambient Player
          </h3>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-300">Cozy Lo-fi Sound Effects</span>
            <button 
              onClick={() => dispatch(toggleAudio())}
              className={`py-2 px-4 rounded-xl font-bold text-xs border transition-all ${
                audioEnabled 
                  ? 'bg-sakura-500 text-white border-sakura-600' 
                  : 'bg-pink-50 text-slate-400 border-pink-100'
              }`}
            >
              {audioEnabled ? 'Audio Active' : 'Audio Silenced'}
            </button>
          </div>
        </div>

        {/* Data & Backup Options */}
        <div className="glass-panel p-5 border-pink-200 dark:border-slate-800 flex flex-col gap-4">
          <h3 className="font-kosugi font-bold text-sm text-sakura-600 dark:text-sakura-400 flex items-center gap-1.5">
            <Download size={16} /> Data Export & Security
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200">Export Sakura Scrapbook</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Download your memories as a portable JSON backup file</p>
              </div>
              <button 
                onClick={handleBackupExport}
                className="btn-cozy py-2 px-4 text-xs"
              >
                Backup Data
              </button>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-pink-50 dark:border-slate-800 pt-3">
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200">Language Preference</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Select interface localization languages</p>
              </div>
              <select className="glass-input py-1 px-3 text-xs bg-transparent border-pink-100 rounded-xl">
                <option>English (US) 🇺🇸</option>
                <option>Japanese (日本語) 🇯🇵</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Area */}
        <div className="glass-panel p-5 border-red-200/50 dark:border-red-950/20 bg-red-50/10 dark:bg-red-950/5 flex flex-col gap-4">
          <h3 className="font-kosugi font-bold text-sm text-red-500 flex items-center gap-1.5">
            <ShieldAlert size={16} /> Danger Zone
          </h3>

          <div className="flex justify-between items-center text-xs">
            <div>
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Erase Shinoraa Account</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Completely delete all couple timelines and memories</p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              className="py-2.5 px-4 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white shadow shadow-red-200"
            >
              Delete Account
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
