import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Send, Smile, Image, Paperclip, Heart, Star, Trash, Pin, CheckCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

const STICKERS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzk1YzgxNWE4MGZlMmZlM2E4MTU1MWU5NjBkMGNmZjhkNTRkNmMyZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfZ2lmcyZjdD1z/29t36b9M5G1qA2OqqC/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTUzOGUxZTY5ZTUwZmNhNTY4MGZlM2E5MmRjMDdjOWExOGQ3NWMwOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfZ2lmcyZjdD1z/yv1gZ6Tj3000P4oM15/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzNkODg5YzA4MmExNGNjYmNlOWU4MWM4OGZhMTUzNzRlOTlhYzAxNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfZ2lmcyZjdD1z/l3q2t2e3yKvZ3W0yU/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzFjYzllZDcyNzg1MzdiNGE4MzFmOWM1NTNhMzkzMmQ0Y2NkYWViMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfZ2lmcyZjdD1z/3orieQcvWn0vSgEa6A/giphy.gif',
];

const EMOJIS = ['❤️', '🌸', '🥰', '✨', '🐱', '🐻', '🐰', '🍵', '🍙', '🍡', '🍦', '🥞'];

export default function Chat() {
  const { user, relationship, token } = useSelector((state) => state.auth);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Synthesize a cute chime sound effect
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6 note

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  useEffect(() => {
    // Fetch initial chat logs from REST API
    if (!token || !relationship) return;

    fetch(`/api/notes`, { // Fetching messages mock or custom note logs
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter out love notes / stickies to show chat messages
          const chatMsgs = data.filter(n => n.type === 'chat_message');
          setMessages(chatMsgs);
        }
      })
      .catch(err => console.log(err));

    // Connect Socket.IO
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    newSocket.emit('join_relationship', {
      relationshipId: relationship._id,
      username: user.username
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      playChime();
    });

    newSocket.on('partner_online', ({ online }) => {
      setIsPartnerOnline(online);
    });

    newSocket.on('partner_typing', ({ isTyping }) => {
      setIsPartnerTyping(isTyping);
    });

    newSocket.on('message_reaction_updated', ({ messageId, reaction, username }) => {
      setMessages((prev) => prev.map(m => {
        if (m._id === messageId) {
          const reactions = [...(m.reactions || [])];
          const existIdx = reactions.findIndex(r => r.username === username);
          if (existIdx !== -1) {
            reactions[existIdx].reaction = reaction;
          } else {
            reactions.push({ username, reaction });
          }
          return { ...m, reactions };
        }
        return m;
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, relationship]);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Send via socket/REST adapter
    const newMsg = {
      relationshipId: relationship._id,
      sender: user.username,
      content: inputText,
      mediaType: 'text',
      type: 'chat_message' // wrapper for DB notes mock
    };

    // Emit socket event for real-time
    if (socket) {
      socket.emit('send_message', newMsg);
    }

    // Save to server database
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMsg)
      });
      const data = await res.json();
      if (res.ok) {
        // If sockets didn't emit locally
        if (!socket) {
          setMessages([...messages, data]);
          playChime();
        }
      }
    } catch (e) {
      console.log(e);
    }

    setInputText('');
    if (socket) {
      socket.emit('typing', { relationshipId: relationship._id, username: user.username, isTyping: false });
    }
  };

  const handleSendSticker = async (url) => {
    const newMsg = {
      relationshipId: relationship._id,
      sender: user.username,
      content: '',
      mediaUrl: url,
      mediaType: 'gif',
      type: 'chat_message'
    };

    if (socket) {
      socket.emit('send_message', newMsg);
    }

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMsg)
      });
    } catch (e) {}

    setShowStickerPicker(false);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket) return;

    socket.emit('typing', { relationshipId: relationship._id, username: user.username, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { relationshipId: relationship._id, username: user.username, isTyping: false });
    }, 1500);
  };

  const handleAddReaction = (msgId, emoji) => {
    if (socket) {
      socket.emit('add_reaction', {
        relationshipId: relationship._id,
        messageId: msgId,
        reaction: emoji,
        username: user.username
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        const imageMsg = {
          relationshipId: relationship._id,
          sender: user.username,
          content: '',
          mediaUrl: data.fileUrl,
          mediaType: 'image',
          type: 'chat_message'
        };

        if (socket) socket.emit('send_message', imageMsg);
        
        await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(imageMsg)
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 py-4 w-full flex flex-col h-[78vh] select-none">
      
      {/* Header */}
      <div className="glass-panel p-4 border-pink-200/50 dark:border-slate-800 flex items-center justify-between mb-4 shadow-md bg-white/70">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🌸</span>
          <div>
            <h3 className="font-kosugi font-bold text-sm text-slate-800 dark:text-slate-200">Private Sakura Chat</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-bold">
              <span className={`w-2 h-2 rounded-full ${isPartnerOnline ? 'bg-green-400' : 'bg-slate-300'}`} />
              {isPartnerOnline ? 'Your partner is active' : 'Partner is away'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 glass-panel p-4 border-pink-200/50 dark:border-slate-800 overflow-y-auto mb-4 flex flex-col gap-4 bg-white/40">
        {messages.map((msg, idx) => {
          const isMe = msg.sender === user.username;
          return (
            <div key={idx} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
              
              {/* Message bubble */}
              <div className={`p-3.5 rounded-3xl text-sm font-semibold relative group shadow-sm ${
                isMe 
                  ? 'bg-gradient-to-r from-sakura-400 to-sakura-500 text-white rounded-br-none' 
                  : 'bg-white dark:bg-[#1E1B2B] text-slate-800 dark:text-slate-100 rounded-bl-none border border-pink-100 dark:border-slate-800'
              }`}>
                {msg.mediaType === 'image' && (
                  <img src={msg.mediaUrl} alt="Shared attachment" className="rounded-2xl max-w-xs mb-1 object-cover shadow" />
                )}
                {msg.mediaType === 'gif' && (
                  <img src={msg.mediaUrl} alt="Sticker" className="rounded-xl w-32 object-contain" />
                )}
                {msg.content && <p className="leading-relaxed select-text">{msg.content}</p>}

                {/* Reaction button */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-white/90 dark:bg-slate-800/95 shadow border border-pink-100 dark:border-slate-700 p-1 rounded-full text-xs">
                  <button onClick={() => handleAddReaction(msg._id, '❤️')}>❤️</button>
                  <button onClick={() => handleAddReaction(msg._id, '🥰')}>🥰</button>
                </div>
              </div>

              {/* Reaction indicators */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {msg.reactions.map((r, i) => (
                    <span key={i} className="text-[10px] bg-pink-100/50 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-pink-100/50 font-bold" title={r.username}>
                      {r.reaction}
                    </span>
                  ))}
                </div>
              )}

              {/* Message metadata */}
              <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-bold">
                {isMe && <CheckCheck size={10} className="text-sakura-500" />}
                {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isPartnerTyping && (
          <div className="self-start flex items-center gap-2 bg-white dark:bg-[#1E1B2B] py-2.5 px-4 rounded-full border border-pink-50 dark:border-slate-800 shadow-sm animate-pulse">
            <span className="text-xs text-slate-400 font-bold">Partner is writing</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-sakura-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-1.5 h-1.5 bg-sakura-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="w-1.5 h-1.5 bg-sakura-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input controls bar */}
      <form onSubmit={handleSendText} className="flex gap-2 items-center relative">
        {/* Stickers selector */}
        {showStickerPicker && (
          <div className="absolute bottom-16 left-0 glass-panel p-3 border-pink-200 shadow-xl flex gap-2 z-50 animate-fade-in bg-white">
            {STICKERS.map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendSticker(st)}
                className="w-14 h-14 hover:scale-110 active:scale-95 transition-transform"
              >
                <img src={st} alt="" className="w-full h-full object-contain rounded" />
              </button>
            ))}
          </div>
        )}

        {/* Emoji Selector */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-12 glass-panel p-3 border-pink-200 shadow-xl flex gap-2.5 z-50 animate-fade-in bg-white text-lg">
            {EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => { setInputText(prev => prev + em); setShowEmojiPicker(false); }}
                className="hover:scale-115 active:scale-95 transition-transform"
              >
                {em}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); }}
          className="p-3 bg-pink-100 hover:bg-sakura-100 text-sakura-500 rounded-2xl transition-colors"
          title="Stickers"
        >
          <Star size={18} />
        </button>

        <button
          type="button"
          onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickerPicker(false); }}
          className="p-3 bg-pink-100 hover:bg-sakura-100 text-sakura-500 rounded-2xl transition-colors"
          title="Emojis"
        >
          <Smile size={18} />
        </button>

        <label className="p-3 bg-pink-100 hover:bg-sakura-100 text-sakura-500 rounded-2xl cursor-pointer flex items-center justify-center transition-colors">
          <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
          <Image size={18} />
        </label>

        <input
          type="text"
          placeholder="Send a sweet message..."
          value={inputText}
          onChange={handleInputChange}
          className="glass-input flex-grow py-3"
        />

        <button
          type="submit"
          className="btn-sakura py-3 px-5 rounded-2xl"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
