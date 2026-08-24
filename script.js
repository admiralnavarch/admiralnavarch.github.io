const CONFIG = {
  seal: {
    title: "SECURE ACCESS TERMINAL",
    subtitle: "CLASSIFICATION: TOP SECRET // NOFORN",
    hint: "CLICK TO AUTHENTICATE",
    warning: "UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE",
    starCount: 13
  },

  bootLines: [
    { text: "admiralOS — REV 1.21.5", cls: "accent" },
    { text: "(C) Directorate of Science & Technology", cls: "dim" },
    "",
    "CPU  : QUAD-CORE SECURE ENCLAVE @ 3.9GHz",
    "MEM  : 65,536 MB ......... OK",
    "TPM  : HARDWARE KEY VERIFIED",
    "",
    "DISK 0  : ENCRYPTED VOLUME  512GB  [AES-256]",
    "DISK 1  : ARCHIVE VOLUME   2.0TB  [OFFLINE]",
    "NET  0  : SECURE LINK ......... ESTABLISHED",
    { text: `SIG  0  : ${PUZZLE_ANSWERS.bootBinary}`, cls: "dim" },
    "",
    { text: "RUNNING INTEGRITY CHECK...", cls: "accent" },
    { text: "VERIFYING CREDENTIALS...", cls: "accent", holdAfter: 1200 },
    { text: "SESSION INITIALIZED.", cls: "accent", holdAfter: 700 }
  ],

  icons: [
    { glyph: "▣", label: "My Computer",    app: "mypc" },
    { glyph: "▶", label: "Command Prompt", app: "cmd" },
    { glyph: "✎", label: "Notepad",        app: "notepad" },
    { glyph: "▧", label: "Recon Grid",     app: "recon" },
    { glyph: "◐", label: "Paint",          app: "paint" },
    { glyph: "▲", label: "Snake.exe",      app: "snake" },
    { glyph: "▦", label: "Calculator",     app: "calc" },
    { glyph: "◈", label: "SURVEILLANCE.PNG", app: "imgview", hidden: true }
  ],

  notes: [
    {
      color: "yellow", top: 40, left: "62%",
      stamp: "SIGINT",
      lines: [ "the terminal listens", "for riddles, if asked" ]
    },
    {
      color: "yellow", top: 40, left: "78%",
      stamp: null,
      lines: [ [{cipher: PUZZLE_ANSWERS.morsePayload}], "signal designation —", "translate the dots" ]
    },
    {
      color: "yellow", top: 250, left: "78%",
      stamp: null,
      lines: [
        [{redact:"████████"}, " status —"],
        "pending review",
        [ "contact: ", {redact:"███████"} ]
      ]
    }
  ],

  apps: {
    mypc: {
      title: "MY COMPUTER",
      width: 400, height: 320,
      drives: [
        { glyph: "▣", label: "Encrypted Volume (C:)", info: "512 GB — 118 GB free", used: 77,
          meta: `OWNER: ADMIRAL7\nCREATED: 1991-04-02\nCOMMENT: ${PUZZLE_ANSWERS.metadataComment}` },
        { glyph: "▤", label: "Archive Volume (D:)",   info: "2.0 TB — offline",     used: 0,
          meta: "OWNER: UNKNOWN\nCREATED: —\nCOMMENT: (offline)" },
        { glyph: "▥", label: "Secure Share (E:)",     info: "Network drive",        used: 34,
          meta: "OWNER: FIELD OPS\nCREATED: 2019-11-02\nCOMMENT: standard issue" }
      ]
    },
    cmd: {
      title: "COMMAND PROMPT",
      width: 480, height: 320,
      prompt: "C:\\SECURE>",
      banner: "admiralOS TERMINAL [Rev 1.21.5]\nType HELP for a list of commands.\n"
    },
    notepad: {
      title: "NOTEPAD",
      width: 440, height: 300,
      placeholder: "Untitled — type to begin...",
      content: PUZZLE_ANSWERS.anomalyParagraph
    },
    imgview: {
      title: "IMAGE VIEWER",
      width: 340, height: 320
    },
    recon: {
      title: "RECON GRID",
      width: 340, height: 220
    },
    paint: {
      title: "PAINT",
      width: 440, height: 380
    },
    snake: {
      title: "SNAKE.EXE",
      width: 300, height: 360
    },
    calc: {
      title: "CALCULATOR",
      width: 240, height: 320
    }
  },

  taskbarClock: null,
  use24hClock: false,

  timing: { bootLineDelay: 170, postBootHold: 900, glitchDuration: 400 },

  puzzle: PUZZLE_ANSWERS
};

const sealScreen   = document.getElementById('seal-screen');
const bootScreen   = document.getElementById('boot-screen');
const bootLinesEl  = document.getElementById('boot-lines');
const desktop      = document.getElementById('desktop');
const windowsLayer = document.getElementById('windows-layer');
const taskbarApps  = document.getElementById('taskbar-apps');
const toastLayer   = document.getElementById('toast-layer');
const finaleFlash  = document.getElementById('finale-flash');

