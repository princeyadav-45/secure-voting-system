<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SecureVote — Admin Dashboard</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --bg: #060a0f;
  --surface: #0a1120;
  --card: #0f1929;
  --border: #162440;
  --accent: #3b82f6;
  --green: #10b981;
  --yellow: #f59e0b;
  --red: #ef4444;
  --purple: #8b5cf6;
  --text: #cbd5e1;
  --muted: #3d5070;
  --white: #f1f5f9;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

/* BG */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 80% 10%, rgba(59,130,246,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 10% 90%, rgba(16,185,129,0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.app { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 24px 20px 60px; }

/* HEADER */
header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 32px; padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.logo { display: flex; align-items: center; gap: 10px; }
.logo-box {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--accent), #1d4ed8);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-size: 17px;
}
.logo-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: var(--white); }
.logo-text span { color: var(--accent); }
.admin-tag {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--yellow); border: 1px solid rgba(245,158,11,0.3);
  padding: 4px 10px; border-radius: 20px; background: rgba(245,158,11,0.08);
  letter-spacing: 1.5px;
}

/* LOGIN CARD */
.login-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 16px; padding: 40px;
  max-width: 420px; margin: 80px auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.login-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--white); margin-bottom: 6px; }
.login-sub { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
.field { margin-bottom: 16px; }
.field label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; margin-bottom: 8px; }
.field input {
  width: 100%; background: var(--surface); border: 1.5px solid var(--border);
  border-radius: 10px; color: var(--white); padding: 12px 14px;
  font-size: 14px; outline: none; transition: border-color 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.field input:focus { border-color: var(--accent); }

/* BUTTONS */
.btn {
  width: 100%; padding: 13px; border: none; border-radius: 10px;
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
  letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
}
.btn-primary { background: var(--accent); color: white; box-shadow: 0 4px 20px rgba(59,130,246,0.25); }
.btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
.btn-sm {
  padding: 8px 16px; width: auto; font-size: 12px; letter-spacing: 1px;
  background: var(--surface); border: 1px solid var(--border); color: var(--muted);
  border-radius: 8px; cursor: pointer; font-family: 'JetBrains Mono', monospace;
  transition: all 0.2s;
}
.btn-sm:hover { border-color: var(--accent); color: var(--accent); }
.btn-danger-sm {
  padding: 8px 16px; width: auto; font-size: 12px;
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  color: var(--red); border-radius: 8px; cursor: pointer;
  font-family: 'JetBrains Mono', monospace; transition: all 0.2s; letter-spacing: 1px;
}
.btn-danger-sm:hover { background: rgba(239,68,68,0.2); }

/* ALERT */
.alert { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
.alert-danger { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; }

/* STATS ROW */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
.stat-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 20px;
}
.stat-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: var(--white); }
.stat-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
.stat-card.accent { border-color: rgba(59,130,246,0.3); background: rgba(59,130,246,0.05); }
.stat-card.accent .stat-value { color: var(--accent); }
.stat-card.green { border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.05); }
.stat-card.green .stat-value { color: var(--green); }
.stat-card.yellow { border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }
.stat-card.yellow .stat-value { color: var(--yellow); }

/* SECTION TITLE */
.section-title {
  font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
  color: var(--white); margin-bottom: 16px;
  display: flex; align-items: center; justify-content: space-between;
}
.live-badge {
  display: flex; align-items: center; gap: 6px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--green); letter-spacing: 1px;
}
.live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--green);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* RESULTS CARDS */
.results-grid { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }

.result-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 20px 22px;
  transition: border-color 0.3s;
  position: relative; overflow: hidden;
}
.result-card.leading { border-color: rgba(16,185,129,0.4); }
.result-card.leading::before {
  content: '👑 LEADING';
  position: absolute; top: 12px; right: 14px;
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  color: var(--green); letter-spacing: 1.5px;
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
  padding: 3px 8px; border-radius: 20px;
}

