/* Arrière-plans de l'écran d'attente : thèmes animés dessinés en direct, et photos ou vidéos du PC.
 * Chaque thème : (ctx, w, h, t, u) avec t en millisecondes et u l'échelle (1 = 1280 px de large). */
'use strict';

const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

function softDot(ctx, x, y, r, color, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace('A', a)); g.addColorStop(1, color.replace('A', 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}
function sparkles(ctx, w, h, t, u, n, color, speed) {
  ctx.save(); ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const px = rnd(i, 1) * w, py = ((rnd(i, 2) * h) - t * speed * (0.5 + rnd(i, 3))) % h, y = py < 0 ? py + h : py;
    ctx.globalAlpha = .2 + .5 * Math.abs(Math.sin(t / 700 + i));
    ctx.beginPath(); ctx.arc(px, y, (0.8 + 1.8 * rnd(i, 4)) * u, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function rays(ctx, cx, cy, len, n, t, speed, color) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * speed);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, wdt = 0.06 + 0.05 * Math.sin(t / 2000 + i);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, len); g.addColorStop(0, color(0.22)); g.addColorStop(1, color(0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, len, a - wdt, a + wdt); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

const THEMES = [
  {
    id: 'nuit', name: 'Nuit dorée',
    draw(ctx, w, h, t, u) {
      const g = ctx.createRadialGradient(w / 2, h * .42, 0, w / 2, h * .42, Math.max(w, h) * .75);
      g.addColorStop(0, '#1b3378'); g.addColorStop(.55, '#0b1f5c'); g.addColorStop(1, '#050b22');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.strokeStyle = 'rgba(243,210,122,.10)'; ctx.lineWidth = 1.5 * u;
      for (let i = 0; i < 5; i++) { const r = (160 + i * 90) * u + Math.sin(t / 1600 + i) * 6 * u; ctx.beginPath(); ctx.arc(w / 2, h * .42, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      sparkles(ctx, w, h, t, u, 40, 'rgba(243,210,122,.9)', -0.012 * u);
    },
  },
  {
    id: 'aurore', name: 'Aurore', light: true,
    draw(ctx, w, h, t, u) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#1a0f3d'); g.addColorStop(.45, '#6b2a5e'); g.addColorStop(.75, '#e0763a'); g.addColorStop(1, '#f7c56b');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const sy = h * 1.02 - Math.sin(t / 9000) * 10 * u;
      rays(ctx, w / 2, sy, h * 1.4, 18, t, 0.00003, (a) => `rgba(255,224,160,${a})`);
      softDot(ctx, w / 2, sy, 420 * u, 'rgba(255,214,140,A)', .75);
      softDot(ctx, w / 2, sy, 160 * u, 'rgba(255,245,220,A)', .9);
      // brume
      for (let i = 0; i < 6; i++) { const x = ((rnd(i, 1) * w + t * .01 * (1 + i % 3) * u) % (w + 600 * u)) - 300 * u; softDot(ctx, x, h * (.62 + .07 * rnd(i, 2)), 260 * u, 'rgba(255,190,150,A)', .12); }
      sparkles(ctx, w, h, t, u, 25, 'rgba(255,240,210,.9)', 0.006 * u);
    },
  },
  {
    id: 'ciel', name: 'Lumière céleste', light: true,
    draw(ctx, w, h, t, u) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0d3b78'); g.addColorStop(.55, '#3d86c6'); g.addColorStop(1, '#a9d4f0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      rays(ctx, w / 2, -h * .15, h * 1.6, 14, t, 0.00002, (a) => `rgba(255,248,220,${a * 1.2})`);
      softDot(ctx, w / 2, -h * .05, 520 * u, 'rgba(255,250,230,A)', .6);
      // nuages
      for (let i = 0; i < 9; i++) {
        const x = ((rnd(i, 5) * (w + 800 * u) + t * .008 * (1 + rnd(i, 6)) * u) % (w + 800 * u)) - 400 * u, y = h * (.55 + .4 * rnd(i, 7));
        for (let k = 0; k < 4; k++) softDot(ctx, x + (k - 1.5) * 90 * u, y + Math.sin(k + i) * 20 * u, (150 + 60 * rnd(i, k)) * u, 'rgba(255,255,255,A)', .28);
      }
    },
  },
  {
    id: 'bokeh', name: 'Bokeh doré',
    draw(ctx, w, h, t, u) {
      const g = ctx.createRadialGradient(w * .5, h * .5, 0, w * .5, h * .5, w * .8);
      g.addColorStop(0, '#2a1d0c'); g.addColorStop(1, '#07060a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 34; i++) {
        const r = (30 + 110 * rnd(i, 1)) * u;
        const x = (rnd(i, 2) * w + Math.sin(t / (6000 + 3000 * rnd(i, 3)) + i) * 60 * u);
        const y = (rnd(i, 4) * h + Math.cos(t / (7000 + 3000 * rnd(i, 5)) + i) * 40 * u);
        const warm = rnd(i, 6) > .3;
        softDot(ctx, x, y, r, warm ? 'rgba(243,190,90,A)' : 'rgba(255,255,255,A)', (.10 + .18 * rnd(i, 7)) * (.6 + .4 * Math.sin(t / 1500 + i)));
      }
      ctx.restore();
    },
  },
  {
    id: 'vagues', name: 'Vagues de paix',
    draw(ctx, w, h, t, u) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#04263b'); g.addColorStop(.6, '#0b4f6c'); g.addColorStop(1, '#0f7a82');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (let k = 0; k < 6; k++) {
        const base = h * (.55 + k * .08), amp = (18 + k * 6) * u, sp = t / (2600 + k * 700), f = (2 + k * .4) / w;
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 16 * u) ctx.lineTo(x, base + Math.sin(x * f * Math.PI * 2 + sp + k) * amp);
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${.035 + k * .01})`; ctx.fill();
        ctx.strokeStyle = `rgba(243,210,122,${.35 - k * .04})`; ctx.lineWidth = 1.6 * u; ctx.stroke();
      }
      softDot(ctx, w * .5, h * .3, 380 * u, 'rgba(160,230,240,A)', .18);
      sparkles(ctx, w, h * .6, t, u, 30, 'rgba(255,255,255,.9)', 0.004 * u);
    },
  },
  {
    id: 'royal', name: 'Velours royal',
    draw(ctx, w, h, t, u) {
      const g = ctx.createRadialGradient(w * .5, h * .45, 0, w * .5, h * .45, w * .75);
      g.addColorStop(0, '#5a1240'); g.addColorStop(.6, '#2d0a2a'); g.addColorStop(1, '#120412');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // reflet qui balaie
      const p = ((t / 7000) % 1.6) - .3, x = p * w;
      const s = ctx.createLinearGradient(x - 200 * u, 0, x + 200 * u, h);
      s.addColorStop(0, 'rgba(243,210,122,0)'); s.addColorStop(.5, 'rgba(243,210,122,.10)'); s.addColorStop(1, 'rgba(243,210,122,0)');
      ctx.fillStyle = s; ctx.fillRect(0, 0, w, h);
      // fines lignes dorées
      ctx.save(); ctx.strokeStyle = 'rgba(243,210,122,.16)'; ctx.lineWidth = 1 * u;
      for (let i = -8; i < 20; i++) { ctx.beginPath(); ctx.moveTo(i * 90 * u, 0); ctx.lineTo(i * 90 * u + h * .6, h); ctx.stroke(); }
      ctx.restore();
      sparkles(ctx, w, h, t, u, 55, 'rgba(255,220,140,.95)', 0.02 * u);
    },
  },
  {
    id: 'emeraude', name: 'Aurore émeraude',
    draw(ctx, w, h, t, u) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#02140f'); g.addColorStop(1, '#073b2c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 4; k++) {
        const col = ['rgba(60,230,160,A)', 'rgba(80,200,255,A)', 'rgba(243,210,122,A)', 'rgba(120,255,200,A)'][k];
        for (let x = -100 * u; x < w + 100 * u; x += 34 * u) {
          const y = h * (.3 + k * .1) + Math.sin(x / (240 * u) + t / (3000 + k * 900) + k) * 70 * u;
          softDot(ctx, x, y, 110 * u, col, .07);
        }
      }
      ctx.restore();
      sparkles(ctx, w, h * .7, t, u, 50, 'rgba(255,255,255,.9)', 0);
    },
  },
  {
    id: 'kcc', name: 'Bleu et or KCC',
    draw(ctx, w, h, t, u) {
      ctx.fillStyle = '#0b1f5c'; ctx.fillRect(0, 0, w, h);
      // grands rubans or et bleu qui ondulent
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        const yb = h * (.72 + k * .07), amp = 50 * u;
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 20 * u) ctx.lineTo(x, yb + Math.sin(x / (w / 2) * Math.PI + t / (4000 + k * 1500) + k * 1.4) * amp);
        ctx.lineTo(w, h); ctx.closePath();
        ctx.fillStyle = ['rgba(217,178,90,.85)', 'rgba(20,52,140,.95)', 'rgba(8,22,70,1)'][k]; ctx.fill();
      }
      const g = ctx.createRadialGradient(w / 2, h * .38, 0, w / 2, h * .38, w * .6);
      g.addColorStop(0, 'rgba(60,100,200,.45)'); g.addColorStop(1, 'rgba(60,100,200,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      sparkles(ctx, w, h * .7, t, u, 30, 'rgba(243,210,122,.9)', -0.008 * u);
    },
  },
];

/* Fond choisi : un thème ou un fichier du PC (image ou vidéo) */
const Fonds = (() => {
  const media = new Map(); // id -> élément img/video déjà chargé
  const thumbs = new Map(); // id -> petit canvas de la vignette
  let prev = null, changedAt = 0;

  function fileUrl(p) { return 'file:///' + p.replace(/\\/g, '/').replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/').replace(/^([A-Za-z])%3A/, '$1:'); }
  function element(c) {
    if (media.has(c.id)) return media.get(c.id);
    let el;
    if (c.kind === 'video') { el = document.createElement('video'); el.muted = true; el.loop = true; el.playsInline = true; el.src = c.url || fileUrl(c.path); el.play().catch(() => {}); }
    else { el = new Image(); el.src = c.url || fileUrl(c.path); }
    media.set(c.id, el); return el;
  }
  function find(id) { return THEMES.find((x) => x.id === id) || S.customBgs.find((x) => x.id === id) || THEMES[0]; }

  function drawOne(ctx, w, h, t, b) {
    const u = w / 1280;
    if (b.draw) { b.draw(ctx, w, h, t, u); return; }
    const el = element(b);
    const sw = el.videoWidth || el.naturalWidth, sh = el.videoHeight || el.naturalHeight;
    if (!sw) { THEMES[0].draw(ctx, w, h, t, u); return; }
    // image en plein cadre avec un très léger zoom lent (effet « Ken Burns »)
    const z = 1.04 + 0.04 * Math.sin(t / 12000);
    const r = Math.max(w / sw, h / sh) * z, dw = sw * r, dh = sh * r;
    ctx.drawImage(el, (w - dw) / 2, (h - dh) / 2, dw, dh);
    // voile pour que le texte reste lisible
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `rgba(5,11,34,${S.bgDim * .6})`); g.addColorStop(.5, `rgba(5,11,34,${S.bgDim})`); g.addColorStop(1, `rgba(5,11,34,${Math.min(1, S.bgDim * 1.2)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  function draw(ctx, w, h, t) {
    const cur = find(S.bg);
    const k = prev ? Math.min(1, (performance.now() - changedAt) / 900) : 1;
    if (k < 1) { drawOne(ctx, w, h, t, prev); ctx.save(); ctx.globalAlpha = k; drawOne(ctx, w, h, t, cur); ctx.restore(); }
    else { prev = null; drawOne(ctx, w, h, t, cur); }
  }
  function choose(id) { if (id === S.bg) return; prev = find(S.bg); changedAt = performance.now(); S.bg = id; save(); render(); }

  async function addFile(kind) {
    const f = await pickFile(kind === 'video' ? 'video/*' : 'image/*'); if (!f) return;
    const path = api && api.pathFor ? api.pathFor(f) : '';
    const c = { id: 'bg' + Date.now(), kind, name: f.name.replace(/\.[^.]+$/, ''), path };
    if (!path) c.url = URL.createObjectURL(f); // hors application : seulement pour cette séance
    S.customBgs.push(c); save();
    choose(c.id);
  }
  function remove(id) {
    S.customBgs = S.customBgs.filter((x) => x.id !== id); media.delete(id);
    if (S.bg === id) S.bg = 'nuit';
    save(); render();
  }

  function render() {
    const box = document.getElementById('bgGrid'); if (!box) return;
    box.innerHTML = '';
    for (const b of [...THEMES, ...S.customBgs]) {
      const el = document.createElement('button'); el.className = 'bg' + (b.id === S.bg ? ' on' : ''); el.title = b.name;
      const cv = document.createElement('canvas'); cv.width = 160; cv.height = 90; el.append(cv);
      const lab = document.createElement('span'); lab.textContent = (b.kind === 'video' ? '🎞️ ' : b.kind === 'image' ? '🖼️ ' : '') + b.name; el.append(lab);
      if (!b.draw) { const x = document.createElement('i'); x.textContent = '×'; x.title = 'Retirer'; el.append(x); }
      el.onclick = (e) => { if (e.target.tagName === 'I') remove(b.id); else choose(b.id); };
      box.append(el);
      thumbs.set(b.id, cv);
    }
  }
  // vignettes animées doucement (5 images/s)
  setInterval(() => {
    if (document.querySelector('.pane[data-pane=gfx]:not(.on)')) return;
    const t = performance.now();
    for (const b of [...THEMES, ...S.customBgs]) { const cv = thumbs.get(b.id); if (cv && cv.isConnected) drawOne(cv.getContext('2d'), 160, 90, t, b); }
  }, 200);

  // thèmes clairs : un voile derrière le texte pour qu'il reste lisible
  const isLight = () => !!find(S.bg).light;
  return { draw, render, addFile, choose, isLight };
})();
