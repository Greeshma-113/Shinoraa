import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Award, BookOpen, Code, CheckSquare, Plus, Trash, Check, User, Link2, Sparkles, RefreshCw, Save, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_ROUTINE = {
  hours: [
    { time: '6 AM', text: '', done: false },
    { time: '7 AM', text: '', done: false },
    { time: '8 AM', text: '', done: false },
    { time: '9 AM', text: '', done: false },
    { time: '10 AM', text: '', done: false },
    { time: '11 AM', text: '', done: false },
    { time: '12 PM', text: '', done: false },
    { time: '1 PM', text: '', done: false },
    { time: '2 PM', text: '', done: false },
    { time: '3 PM', text: '', done: false },
    { time: '4 PM', text: '', done: false },
    { time: '5 PM', text: '', done: false },
    { time: '6 PM', text: '', done: false },
    { time: '7 PM', text: '', done: false },
    { time: '8 PM', text: '', done: false },
    { time: '9 PM', text: '', done: false },
    { time: '10 PM', text: '', done: false },
    { time: '11 PM', text: '', done: false },
  ],
  priorities: [
    { text: '', done: false },
    { text: '', done: false },
    { text: '', done: false },
    { text: '', done: false },
  ],
  events: '',
  meetings: '',
  unwind: ''
};

