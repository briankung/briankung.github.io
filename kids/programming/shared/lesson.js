// ── Canvas & resize ──────────────────────────────────────────────────────
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var _loopId = null;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.WIDTH = canvas.width;
  window.HEIGHT = canvas.height;
  if (typeof drawPlaceholder === 'function' && !_loopId) drawPlaceholder();
}
window.addEventListener('resize', resize);

// ── Primitives (available in the editor & browser console) ────────────────
window.clear = function(color) {
  ctx.fillStyle = color || '#000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

window.circle = function(x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fillStyle = color || 'white';
  ctx.fill();
};

window.rect = function(x, y, w, h, color) {
  ctx.fillStyle = color || 'white';
  ctx.fillRect(x, y, w, h);
};

window.line = function(x1, y1, x2, y2, color, lineWidth) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color || 'white';
  ctx.lineWidth = lineWidth || 1;
  ctx.stroke();
};

window.text = function(str, x, y, color, size) {
  ctx.fillStyle = color || 'white';
  ctx.font = (size || 16) + 'px monospace';
  ctx.fillText(str, x, y);
};

window.ring = function(x, y, r, color, lineWidth) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  ctx.strokeStyle = color || 'white';
  ctx.lineWidth = lineWidth || 1;
  ctx.stroke();
};

window.loop = function(fn) {
  if (_loopId) cancelAnimationFrame(_loopId);
  function step() { fn(); _loopId = requestAnimationFrame(step); }
  _loopId = requestAnimationFrame(step);
};

window.stop = function() {
  if (_loopId) { cancelAnimationFrame(_loopId); _loopId = null; }
};

window.random = function(min, max) {
  return min + Math.random() * (max - min);
};

window.ctx = ctx;

// NOTE: resize() is not called here — each lesson calls it after defining drawPlaceholder()

// ── Panel ────────────────────────────────────────────────────────────────
var panelCollapsed = false;

(function() {
  var panelEl = document.getElementById('panel');
  var handleEl = document.getElementById('panel-handle');
  var dragging = false;
  var startY, startH;

  function onStart(y) { dragging = true; startY = y; startH = panelEl.offsetHeight; }
  function onMove(y) {
    if (!dragging) return;
    var h = Math.max(50, Math.min(window.innerHeight - 60, startH + (startY - y)));
    panelEl.style.height = h + 'px';
  }
  function onEnd() { dragging = false; }

  handleEl.addEventListener('mousedown', function(e) { onStart(e.clientY); e.preventDefault(); });
  document.addEventListener('mousemove', function(e) { onMove(e.clientY); });
  document.addEventListener('mouseup', onEnd);
  handleEl.addEventListener('touchstart', function(e) { onStart(e.touches[0].clientY); e.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', function(e) { if (dragging) { onMove(e.touches[0].clientY); e.preventDefault(); } }, { passive: false });
  document.addEventListener('touchend', onEnd);
})();

function togglePanel() {
  panelCollapsed = !panelCollapsed;
  document.getElementById('panel').classList.toggle('collapsed', panelCollapsed);
  document.getElementById('panel-toggle').innerHTML =
    panelCollapsed ? 'show &#9650;' : 'hide &#9660;';
}

// ── Editor ───────────────────────────────────────────────────────────────
function runCode() {
  stop();
  document.getElementById('error').textContent = '';
  try {
    eval(document.getElementById('editor').value);
  } catch(e) {
    document.getElementById('error').textContent = e.message;
  }
}

document.getElementById('editor').addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    var start = this.selectionStart;
    this.value = this.value.substring(0, start) + '  ' + this.value.substring(start);
    this.selectionStart = this.selectionEnd = start + 2;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    runCode();
  }
});

// ── Print utilities ───────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function colorCode(raw) {
  return raw.split('\n').map(function(line) {
    var t = line.trim();
    if (t.startsWith('//')) return '<span class="cmt">' + escHtml(line) + '</span>';
    return escHtml(line);
  }).join('\n');
}

function buildPrintPage(cfg) {
  var w = window.open('', '_blank');
  w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<title>' + cfg.title + ' \u2014 Code Playground</title><style>'
    + 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:680px;margin:0 auto;padding:2rem;color:#2d3748}'
    + 'h1{font-size:2rem;color:' + cfg.h1Color + ';margin-bottom:.2rem}'
    + '.sub{color:#718096;margin-bottom:1.5rem;font-size:.95rem}'
    + 'h2{font-size:.95rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#a0aec0;margin:1.5rem 0 .5rem}'
    + 'pre{background:#1a202c;color:#e2e8f0;padding:1.1rem 1.25rem;border-radius:10px;font:14px/1.75 monospace;white-space:pre-wrap;word-break:break-word}'
    + '.cmt{color:#68d391}'
    + '.try{background:' + cfg.tryBg + ';border-left:4px solid ' + cfg.tryBorder + ';padding:1rem 1.25rem;border-radius:0 10px 10px 0;margin-top:1.5rem}'
    + '.try h2{color:' + cfg.tryH2Color + ';font-size:1.1rem;text-transform:none;letter-spacing:0;margin-top:0}'
    + '.try ol{padding-left:1.25rem;line-height:2.1;color:' + cfg.tryOlColor + '}'
    + '.try code{background:' + cfg.tryCodeBg + ';padding:1px 5px;border-radius:4px;font:13px monospace}'
    + '.print-btn{margin-top:1.5rem;background:' + cfg.btnBg + ';color:' + cfg.btnColor + ';border:none;border-radius:8px;padding:8px 20px;font-size:.9rem;font-weight:600;cursor:pointer}'
    + '@media print{.print-btn{display:none}}'
    + '</style></head><body>'
    + '<h1>' + cfg.title + '</h1>'
    + '<p class="sub">' + cfg.subtitle + '</p>'
    + '<h2>Step 1 &mdash; ' + cfg.step1Label + '</h2>'
    + '<pre>' + colorCode(cfg.code1) + '</pre>'
    + '<h2>Step 2 &mdash; ' + cfg.step2Label + '</h2>'
    + '<pre>' + colorCode(cfg.code2) + '</pre>'
    + '<div class="try"><h2>&#128295; Try changing these things!</h2><ol>'
    + cfg.tries.map(function(t) { return '<li>' + t + '</li>'; }).join('')
    + '</ol></div>'
    + '<button class="print-btn" onclick="window.print()">🖨️ Print this page</button>'
    + '</body></html>');
  w.document.close();
}
