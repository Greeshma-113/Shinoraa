import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Image, Video, Plus, Heart, Trash, Calendar, ArrowRight, Play, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Memories() {
  const { token } = useSelector((state) => state.auth);
  
  const [memories, setMemories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [slideshowIdx, setSlideshowIdx] = useState(null); // null means no active slideshow

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('General');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, [token]);

  const fetchMemories = () => {
    if (!token) return;
    fetch('/api/memories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMemories(data);
        }
      })
      .catch(err => console.log(err));
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
        setMediaUrl(data.fileUrl);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || !mediaUrl) {
      alert('Please fill out all required fields and upload/paste media.');
      return;
    }

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, mediaUrl, mediaType, date, category })
      });
      const data = await res.json();
      if (res.ok) {
        setMemories([data, ...memories]);
        // Reset form
        setTitle('');
        setDescription('');
        setMediaUrl('');
        setMediaType('image');
        setCategory('General');
        setShowAddForm(false);
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleFavorite = async (id, currentFav) => {
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isFavorite: !currentFav })
      });
      if (res.ok) {
        setMemories(memories.map(m => m._id === id ? { ...m, isFavorite: !currentFav } : m));
        if (!currentFav) confetti({ particleCount: 20, colors: ['#FFC1CC'] });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this memory?')) return;
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMemories(memories.filter(m => m._id !== id));
      }
    } catch (e) {
      console.log(e);
    }
  };

  const filteredMemories = memories.filter(m => {
    if (categoryFilter === 'All') return true;
    if (categoryFilter === 'Favorites') return m.isFavorite;
    return m.category === categoryFilter;
  });

  const categories = ['All', 'Favorites', 'General', 'Cozy Dates', 'Travels', 'Anniversaries', 'Holidays'];

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full select-none">
      {/* Header and buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-kosugi text-2xl font-bold text-sakura-600 dark:text-sakura-400 flex items-center gap-2">
            📸 Shared Memory Book
          </h2>
          <p className="text-xs text-slate-500 mt-1">Our adventures, frozen in time</p>
        </div>

        <div className="flex gap-2">
          {memories.length > 0 && (
            <button
              onClick={() => setSlideshowIdx(0)}
              className="btn-cozy py-2.5 px-4 text-xs font-bold"
            >
              <Play size={14} /> Slideshow
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-sakura py-2.5 px-4 text-xs font-bold"
          >
            <Plus size={14} /> New Polaroid
          </button>
        </div>
      </div>

      {/* Categories filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
              categoryFilter === cat
                ? 'bg-sakura-500 text-white border-sakura-600 shadow shadow-sakura-200'
                : 'bg-white/80 dark:bg-slate-900/40 text-slate-500 border-pink-100/50 dark:border-slate-800 hover:text-sakura-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Polaris / scrapbook list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMemories.map((mem) => (
          <div
            key={mem._id}
            className="glass-card glass-card-hover p-4 border-pink-100/50 dark:border-slate-800/80 bg-white dark:bg-[#1E1B2B] shadow-lg flex flex-col gap-3 group relative transform hover:-rotate-1"
          >
            {/* Polaroid image window */}
            <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-900/60 rounded-xl overflow-hidden relative shadow-inner">
              {mem.mediaType === 'video' ? (
                <video src={mem.mediaUrl} controls className="w-full h-full object-cover" />
              ) : (
                <img src={mem.mediaUrl} alt={mem.title} className="w-full h-full object-cover" />
              )}
              
              {/* Category indicator tag */}
              <span className="absolute top-2 left-2 text-[9px] font-bold bg-white/90 dark:bg-slate-900/90 text-sakura-500 px-2 py-0.5 rounded-full shadow-sm">
                {mem.category}
              </span>
            </div>

            {/* Polaroid base paper style details */}
            <div className="flex flex-col gap-1.5 px-1 pb-1 text-left select-text">
              <div className="flex justify-between items-start">
                <h3 className="font-kosugi font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">
                  {mem.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap flex items-center gap-1">
                  <Calendar size={10} /> {new Date(mem.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                {mem.description}
              </p>
            </div>

            {/* Hover Actions */}
            <div className="flex items-center justify-between border-t border-pink-50 dark:border-slate-800 pt-2.5">
              <button
                onClick={() => handleToggleFavorite(mem._id, mem.isFavorite)}
                className={`p-1.5 rounded-xl hover:bg-pink-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[10px] font-bold ${
                  mem.isFavorite ? 'text-red-500' : 'text-slate-400'
                }`}
              >
                <Heart size={14} fill={mem.isFavorite ? 'currentColor' : 'none'} />
                <span>{mem.isFavorite ? 'Loved' : 'Love'}</span>
              </button>

              <button
                onClick={() => handleDelete(mem._id)}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                title="Delete memory"
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredMemories.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-20 italic bg-white/40 dark:bg-slate-900/20 rounded-3xl border border-dashed border-pink-200/50">
            No polaroid memories captured in this category yet.
          </div>
        )}
      </div>

      {/* New Polaroid Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 w-full max-w-md border-pink-200 dark:border-slate-800 shadow-2xl relative">
            <h3 className="font-kosugi font-bold text-lg text-sakura-600 dark:text-sakura-400 mb-4 flex items-center gap-2">
              📸 Add Polaroid Memory
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Memory Title</label>
                <input
                  type="text"
                  placeholder="e.g. Picnic under the Cherry Blossom tree 🌸"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Caption / Description</label>
                <textarea
                  placeholder="Describe this cozy moment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input min-h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="glass-input text-xs"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input text-xs"
                  >
                    <option>General</option>
                    <option>Cozy Dates</option>
                    <option>Travels</option>
                    <option>Anniversaries</option>
                    <option>Holidays</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Media Type</label>
                <div className="flex bg-pink-100/50 dark:bg-slate-900/30 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mediaType === 'image' ? 'bg-sakura-500 text-white shadow' : 'text-slate-500'
                    }`}
                  >
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mediaType === 'video' ? 'bg-sakura-500 text-white shadow' : 'text-slate-500'
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Photo / Video Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste URL or choose file..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="glass-input flex-1 text-xs"
                  />
                  <label className="btn-cozy py-2 px-3 text-xs rounded-xl flex items-center justify-center cursor-pointer">
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                    {uploading ? '...' : 'Upload'}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-cozy flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-sakura flex-1 py-3"
                >
                  Save Polaroid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Slideshow Overlay */}
      {slideshowIdx !== null && memories.length > 0 && (
        <div className="fixed inset-0 z-55 flex flex-col items-center justify-center p-6 bg-black/90 animate-fade-in text-white">
          <button
            onClick={() => setSlideshowIdx(null)}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          {/* Slideshow image frame */}
          <div className="max-w-2xl w-full h-[65vh] flex items-center justify-center relative">
            {memories[slideshowIdx].mediaType === 'video' ? (
              <video src={memories[slideshowIdx].mediaUrl} autoplay controls className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl" />
            ) : (
              <img src={memories[slideshowIdx].mediaUrl} alt="" className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl" />
            )}
          </div>

          <div className="mt-6 text-center max-w-lg">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sakura-400">
              {memories[slideshowIdx].category} • {new Date(memories[slideshowIdx].date).toLocaleDateString()}
            </span>
            <h3 className="font-kosugi text-xl font-bold mt-1">{memories[slideshowIdx].title}</h3>
            <p className="text-sm text-slate-400 mt-2 italic">"{memories[slideshowIdx].description}"</p>
          </div>

          {/* Slideshow controls */}
          <div className="flex gap-6 mt-8">
            <button
              onClick={() => setSlideshowIdx((prev) => (prev - 1 + memories.length) % memories.length)}
              className="px-4 py-2 hover:bg-white/10 rounded-xl transition-all font-bold text-xs"
            >
              Previous
            </button>
            <span className="text-xs self-center">
              {slideshowIdx + 1} / {memories.length}
            </span>
            <button
              onClick={() => setSlideshowIdx((prev) => (prev + 1) % memories.length)}
              className="px-4 py-2 hover:bg-white/10 rounded-xl transition-all font-bold text-xs flex items-center gap-1"
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