export default function PlacementHub() {
  const { token, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('dsa'); // dsa, aptitude, mock, routine
  const [items, setItems] = useState([]);
  
  // DSA Input states
  const [probName, setProbName] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [difficulty, setDifficulty] = useState('Easy');
  const [probUrl, setProbUrl] = useState('');

  // Aptitude Input states
  const [topicName, setTopicName] = useState('');
  const [subject, setSubject] = useState('DSA Core');

  // Mock Input states
  const [mockTopic, setMockTopic] = useState('');
  const [mockDate, setMockDate] = useState('');
  const [interviewer, setInterviewer] = useState('');

  // Daily Routine data state
  const [routineData, setRoutineData] = useState(DEFAULT_ROUTINE);

  useEffect(() => {
    fetchPlacementItems();
  }, [token]);

  const fetchPlacementItems = () => {
    if (!token) return;
    fetch('/api/planner', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter placement items
          const placementItems = data.filter(i => i.type.startsWith('placement_'));
          setItems(placementItems);

          // Find the routine sheet if saved
          const routine = placementItems.find(i => i.type === 'placement_routine');
          if (routine) {
            try {
              const parsed = JSON.parse(routine.description);
              // Merge with default routine in case of missing keys
              setRoutineData({
                hours: parsed.hours || DEFAULT_ROUTINE.hours,
                priorities: parsed.priorities || DEFAULT_ROUTINE.priorities,
                events: parsed.events || '',
                meetings: parsed.meetings || '',
                unwind: parsed.unwind || ''
              });
            } catch (err) {
              console.log('Error parsing routine:', err);
            }
          }
        }
      })
      .catch(err => console.log(err));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    let targetType = `placement_${activeTab}`;
    let title = '';
    let description = '';
    let dueDate = '';
    let assignee = '';

    if (activeTab === 'dsa') {
      if (!probName) return;
      title = probName;
      description = `${platform} | ${difficulty} | ${probUrl}`;
    } else if (activeTab === 'aptitude') {
      if (!topicName) return;
      title = topicName;
      description = subject;
    } else if (activeTab === 'mock') {
      if (!mockTopic) return;
      title = `Mock: ${mockTopic}`;
      description = `Interviewer: ${interviewer || 'Peer Review'}`;
      dueDate = mockDate;
      assignee = interviewer;
    }

    try {
      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: targetType,
          title,
          description,
          dueDate,
          assignee
        })
      });
      const data = await res.json();
      if (res.ok) {
        setItems([...items, data]);
        // Reset states
        setProbName('');
        setProbUrl('');
        setTopicName('');
        setMockTopic('');
        setMockDate('');
        setInterviewer('');
        confetti({ particleCount: 30, colors: ['#FFC1CC'] });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleComplete = async (id, currentVal) => {
    try {
      const res = await fetch(`/api/planner/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !currentVal })
      });
      if (res.ok) {
        setItems(items.map(i => i._id === id ? { ...i, completed: !currentVal } : i));
        if (!currentVal) confetti({ particleCount: 20 });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`/api/planner/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(items.filter(i => i._id !== id));
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Routine fields helper changes
  const updateRoutineHourText = (index, value) => {
    const hours = [...routineData.hours];
    hours[index].text = value;
    setRoutineData({ ...routineData, hours });
  };

  const toggleRoutineHourDone = (index) => {
    const hours = [...routineData.hours];
    hours[index].done = !hours[index].done;
    setRoutineData({ ...routineData, hours });
    if (hours[index].done) confetti({ particleCount: 15 });
  };

  const updateRoutinePriorityText = (index, value) => {
    const priorities = [...routineData.priorities];
    priorities[index].text = value;
    setRoutineData({ ...routineData, priorities });
  };

  const toggleRoutinePriorityDone = (index) => {
    const priorities = [...routineData.priorities];
    priorities[index].done = !priorities[index].done;
    setRoutineData({ ...routineData, priorities });
    if (priorities[index].done) confetti({ particleCount: 20 });
  };

  const handleSaveRoutine = async () => {
    const existing = items.find(i => i.type === 'placement_routine');
    const method = existing ? 'PUT' : 'POST';
    const url = existing ? `/api/planner/${existing._id}` : '/api/planner';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'placement_routine',
          title: 'Daily Placement Routine Sheet',
          description: JSON.stringify(routineData)
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (existing) {
          setItems(items.map(i => i._id === existing._id ? data : i));
        } else {
          setItems([...items, data]);
        }
        confetti({ particleCount: 80, spread: 60, colors: ['#FFC1CC', '#FF7693'] });
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Lists
  const dsaProblems = items.filter(i => i.type === 'placement_dsa');
  const aptTopics = items.filter(i => i.type === 'placement_aptitude');
  const mockSessions = items.filter(i => i.type === 'placement_mock');

  // Stats calculation
  const totalSolved = dsaProblems.filter(i => i.completed).length;

  return (
    <div className="flex-grow max-w-6xl mx-auto px-4 py-6 w-full flex flex-col gap-6 select-none text-left">
      
      {/* Tab selectors row */}
      <div className="flex bg-pink-100/50 dark:bg-slate-900/40 p-1.5 rounded-2xl w-full">
        <button
          onClick={() => setActiveTab('dsa')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'dsa'
              ? 'bg-sakura-500 text-white shadow'
              : 'text-slate-500 hover:text-sakura-500'
          }`}
        >
          <Code size={14} /> DSA Practice
        </button>
        <button
          onClick={() => setActiveTab('aptitude')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'aptitude'
              ? 'bg-sakura-500 text-white shadow'
              : 'text-slate-500 hover:text-sakura-500'
          }`}
        >
          <BookOpen size={14} /> Aptitude Topics
        </button>
        <button
          onClick={() => setActiveTab('mock')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'mock'
              ? 'bg-sakura-500 text-white shadow'
              : 'text-slate-500 hover:text-sakura-500'
          }`}
        >
          <RefreshCw size={14} /> Mock Reviews
        </button>
        <button
          onClick={() => setActiveTab('routine')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'routine'
              ? 'bg-sakura-500 text-white shadow'
              : 'text-slate-500 hover:text-sakura-500'
          }`}
        >
          <Clock size={14} /> Daily Routine Tracker
        </button>
      </div>

      {/* Main Tab content router */}
      {activeTab !== 'routine' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Placement Input Forms */}
          <div className="flex flex-col gap-6">
            <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 bg-white/70">
              <h3 className="font-kosugi font-bold text-sm text-sakura-600 dark:text-sakura-400 mb-4 flex items-center gap-1.5">
                🎓 Log Practice Item
              </h3>

              <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                
                {/* 1. DSA Form */}
                {activeTab === 'dsa' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Problem Name</label>
                      <input
                        type="text"
                        placeholder="e.g. 2-Sum, Merge Intervals..."
                        value={probName}
                        onChange={(e) => setProbName(e.target.value)}
                        className="glass-input text-xs"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500">Platform</label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="glass-input text-xs"
                        >
                          <option>LeetCode</option>
                          <option>CodeStudio</option>
                          <option>GeeksforGeeks</option>
                          <option>HackerRank</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500">Difficulty</label>
                        <select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          className="glass-input text-xs"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Problem URL Link</label>
                      <input
                        type="text"
                        placeholder="Paste link here..."
                        value={probUrl}
                        onChange={(e) => setProbUrl(e.target.value)}
                        className="glass-input text-xs"
                      />
                    </div>
                  </>
                )}

                {/* 2. Aptitude Form */}
                {activeTab === 'aptitude' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Topic / Question Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Time & Work, DBMS Normalization..."
                        value={topicName}
                        onChange={(e) => setTopicName(e.target.value)}
                        className="glass-input text-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Subject Area</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="glass-input text-xs"
                      >
                        <option>Quant Aptitude</option>
                        <option>Logical Reasoning</option>
                        <option>Verbal Ability</option>
                        <option>Database Management</option>
                        <option>Operating Systems</option>
                        <option>Computer Networks</option>
                        <option>Object-Oriented Design</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 3. Mock Interview Form */}
                {activeTab === 'mock' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500">Interview Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Graph Algorithms, Resume Review..."
                        value={mockTopic}
                        onChange={(e) => setMockTopic(e.target.value)}
                        className="glass-input text-xs"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500">Date</label>
                        <input
                          type="date"
                          value={mockDate}
                          onChange={(e) => setMockDate(e.target.value)}
                          className="glass-input text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500">Reviewer/Partner</label>
                        <input
                          type="text"
                          placeholder="e.g. Haru"
                          value={interviewer}
                          onChange={(e) => setInterviewer(e.target.value)}
                          className="glass-input text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="btn-sakura mt-2 py-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs">
                  <Plus size={14} /> Log Progress
                </button>
              </form>
            </div>

            {/* Stats card */}
            <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 bg-white/70 text-center flex flex-col items-center justify-center">
              <span className="text-3xl">🏆</span>
              <h4 className="font-kosugi font-bold text-sm text-slate-700 dark:text-slate-200 mt-2">Placement Practice Stats</h4>
              <div className="flex gap-4 mt-3">
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-sakura-500">{totalSolved}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">DSA Problems Solved</span>
                </div>
                <div className="w-px bg-pink-100 dark:bg-slate-800 self-stretch" />
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-700 dark:text-slate-200">
                    {aptTopics.filter(i => i.completed).length + mockSessions.filter(i => i.completed).length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Aptitude & Mocks</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Table Lists */}
          <div className="lg:col-span-2 glass-panel p-5 border-pink-200/50 dark:border-slate-800 max-h-[550px] overflow-y-auto bg-white/40 flex flex-col gap-4">
            
            {/* 1. DSA Problems solved list */}
            {activeTab === 'dsa' && (
              <div className="flex flex-col gap-3">
                {dsaProblems.map(item => {
                  const [itemPlatform, itemDiff, itemUrl] = (item.description || '').split(' | ');
                  return (
                    <div key={item._id} className={`glass-card p-4 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex items-center justify-between group transition-all ${
                      item.completed ? 'opacity-65' : ''
                    }`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleComplete(item._id, item.completed)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            item.completed 
                              ? 'bg-sakura-500 border-sakura-600 text-white' 
                              : 'border-pink-200 dark:border-slate-800 hover:border-sakura-400 text-transparent'
                          }`}
                        >
                          <Check size={14} />
                        </button>
                        <div>
                          <h4 className={`text-xs font-bold text-slate-800 dark:text-slate-200 ${item.completed ? 'line-through' : ''}`}>
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">
                              {itemPlatform || 'LeetCode'}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              itemDiff === 'Easy' ? 'bg-green-100 text-green-700' : itemDiff === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {itemDiff || 'Easy'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {itemUrl && itemUrl !== 'undefined' && (
                          <a
                            href={itemUrl.startsWith('http') ? itemUrl : `https://${itemUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-sakura-500 rounded-xl"
                            title="Solve Problem Link"
                          >
                            <Link2 size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {dsaProblems.length === 0 && (
                  <div className="text-center text-slate-400 py-16 italic text-xs">No DSA practice coding problems logged.</div>
                )}
              </div>
            )}

            {/* 2. Aptitude check-off */}
            {activeTab === 'aptitude' && (
              <div className="flex flex-col gap-3">
                {aptTopics.map(item => (
                  <div key={item._id} className={`glass-card p-4 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex items-center justify-between group transition-all ${
                    item.completed ? 'opacity-65 line-through' : ''
                  }`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleComplete(item._id, item.completed)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          item.completed 
                            ? 'bg-sakura-500 border-sakura-600 text-white' 
                            : 'border-pink-200 dark:border-slate-800 hover:border-sakura-400 text-transparent'
                        }`}
                      >
                        <Check size={14} />
                      </button>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
                {aptTopics.length === 0 && (
                  <div className="text-center text-slate-400 py-16 italic text-xs">Aptitude checklist is empty.</div>
                )}
              </div>
            )}

            {/* 3. Mock Reviews */}
            {activeTab === 'mock' && (
              <div className="flex flex-col gap-3">
                {mockSessions.map(item => (
                  <div key={item._id} className={`glass-card p-4 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex items-center justify-between group transition-all ${
                    item.completed ? 'opacity-65 line-through' : ''
                  }`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleComplete(item._id, item.completed)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          item.completed 
                            ? 'bg-sakura-500 border-sakura-600 text-white' 
                            : 'border-pink-200 dark:border-slate-800 hover:border-sakura-400 text-transparent'
                        }`}
                      >
                        <Check size={14} />
                      </button>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.dueDate && (
                        <span className="text-[9px] font-bold bg-pink-50 dark:bg-slate-900 text-sakura-500 px-2 py-0.5 rounded-full border">
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {mockSessions.length === 0 && (
                  <div className="text-center text-slate-400 py-16 italic text-xs">No mock interview reviews scheduled.</div>
                )}
              </div>
            )}

          </div>

        </div>
      ) : (
        /* 4. DAILY ROUTINE TRACKER NOTEPAD (replica of notepad mockup) */
        <div className="w-full flex flex-col items-center">
          
          <div className="w-full max-w-4xl bg-[#fdfbf7] dark:bg-[#1E1B2C] border-2 border-pink-200/50 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden p-6 relative">
            
            {/* Notepad Spiral Header visual */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-pink-200 to-transparent flex justify-around px-10">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-3 h-5 bg-slate-300 border border-slate-400 rounded-full -mt-2.5 shadow-sm" />
              ))}
            </div>
            
            {/* Margins and Binder holes Visual */}
            <div className="pt-6 flex flex-col md:flex-row gap-6 relative select-text">
              
              {/* Vertical Pink Notebook Line (Left Margin decoration) */}
              <div className="hidden md:block absolute left-[30.5%] top-0 bottom-0 border-l border-red-300 opacity-60" />
              
              {/* Left Notepad Panel: HOURLY ROUTINE */}
              <div className="w-full md:w-[30%] flex flex-col pr-0 md:pr-4">
                <h3 className="font-kosugi font-bold text-sm text-pink-600 dark:text-pink-400 border-b-2 border-pink-200 pb-2 mb-3 tracking-widest uppercase text-center flex items-center justify-center gap-1.5">
                  🕒 Hourly Routine
                </h3>
                
                <div className="flex flex-col gap-2 max-h-[580px] overflow-y-auto pr-1">
                  {routineData.hours.map((hr, idx) => (
                    <div key={hr.time} className="flex items-center gap-2 py-0.5">
                      <span className="w-14 text-[10px] font-bold text-slate-400 dark:text-slate-500 select-none text-right">
                        {hr.time}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => toggleRoutineHourDone(idx)}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
                          hr.done 
                            ? 'bg-sakura-500 border-sakura-600 text-white' 
                            : 'border-pink-200 dark:border-slate-800 hover:border-sakura-400 text-transparent'
                        }`}
                      >
                        <Check size={10} />
                      </button>
                      
                      <input
                        type="text"
                        placeholder="--"
                        value={hr.text}
                        onChange={(e) => updateRoutineHourText(idx, e.target.value)}
                        className={`flex-1 border-b border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-[11px] font-semibold focus:outline-none focus:border-sakura-400 py-0.5 px-1 text-slate-700 dark:text-slate-200 ${
                          hr.done ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Notepad Panel: PRIORITIES, EVENTS, MEETINGS, UNWIND */}
              <div className="flex-1 flex flex-col gap-5 pl-0 md:pl-6">
                
                {/* Priorities section */}
                <div className="bg-pink-50/40 dark:bg-slate-900/30 p-4 border border-pink-100/50 dark:border-slate-800 rounded-2xl text-left">
                  <h4 className="font-kosugi font-bold text-xs text-pink-600 dark:text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    🌟 Daily Priorities
                  </h4>
                  <div className="flex flex-col gap-2">
                    {routineData.priorities.map((pr, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRoutinePriorityDone(idx)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                            pr.done 
                              ? 'bg-sakura-500 border-sakura-600 text-white' 
                              : 'border-pink-200 dark:border-slate-800 hover:border-sakura-400'
                          }`}
                        >
                          <Check size={10} />
                        </button>
                        <input
                          type="text"
                          placeholder={`Priority target ${idx + 1}`}
                          value={pr.text}
                          onChange={(e) => updateRoutinePriorityText(idx, e.target.value)}
                          className={`flex-1 border-b border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold focus:outline-none focus:border-sakura-400 py-0.5 px-1 text-slate-700 dark:text-slate-200 ${
                            pr.done ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub panels grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Events Panel */}
                  <div className="bg-white dark:bg-[#1E1B2C]/50 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-left shadow-sm">
                    <h4 className="font-kosugi font-bold text-xs text-slate-500 uppercase tracking-widest mb-2">
                      📅 Scheduled Events
                    </h4>
                    <textarea
                      placeholder="Enter today's key tests/milestones..."
                      value={routineData.events}
                      onChange={(e) => setRoutineData({ ...routineData, events: e.target.value })}
                      className="w-full min-h-[80px] bg-transparent text-xs font-semibold focus:outline-none border-b border-dashed border-slate-200 focus:border-sakura-400 py-1 resize-none text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  {/* Meetings Panel */}
                  <div className="bg-white dark:bg-[#1E1B2C]/50 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-left shadow-sm">
                    <h4 className="font-kosugi font-bold text-xs text-slate-500 uppercase tracking-widest mb-2">
                      🤝 Mock / Meetings
                    </h4>
                    <textarea
                      placeholder="Interviews, discussions, group studies..."
                      value={routineData.meetings}
                      onChange={(e) => setRoutineData({ ...routineData, meetings: e.target.value })}
                      className="w-full min-h-[80px] bg-transparent text-xs font-semibold focus:outline-none border-b border-dashed border-slate-200 focus:border-sakura-400 py-1 resize-none text-slate-700 dark:text-slate-200"
                    />
                  </div>

                </div>

                {/* Unwind section */}
                <div className="bg-amber-50/40 dark:bg-amber-950/10 p-4 border border-amber-100/50 dark:border-slate-800/50 rounded-2xl text-left">
                  <h4 className="font-kosugi font-bold text-xs text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">
                    🍵 Unwind / Couple Goals
                  </h4>
                  <textarea
                    placeholder="e.g. Solve a fun puzzle together, tea time break..."
                    value={routineData.unwind}
                    onChange={(e) => setRoutineData({ ...routineData, unwind: e.target.value })}
                    className="w-full min-h-[60px] bg-transparent text-xs font-semibold focus:outline-none border-b border-dashed border-amber-200 focus:border-sakura-400 py-1 resize-none text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Bottom actions row */}
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleSaveRoutine}
                    className="btn-sakura py-2.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Save size={14} /> Save Routine Sheet
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
