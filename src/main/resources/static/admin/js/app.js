/* MindSpace Admin - plain JavaScript, no frameworks */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const when = d => new Date(d).toLocaleString();
let me = null;

// ---- Talking to the backend ----
async function api(url, method = 'GET', body) {
  const res = await fetch('/api/admin' + url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.adminToken || '') },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && localStorage.adminToken) { logout(); throw new Error(data.error); }
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.className = 'show';
  clearTimeout(toast.t); toast.t = setTimeout(() => t.className = '', 2800);
}
function setTheme(t) { document.documentElement.dataset.theme = t; localStorage.adminTheme = t; }
setTheme(localStorage.adminTheme || 'light');
function logout() { localStorage.removeItem('adminToken'); me = null; location.hash = ''; showLogin(); }

// ---- Login, forgot, reset screens ----
function authShell(inner) {
  $('#root').innerHTML = `<main class="auth"><div class="auth-card">
    <img class="logo" src="logo.png" alt="MindSpace logo"><h1>MindSpace</h1>${inner}</div></main>`;
}
function showLogin() {
  authShell(`<p class="sub">Admin sign in</p>
    <form id="f"><label for="e">Email</label><input id="e" type="email" required autocomplete="username">
    <label for="p">Password</label><input id="p" type="password" required autocomplete="current-password">
    <div class="err" id="err"></div><button class="btn full">Log in</button></form>
    <button class="link" id="fg">Forgot password?</button>`);
  $('#fg').onclick = showForgot;
  $('#f').onsubmit = async e => {
    e.preventDefault();
    try {
      const r = await api('/auth/login', 'POST', { email: $('#e').value, password: $('#p').value });
      localStorage.adminToken = r.token; start();
    } catch (x) { $('#err').textContent = x.message; }
  };
}
function showForgot() {
  authShell(`<p class="sub">Type your email. We will make you a reset code.</p>
    <form id="f"><label for="e">Email</label><input id="e" type="email" required>
    <div class="err" id="err"></div><button class="btn full">Get reset code</button></form>
    <button class="link" id="bk">Back to log in</button>`);
  $('#bk').onclick = showLogin;
  $('#f').onsubmit = async e => {
    e.preventDefault();
    await api('/auth/forgot', 'POST', { email: $('#e').value });
    toast('Code made! In this class project it shows in the server terminal.'); showReset();
  };
}
function showReset() {
  authShell(`<p class="sub">Paste your code and choose a new password.</p>
    <form id="f"><label for="t">Reset code</label><input id="t" required>
    <label for="p">New password (8+ characters)</label><input id="p" type="password" minlength="8" required>
    <div class="err" id="err"></div><button class="btn full">Save new password</button></form>
    <button class="link" id="bk">Back to log in</button>`);
  $('#bk').onclick = showLogin;
  $('#f').onsubmit = async e => {
    e.preventDefault();
    try { await api('/auth/reset', 'POST', { token: $('#t').value.trim(), password: $('#p').value }); toast('Password changed. Please log in.'); showLogin(); }
    catch (x) { $('#err').textContent = x.message; }
  };
}

