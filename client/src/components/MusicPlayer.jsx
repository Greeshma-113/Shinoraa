import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleAudio } from '../store/authSlice';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, ListMusic, Heart, Plus } from 'lucide-react';

const TRACKS = [
  {
    title: 'Sakura Rain 🌸',
    artist: 'Shinoraa Cozy Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    title: 'Tokyo Cafe Piano ☕',
    artist: 'Cozy Lofi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    title: 'Kyoto Dreams 🌙',
    artist: 'Shamisen Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    title: 'Lofi Girl Live Stream 📻',
    artist: 'Lofi Girl',
    url: 'https://icecast.lofigirl.com/lofigirl.mp3'
  }
];

export default function MusicPlayer() {
  const dispatch = useDispatch();
  const audioEnabled = useSelector((state) => state.auth.audioEnabled);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState(localStorage.getItem('shinoraa_spotify_url') || '');
  const [showSpotifyInput, setShowSpotifyInput] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio instance
    audioRef.current = new Audio(TRACKS[currentTrackIdx].url);
    audioRef.current.loop = true;
    audioRef.current.volume = isMuted ? 0 : volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = TRACKS[currentTrackIdx].url;
    audioRef.current.load();
    if (isPlaying && audioEnabled) {
      audioRef.current.play().catch(err => console.log('Audio autoplay blocked: ', err));
    }
  }, [currentTrackIdx]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted || !audioEnabled ? 0 : volume;
  }, [volume, isMuted, audioEnabled]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && audioEnabled) {
      audioRef.current.play().catch(err => {
        setIsPlaying(false);
        console.log('Playback error:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioEnabled]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSpotifySave = (e) => {
    e.preventDefault();
    localStorage.setItem('shinoraa_spotify_url', spotifyUrl);
    setShowSpotifyInput(false);
  };

  // Convert typical Spotify playlist share link to embed link
  const getSpotifyEmbedUrl = (url) => {
    if (!url) return '';
    try {
      const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `https://open.spotify.com/embed/playlist/${match[1]}?utm_source=generator&theme=0`;
      }
    } catch (e) {}
    return '';
  };

  const spotifyEmbedSrc = getSpotifyEmbedUrl(spotifyUrl);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded Playlist panel */}
      {showPlaylist && (
        <div className="glass-panel p-4 w-72 mb-1 flex flex-col gap-3 border-pink-200 dark:border-slate-800 scale-in shadow-2xl animate-fade-in text-xs">
          <div className="flex justify-between items-center border-b border-pink-100 dark:border-slate-800 pb-2">
            <span className="font-bold flex items-center gap-1 text-sakura-500">
              <ListMusic size={14} /> Playlist Selection
            </span>
            <button 
              onClick={() => setShowPlaylist(false)} 
              className="text-slate-400 hover:text-sakura-500 font-bold"
            >
              ✕
            </button>
          </div>

          {/* Built-in Tracks */}
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
            {TRACKS.map((track, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentTrackIdx(idx);
                  setIsPlaying(true);
                }}
                className={`text-left p-2 rounded-xl transition-all flex items-center justify-between ${
                  currentTrackIdx === idx
                    ? 'bg-sakura-100/50 dark:bg-sakura-900/30 text-sakura-600 font-medium'
                    : 'hover:bg-pink-50/50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{track.title}</span>
                {currentTrackIdx === idx && isPlaying && (
                  <span className="flex gap-[2px] items-end h-3">
                    <span className="w-1 bg-sakura-500 animate-bounce h-full rounded-full" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 bg-sakura-500 animate-bounce h-2 rounded-full" style={{ animationDelay: '0.3s' }}></span>
                    <span className="w-1 bg-sakura-500 animate-bounce h-3 rounded-full" style={{ animationDelay: '0.5s' }}></span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Spotify integration section */}
          <div className="border-t border-pink-100 dark:border-slate-800 pt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Spotify Link</span>
              <button 
                onClick={() => setShowSpotifyInput(!showSpotifyInput)}
                className="text-sakura-500 hover:text-sakura-600 text-[10px] flex items-center gap-1"
              >
                <Plus size={10} /> Edit Link
              </button>
            </div>
            
            {showSpotifyInput ? (
              <form onSubmit={handleSpotifySave} className="flex gap-1">
                <input
                  type="text"
                  placeholder="Paste playlist URL..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="glass-input py-1 px-2 text-[11px] rounded-xl flex-1"
                />
                <button type="submit" className="btn-sakura py-1 px-3 text-[11px] rounded-xl">Save</button>
              </form>
            ) : spotifyEmbedSrc ? (
              <iframe
                title="Spotify Shared Playlist"
                src={spotifyEmbedSrc}
                width="100%"
                height="80"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl border border-pink-100 dark:border-slate-800"
              />
            ) : (
              <div className="text-[10px] text-slate-400 text-center py-2 bg-pink-50/20 dark:bg-slate-800/20 rounded-xl">
                No Spotify playlist connected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating mini bar */}
      <div className="glass-panel p-3 flex items-center gap-3 border-pink-200 dark:border-slate-800 shadow-xl max-w-sm">
        <button 
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="p-2 bg-pink-100/50 dark:bg-slate-800/50 hover:bg-sakura-100 dark:hover:bg-slate-700/60 rounded-xl text-sakura-500 transition-colors"
          title="Playlists"
        >
          <Music size={16} />
        </button>

        <div className="flex flex-col text-left max-w-28 overflow-hidden select-none">
          <span className="text-[11px] font-bold truncate text-slate-800 dark:text-slate-200">
            {TRACKS[currentTrackIdx].title}
          </span>
          <span className="text-[9px] text-slate-400 truncate">
            {TRACKS[currentTrackIdx].artist}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={handlePlayPause}
            className="p-2 bg-sakura-500 text-white rounded-xl hover:bg-sakura-600 active:scale-95 transition-all shadow-md shadow-sakura-200/30"
          >
            {isPlaying && audioEnabled ? <Pause size={14} /> : <Play size={14} />}
          </button>
          
          <button 
            onClick={handleNext}
            className="p-2 hover:bg-pink-50 dark:hover:bg-slate-800/80 rounded-xl text-slate-500 dark:text-slate-400 transition-colors"
          >
            <SkipForward size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-pink-100 dark:border-slate-800 pl-2">
          <button 
            onClick={toggleMute}
            className="p-1.5 hover:bg-pink-50 dark:hover:bg-slate-800/80 rounded-lg text-slate-500 dark:text-slate-400"
          >
            {isMuted || !audioEnabled ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-12 h-1 cursor-pointer accent-sakura-500"
          />
        </div>
      </div>
    </div>
  );
}
