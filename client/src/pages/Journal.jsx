import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, Heart, Sparkles, Key, Lock, Plus, Trash, Clock, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Journal() {
  const { token, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('diary'); // diary, gratitude, secrets
  const [entries, setEntries] = useState([]);
  
  // Input fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [journalMood, setJournalMood] = useState('🌸 Happy');
  const [isSecretOpened, setIsSecretOpened] = useState({});

  useEffect(() => {
    fetchJournal();
  }, [token]);

  const fetchJournal = () => {
    if (!token) return;
    fetch('/api/notes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEntries(data);
        }
      })
      .catch(err => console.log(err));
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    let noteType = 'love'; // Love Diary
    if (activeTab === 'gratitude') noteType = 'gratitude';
    else if (activeTab === 'secrets') noteType = 'secret';

    const payload = {
      type: noteType,
      content: content,
      // For diary, we prepend the title and mood into the content or store it
      color: activeTab === 'diary' ? `${title} | ${journalMood}` : '#FFC1CC'
    };

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setEntries([data, ...entries]);
        setTitle('');
        setContent('');
        confetti({ particleCount: 30, colors: ['#FFC1CC'] });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteEntry = async (id, type) => {
    if (!window.confirm('Erase this journal record?')) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEntries(entries.filter(e => e._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenSecret = async (id) => {
    setIsSecretOpened(prev => ({ ...prev, [id]: true }));
    confetti({ particleCount: 40, spread: 50 });
  };

  // Grouped lists
  const diaryLogs = entries.filter(e => e.type === 'love');
  const gratitudeLogs = entries.filter(e => e.type === 'gratitude');
  const secretLogs = entries.filter(e => e.type === 'secret');

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full grid grid-cols-1 lg:grid-cols-3 gap-6 relative select-none">
      
      {/* LEFT COLUMN: Entry Editor */}
      <div>
        <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex flex-col gap-4 bg-white/70">
          <h3 className="font-kosugi font-bold text-sm text-sakura-600 dark:text-sakura-400 flex items-center gap-1.5">
            <BookOpen size={16} /> Write in Journal
          </h3>

          <form onSubmit={handleAddEntry} className="flex flex-col gap-4 text-left">
            {activeTab === 'diary' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Diary Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Baking strawberry shortcake together 🍓"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Mood Indicator</label>
                  <select
                    value={journalMood}
                    onChange={(e) => setJournalMood(e.target.value)}
                    className="glass-input text-xs"
                  >
                    <option>🌸 Happy</option>
                    <option>🥰 Loved</option>
                    <option>💤 Cozy</option>
                    <option>😢 Emotional</option>
                    <option>✨ Magical</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">
                {activeTab === 'diary' ? 'Write entry...' : activeTab === 'gratitude' ? 'What are you grateful for today?' : 'Write a secret note...'}
              </label>
              <textarea
                placeholder={activeTab === 'secrets' ? 'Only your partner can open this...' : 'Today was special because...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="glass-input min-h-28 text-xs"
                required
              />
            </div>

            <button type="submit" className="btn-sakura mt-2 py-3 rounded-2xl flex items-center justify-center gap-2">
              <Plus size={16} /> Save Record
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMNS: Tabs & Entry List */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex bg-pink-100/50 dark:bg-slate-900/40 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('diary')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'diary'
                ? 'bg-sakura-500 text-white shadow'
                : 'text-slate-500 hover:text-sakura-500'
            }`}
          >
            <Heart size={14} /> Love Diary
          </button>
          <button
            onClick={() => setActiveTab('gratitude')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'gratitude'
                ? 'bg-sakura-500 text-white shadow'
                : 'text-slate-500 hover:text-sakura-500'
            }`}
          >
            <Sparkles size={14} /> Gratitude Log
          </button>
          <button
            onClick={() => setActiveTab('secrets')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'secrets'
                ? 'bg-sakura-500 text-white shadow'
                : 'text-slate-500 hover:text-sakura-500'
            }`}
          >
            <Lock size={14} /> Secret Notes
          </button>
        </div>

        {/* Dynamic Entry Logs Board */}
        <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex-1 flex flex-col gap-4 max-h-[550px] overflow-y-auto bg-white/40">
          
          {/* 1. Love Diary Log */}
          {activeTab === 'diary' && (
            <div className="flex flex-col gap-4 text-left">
              {diaryLogs.map(entry => {
                const [entryTitle, entryMood] = (entry.color || '').split('|');
                return (
                  <div key={entry._id} className="glass-card p-5 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex flex-col gap-3 group relative select-text">
                    <button
                      onClick={() => handleDeleteEntry(entry._id, 'diary')}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash size={14} />
                    </button>
                    <div className="flex justify-between items-center pr-6">
                      <h4 className="font-kosugi font-bold text-sm text-slate-800 dark:text-slate-200">
                        {entryTitle || 'Untitled Cozy Diary'}
                      </h4>
                      <span className="text-[9px] bg-pink-100 text-sakura-600 px-2 py-0.5 rounded-full font-bold">
                        {entryMood || '🌸 Cozy'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {entry.content}
                    </p>
                    <span className="text-[8px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                      <Clock size={10} /> Written by {entry.sender} on {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
              {diaryLogs.length === 0 && (
                <div className="text-center text-slate-400 py-20 italic">No diary logs written yet.</div>
              )}
            </div>
          )}

          {/* 2. Gratitude Log */}
          {activeTab === 'gratitude' && (
            <div className="flex flex-col gap-3 text-left">
              {gratitudeLogs.map(gr => (
                <div key={gr._id} className="glass-card p-4 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex justify-between items-center group select-text">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌸</span>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-200 font-semibold italic">"{gr.content}"</p>
                      <span className="text-[8px] text-slate-400 font-bold block mt-1">- {gr.sender}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(gr._id, 'gratitude')}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
              {gratitudeLogs.length === 0 && (
                <div className="text-center text-slate-400 py-20 italic">What are you thankful for today? Write a list!</div>
              )}
            </div>
          )}

          {/* 3. Secret Lock Notes */}
          {activeTab === 'secrets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {secretLogs.map(sec => {
                const isAuthor = sec.sender === user.username;
                const opened = isSecretOpened[sec._id] || isAuthor;

                return (
                  <div key={sec._id} className="glass-card p-5 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex flex-col justify-between gap-4 group relative">
                    <button
                      onClick={() => handleDeleteEntry(sec._id, 'secret')}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={12} />
                    </button>

                    <div className="flex items-center gap-2 border-b border-pink-50 dark:border-slate-800 pb-2">
                      <span className="text-xl">{opened ? '✉️' : '🔒'}</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {isAuthor ? 'Secret you sent' : 'Secret from partner'}
                        </h4>
                        <span className="text-[8px] text-slate-400 font-bold block">Sent by {sec.sender}</span>
                      </div>
                    </div>

                    <div className="min-h-16 flex items-center justify-center">
                      {opened ? (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic font-semibold leading-relaxed w-full select-text">
                          "{sec.content}"
                        </p>
                      ) : (
                        <button
                          onClick={() => handleOpenSecret(sec._id)}
                          className="btn-sakura py-2 px-4 rounded-xl text-[10px] flex items-center gap-1 shadow"
                        >
                          <Key size={10} /> Open Secret Letter
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {secretLogs.length === 0 && (
                <div className="col-span-full text-center text-slate-400 py-20 italic">No locked secret letters sent yet.</div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
