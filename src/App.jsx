import { useState, useEffect, useCallback } from "react";

// localStorage helper
const ls = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const TABS = ["Today", "Schedule", "Learning", "Apply", "Network", "90-Day", "Stats", "Sheets"];

const DEFAULT_TODOS = [
  { id: "scan", label: "Morning scan — new job postings", cat: "search" },
  { id: "learn1", label: "Deep learning block (2+ hrs)", cat: "learn" },
  { id: "apply", label: "Applied to 8-12 jobs", cat: "search" },
  { id: "outreach", label: "Post-application outreach (top 3)", cat: "network" },
  { id: "sql", label: "5+ SQL problems solved", cat: "learn" },
  { id: "case", label: "1 case study / product question", cat: "learn" },
  { id: "connect", label: "10-15 LinkedIn connections sent", cat: "network" },
  { id: "dms", label: "3-5 cold DMs sent", cat: "network" },
  { id: "interview", label: "1 hr interview prep", cat: "learn" },
  { id: "project", label: "Project / portfolio work", cat: "build" },
  { id: "tracker", label: "Tracker updated", cat: "admin" },
  { id: "plan", label: "Tomorrow planned", cat: "admin" },
];

const DEFAULT_SCHEDULE = [
  { time: "8:00 – 8:30", block: "Morning Scan", desc: "LinkedIn + Naukri new postings", color: "#3b82f6" },
  { time: "8:30 – 10:30", block: "Deep Learning 1", desc: "SQL + Python (alternating)", color: "#8b5cf6" },
  { time: "10:30 – 10:45", block: "Break", desc: "Walk, stretch", color: "#6b7280" },
  { time: "10:45 – 12:00", block: "Deep Learning 2", desc: "Stats / ML / Product Sense", color: "#8b5cf6" },
  { time: "12:00 – 1:00", block: "Applications", desc: "Apply + post-application outreach", color: "#3b82f6" },
  { time: "1:00 – 2:00", block: "Lunch + Reading", desc: "Analytics blog / case study", color: "#6b7280" },
  { time: "2:00 – 3:30", block: "Interview Prep", desc: "SQL / Case / Behavioral", color: "#ef4444" },
  { time: "3:30 – 3:45", block: "Break", desc: "", color: "#6b7280" },
  { time: "3:45 – 5:00", block: "Projects", desc: "Build / polish portfolio", color: "#f59e0b" },
  { time: "5:00 – 5:30", block: "Networking", desc: "Connections, DMs, follow-ups", color: "#10b981" },
  { time: "5:30 – 6:30", block: "Exercise", desc: "Non-negotiable", color: "#6b7280" },
  { time: "7:00 – 8:00", block: "Evening Review", desc: "Flashcards, case studies, plan tomorrow", color: "#8b5cf6" },
  { time: "8:00 – 8:30", block: "Tracking", desc: "Update tracker, check off tasks", color: "#6b7280" },
];

const DEFAULT_LEARNING = [
  {
    id: "p1", dateRange: "2026-07-14 to 2026-07-27", title: "SQL Reactivation + Stats",
    skills: [
      { id: "s1", label: "JOINs (all types, self, cross)" },
      { id: "s2", label: "Window functions (ROW_NUMBER, RANK, LAG, LEAD)" },
      { id: "s3", label: "GROUP BY, HAVING, CASE WHEN, date functions" },
      { id: "s4", label: "Correlated subqueries, CTEs, anti-joins" },
      { id: "s5", label: "Probability: Bayes, distributions, conditional" },
      { id: "s6", label: "Hypothesis testing: p-value, t-test, chi-square" },
      { id: "s7", label: "A/B testing: sample size, significance, CI" },
      { id: "s8", label: "CLT, Law of Large Numbers" },
    ]
  },
  {
    id: "p2", dateRange: "2026-07-28 to 2026-08-10", title: "Python/Pandas + Excel",
    skills: [
      { id: "s9", label: "Pandas: filtering, groupby, merge, pivot" },
      { id: "s10", label: "Data cleaning: missing values, types, strings" },
      { id: "s11", label: "EDA workflow: describe(), correlation, viz" },
      { id: "s12", label: "Advanced: apply/lambda, time series, rolling" },
      { id: "s13", label: "Excel: VLOOKUP, INDEX-MATCH, SUMIFS" },
      { id: "s14", label: "Excel: Pivot tables, charts, formatting" },
    ]
  },
  {
    id: "p3", dateRange: "2026-08-11 to 2026-08-24", title: "Product Sense + Power BI",
    skills: [
      { id: "s15", label: "RICE framework, North Star Metric, funnels" },
      { id: "s16", label: "Product metrics: DAU/MAU, churn, conversion" },
      { id: "s17", label: "Power BI: data modeling, DAX basics" },
      { id: "s18", label: "Build 2-3 dashboards from Kaggle data" },
    ]
  },
  {
    id: "p4", dateRange: "2026-08-25 to 2026-09-07", title: "ML Basics + Behavioral",
    skills: [
      { id: "s19", label: "Linear & Logistic Regression" },
      { id: "s20", label: "Decision Trees, Random Forest" },
      { id: "s21", label: "K-Means clustering" },
      { id: "s22", label: "Metrics: precision, recall, F1, AUC-ROC" },
      { id: "s23", label: "STAR method for all resume bullets" },
      { id: "s24", label: "2-min resume walkthrough pitch" },
    ]
  },
];