document.getElementById('seal-title').textContent    = CONFIG.seal.title;
document.getElementById('seal-subtitle').textContent = CONFIG.seal.subtitle;
document.getElementById('seal-hint').textContent     = CONFIG.seal.hint;
document.getElementById('seal-warn').textContent     = CONFIG.seal.warning;

let sequenceRunning = false;
let zCounter = 100;
let openWindowCount = 0;
let puzzleSolved = false;

(function drawStarRing(){
  const g = document.getElementById('star-ring');
  const n = CONFIG.seal.starCount;
  const r = 82;
  for(let i=0;i<n;i++){
    const angle = (i / n) * Math.PI * 2 - Math.PI/2;
    const cx = 120 + r * Math.cos(angle);
    const cy = 120 + r * Math.sin(angle);
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx', cx.toFixed(2));
    c.setAttribute('cy', cy.toFixed(2));
    c.setAttribute('r', 1.6);
    g.appendChild(c);
  }
})();

function startSequence(){
  if(sequenceRunning) return;
  sequenceRunning = true;
  sealScreen.classList.add('glitching');
  setTimeout(()=> sealScreen.classList.add('hidden'), CONFIG.timing.glitchDuration - 100);
  setTimeout(()=>{
    sealScreen.style.display = 'none';
    runBoot();
  }, CONFIG.timing.glitchDuration + 300);
}

function runBoot(){
  bootLinesEl.innerHTML = "";
  bootScreen.classList.add('show');
  let delayAcc = 0;

  CONFIG.bootLines.forEach((raw)=>{
    const isObj = typeof raw === 'object';
    const text = isObj ? raw.text : raw;
    const cls = isObj && raw.cls ? raw.cls : "";
    const extraHold = isObj && raw.holdAfter ? raw.holdAfter : 0;
    const span = document.createElement('span');
    span.textContent = text;
    if(cls) span.className = cls;
    span.style.animationDelay = delayAcc + 'ms';
    bootLinesEl.appendChild(span);
    delayAcc += CONFIG.timing.bootLineDelay + extraHold;
  });

  const cursor = document.createElement('span');
  cursor.innerHTML = '<span class="boot-cursor"></span>';
  cursor.style.animationDelay = delayAcc + 'ms';
  bootLinesEl.appendChild(cursor);

  setTimeout(loadDesktop, delayAcc + CONFIG.timing.postBootHold);
}

function loadDesktop(){
  buildIcons();
  buildNotes();
  startClock();
  startGeoJitter();

  desktop.classList.add('show');
  bootScreen.classList.remove('show');
  requestAnimationFrame(()=> requestAnimationFrame(()=> desktop.classList.add('visible')));
}

function startClock(){
  const clockEl = document.getElementById('clock');
  if(CONFIG.taskbarClock){ clockEl.textContent = CONFIG.taskbarClock; return; }
  function tick(){
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2,'0');
    let suffix = '';
    if(!CONFIG.use24hClock){ suffix = h >= 12 ? ' PM' : ' AM'; h = h % 12; if(h === 0) h = 12; }
    clockEl.textContent = `${h}:${m}${suffix}`;
  }
  tick();
  setInterval(tick, 15000);
}

function startGeoJitter(){
  const el = document.getElementById('geo-readout');
  const baseLat = 38.9517, baseLon = -77.1467;
  setInterval(()=>{
    const lat = (baseLat + (Math.random()-0.5)*0.0006).toFixed(4);
    const lon = (Math.abs(baseLon) + (Math.random()-0.5)*0.0006).toFixed(4);
    el.textContent = `${lat} N, ${lon} W`;
  }, 2200);
}

function buildIcons(){
  const grid = document.getElementById('icon-grid');
  grid.innerHTML = "";
  CONFIG.icons.forEach(ic=>{
    if(ic.hidden) return;
    grid.appendChild(makeIconEl(ic));
  });
}
function makeIconEl(ic){
  const el = document.createElement('div');
  el.className = 'desk-icon';
  el.innerHTML = `<div class="glyph">${ic.glyph}</div><div class="label">${ic.label}</div>`;
  el.addEventListener('click', ()=> openApp(ic.app));
  el.addEventListener('dblclick', ()=> openApp(ic.app));
  return el;
}
function revealHiddenIcon(appKey){
  const ic = CONFIG.icons.find(i=> i.app === appKey);
  if(!ic || !ic.hidden) return;
  ic.hidden = false;
  document.getElementById('icon-grid').appendChild(makeIconEl(ic));
  showToast('SIGNAL DETECTED — NEW ASSET AVAILABLE');
}

