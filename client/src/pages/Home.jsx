import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateRelationship, updateUserProfile } from '../store/authSlice';
import { Heart, Calendar, Smile, Sun, Sunset, AlertCircle, Sparkles, RefreshCw, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

const MOODS = [
  { label: 'Loved ❤️', emoji: '🥰', color: 'bg-pink-100 hover:bg-pink-200 text-pink-700 dark:bg-pink-900/30' },
  { label: 'Happy 🌸', emoji: '😊', color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30' },
  { label: 'Sleepy 💤', emoji: '😴', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30' },
  { label: 'Excited ✨', emoji: '😆', color: 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30' },
  { label: 'Busy 📝', emoji: '🧐', color: 'bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30' },
  { label: 'Sad 🥺', emoji: '😢', color: 'bg-sky-100 hover:bg-sky-200 text-sky-700 dark:bg-sky-900/30' },
  { label: 'Angry 💢', emoji: '😤', color: 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30' },
  { label: 'Romantic 🕯️', emoji: '🌹', color: 'bg-violet-100 hover:bg-violet-200 text-violet-700 dark:bg-violet-900/30' },
];

const WEATHER_OPTIONS = [
  { temp: '22°C', icon: '🌸', text: 'Sakura Petals Falling' },
  { temp: '15°C', icon: '🌧️', text: 'Cozy Kotatsu Rain' },
  { temp: '4°C', icon: '❄️', text: 'Romantic Soft Snowfall' },
  { temp: '26°C', icon: '☀️', text: 'Warm Golden Sunshine' },
  { temp: '19°C', icon: '🍃', text: 'Fresh Autumn Breeze' }
];

export default function Home() {
  const dispatch = useDispatch();
  const { user, partner, relationship, token } = useSelector((state) => state.auth);

  const [time, setTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [weatherIdx, setWeatherIdx] = useState(0);
  const [luckyNumber, setLuckyNumber] = useState(7);
  const [fortuneText, setFortuneText] = useState('Click to break a Sakura Fortune Cookie! 🥠');
  const [isFortuneBroken, setIsFortuneBroken] = useState(false);
  const [stickyInput, setStickyInput] = useState('');
  const [stickyNotes, setStickyNotes] = useState([]);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch local sticky notes on load
  useEffect(() => {
    if (!token) return;
    fetch('/api/notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStickyNotes(data.filter(n => n.type === 'sticky'));
        }
      })
      .catch(err => console.log(err));
  }, [token]);

  // Relationship time calculator
  const calculateDays = () => {
    if (!relationship || !relationship.startDate) return { days: 0, hrs: 0, mins: 0, secs: 0 };
    const diff = Math.max(0, new Date() - new Date(relationship.startDate));
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
      days,
      hrs: hours % 24,
      mins: minutes % 60,
      secs: seconds % 60
    };
  };

  const elapsed = calculateDays();

  // Change user mood helper
  const handleMoodSelect = async (moodLabel) => {
    const updatedUser = {
      ...user,
      profile: {
        ...user.profile,
        location: moodLabel // temporarily hijack location or save as profile state field
      }
    };
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location: moodLabel })
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(updateUserProfile({ profile: data.profile }));
        confetti({ particleCount: 30, spread: 40, colors: ['#FFC1CC'] });
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Fortune Cookie breaker
  const breakFortune = () => {
    if (isFortuneBroken) return;
    const fortunes = [
      "A sweet surprise awaits you both this weekend! 🎁",
      "You will share a cozy laugh together soon. 😄",
      "Your love will bloom bigger than the highest sakura tree. 🌸",
      "A date night planner is in your near future! 🥂",
      "An unexpected compliment will brighten your partner's day. ✨",
      "Sharing a warm tea together today brings good health. 🍵",
    ];
    const rand = Math.floor(Math.random() * fortunes.length);
    const randNum = Math.floor(Math.random() * 99) + 1;
    
    setFortuneText(fortunes[rand]);
    setLuckyNumber(randNum);
    setIsFortuneBroken(true);
    confetti({ particleCount: 50, spread: 60 });
  };

  const resetFortune = () => {
    setFortuneText('Click to break a Sakura Fortune Cookie! 🥠');
    setIsFortuneBroken(false);
  };

  // Sticky notes submission
  const handleAddSticky = async (e) => {
    e.preventDefault();
    if (!stickyInput.trim()) return;

    const colors = ['#FFC1CC', '#FFFDD0', '#E6E6FA', '#E0F7FA', '#FFDAB9'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'sticky',
          content: stickyInput,
          color: randomColor
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStickyNotes([...stickyNotes, data]);
        setStickyInput('');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteSticky = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStickyNotes(stickyNotes.filter(n => n._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Cycle Love Quote
  const nextQuote = () => {
    if (relationship && relationship.loveQuotes) {
      setQuoteIndex((prev) => (prev + 1) % relationship.loveQuotes.length);
    }
  };

  const weather = WEATHER_OPTIONS[weatherIdx];

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full grid grid-cols-1 lg:grid-cols-3 gap-6 relative select-none">
      
      {/* LEFT COLUMN: Date, Time, Weather, Mood, Partner Status */}
      <div className="flex flex-col gap-6">
        {/* Welcome Banner */}
        <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-kosugi text-xl font-bold text-sakura-600 dark:text-sakura-400">Welcome Home ❤️</h2>
            <p className="text-xs text-slate-500 mt-1">
              Today is {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono font-bold text-lg text-slate-700 dark:text-slate-200">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Partner Active Status */}
        {partner ? (
          <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex flex-col gap-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Partner Status</h3>
            <div className="flex items-center gap-3">
              <img
                src={partner.profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${partner.username}`}
                alt="Partner Avatar"
                className="w-12 h-12 rounded-full border-2 border-sakura-300 object-cover bg-sakura-50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{partner.profile.nickname || partner.username}</span>
                </div>
                <p className="text-xs text-slate-500 italic mt-0.5 truncate max-w-[150px]">"{partner.profile.bio}"</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Mood</span>
                <div className="text-sm font-semibold text-sakura-500">
                  {partner.profile.location || 'Cozy ☕'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <AlertCircle size={16} />
              <span>Share Invite Code: <strong className="font-mono text-sakura-500">{relationship?.inviteCode}</strong></span>
            </div>
          </div>
        )}

        {/* Mood Selection */}
        <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-3">How are you feeling today?</h3>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.label}
                onClick={() => handleMoodSelect(m.label)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all border border-pink-100/30 active:scale-95 ${m.color} ${
                  user.profile.location === m.label ? 'ring-2 ring-sakura-500' : ''
                }`}
                title={m.label}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[9px] font-semibold mt-1 truncate max-w-full">{m.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weather Indicator */}
        <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{weather.icon}</span>
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{weather.text}</h4>
              <p className="text-xs text-slate-400">Cozy Weather Indicator</p>
            </div>
          </div>
          <button 
            onClick={() => setWeatherIdx((prev) => (prev + 1) % WEATHER_OPTIONS.length)}
            className="text-lg font-bold text-sakura-500 p-2 hover:bg-sakura-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {weather.temp}
          </button>
        </div>
      </div>

      {/* MIDDLE COLUMN: Anniversary Love Counter, Quotes & Fortune Cookie */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {/* Relationship Counter Widget */}
        <div className="glass-panel p-6 border-pink-200/50 dark:border-slate-800 relative overflow-hidden text-center flex flex-col items-center justify-center bg-gradient-to-br from-white/70 to-pink-50/50 dark:from-[#1E1B2B]/70 dark:to-sakura-900/10">
          <div className="absolute top-2 right-2 animate-spin-slow text-sakura-400 opacity-20">🌸</div>
          <h3 className="font-kosugi text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
            We have been together for 🌸
          </h3>

          <div className="flex items-center gap-4 md:gap-6 justify-center">
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-extrabold text-sakura-500 drop-shadow-sm">{elapsed.days}</span>
              <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">Days</span>
            </div>
            <span className="text-2xl text-pink-300 font-light">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-extrabold text-slate-700 dark:text-slate-200">{elapsed.hrs}</span>
              <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">Hours</span>
            </div>
            <span className="text-2xl text-pink-300 font-light">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-extrabold text-slate-700 dark:text-slate-200">{elapsed.mins}</span>
              <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">Mins</span>
            </div>
            <span className="text-2xl text-pink-300 font-light">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-extrabold text-slate-700 dark:text-slate-200">{elapsed.secs}</span>
              <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase mt-1">Secs</span>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-white/70 dark:bg-slate-900/50 rounded-2xl border border-pink-100/50 dark:border-slate-800 max-w-md w-full flex items-center justify-between gap-3 text-left">
            <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium">
              "{relationship?.loveQuotes?.[quoteIndex] || 'In all the world, there is no heart for me like yours. 🌸'}"
            </p>
            <button 
              onClick={nextQuote}
              className="p-2 text-sakura-500 hover:bg-sakura-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic two boxes: Sticky notes board & Fortune cookies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Corkboard Sticky Notes */}
          <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-pink-100/50 dark:border-slate-800">
              <h3 className="font-kosugi text-sm font-bold text-sakura-600 dark:text-sakura-400">📌 Sticky Corkboard</h3>
              <span className="text-[10px] bg-sakura-100 text-sakura-600 px-2 py-0.5 rounded-full font-bold">
                {stickyNotes.length} Notes
              </span>
            </div>

            {/* Note items */}
            <div className="flex-1 flex flex-wrap gap-2 overflow-y-auto max-h-48 pr-1">
              {stickyNotes.map((note) => (
                <div
                  key={note._id}
                  style={{ backgroundColor: note.color }}
                  className="p-3 w-[47%] min-h-24 rounded-2xl shadow-sm text-slate-800 text-xs font-semibold relative flex flex-col justify-between transform rotate-1 group"
                >
                  <button 
                    onClick={() => handleDeleteSticky(note._id)}
                    className="absolute top-1 right-1.5 text-slate-400 hover:text-red-500 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  <p className="line-clamp-3 select-text pr-2 leading-relaxed">{note.content}</p>
                  <span className="text-[8px] text-slate-400 text-right mt-1">- {note.sender}</span>
                </div>
              ))}
              {stickyNotes.length === 0 && (
                <div className="w-full text-center text-xs text-slate-400 py-10 italic">
                  Leave a sweet note here for each other...
                </div>
              )}
            </div>

            {/* Note input */}
            <form onSubmit={handleAddSticky} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a sticky note..."
                value={stickyInput}
                onChange={(e) => setStickyInput(e.target.value)}
                className="glass-input flex-1 py-2 px-3 text-xs"
              />
              <button type="submit" className="btn-sakura py-2 px-3.5 rounded-xl">
                <Send size={12} />
              </button>
            </form>
          </div>

          {/* Sakura Fortune Cookie */}
          <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-4 min-h-[250px]">
            <h3 className="font-kosugi text-sm font-bold text-sakura-600 dark:text-sakura-400 mb-1">🥠 Sakura Fortune Cookie</h3>

            <button
              onClick={breakFortune}
              disabled={isFortuneBroken}
              className={`text-5xl transition-transform active:scale-95 ${
                isFortuneBroken ? 'animate-none opacity-80 cursor-default' : 'hover:scale-115 hover:rotate-6 cursor-pointer animate-pulse'
              }`}
            >
              {isFortuneBroken ? '🥠' : '🍪'}
            </button>

            <div className="bg-pink-50/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-pink-100/50 dark:border-slate-800 w-full min-h-16 flex flex-col justify-center">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                {fortuneText}
              </p>
              {isFortuneBroken && (
                <span className="text-[10px] text-sakura-500 font-bold mt-2">
                  🌸 Lucky Couple Number of the day: {luckyNumber}
                </span>
              )}
            </div>

            {isFortuneBroken && (
              <button 
                onClick={resetFortune}
                className="text-[10px] text-sakura-500 hover:text-sakura-600 font-bold uppercase tracking-wider"
              >
                Reset Cookie
              </button>
            )}
          </div>
        </div>

      </div>
      
    </div>
  );
}
