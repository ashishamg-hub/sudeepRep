 "use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, CalendarDays, Check, CheckCircle2, Circle,
  Clock3, Filter, LayoutDashboard, ListTodo, MoreHorizontal, Plus,
  Search, Target, Trash2, X
} from "lucide-react";

type Status = "Not started" | "In progress" | "Completed";
type Priority = "Low" | "Medium" | "High";
type Task = {
  id: string; title: string; description: string; startDate: string;
  dueDate: string; status: Status; priority: Priority; progress: number;
  createdAt: string;
};

const STORAGE_KEY = "taskflow.tasks.v1";
const today = () => new Date().toISOString().slice(0, 10);
const initialTasks: Task[] = [
  { id: "demo-1", title: "Define project milestones", description: "Break the project into achievable delivery stages.", startDate: today(), dueDate: today(), status: "In progress", priority: "High", progress: 55, createdAt: new Date().toISOString() },
  { id: "demo-2", title: "Review product requirements", description: "Validate scope, dependencies, and acceptance criteria.", startDate: today(), dueDate: "", status: "Not started", priority: "Medium", progress: 0, createdAt: new Date().toISOString() },
  { id: "demo-3", title: "Set up project workspace", description: "Create the initial workspace and organize project assets.", startDate: today(), dueDate: today(), status: "Completed", priority: "Low", progress: 100, createdAt: new Date().toISOString() }
];

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All tasks");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setTasks(saved ? JSON.parse(saved) as Task[] : initialTasks);
    } catch { setTasks(initialTasks); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const active = tasks.filter(t => t.status === "In progress").length;
    const overdue = tasks.filter(t => t.dueDate && t.dueDate < today() && t.status !== "Completed").length;
    const avg = total ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total) : 0;
    return { total, completed, active, overdue, avg };
  }, [tasks]);

  const visibleTasks = useMemo(() => tasks.filter(t => {
    const matches = `${t.title} ${t.description}`.toLowerCase().includes(query.toLowerCase());
    const byFilter = filter === "All tasks" || (filter === "Overdue" ? t.dueDate && t.dueDate < today() && t.status !== "Completed" : t.status === filter);
    return matches && byFilter;
  }).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [tasks, query, filter]);

  function saveTask(data: Omit<Task, "id" | "createdAt">) {
    if (editing) setTasks(prev => prev.map(t => t.id === editing.id ? { ...t, ...data } : t));
    else setTasks(prev => [{ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev]);
    setModalOpen(false); setEditing(null);
    setNotice(editing ? "Task updated successfully." : "New task added.");
    window.setTimeout(() => setNotice(""), 2600);
  }
  function openEdit(task: Task) { setEditing(task); setModalOpen(true); }
  function removeTask(id: string) {
    if (window.confirm("Delete this task? This cannot be undone.")) setTasks(prev => prev.filter(t => t.id !== id));
  }
  function updateProgress(task: Task, value: number) {
    const progress = Math.max(0, Math.min(100, value));
    const status: Status = progress === 100 ? "Completed" : progress === 0 ? "Not started" : "In progress";
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress, status } : t));
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Check size={20}/></div><span>taskflow</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active"><LayoutDashboard size={18}/> Overview</button>
        <button className="nav-item" onClick={() => setFilter("All tasks")}><ListTodo size={18}/> All tasks <span className="nav-count">{stats.total}</span></button>
        <button className="nav-item" onClick={() => setFilter("In progress")}><Activity size={18}/> In progress</button>
        <button className="nav-item" onClick={() => setFilter("Completed")}><CheckCircle2 size={18}/> Completed</button>
        <button className="nav-item" onClick={() => setFilter("Overdue")}><AlertCircle size={18}/> Overdue</button>
        <div className="sidebar-bottom">
          <div className="tip-card"><div className="tip-icon"><Target size={18}/></div><strong>Make progress visible</strong><p>Small steps add up. Update your task progress as you go.</p></div>
          <div className="profile"><div className="avatar">TF</div><div><strong>My workspace</strong><small>Personal plan</small></div><MoreHorizontal size={18}/></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>Overview</b></div><div className="top-right"><span className="today-label"><CalendarDays size={15}/>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span><div className="avatar small">TF</div></div></header>
        <div className="content">
          <div className="page-heading"><div><div className="eyebrow">YOUR PERSONAL WORKSPACE</div><h1>Good work starts with a plan.</h1><p>Keep your priorities clear and your progress moving.</p></div><button className="primary-btn" onClick={() => {setEditing(null);setModalOpen(true);}}><Plus size={18}/> Add new task</button></div>

          <div className="stats-grid">
            <Stat icon={<ListTodo size={18}/>} label="Total tasks" value={stats.total} detail="Across your workspace" tone="violet"/>
            <Stat icon={<Activity size={18}/>} label="In progress" value={stats.active} detail="Currently being worked on" tone="blue"/>
            <Stat icon={<CheckCircle2 size={18}/>} label="Completed" value={stats.completed} detail={`${stats.total ? Math.round(stats.completed/stats.total*100) : 0}% of all tasks`} tone="green"/>
            <Stat icon={<AlertCircle size={18}/>} label="Overdue" value={stats.overdue} detail="Needs your attention" tone="orange"/>
          </div>

          <div className="progress-banner"><div className="progress-copy"><div className="banner-icon"><Target size={20}/></div><div><strong>Overall progress</strong><p>Your average completion across all tasks</p></div></div><div className="overall-meter"><div className="meter-track"><div style={{width:`${stats.avg}%`}}/></div><b>{stats.avg}%</b></div></div>

          <section className="task-section">
            <div className="section-head"><div><h2>Tasks</h2><p>Manage deadlines, priorities, and progress in one place.</p></div><button className="secondary-btn" onClick={() => {setFilter("All tasks");setQuery("");}}><Filter size={15}/> Clear filters</button></div>
            <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks..."/></div><div className="filter-tabs">{["All tasks","In progress","Completed","Overdue"].map(f=><button key={f} className={filter===f?"selected":""} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
            <div className="task-list">
              {!ready ? <div className="empty">Loading your tasks...</div> : visibleTasks.length === 0 ? <div className="empty"><div className="empty-icon"><ListTodo size={23}/></div><strong>No tasks found</strong><p>Try changing your search or add a new task.</p><button className="text-btn" onClick={()=>{setEditing(null);setModalOpen(true);}}>+ Create a task</button></div> : visibleTasks.map(task=><TaskRow key={task.id} task={task} onEdit={()=>openEdit(task)} onDelete={()=>removeTask(task.id)} onProgress={v=>updateProgress(task,v)}/>)}
            </div>
            <div className="list-footer">Showing <b>{visibleTasks.length}</b> of <b>{tasks.length}</b> tasks <span>Changes are saved automatically in this browser</span></div>
          </section>
        </div>
      </section>

      {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
      {modalOpen && <TaskModal task={editing} onClose={()=>{setModalOpen(false);setEditing(null);}} onSave={saveTask}/>}
    </main>
  );
}