function renderLineParts(parts){
  if(typeof parts === 'string') return escapeHtml(parts);
  return parts.map(p=>{
    if(typeof p === 'string') return escapeHtml(p);
    if(p.redact) return `<span class="redact">${escapeHtml(p.redact)}</span>`;
    if(p.cipher) return `<span class="cipher">${escapeHtml(p.cipher)}</span>`;
    return "";
  }).join("");
}
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function buildNotes(){
  const layer = document.getElementById('notes-layer');
  layer.innerHTML = "";
  CONFIG.notes.forEach(n=>{
    const el = document.createElement('div');
    el.className = 'sticky ' + (n.color || 'yellow');
    el.style.top = n.top + 'px';
    el.style.left = n.left;
    const stampHtml = n.stamp ? `<div class="stamp">${escapeHtml(n.stamp)}</div><br>` : '';
    const bodyHtml = n.lines.map(l=>renderLineParts(l)).join('<br>');
    el.innerHTML = `<div class="titlebar"><span>MEMO</span><span class="note-close">×</span></div><div class="body">${stampHtml}${bodyHtml}</div>`;
    el.querySelector('.note-close').addEventListener('click', (e)=>{ e.stopPropagation(); el.remove(); });
    makeDraggable(el, el.querySelector('.titlebar'));
    layer.appendChild(el);
  });
}

function makeDraggable(el, handle, onMoveStart){
  let startX, startY, startLeft, startTop, dragging = false;
  function beginDrag(clientX, clientY){
    dragging = true;
    el.classList.add('dragging');
    el.style.zIndex = ++zCounter;
    if(onMoveStart) onMoveStart();
    const rect = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();
    startLeft = rect.left - parentRect.left;
    startTop  = rect.top - parentRect.top;
    el.style.left = startLeft + 'px';
    el.style.top  = startTop + 'px';
    startX = clientX; startY = clientY;
  }
  handle.addEventListener('mousedown', (e)=>{ beginDrag(e.clientX, e.clientY); e.preventDefault(); });
  window.addEventListener('mousemove', (e)=>{
    if(!dragging) return;
    el.style.left = (startLeft + (e.clientX - startX)) + 'px';
    el.style.top  = (startTop + (e.clientY - startY)) + 'px';
  });
  window.addEventListener('mouseup', ()=>{ if(!dragging) return; dragging = false; el.classList.remove('dragging'); });

  handle.addEventListener('touchstart', (e)=>{ const t = e.touches[0]; beginDrag(t.clientX, t.clientY); }, {passive:true});
  window.addEventListener('touchmove', (e)=>{
    if(!dragging) return;
    const t = e.touches[0];
    el.style.left = (startLeft + (t.clientX - startX)) + 'px';
    el.style.top  = (startTop + (t.clientY - startY)) + 'px';
  }, {passive:true});
  window.addEventListener('touchend', ()=>{ dragging = false; el.classList.remove('dragging'); });
}

function makeResizable(el, handle, minW, minH){
  let startX, startY, startW, startH, resizing = false;
  handle.addEventListener('mousedown', (e)=>{
    resizing = true; startX = e.clientX; startY = e.clientY;
    const rect = el.getBoundingClientRect(); startW = rect.width; startH = rect.height;
    e.stopPropagation(); e.preventDefault();
  });
  window.addEventListener('mousemove', (e)=>{
    if(!resizing) return;
    el.style.width = Math.max(minW, startW + (e.clientX - startX)) + 'px';
    el.style.height = Math.max(minH, startH + (e.clientY - startY)) + 'px';
  });
  window.addEventListener('mouseup', ()=> resizing = false);
}

function showToast(text){
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  toastLayer.appendChild(t);
  setTimeout(()=> t.remove(), 3600);
}

let openOffset = 0;
const openWindows = {};

function openApp(appKey){
  if(!appKey || !CONFIG.apps[appKey]) return;
  const cfg = CONFIG.apps[appKey];
  const winId = 'win-' + (++openWindowCount);

  const win = document.createElement('div');
  win.className = 'app-window';
  win.dataset.id = winId;
  win.dataset.app = appKey;
  win.style.width = cfg.width + 'px';
  win.style.height = cfg.height + 'px';
  win.style.left = (60 + openOffset) + 'px';
  win.style.top  = (50 + openOffset) + 'px';
  win.style.zIndex = ++zCounter;
  openOffset = (openOffset + 28) % 140;

  const bodyClassMap = { mypc:'mypc', notepad:'notepad', imgview:'imgview', recon:'recon', paint:'paint', snake:'snake', calc:'calc' };
  const bodyClass = bodyClassMap[appKey] || 'cmd';

  win.innerHTML = `
    <div class="win-titlebar">
      <span class="win-title-text">${cfg.title}</span>
      <div class="win-controls">
        <span class="win-min" title="Minimize">_</span>
        <span class="win-close" title="Close">×</span>
      </div>
    </div>
    <div class="win-body ${bodyClass}">${appBodyHtml(appKey, cfg)}</div>
    <div class="resize-handle" title="Resize"></div>
  `;

  win.querySelector('.win-close').addEventListener('click', (e)=>{ e.stopPropagation(); win.remove(); removeTaskbarEntry(winId); });
  win.querySelector('.win-min').addEventListener('click', (e)=>{ e.stopPropagation(); win.style.display = 'none'; });
  win.addEventListener('mousedown', ()=>{ win.style.zIndex = ++zCounter; setActiveTaskbarEntry(winId); });

  makeDraggable(win, win.querySelector('.win-titlebar'), ()=> setActiveTaskbarEntry(winId));
  makeResizable(win, win.querySelector('.resize-handle'), 260, 160);

  windowsLayer.appendChild(win);
  addTaskbarEntry(winId, cfg.title, win);

  if(appKey === 'cmd'){
    const input = win.querySelector('.win-body.cmd input');
    if(input) setTimeout(()=> input.focus(), 50);
  }
  if(appKey === 'imgview'){
    initImageViewer(win);
  }
  if(appKey === 'recon'){
    initRecon(win);
  }
  if(appKey === 'paint'){
    initPaint(win);
  }
  if(appKey === 'snake'){
    initSnake(win, winId);
  }
  if(appKey === 'calc'){
    initCalc(win);
  }
  if(appKey === 'mypc'){
    win.querySelectorAll('.drive').forEach(row=>{
      row.style.cursor = 'pointer';
      row.addEventListener('click', ()=>{
        if(row.dataset.used === '0'){
          showToast('VOLUME OFFLINE — MOUNT VIA TERMINAL');
        }
      });
    });
    win.querySelectorAll('.drive-info-btn').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const meta = btn.closest('.drive').querySelector('.drive-meta');
        meta.classList.toggle('show');
      });
    });
  }
}

