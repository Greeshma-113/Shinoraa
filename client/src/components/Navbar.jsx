import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, logout } from '../store/authSlice';
import { Home, Image, Calendar, MessageCircle, Gamepad2, User, Settings, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, partner, theme, partnerOnline } = useSelector((state) => state.auth);

  if (!user) return null; // hide navbar on login screen

  const links = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/memories', label: 'Memories', icon: Image },
    { path: '/planner', label: 'Planner', icon: Calendar },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/entertainment', label: 'Arcade', icon: Gamepad2 },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="glass-panel sticky top-4 mx-4 md:mx-auto max-w-6xl z-40 px-4 py-2 border-pink-200/50 dark:border-slate-800 flex items-center justify-between shadow-xl mt-4">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-8 h-8 animate-pulse-soft">
          <circle cx="50" cy="50" r="45" fill="url(#sakuraGrad)" stroke="#FFFFFF" strokeWidth="3"/>
          <path d="M50 25 C45 35 30 35 35 48 C35 60 50 65 50 75 C50 65 65 60 65 48 C65 35 55 35 50 25 Z" fill="#FF7693"/>
          <circle cx="50" cy="48" r="6" fill="#FFFDF0"/>
          <defs>
            <linearGradient id="sakuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF0F2" />
              <stop offset="100%" stopColor="#FFB8C7" />
            </linearGradient>
          </defs>
        </svg>
        <span className="font-kosugi text-lg font-bold bg-gradient-to-r from-sakura-500 to-sakura-600 dark:from-sakura-400 dark:to-cozy-darkAccent bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
          Shinoraa
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl transition-all duration-200 text-sm font-semibold ${
                isActive
                  ? 'bg-sakura-100/70 dark:bg-sakura-900/30 text-sakura-600 dark:text-cozy-darkAccent'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-pink-50/50 dark:hover:bg-slate-800/40 hover:text-sakura-500'
              }`}
            >
              <Icon size={16} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Utilities / Theme & User */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 hover:bg-pink-50 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Partner Avatars display */}
        <div className="flex items-center gap-2 border-l border-pink-100 dark:border-slate-800 pl-3">
          <div className="flex -space-x-2.5">
            <Link to="/profile" title={user.username}>
              <img
                src={user.profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                alt="Me"
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover bg-pink-100 shadow-sm"
              />
            </Link>
            {partner && (
              <div className="relative" title={`${partner.username} is ${partnerOnline ? 'Online' : 'Away'}`}>
                <img
                  src={partner.profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${partner.username}`}
                  alt="Partner"
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 object-cover bg-sakura-100 shadow-sm"
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                  partnerOnline ? 'bg-green-400' : 'bg-slate-400'
                }`} />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => dispatch(logout())}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Mobile nav indicator/bar links */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-pink-200/50 dark:border-slate-800/50 rounded-t-3xl rounded-b-none py-2 px-6 flex justify-between items-center shadow-2xl z-40 bg-white/95 dark:bg-cozy-darkBg/95">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                isActive
                  ? 'bg-sakura-500 text-white scale-110 shadow-lg shadow-sakura-200'
                  : 'text-slate-400 hover:text-sakura-400'
              }`}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