// ---- App shell (sidebar + pages) ----
const PAGES = [
  { id: 'dashboard', label: 'Dashboard', admin: true },
  { sec: 'Moderation' },
  { id: 'posts', label: 'Flagged posts' },
  { id: 'comments', label: 'Flagged comments' },
  { id: 'history', label: 'Moderation history' },
  { id: 'notifications', label: 'Notifications' },
  { sec: 'Administration', admin: true },
  { id: 'users', label: 'Users', admin: true },
  { id: 'audit', label: 'Audit logs', admin: true },
  { id: 'settings', label: 'Settings' }
];
async function start() {
  try { me = await api('/me'); } catch { return showLogin(); }
  setTheme(me.theme);
  const isAdmin = me.role === 'admin';
  const links = PAGES.filter(p => isAdmin || !p.admin).map(p => p.sec
    ? `<div class="sec">${p.sec}</div>` : `<a href="#${p.id}" data-p="${p.id}">${p.label}</a>`).join('');
  $('#root').innerHTML = `
    <div class="top"><div class="brand"><img class="logo-sm" src="logo.png" alt="MindSpace logo">MindSpace</div>
      <button class="btn ghost sm" id="menu" aria-label="Open menu">Menu</button></div>
    <div class="shell"><aside class="side" id="side">
      <div class="brand"><img class="logo-sm" src="logo.png" alt="MindSpace logo">MindSpace</div>
      <nav class="nav">${links}</nav>
      <div style="margin-top:auto"><div class="meta" style="padding:8px">${esc(me.name)} (${me.role})</div>
      <button class="btn ghost full" id="out" style="margin-top:4px">Log out</button></div></aside>
    <main class="main" id="main"></main></div>`;
  $('#out').onclick = logout;
  $('#menu').onclick = () => $('#side').classList.toggle('open');
  window.onhashchange = route; route();
}
const R = {};
function route() {
  const id = location.hash.slice(1) || (me.role === 'admin' ? 'dashboard' : 'posts');
  const page = PAGES.find(p => p.id === id && (me.role === 'admin' || !p.admin)) || PAGES.find(p => p.id === 'posts');
  document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('on', a.dataset.p === page.id));
  $('#side').classList.remove('open');
  R[page.id]().catch(e => $('#main').innerHTML = `<div class="card err">${esc(e.message)}</div>`);
}
const table = (heads, rows) => rows.length
  ? `<div class="tw"><table><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
  : '<div class="empty">Nothing here yet.</div>';

R.dashboard = async () => {
  const s = await api('/stats');
  const box = (n, l, hot) => `<div class="stat ${hot ? 'hot' : ''}"><b>${n}</b><span>${l}</span></div>`;
  $('#main').innerHTML = `<h1>Hello, ${esc(me.name)}!</h1><p class="sub">Here is how MindSpace is doing.</p>
    <div class="grid">${box(s.flagged, 'Waiting for review', 1)}${box(s.users, 'Members')}${box(s.moderators, 'Active moderators')}
    ${box(s.posts, 'Posts')}${box(s.comments, 'Comments')}${box(s.approved, 'Approved')}${box(s.removed, 'Removed')}</div>
    <div class="card"><h2>Quick steps</h2><div class="row">
    <a class="btn pink" href="#posts">Review flagged posts</a><a class="btn ghost" href="#users">Manage users</a>
    <a class="btn ghost" href="#audit">See audit logs</a></div></div>`;
};

async function flagged(type) {
  const rows = await api('/flagged?type=' + type);
  const kind = type === 'posts' ? 'post' : 'comment';
  $('#main').innerHTML = `<h1>Flagged ${type}</h1><p class="sub">Read each one, then approve or remove it.</p>
    <div class="card">${rows.length ? rows.map(r => `<div class="item"><div class="meta">${esc(r.author)} · ${when(r.created_at)} · <span class="badge">${esc(r.flag_reason || 'Flagged')}</span></div>
      <p>${esc(r.content)}</p><div class="row">
      <button class="btn sm" data-a="approved" data-id="${r.id}">Approve</button>
      <button class="btn danger sm" data-a="removed" data-id="${r.id}">Remove</button></div></div>`).join('') : '<div class="empty">All clean! No flagged ' + type + '.</div>'}</div>`;
  $('#main').querySelectorAll('button[data-a]').forEach(b => b.onclick = async () => {
    const note = b.dataset.a === 'removed' ? prompt('Why are you removing this? (optional)') : '';
    if (note === null) return;
    await api('/review', 'POST', { type: kind, id: +b.dataset.id, action: b.dataset.a, note });
    toast(b.dataset.a === 'approved' ? 'Approved' : 'Removed'); flagged(type);
  });
}
R.posts = () => flagged('posts');
R.comments = () => flagged('comments');

R.history = async () => {
  const rows = await api('/history');
  $('#main').innerHTML = `<h1>Moderation history</h1><p class="sub">Every decision, newest first.</p><div class="card">
    ${table(['When', 'Moderator', 'What', 'Decision', 'Note'], rows.map(r => `<tr><td>${when(r.created_at)}</td><td>${esc(r.moderator)}</td>
    <td>${r.content_type} #${r.content_id}</td><td><span class="badge ${r.action === 'approved' ? 'ok' : 'bad'}">${r.action}</span></td><td>${esc(r.note)}</td></tr>`))}</div>`;
};

R.notifications = async () => {
  const rows = await api('/notifications');
  $('#main').innerHTML = `<h1>Notifications</h1><p class="sub">News for you.</p><div class="card">
    ${rows.length ? rows.map(n => `<div class="item"><b>${n.is_read ? '' : '<span class="badge">New</span> '}${esc(n.message)}</b><div class="meta">${when(n.created_at)}</div></div>`).join('') : '<div class="empty">No news yet. </div>'}
    ${rows.some(n => !n.is_read) ? '<button class="btn pink" id="mr">Mark all as read</button>' : ''}</div>`;
  const mr = $('#mr'); if (mr) mr.onclick = async () => { await api('/notifications/read', 'POST'); R.notifications(); };
};

R.users = async () => {
  const rows = await api('/users');
  $('#main').innerHTML = `<div class="row" style="justify-content:space-between"><div><h1>Users</h1><p class="sub">Add people, change roles, turn accounts on or off.</p></div>
    <button class="btn pink" id="add">+ Add user</button></div>
    <div class="card"><input id="q" placeholder="Search by name or email" aria-label="Search users" style="margin-bottom:12px">
    <div id="ul"></div></div>`;
  const draw = () => {
    const q = $('#q').value.toLowerCase();
    $('#ul').innerHTML = table(['Name', 'Email', 'Role', 'Status', 'Actions'], rows.filter(u => (u.name + u.email).toLowerCase().includes(q)).map(u => `<tr>
      <td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${u.role}</td>
      <td><span class="badge ${u.active ? 'ok' : 'bad'}">${u.active ? 'Active' : 'Off'}</span></td>
      <td>${u.id === me.id ? '<span class="meta">You</span>' : `<button class="btn ghost sm" data-e="${u.id}">Edit</button>`}</td></tr>`));
    $('#ul').querySelectorAll('[data-e]').forEach(b => b.onclick = () => editUser(rows.find(u => u.id == b.dataset.e)));
  };
  $('#q').oninput = draw; draw();
  $('#add').onclick = () => modal(`<h2>Add user</h2><form id="mf"><label>Name</label><input id="n" required>
    <label>Email</label><input id="e" type="email" required><label>Temporary password (8+)</label><input id="p" type="password" minlength="8" required>
    <label>Role</label><select id="r"><option value="user">Member</option><option value="moderator">Moderator</option><option value="admin">Administrator</option></select>
    <div class="err" id="err"></div><div class="row" style="margin-top:14px"><button class="btn pink">Create</button><button type="button" class="btn ghost" id="x">Cancel</button></div></form>`,
    async () => { await api('/users', 'POST', { name: $('#n').value, email: $('#e').value, password: $('#p').value, role: $('#r').value }); toast('User created'); R.users(); });
};
function editUser(u) {
  modal(`<h2>${esc(u.name)}</h2><p class="meta">${esc(u.email)}</p><form id="mf"><label>Role</label>
    <select id="r">${['user', 'moderator', 'admin'].map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r === 'user' ? 'Member' : r}</option>`).join('')}</select>
    <label class="switch">Account is active <input type="checkbox" id="a" ${u.active ? 'checked' : ''}></label>
    <div class="err" id="err"></div><div class="row" style="margin-top:14px"><button class="btn pink">Save changes</button><button type="button" class="btn ghost" id="x">Cancel</button></div></form>`,
    async () => { await api('/users/' + u.id, 'PUT', { role: $('#r').value, active: $('#a').checked }); toast('Saved'); R.users(); });
}
function modal(html, onSave) {
  const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="card" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  m.querySelector('#x').onclick = close;
  m.querySelector('form').onsubmit = async e => { e.preventDefault(); try { await onSave(); close(); } catch (x) { m.querySelector('#err').textContent = x.message; } };
  const f = m.querySelector('input,select'); if (f) f.focus();
}