function addTaskbarEntry(winId, title, winEl){
  const entry = document.createElement('div');
  entry.className = 'taskbar-app active';
  entry.textContent = title;
  entry.dataset.id = winId;
  entry.addEventListener('click', ()=>{
    winEl.style.display = winEl.style.display === 'none' ? 'flex' : 'none';
    winEl.style.zIndex = ++zCounter;
    setActiveTaskbarEntry(winId);
  });
  taskbarApps.appendChild(entry);
  openWindows[winId] = { el: winEl, taskbarEl: entry };
  setActiveTaskbarEntry(winId);
}
function removeTaskbarEntry(winId){
  const rec = openWindows[winId];
  if(rec){ rec.taskbarEl.remove(); delete openWindows[winId]; }
}
function setActiveTaskbarEntry(winId){
  Object.keys(openWindows).forEach(id=> openWindows[id].taskbarEl.classList.toggle('active', id === winId));
}

function appBodyHtml(appKey, cfg){
  if(appKey === 'mypc'){
    const rows = cfg.drives.map(d=>
      `<div class="drive" data-used="${d.used}">
         <div class="glyph">${d.glyph}</div>
         <div style="flex:1;">
           <div class="drive-row-head">
             <div class="label">${d.label}</div>
             <button class="drive-info-btn">ⓘ</button>
           </div>
           <div class="info">${d.info}</div>
           <div class="bar-track"><div class="bar-fill" style="width:${d.used}%"></div></div>
           <div class="drive-meta">${escapeHtml(d.meta || '').replace(/\n/g,'<br>')}</div>
         </div>
       </div>`
    ).join('');
    return `<div class="mypc-head">SYSTEM VOLUMES</div>${rows}`;
  }
  if(appKey === 'cmd'){
    const banner = escapeHtml(cfg.banner || '');
    return `<div class="cmd-history">${banner.split('\n').map(l=>`<div class="cmd-line">${l}</div>`).join('')}</div><div class="cmd-input-line"><span class="cmd-prompt">${escapeHtml(cfg.prompt)}&nbsp;</span><input type="text" autocomplete="off" spellcheck="false"></div>`;
  }
  if(appKey === 'notepad'){
    return `<div class="notepad-wrap"><textarea placeholder="${escapeHtml(cfg.placeholder||'')}">${escapeHtml(cfg.content||'')}</textarea></div>`;
  }
  if(appKey === 'imgview'){
    const wid = 'iv-' + openWindowCount;
    return `<div class="imgview-wrap" data-canvas-id="${wid}">
      <div class="imgview-canvas-holder"><canvas id="${wid}" width="240" height="140"></canvas></div>
      <button class="imgview-btn">RUN ANALYSIS</button>
      <div class="imgview-result">No anomalies flagged yet.</div>
    </div>`;
  }
  if(appKey === 'recon'){
    return `<div class="recon-wrap"><canvas class="recon-canvas" width="300" height="120"></canvas></div>`;
  }
  if(appKey === 'paint'){
    return `<div class="paint-wrap">
      <div class="paint-toolbar">
        <div class="paint-swatches"></div>
        <div class="paint-sizes">
          <button class="paint-size-btn" data-size="2">S</button>
          <button class="paint-size-btn active" data-size="5">M</button>
          <button class="paint-size-btn" data-size="10">L</button>
        </div>
        <button class="paint-clear-btn">CLEAR</button>
      </div>
      <canvas class="paint-canvas" width="400" height="300"></canvas>
    </div>`;
  }
  if(appKey === 'snake'){
    return `<div class="snake-wrap">
      <div class="snake-hud"><span>SCORE: <span class="snake-score">0</span></span></div>
      <canvas class="snake-canvas" width="240" height="240"></canvas>
      <div class="snake-status">USE ARROW KEYS — SPACE TO START</div>
    </div>`;
  }
  if(appKey === 'calc'){
    const keys = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];
    const keyHtml = keys.map(k=>`<button class="calc-key" data-key="${k}">${k}</button>`).join('');
    return `<div class="calc-wrap">
      <div class="calc-display">0</div>
      <div class="calc-grid">${keyHtml}</div>
      <button class="calc-clear">C</button>
    </div>`;
  }
  return '';
}