.result-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.cand-emoji { font-size: 32px; }
.cand-info { flex: 1; }
.cand-name { font-weight: 700; font-size: 16px; color: var(--white); }
.cand-pos { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
.vote-count {
  text-align: right;
  font-family: 'Syne', sans-serif;
}
.vote-num { font-size: 28px; font-weight: 800; color: var(--white); }
.vote-label { font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }

/* PROGRESS BAR */
.progress-wrap { margin-top: 4px; }
.progress-info { display: flex; justify-content: space-between; margin-bottom: 6px; }
.progress-pct { font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; }
.progress-bar-bg { background: var(--surface); border-radius: 20px; height: 10px; overflow: hidden; }
.progress-bar-fill {
  height: 100%; border-radius: 20px;
  background: linear-gradient(90deg, var(--accent), #06b6d4);
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}
.progress-bar-fill.leading { background: linear-gradient(90deg, var(--green), #34d399); }
.progress-bar-fill.second { background: linear-gradient(90deg, var(--purple), #a78bfa); }
.progress-bar-fill.third { background: linear-gradient(90deg, var(--yellow), #fbbf24); }

/* VOTE LOG TABLE */
.log-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden; margin-bottom: 24px;
}
.log-header {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1.5fr;
  padding: 12px 20px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase;
}
.log-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1.5fr;
  padding: 13px 20px; border-bottom: 1px solid var(--border);
  font-size: 13px; transition: background 0.15s;
}
.log-row:last-child { border-bottom: none; }
.log-row:hover { background: var(--surface); }
.log-id { font-family: 'JetBrains Mono', monospace; color: var(--accent); font-size: 12px; }
.log-name { color: var(--white); font-weight: 500; }
.log-voted { color: var(--green); font-weight: 600; }
.log-time { font-family: 'JetBrains Mono', monospace; color: var(--muted); font-size: 11px; }
.empty-log { padding: 30px; text-align: center; color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 1px; }

/* REFRESH */
.refresh-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.last-updated { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); }

.hidden { display: none !important; }
.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 7px; vertical-align: middle; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── IDS STYLES ───────────────────────────────────────── */

/* Threat banner */
.ids-banner {
  position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
  padding: 12px 24px;
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  animation: slideDown 0.3s ease;
  border-bottom: 1px solid;
}
.ids-banner.warning {
  background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.4); color: #fcd34d;
}
.ids-banner.danger {
  background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.5); color: #fca5a5;
}
.ids-banner.critical {
  background: rgba(239,68,68,0.25); border-color: rgba(239,68,68,0.8); color: #fff;
  animation: slideDown 0.3s ease, criticalPulse 1s ease infinite;
}
.ids-banner-icon { font-size: 16px; }
.ids-banner-msg { flex: 1; }
.ids-banner-close { cursor: pointer; opacity: 0.6; font-size: 16px; padding: 0 4px; }
.ids-banner-close:hover { opacity: 1; }
@keyframes slideDown { from{transform:translateY(-100%);opacity:0} to{transform:none;opacity:1} }
@keyframes criticalPulse { 0%,100%{background:rgba(239,68,68,0.25)} 50%{background:rgba(239,68,68,0.4)} }

/* Lockout overlay */
.ids-lockout {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(6,10,15,0.97);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px;
}
.ids-lockout-box {
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.4);
  border-radius: 16px; padding: 40px 48px; text-align: center; max-width: 420px;
}
.ids-lockout-icon { font-size: 48px; margin-bottom: 12px; }
.ids-lockout-title {
  font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
  color: var(--red); margin-bottom: 8px;
}
.ids-lockout-msg { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 20px; }
.ids-lockout-timer {
  font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700;
  color: var(--red); letter-spacing: 4px;
}
.ids-lockout-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 2px; margin-top: 8px; }

/* IDS Panel inside dashboard */
.ids-panel {
  background: var(--card); border: 1px solid rgba(239,68,68,0.25);
  border-radius: 14px; margin-bottom: 24px; overflow: hidden;
}
.ids-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; background: rgba(239,68,68,0.06);
  border-bottom: 1px solid rgba(239,68,68,0.15);
}
.ids-panel-title {
  font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
  color: var(--white); display: flex; align-items: center; gap: 8px;
}
.ids-status-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 1.5px;
  padding: 3px 10px; border-radius: 20px;
}
.ids-status-badge.safe { background: rgba(16,185,129,0.12); color: var(--green); border: 1px solid rgba(16,185,129,0.3); }
.ids-status-badge.alert { background: rgba(245,158,11,0.12); color: var(--yellow); border: 1px solid rgba(245,158,11,0.3); }
.ids-status-badge.threat { background: rgba(239,68,68,0.12); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }

.ids-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); }
.ids-stat { background: var(--card); padding: 14px 18px; }
.ids-stat-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; }
.ids-stat-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--white); }
.ids-stat-val.red { color: var(--red); }
.ids-stat-val.yellow { color: var(--yellow); }
.ids-stat-val.green { color: var(--green); }
.ids-stat-val.blue { color: var(--accent); }

/* Threat Log */
.ids-log { max-height: 220px; overflow-y: auto; }
.ids-log::-webkit-scrollbar { width: 4px; }
.ids-log::-webkit-scrollbar-track { background: var(--surface); }
.ids-log::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
.ids-log-row {
  display: grid; grid-template-columns: 90px 80px 1fr 100px;
  padding: 10px 20px; border-bottom: 1px solid var(--border);
  font-size: 12px; align-items: center;
}
.ids-log-row:last-child { border-bottom: none; }
.ids-log-row:hover { background: var(--surface); }
.ids-log-time { font-family: 'JetBrains Mono', monospace; color: var(--muted); font-size: 10px; }
.ids-log-type { font-family: 'JetBrains Mono', monospace; font-size: 10px; }
.ids-log-type.fail { color: var(--red); }
.ids-log-type.warn { color: var(--yellow); }
.ids-log-type.ok { color: var(--green); }
.ids-log-type.block { color: var(--purple); }
.ids-log-msg { color: var(--text); }
.ids-log-ip { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--muted); text-align: right; }
.ids-log-empty { padding: 24px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted); letter-spacing: 1px; }
.ids-log-header {
  display: grid; grid-template-columns: 90px 80px 1fr 100px;
  padding: 8px 20px; background: var(--surface);
  border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace; font-size: 9px;
  color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase;
}

/* Session timer bar */
.session-bar {
  display: flex; align-items: center; gap: 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted);
}
.session-progress-bg { flex: 1; background: var(--surface); border-radius: 20px; height: 4px; max-width: 120px; }
.session-progress-fill { height: 4px; border-radius: 20px; background: var(--green); transition: width 1s linear, background 0.5s; }

/* Attempt dots on login */
.attempt-dots { display: flex; gap: 6px; margin-bottom: 14px; }
.attempt-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--border); border: 1px solid var(--border);
  transition: all 0.3s;
}
.attempt-dot.used { background: var(--red); border-color: var(--red); box-shadow: 0 0 6px rgba(239,68,68,0.5); }
.attempt-dot.warn { background: var(--yellow); border-color: var(--yellow); box-shadow: 0 0 6px rgba(245,158,11,0.5); }
</style>
</head>
<body>
<div class="app">

<!-- IDS: Lockout Overlay -->
<div class="ids-lockout hidden" id="idsLockout">
  <div class="ids-lockout-box">
    <div class="ids-lockout-icon">🔒</div>
    <div class="ids-lockout-title">ACCESS BLOCKED</div>
    <div class="ids-lockout-msg">Too many failed login attempts detected.<br>This session has been temporarily locked by the Intrusion Detection System.</div>
    <div class="ids-lockout-timer" id="lockoutTimer">15:00</div>
    <div class="ids-lockout-sub">LOCKOUT COUNTDOWN</div>
  </div>
</div>

<!-- IDS: Threat Banner -->
<div class="ids-banner hidden" id="idsBanner">
  <div class="ids-banner-icon" id="idsBannerIcon">⚠️</div>
  <div class="ids-banner-msg" id="idsBannerMsg"></div>
  <div class="ids-banner-close" onclick="hideBanner()">✕</div>
