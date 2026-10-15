(() => {
  const path = () => location.pathname.replace(/\/+$|^$/g, '') || '/';
  const isAdmin = () => path() === '/admin.html' || path().startsWith('/admin');
  const sessionKey = 'huetay-analytics-session';
  const getSessionId = () => {
    let value = sessionStorage.getItem(sessionKey);
    if (!value) { value = crypto.randomUUID(); sessionStorage.setItem(sessionKey, value); }
    return value;
  };
  const device = () => matchMedia('(max-width: 640px)').matches ? 'mobile' : matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'desktop';
  const onceKey = (eventName, eventPath, articleId='') => `huetay-analytics:${eventName}:${eventPath}:${articleId}`;
  const track = async (eventName, articleId='') => {
    if (isAdmin() || !window.htSupabase || !['page_view','article_view','article_click'].includes(eventName)) return;
    const eventPath = path();
    const key = onceKey(eventName, eventPath, articleId);
    const ttl = eventName === 'article_view' ? 30 * 60 * 1000 : 30 * 1000;
    const now = Date.now();
    try {
      const previous = Number(sessionStorage.getItem(key) || 0);
      if (previous && now - previous < ttl) return;
      sessionStorage.setItem(key, String(now));
      const payload = { event_name: eventName, path: eventPath.slice(0, 500), article_id: articleId ? String(articleId).slice(0, 180) : null, session_id: getSessionId(), device_type: device(), referrer: document.referrer ? new URL(document.referrer).hostname.slice(0, 180) : null };
      await window.htSupabase.from('analytics_events').insert(payload);
    } catch (_) { /* Analytics must never block the public site. */ }
  };
  window.htTrack = track;
  document.addEventListener('DOMContentLoaded', () => {
    if (isAdmin()) return;
    track('page_view');
    const articleMatch = path().match(/^\/bai-viet\/([^/]+)/);
    if (articleMatch) track('article_view', articleMatch[1]);
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href*="/bai-viet/"]');
      if (!link) return;
      const match = link.getAttribute('href').match(/^\/bai-viet\/([^/?#]+)/);
      if (match) track('article_click', match[1]);
    }, { passive: true });
  }, { once: true });
})();
