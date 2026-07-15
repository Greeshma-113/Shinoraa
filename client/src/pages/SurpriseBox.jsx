import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Gift, Heart, Send, Sparkles, Check, CheckSquare, Trash, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

const GIFTS_PRESETS = [
  'Free Hugs Package 🤗 - Redeemable anytime!',
  '1x Breakfast in Bed 🍳 - Cooked with love.',
  'Movie Picker Pass 🍿 - You select what we watch!',
  'Cozy Massage Ticket 💆‍♀️ - Good for a 30-minute massage.',
  'Late Night Ice Cream Run 🍦 - My treat!'
];

export default function SurpriseBox() {
  const { token, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('coupons'); // coupons, chest
  const [coupons, setCoupons] = useState([]);
  
  // Form input
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Chest animation state
  const [chestState, setChestState] = useState('closed'); // closed, opening, open
  const [giftResult, setGiftResult] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, [token]);

  const fetchCoupons = () => {
    if (!token) return;
    fetch('/api/notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCoupons(data.filter(n => n.type === 'coupon'));
        }
      })
      .catch(err => console.log(err));
  };

  const handleSendCoupon = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'coupon',
          content: title, // Coupon title
          color: description || 'No details provided.', // Description
          pinned: false // Represents completed/redeemed status: false = active, true = redeemed
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons([...coupons, data]);
        setTitle('');
        setDescription('');
        confetti({ particleCount: 30, colors: ['#FFC1CC'] });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRedeemCoupon = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pinned: true }) // pin is used to mark coupon as redeemed!
      });
      if (res.ok) {
        setCoupons(coupons.map(c => c._id === id ? { ...c, pinned: true } : c));
        confetti({ particleCount: 80, spread: 60, colors: ['#FFC1CC', '#FF7693'] });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCoupons(coupons.filter(c => c._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenChest = () => {
    if (chestState !== 'closed') return;
    setChestState('opening');

    setTimeout(() => {
      const rand = Math.floor(Math.random() * GIFTS_PRESETS.length);
      setGiftResult(GIFTS_PRESETS[rand]);
      setChestState('open');
      confetti({ particleCount: 100, spread: 80 });
    }, 1500);
  };

  const handleResetChest = () => {
    setChestState('closed');
    setGiftResult('');
  };

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 py-6 w-full flex flex-col items-center justify-center select-none text-left">
      
      <div className="w-full text-center mb-6">
        <h2 className="font-kosugi text-2xl font-bold text-sakura-600 dark:text-sakura-400 flex items-center justify-center gap-2">
          🎁 Virtual Surprise Box
        </h2>
        <p className="text-xs text-slate-500 mt-1">Unlock virtual gifts and send cute love coupons</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-pink-100/50 dark:bg-slate-900/40 p-1.5 rounded-2xl mb-6 w-full max-w-md">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'coupons'
              ? 'bg-sakura-500 text-white shadow'
              : 'text-slate-500 hover:text-sakura-500'
          }`}
        >
          🎟️ Love Coupons
        </button>
        <button
          onClick={() => setActiveTab('chest')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'chest'
              ? 'bg-sakura-500 text-white shadow'
              : 'text-slate-500 hover:text-sakura-500'
          }`}
        >
          🧰 Surprise Chest
        </button>
      </div>

      {/* Workspace display */}
      <div className="w-full max-w-2xl">
        
        {/* 1. Love Coupons */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Create Coupon form */}
            <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex flex-col gap-4 bg-white/70 h-fit">
              <h3 className="font-kosugi font-bold text-xs text-sakura-600 uppercase tracking-widest flex items-center gap-1">
                🎟️ Create Coupon
              </h3>
              
              <form onSubmit={handleSendCoupon} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500">Coupon Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Cook dinner tonight 🍳"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="glass-input text-xs py-2 px-3"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500">Details / Rules</label>
                  <input
                    type="text"
                    placeholder="e.g. Valid for any gourmet recipe"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input text-xs py-2 px-3"
                  />
                </div>
                <button type="submit" className="btn-sakura text-xs py-2.5 rounded-xl flex items-center justify-center gap-1">
                  <Send size={12} /> Send Coupon
                </button>
              </form>
            </div>

            {/* Coupons Board list */}
            <div className="md:col-span-2 glass-panel p-5 border-pink-200/50 dark:border-slate-800 max-h-[400px] overflow-y-auto bg-white/40 flex flex-col gap-3">
              {coupons.map((coupon) => {
                const isSentByMe = coupon.sender === user.username;
                const isRedeemed = coupon.pinned;

                return (
                  <div
                    key={coupon._id}
                    className={`glass-card p-4 border-pink-100 dark:border-slate-800 flex items-center justify-between group transition-all relative ${
                      isRedeemed ? 'bg-slate-100/50 dark:bg-slate-900/30 opacity-60' : 'bg-white dark:bg-[#1E1B2B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎟️</div>
                      <div>
                        <h4 className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${isRedeemed ? 'line-through' : ''}`}>
                          {coupon.content}
                        </h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{coupon.color}</p>
                        <span className="text-[8px] text-slate-400 font-bold block mt-1">Sent by {coupon.sender}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isRedeemed ? (
                        !isSentByMe ? (
                          <button
                            onClick={() => handleRedeemCoupon(coupon._id)}
                            className="btn-sakura py-1.5 px-3 text-[10px] font-bold rounded-lg flex items-center gap-0.5"
                          >
                            <Gift size={10} /> Redeem
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-sakura-500 uppercase">Active</span>
                        )
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                          <Check size={10} /> Redeemed
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete coupon"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {coupons.length === 0 && (
                <div className="text-center text-slate-400 py-16 italic text-xs">
                  No love coupons sent yet. Send one to your partner!
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. Surprise Chest */}
        {activeTab === 'chest' && (
          <div className="glass-panel p-6 border-pink-200/50 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-6 min-h-[320px] bg-white/70">
            <h3 className="font-kosugi font-bold text-sm text-sakura-600">🧰 Magical Gift Chest</h3>

            <div className="w-48 h-32 flex items-center justify-center relative">
              {chestState === 'closed' && (
                <button
                  onClick={handleOpenChest}
                  className="text-7xl hover:scale-110 active:scale-95 transition-transform animate-bounce cursor-pointer"
                  title="Click to Open!"
                >
                  🧳
                </button>
              )}
              {chestState === 'opening' && (
                <span className="text-7xl animate-pulse">✨🧳✨</span>
              )}
              {chestState === 'open' && (
                <span className="text-7xl animate-pulse-soft">🔓</span>
              )}
            </div>

            {chestState === 'closed' && (
              <p className="text-xs text-slate-400 font-bold">Click the glowing chest to unlock a sweet surprise from your partner!</p>
            )}

            {chestState === 'open' && (
              <div className="bg-pink-50/50 dark:bg-slate-900/50 border border-pink-100 p-4 rounded-2xl w-full max-w-sm flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-sakura-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} /> Surprise Unlocked!
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                  {giftResult}
                </p>
                <button
                  onClick={handleResetChest}
                  className="text-[10px] text-slate-400 hover:text-sakura-500 font-bold mt-2 uppercase"
                >
                  Close Chest
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