</div>

  <header>
    <div class="logo">
      <div class="logo-box">🗳️</div>
      <div class="logo-text">SECURE<span>VOTE</span></div>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <div class="admin-tag">ADMIN DASHBOARD</div>
      <div class="admin-tag" id="idsTag" style="color:var(--green);border-color:rgba(16,185,129,0.3);background:rgba(16,185,129,0.08)">🛡️ IDS ACTIVE</div>
    </div>
  </header>

  <!-- LOGIN -->
  <div id="loginSection">
    <div class="login-card">
      <div class="login-title">Admin Login</div>
      <div class="login-sub">Protected by Intrusion Detection System</div>

      <!-- Attempt dots -->
      <div class="attempt-dots" id="attemptDots">
        <div class="attempt-dot" id="dot1"></div>
        <div class="attempt-dot" id="dot2"></div>
        <div class="attempt-dot" id="dot3"></div>
        <div class="attempt-dot" id="dot4"></div>
        <div class="attempt-dot" id="dot5"></div>
      </div>

      <div class="alert alert-danger hidden" id="loginError"></div>
      <div class="field">
        <label>Admin Password</label>
        <input type="password" id="passwordInput" placeholder="Enter password..." onkeydown="if(event.key==='Enter') login()" />
      </div>
      <button class="btn btn-primary" onclick="login()">View Results →</button>
      <div style="margin-top:14px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);text-align:center;letter-spacing:1px" id="attemptsLeft"></div>
    </div>
  </div>

  <!-- DASHBOARD -->
  <div id="dashboard" class="hidden">

    <div class="refresh-bar">
      <div style="display:flex;flex-direction:column;gap:4px">
        <div class="last-updated">Last updated: <span id="lastUpdated">—</span></div>
        <div class="session-bar">
          <span id="sessionTimerLabel">SESSION:</span>
          <div class="session-progress-bg"><div class="session-progress-fill" id="sessionProgressFill" style="width:100%"></div></div>
          <span id="sessionTimerVal" style="min-width:38px">10:00</span>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-sm" onclick="loadResults()">🔄 Refresh</button>
        <button class="btn-sm" onclick="showIdsPanel()">🛡️ IDS Log</button>
        <button class="btn-danger-sm" onclick="logout()">Logout</button>
      </div>
    </div>

    <!-- IDS PANEL -->
    <div class="ids-panel" id="idsPanel" style="display:none">
      <div class="ids-panel-header">
        <div class="ids-panel-title">🛡️ Intrusion Detection System <span style="font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--muted);font-weight:400">— Live Monitor</span></div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="ids-status-badge safe" id="idsStatusBadge">SECURE</span>
          <button class="btn-sm" onclick="clearIdsLog()" style="font-size:10px;padding:4px 10px">Clear</button>
          <button class="btn-sm" onclick="hideIdsPanel()" style="font-size:10px;padding:4px 10px">✕</button>
        </div>
      </div>
      <div class="ids-stats-row">
        <div class="ids-stat"><div class="ids-stat-label">Failed Attempts</div><div class="ids-stat-val red" id="ids-failed">0</div></div>
        <div class="ids-stat"><div class="ids-stat-label">Threats Detected</div><div class="ids-stat-val yellow" id="ids-threats">0</div></div>
        <div class="ids-stat"><div class="ids-stat-label">Times Blocked</div><div class="ids-stat-val" id="ids-blocked" style="color:var(--purple)">0</div></div>
        <div class="ids-stat"><div class="ids-stat-label">Session Logins</div><div class="ids-stat-val green" id="ids-logins">0</div></div>
      </div>
      <div class="ids-log-header">
        <span>Time</span><span>Event</span><span>Details</span><span style="text-align:right">Source</span>
      </div>
      <div class="ids-log" id="idsLogList">
        <div class="ids-log-empty">NO EVENTS LOGGED YET</div>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-row">
      <div class="stat-card accent">
        <div class="stat-label">Total Votes Cast</div>
        <div class="stat-value" id="totalVotes">0</div>
        <div class="stat-sub">out of <span id="totalVoters">0</span> registered</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Voter Turnout</div>
        <div class="stat-value" id="turnout">0%</div>
        <div class="stat-sub">participation rate</div>
      </div>
      <div class="stat-card yellow">
        <div class="stat-label">Current Leader</div>
        <div class="stat-value" id="leaderName" style="font-size:18px;margin-top:6px">—</div>
        <div class="stat-sub" id="leaderVotes">no votes yet</div>
      </div>
    </div>

    <!-- RESULTS -->
    <div class="section-title">
      Live Results
      <div class="live-badge"><div class="live-dot"></div> LIVE</div>
    </div>
    <div class="results-grid" id="resultsGrid"></div>

    <!-- VOTE LOG -->
    <div class="section-title" style="margin-top:8px">
      Vote Log
      <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)">Detailed record</span>
    </div>
    <div class="log-card">
      <div class="log-header">
        <span>Voter ID</span>
        <span>Name</span>
        <span>Voted For</span>
        <span>Timestamp</span>
      </div>
      <div id="voteLog">
        <div class="empty-log">NO VOTES RECORDED YET</div>
      </div>
    </div>

  </div>
