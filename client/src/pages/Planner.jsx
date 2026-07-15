import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, CheckSquare, ShoppingCart, Clock, Plus, Trash, Check, Heart, User, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Planner() {
  const { token, user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('calendar'); // calendar, tasks, shopping, dates
  const [plannerItems, setPlannerItems] = useState([]);

  // Form input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    fetchPlanner();
  }, [token]);

  const fetchPlanner = () => {
    if (!token) return;
    fetch('/api/planner', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPlannerItems(data);
        }
      })
      .catch(err => console.log(err));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!title) return;

    let targetType = 'calendar_event';
    if (activeTab === 'tasks') targetType = 'task';
    else if (activeTab === 'shopping') targetType = 'shopping';
    else if (activeTab === 'dates') targetType = 'date_plan';

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
          dueDate: dueDate || undefined,
          assignee: assignee || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPlannerItems([...plannerItems, data]);
        setTitle('');
        setDescription('');
        setDueDate('');
        setAssignee('');
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
        setPlannerItems(plannerItems.map(item => item._id === id ? { ...item, completed: !currentVal } : item));
        if (!currentVal) confetti({ particleCount: 15, spread: 30 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const res = await fetch(`/api/planner/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPlannerItems(plannerItems.filter(item => item._id !== id));
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Grouped lists
  const events = plannerItems.filter(i => i.type === 'calendar_event');
  const tasks = plannerItems.filter(i => i.type === 'task');
  const shopping = plannerItems.filter(i => i.type === 'shopping');
  const datePlans = plannerItems.filter(i => i.type === 'date_plan');

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full grid grid-cols-1 lg:grid-cols-3 gap-6 relative select-none">
      
      {/* LEFT COLUMN: Add Input Form */}
      <div>
        <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex flex-col gap-4">
          <h3 className="font-kosugi font-bold text-sm text-sakura-600 dark:text-sakura-400">
            🌸 Plan a new item
          </h3>

          <form onSubmit={handleAddItem} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">
                {activeTab === 'calendar' ? 'Event Title' : activeTab === 'tasks' ? 'Task Name' : activeTab === 'shopping' ? 'Item Name' : 'Date Idea'}
              </label>
              <input
                type="text"
                placeholder="e.g. Cherry blossom stroll, Buy strawberry mochi..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Description / Details</label>
              <textarea
                placeholder="Add locations, notes, or list elements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input min-h-16 text-xs"
              />
            </div>

            {(activeTab === 'calendar' || activeTab === 'dates' || activeTab === 'tasks') && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Target Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Assignee</label>
                <input
                  type="text"
                  placeholder="Who should do this?"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="glass-input text-xs"
                />
              </div>
            )}

            <button type="submit" className="btn-sakura mt-2 py-3 rounded-2xl flex items-center justify-center gap-2">
              <Plus size={16} /> Add to Plan
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMNS: Navigation and List Board */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex bg-pink-100/50 dark:bg-slate-900/40 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'calendar'
                ? 'bg-sakura-500 text-white shadow'
                : 'text-slate-500 hover:text-sakura-500'
            }`}
          >
            <Calendar size={14} /> Couple Events
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'tasks'
                ? 'bg-sakura-500 text-white shadow'
                : 'text-slate-500 hover:text-sakura-500'
            }`}
          >
            <CheckSquare size={14} /> Shared Tasks
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'shopping'
                ? 'bg-sakura-500 text-white shadow'
                : 'text-slate-500 hover:text-sakura-500'
            }`}
          >
            <ShoppingCart size={14} /> Shopping List
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'dates'
                ? 'bg-sakura-500 text-white shadow'
                : 'text-slate-500 hover:text-sakura-500'
            }`}
          >
            <Clock size={14} /> Date Planner
          </button>
        </div>

        {/* Dynamic Lists Display */}
        <div className="glass-panel p-5 border-pink-200/50 dark:border-slate-800 flex-1 flex flex-col gap-4 max-h-[550px] overflow-y-auto">
          
          {/* 1. Couple Events/Calendar List */}
          {activeTab === 'calendar' && (
            <div className="flex flex-col gap-3">
              {events.map(ev => (
                <div key={ev._id} className="glass-card p-4 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-sakura-100 text-sakura-600 rounded-2xl">
                      🌸
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{ev.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{ev.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ev.dueDate && (
                      <span className="text-[10px] font-bold bg-pink-50 dark:bg-slate-900/80 text-sakura-500 px-2 py-0.5 rounded-full border border-pink-100">
                        {new Date(ev.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteItem(ev._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center text-slate-400 py-20 italic">No events or anniversaries added.</div>
              )}
            </div>
          )}

          {/* 2. Shared Tasks List */}
          {activeTab === 'tasks' && (
            <div className="flex flex-col gap-3">
              {tasks.map(task => (
                <div key={task._id} className={`glass-card p-4 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex items-center justify-between group transition-all ${
                  task.completed ? 'opacity-60 line-through' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(task._id, task.completed)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        task.completed 
                          ? 'bg-sakura-500 border-sakura-600 text-white' 
                          : 'border-pink-200 dark:border-slate-800 hover:border-sakura-400 text-transparent'
                      }`}
                    >
                      <Check size={14} />
                    </button>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{task.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.assignee && (
                      <span className="text-[10px] font-bold bg-pink-100/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <User size={10} /> {task.assignee}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteItem(task._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center text-slate-400 py-20 italic">Task checklist is empty.</div>
              )}
            </div>
          )}

          {/* 3. Shopping List */}
          {activeTab === 'shopping' && (
            <div className="flex flex-col gap-3">
              {shopping.map(shop => (
                <div key={shop._id} className={`glass-card p-4 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex items-center justify-between group transition-all ${
                  shop.completed ? 'opacity-60 line-through' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(shop._id, shop.completed)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        shop.completed 
                          ? 'bg-sakura-500 border-sakura-600 text-white' 
                          : 'border-pink-200 dark:border-slate-800 hover:border-sakura-400 text-transparent'
                      }`}
                    >
                      <Check size={14} />
                    </button>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{shop.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{shop.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(shop._id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
              {shopping.length === 0 && (
                <div className="text-center text-slate-400 py-20 italic">Shopping list is empty.</div>
              )}
            </div>
          )}

          {/* 4. Date Planner */}
          {activeTab === 'dates' && (
            <div className="flex flex-col gap-3">
              {datePlans.map(dp => (
                <div key={dp._id} className={`glass-card p-4 border-pink-50 dark:border-slate-800 bg-white dark:bg-[#1E1B2B] flex items-center justify-between group transition-all ${
                  dp.completed ? 'opacity-60 line-through' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(dp._id, dp.completed)}
                      className="p-2 bg-pink-100/50 text-sakura-500 rounded-xl hover:bg-sakura-100 transition-colors"
                    >
                      <Heart size={14} fill={dp.completed ? 'currentColor' : 'none'} />
                    </button>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <MapPin size={12} className="text-sakura-500" /> {dp.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{dp.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {dp.dueDate && (
                      <span className="text-[10px] font-bold bg-pink-50 dark:bg-slate-900/80 text-sakura-500 px-2 py-0.5 rounded-full border border-pink-100">
                        {new Date(dp.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteItem(dp._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {datePlans.length === 0 && (
                <div className="text-center text-slate-400 py-20 italic">No date ideas mapped out yet.</div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