const MORSE_TABLE = {
  '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I',
  '.---':'J','-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R',
  '...':'S','-':'T','..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z',
  '-----':'0','.----':'1','..---':'2','...--':'3','....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9'
};
function morseDecode(code){
  return code.trim().split(/\s+/).map(g=> g === '/' ? ' ' : (MORSE_TABLE[g] || '?')).join('');
}
function binaryDecode(bits){
  const groups = bits.trim().split(/\s+/);
  return groups.map(g=>{
    if(!/^[01]{1,8}$/.test(g)) throw new Error('bad group');
    return String.fromCharCode(parseInt(g,2));
  }).join('');
}
function hexToStr(hex){
  let out = '';
  for(let i=0;i<hex.length;i+=2) out += String.fromCharCode(parseInt(hex.substr(i,2),16));
  return out;
}
function autoDecode(str){
  str = str.trim();
  if(/^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0) return hexToStr(str);
  if(/^[A-Za-z0-9+/]+=*$/.test(str) && str.length % 4 === 0){
    try{ return atob(str); }catch(e){}
  }
  return "UNRECOGNIZED FORMAT.";
}

const CMD_HELP = [
  "AVAILABLE COMMANDS:",
  "  HELP               show this list",
  "  DIR                list files in current volume",
  "  WHOAMI             display current session identity",
  "  DATE               display current date",
  "  CLEAR              clear the screen",
  "  ECHO [txt]         print text back",
  "  AUTHENTICATE [code] verify field credentials",
  "  EXIT               close this window"
].join('\n');

function runCommand(raw, cmdBody, win){
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  const parts = trimmed.split(' ');
  const cmd = parts[0] ? parts[0].toUpperCase() : '';

  if(cmd === 'HELP') return { text: CMD_HELP };
  if(cmd === 'DIR') return { text: "Volume in drive C is SECURE\n\n  ops_log.txt\n  contacts.dat\n  readme.txt\n\n  3 File(s)" };
  if(cmd === 'WHOAMI') return { text: "SECURE\\ANALYST" };
  if(cmd === 'DATE') return { text: new Date().toString() };
  if(cmd === 'ECHO') return { text: parts.slice(1).join(' ') };
  if(cmd === 'DECODE'){
    const payload = trimmed.slice(cmd.length).trim();
    if(!payload) return { text: "USAGE: DECODE <text>", cls: "err" };
    return { text: autoDecode(payload) };
  }
  if(cmd === 'MORSE'){
    const payload = trimmed.slice(cmd.length).trim();
    if(!payload) return { text: "USAGE: MORSE <code>", cls: "err" };
    return { text: morseDecode(payload) };
  }
  if(cmd === 'BINARY'){
    const payload = trimmed.slice(cmd.length).trim();
    if(!payload) return { text: "USAGE: BINARY <bits>", cls: "err" };
    try{ return { text: binaryDecode(payload) }; }
    catch(e){ return { text: "MALFORMED BINARY INPUT.", cls: "err" }; }
  }
  if(cmd === 'TYPE'){
    const filename = (parts[1] || '').toLowerCase();
    if(filename === 'ops_log.txt') return { text: CONFIG.puzzle.acrosticFile };
    if(filename === 'contacts.dat') return { text: CONFIG.puzzle.telestichFile };
    if(filename === 'readme.txt') return { text: "No further documentation on file." };
    return { text: `FILE NOT FOUND: ${parts[1] || ''}`, cls: "err" };
  }
  if(cmd === 'RIDDLE'){
    return { text: CONFIG.puzzle.riddleText };
  }
  if(cmd === 'STATIONS'){
    return { text: CONFIG.puzzle.stationsMap };
  }
  if(cmd === 'MOUNT'){
    const target = (parts[1] || '').toUpperCase();
    if(target !== 'ARCHIVE') return { text: `CANNOT MOUNT '${parts[1]||''}' — VOLUME NOT FOUND.`, cls: "err" };
    openArchiveWindow();
    return { text: "ARCHIVE VOLUME MOUNTED. INDEX WRITTEN TO DESKTOP.", cls: "ok" };
  }
  if(cmd === 'AUTHENTICATE'){
    const code = parts.slice(1).join('').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if(!code) return { text: "USAGE: AUTHENTICATE <code>", cls: "err" };
    if(code === CONFIG.puzzle.passphrase){
      triggerFinale();
      return { text: "ACCESS GRANTED. WELCOME BACK.", cls: "ok" };
    }
    return { text: "ACCESS DENIED — CREDENTIALS NOT RECOGNIZED.", cls: "err" };
  }
  if(cmd === 'CLEAR'){
    const history = cmdBody.querySelector('.cmd-history');
    if(history) history.innerHTML = '';
    return null;
  }
  if(cmd === 'EXIT'){
    win.remove();
    removeTaskbarEntry(win.dataset.id);
    return null;
  }
  if(trimmed === '') return null;
  return { text: `'${trimmed}' is not recognized as an internal command.\nType HELP for a list of commands.`, cls: "err" };
}