</div>

<script>
const API = 'http://localhost:3000/api';

// ── IDS CONFIG ────────────────────────────────────────────────
const IDS_CONFIG = {
  MAX_ATTEMPTS:     5,      // max wrong passwords before lockout
  LOCKOUT_DURATION: 15*60,  // 15 min lockout in seconds
  WARN_AT:          3,      // show warning after this many fails
  SESSION_TIMEOUT:  10*60,  // 10 min session timeout in seconds
  RAPID_WINDOW:     5000,   // 5 sec — rapid attempt detection
};

// ── IDS STATE ─────────────────────────────────────────────────
const IDS = {
  failedAttempts:   0,
  totalFailed:      0,
  totalThreats:     0,
  totalBlocked:     0,
  totalLogins:      0,
  isLocked:         false,
  lockoutEnd:       null,
  lastAttemptTime:  null,
  sessionStart:     null,
  sessionTimer:     null,
  lockoutTimer:     null,
  log:              [],
  browserFingerprint: null,
};

let adminPassword = '';
let autoRefresh   = null;

// ── FINGERPRINT (identify browser session) ────────────────────
function getFingerprint() {
  if (IDS.browserFingerprint) return IDS.browserFingerprint;
  const raw = navigator.userAgent + screen.width + screen.height + navigator.language + Intl.DateTimeFormat().resolvedOptions().timeZone;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash |= 0; }
  IDS.browserFingerprint = 'FP-' + Math.abs(hash).toString(16).toUpperCase().slice(0,6);
  return IDS.browserFingerprint;
}

// ── IDS LOGGER ────────────────────────────────────────────────
function idsLog(type, msg) {
  const entry = {
    time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    type,
    msg,
    fp: getFingerprint()
  };
  IDS.log.unshift(entry);
  if (IDS.log.length > 50) IDS.log.pop();
  renderIdsLog();
  updateIdsStats();
}

function renderIdsLog() {
  const el = document.getElementById('idsLogList');
  if (!IDS.log.length) { el.innerHTML = '<div class="ids-log-empty">NO EVENTS LOGGED YET</div>'; return; }
  el.innerHTML = IDS.log.map(e => `
    <div class="ids-log-row">
      <div class="ids-log-time">${e.time}</div>
      <div class="ids-log-type ${e.type}">${e.type.toUpperCase()}</div>
      <div class="ids-log-msg">${e.msg}</div>
      <div class="ids-log-ip">${e.fp}</div>
    </div>`).join('');
}

function updateIdsStats() {
  document.getElementById('ids-failed').textContent  = IDS.totalFailed;
  document.getElementById('ids-threats').textContent = IDS.totalThreats;
  document.getElementById('ids-blocked').textContent = IDS.totalBlocked;
  document.getElementById('ids-logins').textContent  = IDS.totalLogins;

  const badge = document.getElementById('idsStatusBadge');
  if (IDS.isLocked) {
    badge.className = 'ids-status-badge threat'; badge.textContent = 'LOCKED';
  } else if (IDS.failedAttempts >= IDS_CONFIG.WARN_AT) {
    badge.className = 'ids-status-badge alert'; badge.textContent = 'ALERT';
  } else {
    badge.className = 'ids-status-badge safe'; badge.textContent = 'SECURE';
  }
}