const DEFAULT_TEMPLATES = [
  { id: "t1", type: "Recruiter", text: `Hi [Name], I recently applied for the [Role] position at [Company] (Job ID: [X]). I'm a recent NIT Jalandhar grad with experience in campaign analytics and statistical experimentation. Would love to connect!` },
  { id: "t2", type: "Hiring Manager", text: `Hi [Name], I came across the [Role] opening on your team and applied today. I'm a recent NIT Jalandhar grad with hands-on experience in SQL, Python, and A/B testing. Would love to connect!` },
  { id: "t3", type: "Alumni", text: `Hi [Name], fellow NIT Jalandhar grad here! I recently graduated and am exploring analytics opportunities. Noticed you're at [Company] — would love to connect!` },
  { id: "t4", type: "Referral Ask", text: `Hi [Name], I came across the [Role] opening at [Company] and it looks like a great fit for my background. Would you be open to referring me? I can share my resume and the job ID.` },
  { id: "t5", type: "Referral Email", text: `Hi [Name],\n\nThank you so much for being willing to help! Here are the details:\n\nJob Title: [Role Title]\nJob ID: [ID]\nLocation: [Location]\nLink: [URL]\n\nI've attached my resume. Please let me know if you need anything else.\n\nThanks again!\n\nBest,\nParav Kalra\n9478913463` },
];

