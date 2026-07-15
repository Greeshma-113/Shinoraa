import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../store/authSlice';
import { Edit2, Sparkles, Heart, Award, Shield, User, Coffee, HelpCircle, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

const AVATAR_SEEDS = ['cherry', 'sushi', 'panda', 'michi', 'koko', 'yuki', 'luna', 'haru', 'chibi', 'mochi'];

export default function Profile() {
  const dispatch = useDispatch();
  const { user, partner, token } = useSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState(user?.profile?.nickname || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [avatar, setAvatar] = useState(user?.profile?.avatar || '');
  const [banner, setBanner] = useState(user?.profile?.banner || '');
  const [favAnime, setFavAnime] = useState(user?.profile?.favAnime || '');
  const [favColor, setFavColor] = useState(user?.profile?.favColor || '');
  const [favFood, setFavFood] = useState(user?.profile?.favFood || '');
  const [birthday, setBirthday] = useState(user?.profile?.birthday || '');
  const [location, setLocation] = useState(user?.profile?.location || '');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname, bio, avatar, banner, favAnime, favColor, favFood, birthday, location
        })
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(updateUserProfile(data));
        setEditMode(false);
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleGenerateAvatar = () => {
    const seed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
    const generated = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}-${Math.random().toString(36).substring(2, 6)}`;
    setAvatar(generated);
    confetti({ particleCount: 15, spread: 20 });
  };

  if (!user) return null;

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 py-6 w-full flex flex-col gap-6 select-none">
      
      {/* Banner & Avatar Profile header */}
      <div className="glass-panel overflow-hidden border-pink-200 dark:border-slate-800 shadow-xl relative">
        <div className="h-44 w-full relative">
          <img
            src={user.profile.banner || banner || 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&auto=format&fit=crop'}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div className="p-5 flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 relative">
          <img
            src={user.profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 object-cover bg-white shadow-md relative z-10"
          />

          <div className="flex-1 text-center md:text-left mb-2">
            <h2 className="font-kosugi text-xl font-bold text-white md:text-slate-800 md:dark:text-slate-100 flex items-center justify-center md:justify-start gap-2">
              {user.profile.nickname || user.username}
              <span className="text-xs bg-sakura-500 text-white py-0.5 px-2 rounded-full font-bold">Partner 🌸</span>
            </h2>
            <p className="text-xs text-white/80 md:text-slate-500 mt-1 italic">"{user.profile.bio}"</p>
          </div>

          <button
            onClick={() => setEditMode(!editMode)}
            className="btn-cozy py-2 px-4 text-xs font-bold"
          >
            <Edit2 size={12} /> {editMode ? 'View Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Grid of Profile views / Forms */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Stats and Badges */}
        <div className="flex flex-col gap-6">
          {/* Badge collection */}
          <div className="glass-panel p-5 border-pink-200 dark:border-slate-800 flex flex-col gap-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Award size={14} className="text-sakura-500" /> Badge Collection
            </h3>
            <div className="flex flex-col gap-3">
              {(user.badges || []).map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-pink-50/50 dark:bg-slate-900/30 rounded-xl border border-pink-100/30">
                  <span className="text-lg">🌸</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements progress */}
          <div className="glass-panel p-5 border-pink-200 dark:border-slate-800 flex flex-col gap-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={14} className="text-sakura-500" /> Achievements
            </h3>
            <div className="flex flex-col gap-3">
              {(user.achievements || []).map((ach, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-pink-50/50 dark:bg-slate-900/30 rounded-xl border border-pink-100/30">
                  <span className="text-lg">🏆</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{ach}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Details View or Edit Form */}
        <div className="md:col-span-2">
          {!editMode ? (
            /* DETAILS VIEW */
            <div className="glass-panel p-6 border-pink-200 dark:border-slate-800 flex flex-col gap-5">
              <h3 className="font-kosugi font-bold text-sm text-sakura-600 dark:text-sakura-400 pb-2 border-b border-pink-100 dark:border-slate-800">
                🌸 Couple Details card
              </h3>

              <div className="grid grid-cols-2 gap-6 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Nickname</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.profile.nickname || 'Not specified'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Birthday</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.profile.birthday || 'Not specified'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Favorite Anime</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.profile.favAnime || 'Not specified'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Favorite Food</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.profile.favFood || 'Not specified'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Favorite Color</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.profile.favColor || 'Not specified'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Location / Home</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.profile.location || 'Not specified'}</span>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT FORM VIEW */
            <div className="glass-panel p-6 border-pink-200 dark:border-slate-800">
              <h3 className="font-kosugi font-bold text-sm text-sakura-600 mb-4 pb-2 border-b border-pink-100 dark:border-slate-800">
                ✏️ Edit Couple Profile
              </h3>

              <form onSubmit={handleProfileSave} className="flex flex-col gap-4 text-left">
                
                {/* Avatar generator */}
                <div className="flex flex-col gap-1.5 border-b border-pink-50 dark:border-slate-800 pb-3">
                  <label className="text-xs font-bold text-slate-500">Kawaii Avatar Generator</label>
                  <div className="flex gap-3 items-center">
                    <img src={avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`} alt="" className="w-14 h-14 rounded-full border bg-slate-100" />
                    <button type="button" onClick={handleGenerateAvatar} className="btn-cozy py-2 px-3.5 text-xs">
                      <Sparkles size={12} className="text-sakura-500" /> Roll Chibi seed
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Nickname</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="glass-input text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Birthday</label>
                    <input
                      type="text"
                      placeholder="e.g. November 14"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Biography</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Favorite Anime</label>
                    <input
                      type="text"
                      value={favAnime}
                      onChange={(e) => setFavAnime(e.target.value)}
                      className="glass-input text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Favorite Food</label>
                    <input
                      type="text"
                      value={favFood}
                      onChange={(e) => setFavFood(e.target.value)}
                      className="glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Favorite Color</label>
                    <input
                      type="text"
                      value={favColor}
                      onChange={(e) => setFavColor(e.target.value)}
                      className="glass-input text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500">Banner URL</label>
                    <input
                      type="text"
                      value={banner}
                      onChange={(e) => setBanner(e.target.value)}
                      className="glass-input text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button type="button" onClick={() => setEditMode(false)} className="btn-cozy flex-1 py-3 text-xs">Cancel</button>
                  <button type="submit" className="btn-sakura flex-1 py-3 text-xs">Save Profile</button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
