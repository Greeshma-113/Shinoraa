import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import SakuraOverlay from './components/SakuraOverlay';
import MusicPlayer from './components/MusicPlayer';
import SplashLoader from './components/SplashLoader';
import Navbar from './components/Navbar';

// Page Imports
import Login from './pages/Login';
import Home from './pages/Home';
import Memories from './pages/Memories';
import Planner from './pages/Planner';
import Chat from './pages/Chat';
import Entertainment from './pages/Entertainment';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function MainAppShell() {
  const { token, theme } = useSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  // Synchronize CSS dark class on theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      {/* Animated Opening Splash Screen */}
      {showSplash && <SplashLoader onComplete={() => setShowSplash(false)} />}

      {/* Floating Sakura animations */}
      <SakuraOverlay />
      
      {/* Shared music player */}
      <MusicPlayer />

      {/* Global Navbar */}
      <Navbar />

      <main className="flex-grow flex flex-col w-full pb-20 md:pb-6 overflow-y-auto">
        <Routes>
          {/* Public Login Route */}
          <Route 
            path="/login" 
            element={!token ? <Login /> : <Navigate to="/" replace />} 
          />

          {/* Private Routes */}
          <Route 
            path="/" 
            element={token ? <Home /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/memories" 
            element={token ? <Memories /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/planner" 
            element={token ? <Planner /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/chat" 
            element={token ? <Chat /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/entertainment" 
            element={token ? <Entertainment /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={token ? <Profile /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/settings" 
            element={token ? <Settings /> : <Navigate to="/login" replace />} 
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <MainAppShell />
    </Provider>
  );
}
