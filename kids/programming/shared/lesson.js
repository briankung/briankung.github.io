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
(function() {
  var btn = document.getElementById('print-btn');
  if (btn) btn.innerHTML = '🖨️ Print Code Sheet';
})();

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
  var combinedCode = cfg.code1 + '\n\n' + cfg.code2;
  var html = '<!DOCTYPE html><html><head><meta charset="utf-8">'
    + '<title>' + cfg.title + ' \u2014 Code Playground</title><style>'
    + 'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:680px;margin:0 auto;padding:2rem;color:#2d3748}'
    + 'h2{font-size:.95rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#a0aec0;margin:1.5rem 0 .5rem}'
    + 'pre{background:#f7fafc;color:#1a202c;border:2px solid #cbd5e0;padding:1.1rem 1.25rem;border-radius:10px;font:14px/1.75 monospace;white-space:pre-wrap;word-break:break-word}'
    + '.cmt{color:#2f855a}'
    + '.try{background:#f7fafc;border-left:4px solid #a0aec0;padding:1rem 1.25rem;border-radius:0 10px 10px 0;margin-top:1.5rem}'
    + '.try h2{color:#4a5568;font-size:1.1rem;text-transform:none;letter-spacing:0;margin-top:0}'
    + '.try ol{padding-left:1.25rem;line-height:2.1;color:#2d3748}'
    + '.try code{background:#e2e8f0;padding:1px 5px;border-radius:4px;font:13px monospace}'
    + '</style></head><body>'
    + '<pre>' + colorCode(combinedCode) + '</pre>'
    + '<div class="try"><h2>&#128295; Try changing these things!</h2><ol>'
    + cfg.tries.map(function(t) { return '<li>' + t + '</li>'; }).join('')
    + '</ol></div>'
    + '</body></html>';

  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;width:680px;height:0';
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(function() { document.body.removeChild(iframe); }, 1000);
}