windowsLayer.addEventListener('keydown', (e)=>{
  if(e.target.matches('.win-body.cmd input') && e.key === 'Enter'){
    const input = e.target;
    const cmdBody = input.closest('.win-body.cmd');
    const win = input.closest('.app-window');
    const history = cmdBody.querySelector('.cmd-history');
    const promptText = cmdBody.querySelector('.cmd-prompt').textContent;

    const echo = document.createElement('div');
    echo.className = 'cmd-line';
    echo.textContent = promptText + input.value;
    history.appendChild(echo);

    const result = runCommand(input.value, cmdBody, win);
    if(result && result.text){
      result.text.split('\n').forEach(line=>{
        const l = document.createElement('div');
        l.className = 'cmd-line' + (result.cls ? ' ' + result.cls : '');
        l.textContent = line;
        history.appendChild(l);
      });
    }
    input.value = '';
    cmdBody.scrollTop = cmdBody.scrollHeight;
  }
});

function initImageViewer(win){
  const canvas = win.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  let seed = 42;
  function rand(){ seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  ctx.fillStyle = '#050607';
  ctx.fillRect(0, 0, w, h);
  for(let x=0; x<w; x+=4){
    const v = 20 + Math.floor(rand()*30);
    ctx.fillStyle = `rgb(${v},${v+4},${v+6})`;
    ctx.fillRect(x, 0, 4, h);
  }
  ctx.strokeStyle = 'rgba(198,161,91,0.25)';
  ctx.beginPath();
  ctx.arc(w/2, h/2, 40, 0, Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
  ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
  ctx.stroke();

  const message = CONFIG.puzzle.stegoPayload;
  const imgData = ctx.getImageData(0, 0, w, h);
  let bitIndex = 0;
  outer:
  for(let c=0; c<message.length; c++){
    const code = message.charCodeAt(c);
    for(let b=7; b>=0; b--){
      const bit = (code >> b) & 1;
      const pixelIndex = bitIndex * 4;
      if(pixelIndex >= imgData.data.length) break outer;
      imgData.data[pixelIndex] = (imgData.data[pixelIndex] & 0xFE) | bit;
      bitIndex++;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const btn = win.querySelector('.imgview-btn');
  const result = win.querySelector('.imgview-result');
  btn.addEventListener('click', ()=>{
    const data = ctx.getImageData(0, 0, w, h).data;
    let bits = '';
    for(let i=0; i<message.length*8; i++){
      bits += (data[i*4] & 1);
    }
    let decoded = '';
    for(let i=0; i<bits.length; i+=8){
      decoded += String.fromCharCode(parseInt(bits.substr(i,8), 2));
    }
    result.textContent = `LSB ANOMALY DECODED: "${decoded}"`;
    result.classList.add('revealed');
  });
}

let typedBuffer = '';

function initRecon(win){
  const canvas = win.querySelector('.recon-canvas');
  const ctx = canvas.getContext('2d');
  const word = CONFIG.puzzle.visualWord;
  const dotIndex = CONFIG.puzzle.visualDotIndex;
  const tileW = 40, tileH = 40, gap = 8;
  const startX = (canvas.width - (word.length * tileW + (word.length-1) * gap)) / 2;
  const y = 46;

  ctx.fillStyle = '#0c0e12';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for(let i=0;i<word.length;i++){
    const x = startX + i * (tileW + gap);
    ctx.strokeStyle = '#21242c';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, tileW, tileH);
    ctx.fillStyle = '#9a9a93';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word[i], x + tileW/2, y + tileH/2);

    if(i === dotIndex - 1){
      ctx.fillStyle = '#c6a15b';
      const dotY = y - 14;
      for(let d=0; d<dotIndex; d++){
        ctx.beginPath();
        ctx.arc(x + 8 + d*10, dotY, 2.5, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }
}

function initPaint(win){
  const canvas = win.querySelector('.paint-canvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0c0e12';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const colors = ['#ecebe6','#c6a15b','#6cc491','#c15b50','#5a7fae','#9a9a93'];
  const swatchHolder = win.querySelector('.paint-swatches');
  let currentColor = colors[0];
  let currentSize = 5;
  colors.forEach((c,i)=>{
    const sw = document.createElement('div');
    sw.className = 'paint-swatch' + (i===0 ? ' active' : '');
    sw.style.background = c;
    sw.addEventListener('click', ()=>{
      swatchHolder.querySelectorAll('.paint-swatch').forEach(s=>s.classList.remove('active'));
      sw.classList.add('active');
      currentColor = c;
    });
    swatchHolder.appendChild(sw);
  });

  win.querySelectorAll('.paint-size-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      win.querySelectorAll('.paint-size-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = parseInt(btn.dataset.size, 10);
    });
  });
  win.querySelector('.paint-clear-btn').addEventListener('click', ()=>{
    ctx.fillStyle = '#0c0e12';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  });

  let drawing = false;
  function pos(e){
    const rect = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x: cx * (canvas.width/rect.width), y: cy * (canvas.height/rect.height) };
  }
  function start(e){ drawing = true; draw(e); }
  function stop(){ drawing = false; ctx.beginPath(); }
  function draw(e){
    if(!drawing) return;
    const p = pos(e);
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    e.preventDefault();
  }
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stop);
  canvas.addEventListener('touchstart', start, {passive:false});
  canvas.addEventListener('touchmove', draw, {passive:false});
  canvas.addEventListener('touchend', stop);
}

const snakeGames = {};
let activeSnakeId = null;

function initSnake(win, winId){
  const canvas = win.querySelector('.snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = win.querySelector('.snake-score');
  const statusEl = win.querySelector('.snake-status');
  const cell = 12;
  const cols = canvas.width / cell;
  const rows = canvas.height / cell;

  const state = {
    snake: [{x:7,y:7},{x:6,y:7},{x:5,y:7}],
    dir: {x:1,y:0},
    nextDir: {x:1,y:0},
    food: {x:10,y:10},
    running: false,
    over: false,
    score: 0,
    interval: null
  };
  snakeGames[winId] = state;

  function placeFood(){
    state.food = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) };
  }
  function draw(){
    ctx.fillStyle = '#0c0e12';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#c15b50';
    ctx.fillRect(state.food.x*cell, state.food.y*cell, cell-1, cell-1);
    ctx.fillStyle = '#6cc491';
    state.snake.forEach((s,i)=>{
      ctx.fillStyle = i===0 ? '#e6c583' : '#6cc491';
      ctx.fillRect(s.x*cell, s.y*cell, cell-1, cell-1);
    });
  }
  function tick(){
    state.dir = state.nextDir;
    const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
    if(head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || state.snake.some(s=> s.x===head.x && s.y===head.y)){
      state.running = false;
      state.over = true;
      clearInterval(state.interval);
      statusEl.textContent = 'GAME OVER — SPACE TO RESTART';
      return;
    }
    state.snake.unshift(head);
    if(head.x === state.food.x && head.y === state.food.y){
      state.score++;
      scoreEl.textContent = state.score;
      placeFood();
    } else {
      state.snake.pop();
    }
    draw();
  }
  function startGame(){
    if(state.running) return;
    state.snake = [{x:7,y:7},{x:6,y:7},{x:5,y:7}];
    state.dir = {x:1,y:0}; state.nextDir = {x:1,y:0};
    state.score = 0; scoreEl.textContent = 0;
    state.over = false; state.running = true;
    placeFood();
    statusEl.textContent = 'ARROW KEYS TO STEER';
    clearInterval(state.interval);
    state.interval = setInterval(tick, 130);
  }
  draw();

  win.addEventListener('mousedown', ()=> activeSnakeId = winId);
  win.addEventListener('touchstart', ()=> activeSnakeId = winId);
  activeSnakeId = winId;
  state.start = startGame;

  win.querySelector('.win-close').addEventListener('click', ()=>{
    clearInterval(state.interval);
    delete snakeGames[winId];
    if(activeSnakeId === winId) activeSnakeId = null;
  });
}

