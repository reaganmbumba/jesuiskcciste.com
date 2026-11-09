/* Je suis KCCiste Studio — lien avec le site jesuiskcciste.com.
 *
 * Une fois connectée avec un compte d'administration du site, la régie annonce
 * elle-même le direct : au passage à l'antenne, elle crée le direct dans la table
 * « livestreams » (sans lien de vidéo : le site affiche alors le direct en cours
 * de la chaîne YouTube), et à l'arrêt elle le termine (la page passe en rediffusion).
 * Le mot de passe n'est jamais gardé : seulement le jeton de session de Supabase.
 */
'use strict';
const Site = (() => {
  const SB_URL = 'https://anawpwprqvzxgzcpqqwu.supabase.co';
  const SB_KEY = 'sb_publishable_hnpwDEfVVCC0BhYkxOgdwQ_E745c7rK'; // clé publique du site (la même que dans le navigateur)
  const KEY = 'kcc-studio-site';
  let sess = null, cur = null;
  try { sess = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
  try { cur = JSON.parse(localStorage.getItem(KEY + '-cur') || 'null'); } catch {}
  const keep = () => { try { sess ? localStorage.setItem(KEY, JSON.stringify(sess)) : localStorage.removeItem(KEY); cur ? localStorage.setItem(KEY + '-cur', JSON.stringify(cur)) : localStorage.removeItem(KEY + '-cur'); } catch {} };

  async function auth(body, grant) {
    const r = await fetch(`${SB_URL}/auth/v1/token?grant_type=${grant}`, { method: 'POST', headers: { apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(/invalid/i.test(j.error_description || j.msg || '') ? 'Adresse e-mail ou mot de passe incorrect.' : (j.error_description || j.msg || 'Connexion impossible (' + r.status + ').'));
    sess = { email: j.user?.email || body.email || sess?.email, access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
    keep(); return sess;
  }
  async function token() {
    if (!sess) throw new Error('La régie n\'est pas connectée au site.');
    if (Date.now() > sess.exp - 120000) {
      try { await auth({ refresh_token: sess.refresh }, 'refresh_token'); }
      catch { sess = null; keep(); ui(); throw new Error('La connexion au site a expiré : reconnectez-vous dans l\'onglet Diffusion.'); }
    }
    return sess.access;
  }
  async function api(method, path, body) {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, { method, headers: { apikey: SB_KEY, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      const m = j.message || '';
      if (/row-level security|permission denied/i.test(m) || r.status === 403) throw new Error('Ce compte n\'a pas le droit de programmer des directs sur le site (administration requise).');
      const e = new Error(m || 'Erreur ' + r.status); e.raw = m; throw e;
    }
    return r.json();
  }
  // Prévient les pages ouvertes (accueil, /direct) pour qu'elles basculent sans attendre.
  async function signal() {
    try { await fetch(`${SB_URL}/realtime/v1/api/broadcast`, { method: 'POST', headers: { apikey: SB_KEY, Authorization: 'Bearer ' + await token(), 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ topic: 'kcc-live-status', event: 'live', payload: {} }] }) }); } catch {}
  }

  async function liveStarted() {
    if (!sess || !S.siteAuto || cur) return;
    try {
      const title = (S.siteTitle || S.title || 'Culte en direct · Je suis KCCiste').trim().slice(0, 200);
      const rows = await api('POST', 'livestreams', { title, starts_at: new Date(Date.now() - 60000).toISOString(), duration_minutes: Number(S.siteDur) || 180, youtube_id: null, is_cancelled: false });
      cur = { id: rows[0].id, start: Date.now() }; keep(); signal();
      logLine('Site : direct annoncé sur jesuiskcciste.com/direct'); toast('🌐 Le direct est annoncé sur jesuiskcciste.com', 'ok', 5000); ui();
    } catch (e) { logLine('Site : ' + e.message); toast('Site : ' + e.message, 'err', 8000); }
  }
  async function liveEnded() {
    if (!cur) return;
    const now = new Date();
    try {
      try { await api('PATCH', 'livestreams?id=eq.' + cur.id, { ended_at: now.toISOString() }); }
      catch (e) { if (!/ended_at/.test(e.raw || '')) throw e; await api('PATCH', 'livestreams?id=eq.' + cur.id, { duration_minutes: Math.max(15, Math.round((now - cur.start) / 60000) + 1) }); }
      cur = null; keep(); signal(); logLine('Site : direct terminé, la page montre la rediffusion'); ui();
    } catch (e) { logLine('Site : ' + e.message); toast('Site : ' + e.message, 'err', 8000); }
  }

  function ui() {
    const on = !!sess;
    $('siteLogin').hidden = on; $('siteOn').hidden = !on;
    if (on) $('siteWho').textContent = sess.email || 'compte du site';
    $('siteCur').hidden = !cur;
  }
  function init() {
    if (!$('siteLogin')) return;
    bindInput('siteAuto', 'siteAuto', 'checked'); bindInput('siteTitle', 'siteTitle'); bindInput('siteDur', 'siteDur');
    $('siteLoginBtn').onclick = async () => {
      const email = $('siteEmail').value.trim(), password = $('sitePass').value;
      if (!email || !password) { toast('Écrivez l\'adresse e-mail et le mot de passe de votre compte du site.', 'err'); return; }
      $('siteLoginBtn').disabled = true;
      try { await auth({ email, password }, 'password'); $('sitePass').value = ''; ui(); toast('✓ Régie connectée au site jesuiskcciste.com', 'ok'); }
      catch (e) { toast(e.message, 'err', 7000); }
      finally { $('siteLoginBtn').disabled = false; }
    };
    $('sitePass').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('siteLoginBtn').click(); });
    $('siteLogout').onclick = () => { sess = null; keep(); ui(); };
    $('siteEndNow').onclick = () => liveEnded();
    ui();
  }
  init();
  return { liveStarted, liveEnded, connected: () => !!sess };
})();