function Stat({icon,label,value,detail,tone}:{icon:React.ReactNode;label:string;value:number;detail:string;tone:string}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>;
}
function TaskRow({task,onEdit,onDelete,onProgress}:{task:Task;onEdit:()=>void;onDelete:()=>void;onProgress:(v:number)=>void}) {
  const overdue = task.dueDate && task.dueDate < today() && task.status !== "Completed";
  const dueLabel = task.dueDate ? new Date(task.dueDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "No deadline";
  return <article className="task-row">
    <button className={`task-check ${task.status==="Completed"?"done":""}`} title="Mark completed" onClick={()=>onProgress(task.status==="Completed"?0:100)}>{task.status==="Completed"?<Check size={15}/>:<Circle size={19}/>}</button>
    <div className="task-main"><button className={`task-title ${task.status==="Completed"?"finished":""}`} onClick={onEdit}>{task.title}</button><p>{task.description || "No description added."}</p><div className="task-meta"><span className={`priority ${task.priority.toLowerCase()}`}><i/> {task.priority} priority</span><span className={overdue?"due overdue":"due"}><CalendarDays size={13}/>{dueLabel}{overdue?" · Overdue":""}</span>{task.startDate && <span className="start-date"><Clock3 size={13}/>Starts {new Date(task.startDate+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>}</div></div>
    <div className="task-progress"><div className="progress-top"><span>Progress</span><b>{task.progress}%</b></div><div className="mini-track"><div style={{width:`${task.progress}%`}}/></div><input aria-label={`Progress for ${task.title}`} type="range" min="0" max="100" step="5" value={task.progress} onChange={e=>onProgress(Number(e.target.value))}/></div>
    <div className="status-wrap"><span className={`status ${task.status.toLowerCase().replace(" ","-")}`}>{task.status}</span></div>
    <div className="row-actions"><button title="Edit task" onClick={onEdit}><MoreHorizontal size={19}/></button><button title="Delete task" onClick={onDelete}><Trash2 size={16}/></button></div>
  </article>;
}
function TaskModal({task,onClose,onSave}:{task:Task|null;onClose:()=>void;onSave:(data:Omit<Task,"id"|"createdAt">)=>void}) {
  const [title,setTitle]=useState(task?.title||"");
  const [description,setDescription]=useState(task?.description||"");
  const [startDate,setStartDate]=useState(task?.startDate||today());
  const [dueDate,setDueDate]=useState(task?.dueDate||"");
  const [priority,setPriority]=useState<Priority>(task?.priority||"Medium");
  const [progress,setProgress]=useState(task?.progress??0);
  const [error,setError]=useState("");
  function submit(e:React.FormEvent) {
    e.preventDefault();
    if(!title.trim()){setError("Please enter a task title.");return;}
    if(startDate && dueDate && dueDate<startDate){setError("Due date cannot be earlier than the start date.");return;}
    onSave({title:title.trim(),description:description.trim(),startDate,dueDate,priority,progress,status:progress===100?"Completed":progress===0?"Not started":"In progress"});
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><form className="modal" onSubmit={submit}>
    <div className="modal-head"><div><div className="eyebrow">{task?"UPDATE TASK":"NEW TASK"}</div><h2>{task?"Edit task":"Create a task"}</h2><p>Add the details and timeline for this task.</p></div><button type="button" className="close-btn" onClick={onClose}><X size={20}/></button></div>
    <label>Task title <em>*</em><input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Prepare project proposal"/></label>
    <label>Description <span className="optional">Optional</span><textarea rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="What needs to be done?"/></label>
    <div className="form-grid"><label>Start date<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/></label><label>Due date<input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label></div>
    <div className="form-grid"><label>Priority<select value={priority} onChange={e=>setPriority(e.target.value as Priority)}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Progress <b className="range-value">{progress}%</b><input className="range-input" type="range" min="0" max="100" step="5" value={progress} onChange={e=>setProgress(Number(e.target.value))}/></label></div>
    {error&&<div className="form-error">{error}</div>}
    <div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn"><Check size={16}/>{task?"Save changes":"Create task"}</button></div>
  </form></div>;
}