function initCalc(win){
  const display = win.querySelector('.calc-display');
  let current = '0';
  let stored = null;
  let pendingOp = null;
  let freshEntry = true;

  function render(){ display.textContent = current; }
  function applyOp(){
    if(stored === null || pendingOp === null) return;
    const a = parseFloat(stored), b = parseFloat(current);
    let r = b;
    if(pendingOp === '+') r = a + b;
    if(pendingOp === '-') r = a - b;
    if(pendingOp === '*') r = a * b;
    if(pendingOp === '/') r = b === 0 ? 0 : a / b;
    current = String(Math.round(r * 1e8) / 1e8);
  }

  win.querySelectorAll('.calc-key').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.dataset.key;
      if(k === '='){
        applyOp();
        stored = null; pendingOp = null; freshEntry = true;
      } else if(['+','-','*','/'].includes(k)){
        if(stored !== null && pendingOp !== null && !freshEntry) applyOp();
        stored = current;
        pendingOp = k;
        freshEntry = true;
      } else if(k === '.'){
        if(freshEntry){ current = '0.'; freshEntry = false; }
        else if(!current.includes('.')) current += '.';
      } else {
        if(freshEntry || current === '0'){ current = k; freshEntry = false; }
        else current += k;
      }
      render();
    });
  });
  win.querySelector('.calc-clear').addEventListener('click', ()=>{
    current = '0'; stored = null; pendingOp = null; freshEntry = true;
    render();
  });
}