// ── BANNER ────────────────────────────────────────────────────
function showBanner(level, msg) {
  const banner = document.getElementById('idsBanner');
  const icons  = { warning: '⚠️', danger: '🚨', critical: '🔴' };
  banner.className = `ids-banner ${level}`;
  document.getElementById('idsBannerIcon').textContent = icons[level] || '⚠️';
  document.getElementById('idsBannerMsg').textContent  = msg;
  banner.classList.remove('hidden');
  if (level === 'warning') setTimeout(hideBanner, 5000);
}
function hideBanner() { document.getElementById('idsBanner').classList.add('hidden'); }

// ── ATTEMPT DOTS ──────────────────────────────────────────────
function updateAttemptDots() {
  for (let i = 1; i <= 5; i++) {
    const dot = document.getElementById('dot' + i);
    if (i <= IDS.failedAttempts) {
      dot.className = 'attempt-dot ' + (IDS.failedAttempts >= IDS_CONFIG.WARN_AT ? 'used' : 'warn');
    } else {
      dot.className = 'attempt-dot';
    }
  }
  const left = IDS_CONFIG.MAX_ATTEMPTS - IDS.failedAttempts;
  const el   = document.getElementById('attemptsLeft');
  if (IDS.failedAttempts > 0) {
    el.textContent = left + ' ATTEMPT' + (left !== 1 ? 'S' : '') + ' REMAINING BEFORE LOCKOUT';
    el.style.color = IDS.failedAttempts >= IDS_CONFIG.WARN_AT ? 'var(--red)' : 'var(--yellow)';
  } else {
    el.textContent = '';
  }
}

// ── LOCKOUT ───────────────────────────────────────────────────
function triggerLockout() {
  IDS.isLocked   = true;
  IDS.lockoutEnd = Date.now() + IDS_CONFIG.LOCKOUT_DURATION * 1000;
  IDS.totalBlocked++;
  idsLog('block', `Brute force detected — session locked for ${IDS_CONFIG.LOCKOUT_DURATION/60} minutes`);
  showBanner('critical', '🔴 INTRUSION DETECTED — Account locked due to repeated failed attempts');
  document.getElementById('idsLockout').classList.remove('hidden');
  document.getElementById('passwordInput').disabled = true;
  runLockoutTimer();
}

function runLockoutTimer() {
  clearInterval(IDS.lockoutTimer);
  IDS.lockoutTimer = setInterval(() => {
    const remaining = Math.max(0, Math.floor((IDS.lockoutEnd - Date.now()) / 1000));
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    document.getElementById('lockoutTimer').textContent = m + ':' + s;
    if (remaining <= 0) {
      clearInterval(IDS.lockoutTimer);
      IDS.isLocked      = false;
      IDS.failedAttempts = 0;
      document.getElementById('idsLockout').classList.add('hidden');
      document.getElementById('passwordInput').disabled = false;
      hideBanner();
      updateAttemptDots();
      idsLog('ok', 'Lockout expired — login re-enabled');
    }
  }, 1000);
}

// ── RAPID ATTEMPT DETECTION ───────────────────────────────────
function checkRapidAttempt() {
  const now = Date.now();
  if (IDS.lastAttemptTime && (now - IDS.lastAttemptTime) < IDS_CONFIG.RAPID_WINDOW) {
    IDS.totalThreats++;
    idsLog('warn', 'Rapid login attempts detected — possible automated attack');
    showBanner('danger', '🚨 Rapid attempts detected — possible bot or brute force attack!');
  }
  IDS.lastAttemptTime = now;
}