const DEFAULT_LINKS = [
  { id: "lk1", name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/" },
  { id: "lk2", name: "Naukri", url: "https://www.naukri.com/" },
  { id: "lk3", name: "Instahyre", url: "https://www.instahyre.com/" },
  { id: "lk4", name: "Wellfound", url: "https://wellfound.com/jobs" },
  { id: "lk5", name: "Foundit", url: "https://www.foundit.in/" },
  { id: "lk6", name: "Indeed", url: "https://www.indeed.co.in/" },
  { id: "lk7", name: "YC Jobs", url: "https://www.ycombinator.com/jobs" },
  { id: "lk8", name: "Cutshort", url: "https://cutshort.io/" },
  { id: "lk9", name: "Internshala", url: "https://internshala.com/jobs/" },
  { id: "lk10", name: "Glassdoor", url: "https://www.glassdoor.co.in/Job/" },
];

const DEFAULT_NETWORK_TARGETS = [
  { id: "n1", label: "New connections", target: "10-15/day", color: "#3b82f6" },
  { id: "n2", label: "Cold DMs", target: "3-5/day", color: "#8b5cf6" },
  { id: "n3", label: "Alumni outreach", target: "2-3/day", color: "#10b981" },
  { id: "n4", label: "Referral asks", target: "1-2/day", color: "#f59e0b" },
  { id: "n5", label: "LinkedIn comments", target: "3-5/day", color: "#ef4444" },
  { id: "n6", label: "Follow-ups", target: "As needed", color: "#6b7280" },
];

const DEFAULT_90DAY = [
  { id: "m1", month: "Month 1", title: "Foundation + Volume", color: "#3b82f6", emoji: "🏗️", focus: "Reactivate skills, build momentum, set up systems",
    goals: ["150+ applications sent", "300+ LinkedIn connections", "SQL back to interview-ready", "Stats fundamentals solid", "3 resume versions ready", "2-3 screening calls received"] },
  { id: "m2", month: "Month 2", title: "Depth + Interviews", color: "#f59e0b", emoji: "🎯", focus: "Sharpen weak areas, start interviewing, build portfolio",
    goals: ["300+ total applications", "5-10 interview calls", "1-2 new portfolio projects", "At least 1 second-round interview", "Power BI functional", "Product sense improving"] },
  { id: "m3", month: "Month 3", title: "Convert + Close", color: "#10b981", emoji: "🏆", focus: "Convert interviews to offers, double down on what works",
    goals: ["1-3 offers received", "Offer accepted", "Mock interviews weekly", "Company-specific prep", "Negotiate best terms", "Backup applications running"] },
];

const STAT_FIELDS = [
  { id: "st_apps", label: "Applications sent", target: 60 },
  { id: "st_msgs", label: "Recruiter/HM messages", target: 25 },
  { id: "st_conn", label: "New connections", target: 80 },
  { id: "st_sql", label: "SQL problems solved", target: 35 },
  { id: "st_case", label: "Case studies practiced", target: 6 },
  { id: "st_posts", label: "LinkedIn posts", target: 3 },
  { id: "st_mock", label: "Mock interviews", target: 1 },
  { id: "st_ref", label: "Referral requests", target: 8 },
];

const DEFAULT_SHEETS = [
  {
    id: "sh1", name: "Job Applications",
    columns: [
      { id: "c1", name: "Date" }, { id: "c2", name: "Company" }, { id: "c3", name: "Role" },
      { id: "c4", name: "Source" }, { id: "c5", name: "Status" }, { id: "c6", name: "Recruiter" },
      { id: "c7", name: "Follow-up" }, { id: "c8", name: "Notes" },
    ],
    rows: [],
  },
  {
    id: "sh2", name: "Companies Target",
    columns: [
      { id: "c1", name: "Company" }, { id: "c2", name: "Category" }, { id: "c3", name: "Careers Page" },
      { id: "c4", name: "Contact" }, { id: "c5", name: "Applied?" }, { id: "c6", name: "Notes" },
    ],
    rows: [],
  },
];

const catColors = { search: "#3b82f6", learn: "#8b5cf6", network: "#10b981", build: "#f59e0b", admin: "#6b7280", custom: "#ec4899" };
const catLabels = { search: "Search", learn: "Learn", network: "Network", build: "Build", admin: "Admin", custom: "Custom" };

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function todayStr() { return new Date().toISOString().split("T")[0]; }
function fmtDate(d) { return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }

export default function App() {
  const [tab, setTab] = useState("Today");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [dailyData, setDailyData] = useState(() => ls.get("jsos-daily", {}));
  const [schedule, setSchedule] = useState(() => ls.get("jsos-schedule", DEFAULT_SCHEDULE));
  const [learning, setLearning] = useState(() => ls.get("jsos-learning", DEFAULT_LEARNING));
  const [learningChecks, setLearningChecks] = useState(() => ls.get("jsos-lchecks", {}));
  const [templates, setTemplates] = useState(() => ls.get("jsos-templates", DEFAULT_TEMPLATES));
  const [links, setLinks] = useState(() => ls.get("jsos-links", DEFAULT_LINKS));
  const [networkTargets, setNetworkTargets] = useState(() => ls.get("jsos-network", DEFAULT_NETWORK_TARGETS));
  const [plan90, setPlan90] = useState(() => ls.get("jsos-90day", DEFAULT_90DAY));
  const [statsData, setStatsData] = useState(() => ls.get("jsos-stats", {}));
  const [sheets, setSheets] = useState(() => ls.get("jsos-sheets", DEFAULT_SHEETS));
  const [streak, setStreak] = useState(() => ls.get("jsos-streak", 0));

  // Modal states
  const [modal, setModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [newTodo, setNewTodo] = useState("");
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [statsDateFrom, setStatsDateFrom] = useState(todayStr());
  const [statsDateTo, setStatsDateTo] = useState(todayStr());

  // Persist
  useEffect(() => { ls.set("jsos-daily", dailyData); }, [dailyData]);
  useEffect(() => { ls.set("jsos-schedule", schedule); }, [schedule]);
  useEffect(() => { ls.set("jsos-learning", learning); }, [learning]);
  useEffect(() => { ls.set("jsos-lchecks", learningChecks); }, [learningChecks]);
  useEffect(() => { ls.set("jsos-templates", templates); }, [templates]);
  useEffect(() => { ls.set("jsos-links", links); }, [links]);
  useEffect(() => { ls.set("jsos-network", networkTargets); }, [networkTargets]);
  useEffect(() => { ls.set("jsos-90day", plan90); }, [plan90]);
  useEffect(() => { ls.set("jsos-stats", statsData); }, [statsData]);
  useEffect(() => { ls.set("jsos-sheets", sheets); }, [sheets]);
  useEffect(() => { ls.set("jsos-streak", streak); }, [streak]);

  // Daily data helpers
  const getDayData = (date) => dailyData[date] || { todos: [...DEFAULT_TODOS], checks: {} };
  const setDayData = (date, data) => setDailyData(prev => ({ ...prev, [date]: data }));

  const dayData = getDayData(selectedDate);
  const dayTodos = dayData.todos || [...DEFAULT_TODOS];
  const dayChecks = dayData.checks || {};
  const doneCnt = dayTodos.filter(t => dayChecks[t.id]).length;
  const totalCnt = dayTodos.length;
  const donePct = totalCnt ? Math.round((doneCnt / totalCnt) * 100) : 0;

  const toggleTodo = (id) => {
    const newChecks = { ...dayChecks, [id]: !dayChecks[id] };
    setDayData(selectedDate, { ...dayData, todos: dayTodos, checks: newChecks });
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo = { id: uid(), label: newTodo.trim(), cat: "custom" };
    setDayData(selectedDate, { ...dayData, todos: [...dayTodos, todo], checks: dayChecks });
    setNewTodo("");
  };

  const removeTodo = (id) => {
    const newTodos = dayTodos.filter(t => t.id !== id);
    const newChecks = { ...dayChecks }; delete newChecks[id];
    setDayData(selectedDate, { todos: newTodos, checks: newChecks });
  };

  const moveDate = (dir) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // Learning helpers
  const totalSkills = learning.reduce((a, p) => a + p.skills.length, 0);
  const doneSkills = Object.values(learningChecks).filter(Boolean).length;

  const toggleSkill = (id) => setLearningChecks(prev => ({ ...prev, [id]: !prev[id] }));

  // Template helpers
  const copyText = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  // Sheet helpers
  const curSheet = sheets[activeSheet] || sheets[0];

  const updateSheet = (idx, data) => {
    const ns = [...sheets]; ns[idx] = { ...ns[idx], ...data }; setSheets(ns);
  };

  const addSheetRow = () => {
    const row = { id: uid() };
    curSheet.columns.forEach(c => { row[c.id] = ""; });
    updateSheet(activeSheet, { rows: [...curSheet.rows, row] });
  };

  const updateCell = (rowIdx, colId, val) => {
    const rows = [...curSheet.rows];
    rows[rowIdx] = { ...rows[rowIdx], [colId]: val };
    updateSheet(activeSheet, { rows });
  };

  const deleteRow = (rowIdx) => {
    updateSheet(activeSheet, { rows: curSheet.rows.filter((_, i) => i !== rowIdx) });
  };

  const addColumn = (name) => {
    const col = { id: uid(), name };
    const rows = curSheet.rows.map(r => ({ ...r, [col.id]: "" }));
    updateSheet(activeSheet, { columns: [...curSheet.columns, col], rows });
  };

  const deleteColumn = (colId) => {
    const cols = curSheet.columns.filter(c => c.id !== colId);
    const rows = curSheet.rows.map(r => { const nr = { ...r }; delete nr[colId]; return nr; });
    updateSheet(activeSheet, { columns: cols, rows });
  };

  const addNewSheet = (name) => {
    setSheets([...sheets, { id: uid(), name, columns: [{ id: uid(), name: "Column 1" }], rows: [] }]);
    setActiveSheet(sheets.length);
  };

  const deleteSheet = (idx) => {
    if (sheets.length <= 1) return;
    setSheets(sheets.filter((_, i) => i !== idx));
    setActiveSheet(Math.max(0, activeSheet - 1));
  };

  // Stats helpers
  const statsKey = `${statsDateFrom}_${statsDateTo}`;
  const curStats = statsData[statsKey] || {};
  const updateStat = (id, val) => {
    setStatsData(prev => ({ ...prev, [statsKey]: { ...curStats, [id]: parseInt(val) || 0 } }));
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div>
            <h1>Job Search OS</h1>
            <div className="subtitle">Parav Kalra — Analytics Roles</div>
          </div>
          <div className="streak">
            <div className="num">{streak}</div>
            <div className="label">day streak</div>
          </div>
        </div>
        <div className="quick-stats">
          <div className="stat-card"><div className="val">{donePct}%</div><div className="lbl">Today</div></div>
          <div className="stat-card"><div className="val">{doneCnt}/{totalCnt}</div><div className="lbl">Tasks</div></div>
          <div className="stat-card"><div className="val">{totalSkills ? Math.round((doneSkills / totalSkills) * 100) : 0}%</div><div className="lbl">Skills</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="content">

        {/* ===== TODAY ===== */}
        {tab === "Today" && (
          <div>
            <h2 className="section-title">Daily Checklist</h2>

            {/* Date picker */}
            <div className="date-picker">
              <button className="date-nav" onClick={() => moveDate(-1)}>←</button>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              <button className="date-nav" onClick={() => moveDate(1)}>→</button>
              <button className="date-nav" onClick={() => setSelectedDate(todayStr())} style={{ fontSize: 11 }}>Today</button>
            </div>

            <p className="section-sub">{fmtDate(selectedDate)}</p>

            <div className="progress-bar">
              <div className={`progress-fill ${donePct === 100 ? "progress-green" : "progress-blue"}`} style={{ width: `${donePct}%` }} />
            </div>

            {/* Add custom todo */}
            <div className="add-row">
              <input placeholder="Add a task..." value={newTodo} onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTodo()} />
              <button className="add-btn" onClick={addTodo}>+ Add</button>
            </div>

            {dayTodos.map(item => (
              <div key={item.id} className={`check-item ${dayChecks[item.id] ? "done" : ""}`} onClick={() => toggleTodo(item.id)}>
                <div className="check-box" style={dayChecks[item.id] ? { background: catColors[item.cat] || catColors.custom, border: "none" } : {}}>{dayChecks[item.id] ? "✓" : ""}</div>
                <span className={`check-label ${dayChecks[item.id] ? "struck" : ""}`}>{item.label}</span>
                <span className="tag" style={{ background: (catColors[item.cat] || catColors.custom) + "18", color: catColors[item.cat] || catColors.custom }}>
                  {catLabels[item.cat] || "Custom"}
                </span>
                {item.cat === "custom" && (
                  <button className="icon-btn del-btn" onClick={e => { e.stopPropagation(); removeTodo(item.id); }}>✕</button>
                )}
              </div>
            ))}

            {donePct === 100 && <div className="success-banner">All tasks done! {streak} day streak and counting.</div>}
          </div>
        )}

        {/* ===== SCHEDULE ===== */}
        {tab === "Schedule" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 className="section-title">Daily Schedule</h2>
              <button className="add-btn" style={{ fontSize: 11, padding: "6px 10px" }}
                onClick={() => { setModalData({ time: "", block: "", desc: "", color: "#3b82f6" }); setModal("addSchedule"); }}>
                + Add Block
              </button>
            </div>

            {schedule.map((s, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-time">{s.time.split("–")[0]?.trim()}</div>
                <div className="timeline-dot-col">
                  <div className="timeline-dot" style={{ background: s.color }} />
                  {i < schedule.length - 1 && <div className="timeline-line" />}
                </div>
                <div className="timeline-content" style={{ position: "relative" }}>
                  <div className="timeline-block" style={{ color: s.color }}>{s.block}</div>
                  {s.desc && <div className="timeline-desc">{s.desc}</div>}
                  <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 2 }}>
                    <button className="icon-btn" onClick={() => { setModalData({ ...s, idx: i }); setModal("editSchedule"); }}>✎</button>
                    <button className="icon-btn del-btn" onClick={() => setSchedule(schedule.filter((_, j) => j !== i))}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== LEARNING ===== */}
        {tab === "Learning" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h2 className="section-title">Learning Roadmap</h2>
              <button className="add-btn" style={{ fontSize: 11, padding: "6px 10px" }}
                onClick={() => { setModalData({ dateRange: "", title: "" }); setModal("addPhase"); }}>
                + Add Phase
              </button>
            </div>
            <p className="section-sub">{doneSkills}/{totalSkills} skills completed</p>

            <div className="progress-bar">
              <div className="progress-fill progress-blue" style={{ width: `${totalSkills ? Math.round((doneSkills / totalSkills) * 100) : 0}%` }} />
            </div>

            {learning.map((phase, pi) => {
              const pd = phase.skills.filter(s => learningChecks[s.id]).length;
              return (
                <div key={phase.id} style={{ marginBottom: 18 }}>
                  <div className="phase-header">
                    <div>
                      <div className="phase-week">{phase.dateRange}</div>
                      <div className="phase-title">{phase.title}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#888" }}>{pd}/{phase.skills.length}</span>
                      <button className="icon-btn" onClick={() => { setModalData({ ...phase, phaseIdx: pi }); setModal("editPhase"); }}>✎</button>
                      <button className="icon-btn" onClick={() => {
                        setModalData({ phaseId: phase.id, label: "" }); setModal("addSkill");
                      }}>+</button>
                    </div>
                  </div>
                  {phase.skills.map(skill => (
                    <div key={skill.id} className={`check-item ${learningChecks[skill.id] ? "done" : ""}`} onClick={() => toggleSkill(skill.id)}>
                      <div className="check-box" style={learningChecks[skill.id] ? { background: "#8b5cf6", border: "none" } : {}}>{learningChecks[skill.id] ? "✓" : ""}</div>
                      <span className={`check-label ${learningChecks[skill.id] ? "struck" : ""}`}>{skill.label}</span>
                      <button className="icon-btn del-btn" onClick={e => {
                        e.stopPropagation();
                        setLearning(learning.map(p => p.id === phase.id ? { ...p, skills: p.skills.filter(s => s.id !== skill.id) } : p));
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== APPLY ===== */}
        {tab === "Apply" && (
          <div>
            <h2 className="section-title">Job Platforms</h2>
            <p className="section-sub">Click to open in browser</p>

            {links.map((lk, i) => (
              <a key={lk.id} href={lk.url} target="_blank" rel="noopener noreferrer" className="link-item">
                <div className="link-icon">{lk.name.charAt(0)}</div>
                <div className="link-name">{lk.name}</div>
                <button className="icon-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); setModalData({ ...lk, idx: i }); setModal("editLink"); }}>✎</button>
                <button className="icon-btn del-btn" onClick={e => { e.preventDefault(); e.stopPropagation(); setLinks(links.filter((_, j) => j !== i)); }}>✕</button>
                <span className="link-arrow">→</span>
              </a>
            ))}

            <button className="add-btn" style={{ marginTop: 8, width: "100%", padding: 10 }}
              onClick={() => { setModalData({ name: "", url: "" }); setModal("addLink"); }}>
              + Add Platform
            </button>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>Search Keywords</h3>
            <div className="chips">
              {["Data Analyst", "Business Analyst", "Product Analyst", "Analytics Analyst", "BI Analyst", "Associate Data Scientist", "Growth Analyst", "MIS Analyst", "Reporting Analyst", "Decision Science", "Marketing Analyst", "Analytics Consultant"].map((k, i) => (
                <span key={i} className="chip chip-purple">{k}</span>
              ))}
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>Outreach Templates</h3>
            {templates.map((t, i) => (
              <div key={t.id} className="template-card">
                <div className="template-header">
                  <span className="template-type">{t.type}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="icon-btn" onClick={() => setEditingTemplate(editingTemplate === t.id ? null : t.id)}>✎</button>
                    <button className={`copy-btn ${copiedId === t.id ? "copied" : ""}`} onClick={() => copyText(t.text, t.id)}>
                      {copiedId === t.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                {editingTemplate === t.id ? (
                  <textarea className="template-edit" value={t.text}
                    onChange={e => setTemplates(templates.map(tp => tp.id === t.id ? { ...tp, text: e.target.value } : tp))}
                    onBlur={() => setEditingTemplate(null)} autoFocus />
                ) : (
                  <p className="template-text" style={{ whiteSpace: "pre-wrap" }}>{t.text}</p>
                )}
              </div>
            ))}

            <button className="add-btn" style={{ marginTop: 8, width: "100%", padding: 10 }}
              onClick={() => { setModalData({ type: "", text: "" }); setModal("addTemplate"); }}>
              + Add Template
            </button>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "22px 0 8px" }}>Follow-up Timeline</h3>
            <div className="card">
              <div className="follow-item"><div className="follow-dot" style={{ background: "#10b981" }} /><span style={{ fontSize: 13 }}><b>Day 3:</b> Like/comment on their LinkedIn post</span></div>
              <div className="follow-item"><div className="follow-dot" style={{ background: "#f59e0b" }} /><span style={{ fontSize: 13 }}><b>Day 7:</b> Polite follow-up message</span></div>
              <div className="follow-item"><div className="follow-dot" style={{ background: "#ef4444" }} /><span style={{ fontSize: 13 }}><b>Day 14:</b> Move on if no response</span></div>
            </div>
          </div>
        )}

        {/* ===== NETWORK ===== */}
        {tab === "Network" && (
          <div>
            <h2 className="section-title">Daily Networking Targets</h2>
            <p className="section-sub">Tap target to edit</p>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              {networkTargets.map((n, i) => (
                <div key={n.id} className="card" onClick={() => { setModalData({ ...n, idx: i }); setModal("editTarget"); }} style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: n.color }}>{n.target}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{n.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px" }}>Who to Reach (Priority Order)</h3>
            {[
              { who: "Recruiters at target companies", why: "Direct control over interviews" },
              { who: "NIT Jalandhar alumni", why: "Shared background = higher response" },
              { who: "Hiring managers", why: "Final hiring decision makers" },
              { who: "Analytics employees", why: "Can refer you internally" },
              { who: "HR generalists", why: "Wide reach, lower hit rate" },
            ].map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "9px 12px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", marginBottom: 4, alignItems: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1a1a2e", color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{p.who}</div><div style={{ fontSize: 11, color: "#888" }}>{p.why}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 90-DAY ===== */}
        {tab === "90-Day" && (
          <div>
            <h2 className="section-title" style={{ marginBottom: 14 }}>90-Day Plan</h2>
            {plan90.map((m, i) => (
              <div key={m.id} className="month-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="month-label" style={{ color: m.color }}>{m.month}</div>
                    <div className="month-title">{m.title}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 18 }}>{m.emoji}</span>
                    <button className="icon-btn" onClick={() => { setModalData({ ...m, idx: i }); setModal("editMonth"); }}>✎</button>
                  </div>
                </div>
                <div className="month-focus">{m.focus}</div>
                {m.goals.map((g, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                    <div className="goal-dot" style={{ background: m.color }} />
                    <span style={{ fontSize: 13 }}>{g}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ===== STATS ===== */}
        {tab === "Stats" && (
          <div>
            <h2 className="section-title">Weekly Tracker</h2>

            <div className="date-range">
              <label>From:</label>
              <input type="date" value={statsDateFrom} onChange={e => setStatsDateFrom(e.target.value)} />
              <label>To:</label>
              <input type="date" value={statsDateTo} onChange={e => setStatsDateTo(e.target.value)} />
            </div>

            {STAT_FIELDS.map(w => {
              const val = curStats[w.id] || 0;
              const pct = Math.min(Math.round((val / w.target) * 100), 100);
              const onTrack = pct >= 70;
              return (
                <div key={w.id} className="card">
                  <div className="card-header">
                    <span className="card-title">{w.label}</span>
                    <span style={{ fontSize: 12, color: onTrack ? "#10b981" : "#ef4444", fontWeight: 600 }}>{val} / {w.target}</span>
                  </div>
                  <div className="stat-row">
                    <div className="stat-bar-wrap">
                      <div className="stat-bar" style={{ width: `${pct}%`, background: onTrack ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <input type="number" min={0} className="stat-input" value={val || ""}
                      placeholder="0" onChange={e => updateStat(w.id, e.target.value)} />
                  </div>
                </div>
              );
            })}

            <div className="benchmarks">
              <b>Benchmarks:</b> Application → callback: 5-10% normal. Connection accepted: 30-40% good. Cold DM → response: 15-25% good. Referral ask → given: 30-50% good.
            </div>
          </div>
        )}

        {/* ===== SHEETS ===== */}
        {tab === "Sheets" && (
          <div>
            <h2 className="section-title" style={{ marginBottom: 10 }}>Sheets</h2>

            {/* Sheet tabs */}
            <div className="sheet-tabs">
              {sheets.map((s, i) => (
                <button key={s.id} className={`sheet-tab ${activeSheet === i ? "active" : ""}`} onClick={() => setActiveSheet(i)}>
                  {s.name}
                </button>
              ))}
              <button className="sheet-tab-add" onClick={() => { setModalData({ name: "" }); setModal("addSheet"); }}>+</button>
            </div>

            {curSheet && (
              <>
                {/* Sheet controls */}
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  <button className="add-btn" style={{ fontSize: 11, padding: "5px 10px" }} onClick={addSheetRow}>+ Row</button>
                  <button className="add-btn" style={{ fontSize: 11, padding: "5px 10px" }}
                    onClick={() => { setModalData({ name: "" }); setModal("addColumn"); }}>+ Column</button>
                  <button className="add-btn" style={{ fontSize: 11, padding: "5px 10px" }}
                    onClick={() => { setModalData({ name: curSheet.name }); setModal("renameSheet"); }}>Rename</button>
                  {sheets.length > 1 && (
                    <button className="add-btn" style={{ fontSize: 11, padding: "5px 10px", background: "#ef4444" }}
                      onClick={() => deleteSheet(activeSheet)}>Delete Sheet</button>
                  )}
                </div>

                {/* Table */}
                <div className="table-wrap">
                  <table className="sheet-table">
                    <thead>
                      <tr>
                        <th style={{ width: 30 }}>#</th>
                        {curSheet.columns.map(col => (
                          <th key={col.id}>
                            <div className="col-header">
                              <span>{col.name}</span>
                              <button className="col-del" onClick={() => deleteColumn(col.id)}>✕</button>
                            </div>
                          </th>
                        ))}
                        <th style={{ width: 30 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {curSheet.rows.length === 0 ? (
                        <tr><td colSpan={curSheet.columns.length + 2} style={{ textAlign: "center", color: "#ccc", padding: 20 }}>No data yet. Click + Row to add.</td></tr>
                      ) : (
                        curSheet.rows.map((row, ri) => (
                          <tr key={row.id}>
                            <td style={{ color: "#ccc", fontSize: 11 }}>{ri + 1}</td>
                            {curSheet.columns.map(col => (
                              <td key={col.id}>
                                <input value={row[col.id] || ""} onChange={e => updateCell(ri, col.id, e.target.value)} placeholder="..." />
                              </td>
                            ))}
                            <td><button className="row-del" onClick={() => deleteRow(ri)}>✕</button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{curSheet.rows.length} rows · {curSheet.columns.length} columns</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {modal === "addSchedule" && (<>
              <h3>Add Schedule Block</h3>
              <input placeholder="Time (e.g., 9:00 – 10:00)" value={modalData.time || ""} onChange={e => setModalData({ ...modalData, time: e.target.value })} />
              <input placeholder="Block name" value={modalData.block || ""} onChange={e => setModalData({ ...modalData, block: e.target.value })} />
              <input placeholder="Description" value={modalData.desc || ""} onChange={e => setModalData({ ...modalData, desc: e.target.value })} />
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                {["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"].map(c => (
                  <div key={c} onClick={() => setModalData({ ...modalData, color: c })}
                    style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: "pointer", border: modalData.color === c ? "3px solid #1a1a2e" : "3px solid transparent" }} />
                ))}
              </div>
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => { if (modalData.block) { setSchedule([...schedule, { time: modalData.time, block: modalData.block, desc: modalData.desc, color: modalData.color }]); setModal(null); } }}>Add</button>
              </div>
            </>)}

            {modal === "editSchedule" && (<>
              <h3>Edit Schedule Block</h3>
              <input placeholder="Time" value={modalData.time || ""} onChange={e => setModalData({ ...modalData, time: e.target.value })} />
              <input placeholder="Block name" value={modalData.block || ""} onChange={e => setModalData({ ...modalData, block: e.target.value })} />
              <input placeholder="Description" value={modalData.desc || ""} onChange={e => setModalData({ ...modalData, desc: e.target.value })} />
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                {["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"].map(c => (
                  <div key={c} onClick={() => setModalData({ ...modalData, color: c })}
                    style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: "pointer", border: modalData.color === c ? "3px solid #1a1a2e" : "3px solid transparent" }} />
                ))}
              </div>
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => {
                  const ns = [...schedule]; ns[modalData.idx] = { time: modalData.time, block: modalData.block, desc: modalData.desc, color: modalData.color };
                  setSchedule(ns); setModal(null);
                }}>Save</button>
              </div>
            </>)}

            {modal === "addPhase" && (<>
              <h3>Add Learning Phase</h3>
              <input placeholder="Date range (e.g., 2026-09-08 to 2026-09-21)" value={modalData.dateRange || ""} onChange={e => setModalData({ ...modalData, dateRange: e.target.value })} />
              <input placeholder="Title (e.g., Advanced SQL)" value={modalData.title || ""} onChange={e => setModalData({ ...modalData, title: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => { if (modalData.title) { setLearning([...learning, { id: uid(), dateRange: modalData.dateRange, title: modalData.title, skills: [] }]); setModal(null); } }}>Add</button>
              </div>
            </>)}

            {modal === "editPhase" && (<>
              <h3>Edit Phase</h3>
              <input placeholder="Date range" value={modalData.dateRange || ""} onChange={e => setModalData({ ...modalData, dateRange: e.target.value })} />
              <input placeholder="Title" value={modalData.title || ""} onChange={e => setModalData({ ...modalData, title: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-danger" onClick={() => { setLearning(learning.filter(p => p.id !== modalData.id)); setModal(null); }}>Delete</button>
                <button className="btn-save" onClick={() => {
                  setLearning(learning.map(p => p.id === modalData.id ? { ...p, dateRange: modalData.dateRange, title: modalData.title } : p));
                  setModal(null);
                }}>Save</button>
              </div>
            </>)}

            {modal === "addSkill" && (<>
              <h3>Add Skill</h3>
              <input placeholder="Skill name" value={modalData.label || ""} onChange={e => setModalData({ ...modalData, label: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => {
                  if (modalData.label) {
                    setLearning(learning.map(p => p.id === modalData.phaseId ? { ...p, skills: [...p.skills, { id: uid(), label: modalData.label }] } : p));
                    setModal(null);
                  }
                }}>Add</button>
              </div>
            </>)}

            {modal === "addLink" && (<>
              <h3>Add Platform</h3>
              <input placeholder="Name (e.g., Google Jobs)" value={modalData.name || ""} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
              <input placeholder="URL (https://...)" value={modalData.url || ""} onChange={e => setModalData({ ...modalData, url: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => { if (modalData.name && modalData.url) { setLinks([...links, { id: uid(), name: modalData.name, url: modalData.url }]); setModal(null); } }}>Add</button>
              </div>
            </>)}

            {modal === "editLink" && (<>
              <h3>Edit Platform</h3>
              <input placeholder="Name" value={modalData.name || ""} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
              <input placeholder="URL" value={modalData.url || ""} onChange={e => setModalData({ ...modalData, url: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => {
                  const nl = [...links]; nl[modalData.idx] = { ...nl[modalData.idx], name: modalData.name, url: modalData.url };
                  setLinks(nl); setModal(null);
                }}>Save</button>
              </div>
            </>)}

            {modal === "addTemplate" && (<>
              <h3>Add Template</h3>
              <input placeholder="Type (e.g., Cold Email)" value={modalData.type || ""} onChange={e => setModalData({ ...modalData, type: e.target.value })} />
              <textarea placeholder="Template text..." value={modalData.text || ""} onChange={e => setModalData({ ...modalData, text: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => { if (modalData.type) { setTemplates([...templates, { id: uid(), type: modalData.type, text: modalData.text }]); setModal(null); } }}>Add</button>
              </div>
            </>)}

            {modal === "editTarget" && (<>
              <h3>Edit Target</h3>
              <input placeholder="Label" value={modalData.label || ""} onChange={e => setModalData({ ...modalData, label: e.target.value })} />
              <input placeholder="Target (e.g., 10-15/day)" value={modalData.target || ""} onChange={e => setModalData({ ...modalData, target: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => {
                  const nt = [...networkTargets]; nt[modalData.idx] = { ...nt[modalData.idx], label: modalData.label, target: modalData.target };
                  setNetworkTargets(nt); setModal(null);
                }}>Save</button>
              </div>
            </>)}

            {modal === "editMonth" && (<>
              <h3>Edit Month</h3>
              <input placeholder="Month label" value={modalData.month || ""} onChange={e => setModalData({ ...modalData, month: e.target.value })} />
              <input placeholder="Title" value={modalData.title || ""} onChange={e => setModalData({ ...modalData, title: e.target.value })} />
              <input placeholder="Focus" value={modalData.focus || ""} onChange={e => setModalData({ ...modalData, focus: e.target.value })} />
              <textarea placeholder="Goals (one per line)" value={(modalData.goals || []).join("\n")}
                onChange={e => setModalData({ ...modalData, goals: e.target.value.split("\n") })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => {
                  const np = [...plan90]; np[modalData.idx] = { ...np[modalData.idx], month: modalData.month, title: modalData.title, focus: modalData.focus, goals: modalData.goals };
                  setPlan90(np); setModal(null);
                }}>Save</button>
              </div>
            </>)}

            {modal === "addSheet" && (<>
              <h3>Add Sheet</h3>
              <input placeholder="Sheet name" value={modalData.name || ""} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => { if (modalData.name) { addNewSheet(modalData.name); setModal(null); } }}>Add</button>
              </div>
            </>)}

            {modal === "renameSheet" && (<>
              <h3>Rename Sheet</h3>
              <input placeholder="Sheet name" value={modalData.name || ""} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => { updateSheet(activeSheet, { name: modalData.name }); setModal(null); }}>Save</button>
              </div>
            </>)}

            {modal === "addColumn" && (<>
              <h3>Add Column</h3>
              <input placeholder="Column name" value={modalData.name || ""} onChange={e => setModalData({ ...modalData, name: e.target.value })} />
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-save" onClick={() => { if (modalData.name) { addColumn(modalData.name); setModal(null); } }}>Add</button>
              </div>
            </>)}

          </div>
        </div>
      )}
    </div>
  );
}