document.addEventListener('keydown', (e)=>{
  if(activeSnakeId && snakeGames[activeSnakeId]){
    const state = snakeGames[activeSnakeId];
    const tag = document.activeElement && document.activeElement.tagName;
    if(tag !== 'INPUT' && tag !== 'TEXTAREA'){
      if(e.key === ' '){ if(!state.running) state.start(); e.preventDefault(); }
      if(e.key === 'ArrowUp' && state.dir.y === 0){ state.nextDir = {x:0,y:-1}; e.preventDefault(); }
      if(e.key === 'ArrowDown' && state.dir.y === 0){ state.nextDir = {x:0,y:1}; e.preventDefault(); }
      if(e.key === 'ArrowLeft' && state.dir.x === 0){ state.nextDir = {x:-1,y:0}; e.preventDefault(); }
      if(e.key === 'ArrowRight' && state.dir.x === 0){ state.nextDir = {x:1,y:0}; e.preventDefault(); }
    }
  }
});

document.addEventListener('keydown', (e)=>{
  const tag = document.activeElement && document.activeElement.tagName;
  if(tag === 'INPUT' || tag === 'TEXTAREA') return;
  if(e.key.length === 1){
    typedBuffer = (typedBuffer + e.key.toUpperCase()).slice(-20);
    if(typedBuffer.includes(CONFIG.puzzle.keyword)){
      revealHiddenIcon('imgview');
      typedBuffer = '';
    }
  }
});

function triggerFinale(){
  if(puzzleSolved) return;
  puzzleSolved = true;
  finaleFlash.classList.add('play');
  setTimeout(()=> finaleFlash.classList.remove('play'), 1200);
  setTimeout(openDossier, 500);
}

let archiveOpened = false;
function openArchiveWindow(){
  if(archiveOpened) return;
  archiveOpened = true;
  const win = document.createElement('div');
  win.className = 'app-window';
  win.style.width = '360px';
  win.style.height = '240px';
  win.style.left = '120px';
  win.style.top = '110px';
  win.style.zIndex = ++zCounter;
  win.innerHTML = `
    <div class="win-titlebar">
      <span class="win-title-text">ARCHIVE_INDEX.TXT</span>
      <div class="win-controls"><span class="win-close" title="Close">×</span></div>
    </div>
    <div class="win-body" style="padding:16px; font-family:var(--font-mono); font-size:12px; line-height:1.8; white-space:pre-line;">${escapeHtml(CONFIG.puzzle.archiveNote)}</div>
    <div class="resize-handle" title="Resize"></div>
  `;
  win.querySelector('.win-close').addEventListener('click', ()=> win.remove());
  makeDraggable(win, win.querySelector('.win-titlebar'));
  makeResizable(win, win.querySelector('.resize-handle'), 260, 160);
  windowsLayer.appendChild(win);
}

function openDossier(){
  const win = document.createElement('div');
  win.className = 'app-window';
  win.style.width = '360px';
  win.style.height = '340px';
  win.style.left = '50%';
  win.style.top = '50%';
  win.style.transform = 'translate(-50%,-50%)';
  win.style.zIndex = ++zCounter;

  win.innerHTML = `
    <div class="win-titlebar">
      <span class="win-title-text">CASE FILE — CLOSED</span>
      <div class="win-controls"><span class="win-close" title="Close">×</span></div>
    </div>
    <div class="win-body" style="overflow:auto;">
      <div class="dossier-body">
        <svg class="dossier-seal" width="70" height="70" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#6cc491" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="none" stroke="#6cc491" stroke-width="1"/>
          <path d="M50,26 L56,42 L74,42 L59,52 L65,70 L50,59 L35,70 L41,52 L26,42 L44,42 Z" fill="#6cc491"/>
        </svg>
        <div class="dossier-title">CLEARANCE ELEVATED</div>
        <div class="dossier-sub">CASE NIGHTSHADE — RESOLVED</div>
        <div class="dossier-line">Ten stations cross-referenced and decoded.</div>
        <div class="dossier-line">Index cipher resolved into a single credential.</div>
        <div class="dossier-line" style="margin-top:14px;color:#6cc491;">All layers decrypted. Session complete.</div>
      </div>
    </div>
  `;
  win.querySelector('.win-close').addEventListener('click', ()=> win.remove());
  makeDraggable(win, win.querySelector('.win-titlebar'));
  windowsLayer.appendChild(win);
}

sealScreen.addEventListener('click', startSequence);

document.getElementById('reset-btn').addEventListener('click', ()=>{
  sequenceRunning = false;
  puzzleSolved = false;
  archiveOpened = false;
  typedBuffer = '';
  Object.keys(snakeGames).forEach(id=>{ clearInterval(snakeGames[id].interval); delete snakeGames[id]; });
  activeSnakeId = null;
  CONFIG.icons.forEach(ic=>{ if(ic.app === 'imgview') ic.hidden = true; });
  desktop.classList.remove('show','visible');
  bootScreen.classList.remove('show');
  windowsLayer.innerHTML = '';
  taskbarApps.innerHTML = '';
  Object.keys(openWindows).forEach(k=> delete openWindows[k]);
  sealScreen.classList.remove('glitching');
  sealScreen.style.display = 'flex';
  requestAnimationFrame(()=> sealScreen.classList.remove('hidden'));
});