// ── SESSION TIMEOUT ───────────────────────────────────────────
function startSessionTimer() {
  IDS.sessionStart = Date.now();
  const total = IDS_CONFIG.SESSION_TIMEOUT * 1000;
  clearInterval(IDS.sessionTimer);
  idsLog('ok', 'Admin session started — 10 min timeout active');

  IDS.sessionTimer = setInterval(() => {
    const elapsed   = Date.now() - IDS.sessionStart;
    const remaining = Math.max(0, Math.floor((total - elapsed) / 1000));
    const pct       = (remaining / IDS_CONFIG.SESSION_TIMEOUT) * 100;

    const fill  = document.getElementById('sessionProgressFill');
    const label = document.getElementById('sessionTimerVal');
    const m     = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s     = String(remaining % 60).padStart(2, '0');

    if (label) label.textContent = m + ':' + s;
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.background = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--yellow)' : 'var(--red)';
    }

    if (remaining === 120) {
      showBanner('warning', '⚠️ Session expiring in 2 minutes — save your work');
      idsLog('warn', 'Session timeout warning — 2 minutes remaining');
    }
    if (remaining <= 0) {
      idsLog('warn', 'Session timed out due to inactivity — auto logout triggered');
      logout(true);
    }
  }, 1000);
}

function resetSessionTimer() {
  if (IDS.sessionStart) IDS.sessionStart = Date.now();
}

// Reset session on any activity
document.addEventListener('click',     resetSessionTimer);
document.addEventListener('keypress',  resetSessionTimer);
document.addEventListener('mousemove', resetSessionTimer);

// ── IDS PANEL TOGGLE ──────────────────────────────────────────
function showIdsPanel() { document.getElementById('idsPanel').style.display = 'block'; renderIdsLog(); updateIdsStats(); }
function hideIdsPanel() { document.getElementById('idsPanel').style.display = 'none'; }
function clearIdsLog()  { IDS.log = []; renderIdsLog(); }

// ── LOGIN ─────────────────────────────────────────────────────
async function login() {
  if (IDS.isLocked) { showBanner('critical', '🔴 Account is locked. Wait for the countdown.'); return; }

  const pwd   = document.getElementById('passwordInput').value.trim();
  const errEl = document.getElementById('loginError');
  if (!pwd) { showLoginErr('Enter password'); return; }

  checkRapidAttempt();

  const btn = document.querySelector('#loginSection .btn-primary');
  btn.innerHTML = '<span class="spinner"></span> Verifying...';
  btn.disabled  = true;

  try {
    const res  = await fetch(`${API}/admin/results?password=${encodeURIComponent(pwd)}`);
    const data = await res.json();

    if (!data.success) {
      IDS.failedAttempts++;
      IDS.totalFailed++;
      idsLog('fail', `Failed login attempt #${IDS.failedAttempts} — wrong password entered`);
      updateAttemptDots();

      if (IDS.failedAttempts >= IDS_CONFIG.MAX_ATTEMPTS) {
        IDS.totalThreats++;
        triggerLockout();
        showLoginErr('Too many failed attempts — account LOCKED for 15 minutes!');
      } else if (IDS.failedAttempts === IDS_CONFIG.WARN_AT) {
        IDS.totalThreats++;
        showBanner('danger', `🚨 ${IDS_CONFIG.MAX_ATTEMPTS - IDS.failedAttempts} attempts left before lockout!`);
        showLoginErr(`Warning! ${IDS_CONFIG.MAX_ATTEMPTS - IDS.failedAttempts} more failed attempts will lock this session.`);
      } else {
        showLoginErr('Wrong password! ' + (IDS_CONFIG.MAX_ATTEMPTS - IDS.failedAttempts) + ' attempts left.');
      }

      btn.innerHTML = 'View Results →';
      btn.disabled  = false;
      return;
    }

    // ✅ SUCCESS
    IDS.failedAttempts = 0;
    IDS.totalLogins++;
    updateAttemptDots();
    hideBanner();
    idsLog('ok', `Successful admin login — session authenticated (fingerprint: ${getFingerprint()})`);

    adminPassword = pwd;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    renderDashboard(data);
    startSessionTimer();
    autoRefresh = setInterval(loadResults, 10000);

  } catch(e) {
    idsLog('warn', 'Connection error during login attempt — server may be unreachable');
    showLoginErr('Cannot connect to server. Make sure backend is running.');
    btn.innerHTML = 'View Results →';
    btn.disabled  = false;
  }
}

function showLoginErr(msg) {
  const el = document.getElementById('loginError');
  el.textContent = '❌ ' + msg;
  el.classList.remove('hidden');
}