R.audit = async () => {
  const rows = await api('/audit');
  $('#main').innerHTML = `<h1>Audit logs</h1><p class="sub">Who did what, and when.</p><div class="card">
    ${table(['When', 'Who', 'Action', 'Details'], rows.map(r => `<tr><td>${when(r.created_at)}</td><td>${esc(r.name || '—')}</td><td><span class="badge">${esc(r.action)}</span></td><td>${esc(r.details)}</td></tr>`))}</div>`;
};

R.settings = async () => {
  const sys = me.role === 'admin' ? await api('/settings') : null;
  const sw = (id, label, on) => `<label class="switch">${label}<input type="checkbox" id="${id}" ${on ? 'checked' : ''}></label>`;
  $('#main').innerHTML = `<h1>Settings</h1><p class="sub">Make MindSpace feel like yours.</p>
    <div class="card"><h2>Profile details</h2><form id="pf"><label for="pn">Name</label><input id="pn" value="${esc(me.name)}" required>
      <label for="pe">Email</label><input id="pe" type="email" value="${esc(me.email)}" required><div class="err" id="pferr"></div>
      <button class="btn pink">Save profile</button></form></div>
    <div class="card"><h2>Change password</h2><form id="pw"><label for="cp">Current password</label><input id="cp" type="password" required>
      <label for="np">New password (8+ characters)</label><input id="np" type="password" minlength="8" required><div class="err" id="pwerr"></div>
      <button class="btn pink">Change password</button></form></div>
    <div class="card"><h2>Look and notifications</h2>
      ${sw('dark', 'Dark mode', me.theme === 'dark')}${sw('nf', 'Tell me about new flagged content', me.notify_flagged)}
      ${sw('ns', 'Tell me about system news', me.notify_system)}${sw('ne', 'Also send notifications by email', me.notify_email)}
      <button class="btn pink full" id="sp">Save preferences</button></div>
    ${sys ? `<div class="card"><h2>System settings</h2><form id="ss"><label for="sn">Site name</label><input id="sn" value="${esc(sys.site_name)}">
      <label for="sw">Words that auto-flag content (comma separated)</label><input id="sw" value="${esc(sys.auto_flag_words)}">
      <label for="sg">Allow new sign-ups</label><select id="sg"><option value="yes" ${sys.allow_signups === 'yes' ? 'selected' : ''}>Yes</option><option value="no" ${sys.allow_signups === 'no' ? 'selected' : ''}>No</option></select>
      <label for="sm">Maintenance mode</label><select id="sm"><option value="off" ${sys.maintenance_mode === 'off' ? 'selected' : ''}>Off</option><option value="on" ${sys.maintenance_mode === 'on' ? 'selected' : ''}>On</option></select>
      <button class="btn pink full">Save system settings</button></form></div>` : ''}`;
  $('#dark').onchange = e => setTheme(e.target.checked ? 'dark' : 'light'); // preview instantly
  $('#pf').onsubmit = async e => { e.preventDefault(); try { await api('/me', 'PUT', { name: $('#pn').value, email: $('#pe').value }); me = await api('/me'); toast('Profile saved'); } catch (x) { $('#pferr').textContent = x.message; } };
  $('#pw').onsubmit = async e => { e.preventDefault(); try { await api('/me/password', 'PUT', { current: $('#cp').value, next: $('#np').value }); toast('Password changed'); e.target.reset(); } catch (x) { $('#pwerr').textContent = x.message; } };
  $('#sp').onclick = async () => {
    await api('/me/prefs', 'PUT', { theme: $('#dark').checked ? 'dark' : 'light', notify_flagged: $('#nf').checked, notify_system: $('#ns').checked, notify_email: $('#ne').checked });
    me = await api('/me'); toast('Preferences saved');
  };
  if (sys) $('#ss').onsubmit = async e => { e.preventDefault();
    await api('/settings', 'PUT', { site_name: $('#sn').value, auto_flag_words: $('#sw').value, allow_signups: $('#sg').value, maintenance_mode: $('#sm').value }); toast('System settings saved'); };
};

// ---- Show/Hide button on every password box ----
function addReveal(input) {
  if (input.dataset.rv) return;
  input.dataset.rv = '1';
  const wrap = document.createElement('div'); wrap.className = 'pw-wrap';
  input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'pw-toggle'; btn.textContent = 'Show';
  btn.setAttribute('aria-label', 'Show password');
  btn.onclick = () => {
    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    btn.textContent = hidden ? 'Hide' : 'Show';
    btn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
  };
  wrap.appendChild(btn);
}
new MutationObserver(() => document.querySelectorAll('input[type=password]:not([data-rv])').forEach(addReveal))
  .observe(document.body, { childList: true, subtree: true });

localStorage.adminToken ? start() : showLogin();