// ── LOAD RESULTS ──────────────────────────────────────────────
async function loadResults() {
  try {
    const res  = await fetch(`${API}/admin/results?password=${encodeURIComponent(adminPassword)}`);
    const data = await res.json();
    if (data.success) renderDashboard(data);
  } catch(e) { console.error('Refresh failed'); }
}

// ── RENDER DASHBOARD ──────────────────────────────────────────
function renderDashboard(data) {
  const totalVotes  = data.totalVotes;
  const results     = data.results;
  const voteLog     = data.voteLog || [];
  const totalVoters = 4;

  document.getElementById('totalVotes').textContent  = totalVotes;
  document.getElementById('totalVoters').textContent = totalVoters;
  const turnoutPct = totalVoters > 0 ? Math.round((totalVotes / totalVoters) * 100) : 0;
  document.getElementById('turnout').textContent = turnoutPct + '%';

  const sorted = [...results].sort((a, b) => b.votes - a.votes);
  if (sorted.length > 0 && sorted[0].votes > 0) {
    document.getElementById('leaderName').textContent  = sorted[0].name.split(' ')[0];
    document.getElementById('leaderVotes').textContent = `${sorted[0].votes} vote${sorted[0].votes !== 1 ? 's' : ''}`;
  }

  const emojis     = ['🌟', '🔥', '⚡', '🌸', '💎'];
  const barClasses = ['leading', 'second', 'third', 'accent', 'accent'];
  const grid       = document.getElementById('resultsGrid');
  grid.innerHTML   = '';

  sorted.forEach((candidate, idx) => {
    const pct       = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
    const isLeading = idx === 0 && candidate.votes > 0;
    const origIdx   = results.findIndex(r => r.name === candidate.name);
    const emoji     = emojis[origIdx] || '🗳️';
    const barClass  = barClasses[idx] || 'accent';

    grid.innerHTML += `
      <div class="result-card ${isLeading ? 'leading' : ''}">
        <div class="result-top">
          <div class="cand-emoji">${emoji}</div>
          <div class="cand-info">
            <div class="cand-name">${candidate.name}</div>
            <div class="cand-pos">Class Representative</div>
          </div>
          <div class="vote-count">
            <div class="vote-num">${candidate.votes}</div>
            <div class="vote-label">VOTES</div>
          </div>
        </div>
        <div class="progress-wrap">
          <div class="progress-info">
            <span style="font-size:12px;color:var(--muted)">Vote share</span>
            <span class="progress-pct" style="color:var(--${isLeading ? 'green' : idx === 1 ? 'purple' : 'yellow'})">${pct}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${barClass}" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`;
  });

  const logEl = document.getElementById('voteLog');
  if (voteLog.length === 0) {
    logEl.innerHTML = '<div class="empty-log">NO VOTES RECORDED YET</div>';
  } else {
    logEl.innerHTML = [...voteLog].reverse().map(v => `
      <div class="log-row">
        <div class="log-id">${v.voterId}</div>
        <div class="log-name">${v.voterName}</div>
        <div class="log-voted">${v.nomineeName}</div>
        <div class="log-time">${new Date(v.timestamp).toLocaleString('en-IN')}</div>
      </div>`).join('');
  }

  document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString('en-IN');
}

// ── LOGOUT ────────────────────────────────────────────────────
function logout(auto = false) {
  clearInterval(autoRefresh);
  clearInterval(IDS.sessionTimer);
  if (auto) {
    showBanner('warning', '⚠️ Session expired due to inactivity — please login again');
  }
  idsLog('ok', auto ? 'Auto-logout triggered — session timeout' : 'Admin manually logged out');
  adminPassword = '';
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('passwordInput').value = '';
  document.getElementById('loginError').classList.add('hidden');
  IDS.sessionStart = null;
  const fill = document.getElementById('sessionProgressFill');
  if (fill) { fill.style.width = '100%'; fill.style.background = 'var(--green)'; }
}

// ── INIT ──────────────────────────────────────────────────────
idsLog('ok', `IDS initialized — monitoring active (fingerprint: ${getFingerprint()})`);
</script>
</body>
</html>
