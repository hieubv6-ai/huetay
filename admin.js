const $ = (selector) => document.querySelector(selector);
const supabase = window.htSupabase;
let db = null;

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[c]));
const slug = (value) => String(value || '').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const newId = (prefix) => `${prefix}-${crypto.randomUUID()}`;
const fail = (error) => { if (error) throw new Error(error.message || 'Có lỗi xảy ra'); };
const notice = (message) => {
  const node = $('#notice'); node.textContent = message; node.classList.add('show');
  setTimeout(() => node.classList.remove('show'), 2600);
};

async function load() {
  const [projectsResult, unitsResult, articlesResult, settingsResult] = await Promise.all([
    supabase.from('projects').select('*').order('featured', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('units').select('*').order('created_at', { ascending: false }),
    supabase.from('articles').select('*').order('published_at', { ascending: false }),
    supabase.from('site_settings').select('value').eq('key', 'public').maybeSingle()
  ]);
  [projectsResult, unitsResult, articlesResult, settingsResult].forEach((result) => fail(result.error));
  const unitsByProject = new Map();
  unitsResult.data.forEach((unit) => {
    if (!unitsByProject.has(unit.project_id)) unitsByProject.set(unit.project_id, []);
    unitsByProject.get(unit.project_id).push(unit);
  });
  db = {
    projects: projectsResult.data.map((project) => ({ ...project, featured: Boolean(project.featured), units: unitsByProject.get(project.id) || [] })),
    articles: articlesResult.data.map((article) => ({ ...article, publishedAt: article.published_at })),
    settings: settingsResult.data?.value || {}
  };
  renderDashboard(); renderProjects(); renderArticles();
}

async function showApp() {
  $('#login').hidden = true; $('#app').hidden = false;
  try { await load(); } catch (error) {
    $('#login-error').textContent = error.message;
    $('#login').hidden = false; $('#app').hidden = true;
  }
}

function renderDashboard() {
  $('#dashboard').innerHTML = `<div class="stats">
    <div class="stat"><span>Tổng dự án</span><strong>${db.projects.length}</strong></div>
    <div class="stat"><span>Tổng căn đang quản lý</span><strong>${db.projects.reduce((n, p) => n + p.units.length, 0)}</strong></div>
    <div class="stat"><span>Bài đã đăng</span><strong>${db.articles.filter((a) => a.status === 'published').length}</strong></div>
    <div class="stat"><span>Bài nháp</span><strong>${db.articles.filter((a) => a.status !== 'published').length}</strong></div>
  </div><div class="grid"><div class="panel"><h2>Dự án cập nhật gần đây</h2>
  ${db.projects.slice(0, 5).map((p) => `<div class="item"><div class="item-main"><div class="item-title">${esc(p.name)}</div><div class="item-meta">${esc(p.location)} · ${p.units.length} căn</div></div><span class="badge">${esc(p.status)}</span></div>`).join('')}
  </div><div class="panel"><h2>Bài viết mới</h2>
  ${db.articles.slice(0, 5).map((a) => `<div class="item"><div class="item-main"><div class="item-title">${esc(a.title)}</div><div class="item-meta">${esc(a.category)} · ${esc(a.publishedAt)}</div></div><span class="badge ${a.status !== 'published' ? 'danger' : ''}">${a.status === 'published' ? 'Đã đăng' : 'Nháp'}</span></div>`).join('')}
  </div></div>`;
}

function projectForm(project = null) {
  return `<div class="panel form-panel"><div class="section-title"><h2>${project ? 'Sửa dự án' : 'Thêm dự án'}</h2><button class="ghost" onclick="renderProjects()">Đóng</button></div>
  <form id="project-form"><div class="form-grid">
    <div class="field"><label>TÊN DỰ ÁN<input name="name" required value="${esc(project?.name)}"></label></div>
    <div class="field"><label>SLUG<input name="slug" value="${esc(project?.slug)}" placeholder="tu-dong-tao-neu-bo-trong"></label></div>
    <div class="field"><label>VỊ TRÍ<input name="location" value="${esc(project?.location)}"></label></div>
    <div class="field"><label>TRẠNG THÁI<input name="status" value="${esc(project?.status || 'Đang cập nhật')}"></label></div>
    <div class="field full"><label>ẢNH COVER<input name="cover" value="${esc(project?.cover)}" placeholder="vinhomes-ocean-park-1-2-3.jpg"></label></div>
    <div class="field full"><label>MÔ TẢ NGẮN<textarea name="summary">${esc(project?.summary)}</textarea></label></div>
    <div class="field full"><label>MÔ TẢ CHI TIẾT<textarea name="description">${esc(project?.description)}</textarea></label></div>
    <label class="check"><input name="featured" type="checkbox" ${project?.featured ? 'checked' : ''}> Hiển thị nổi bật</label>
  </div><button>Lưu dự án</button></form></div>`;
}

function unitForm(project) {
  return `<div class="panel form-panel"><div class="section-title"><h2>Thêm căn · ${esc(project.name)}</h2><button class="ghost" onclick="renderProjects()">Đóng</button></div>
  <form id="unit-form"><div class="form-grid">
    <div class="field"><label>MÃ CĂN<input name="code" required placeholder="OP23-LK-01"></label></div>
    <div class="field"><label>LOẠI SẢN PHẨM<input name="type" placeholder="Liền kề, biệt thự, căn hộ…"></label></div>
    <div class="field"><label>DIỆN TÍCH<input name="area" placeholder="90 m²"></label></div>
    <div class="field"><label>GIÁ<input name="price" placeholder="Liên hệ"></label></div>
    <div class="field full"><label>TRẠNG THÁI<input name="status" value="Đang bán"></label></div>
    <div class="field full"><label>GHI CHÚ<textarea name="note"></textarea></label></div>
  </div><button>Lưu căn</button></form></div>`;
}

async function saveProject(data, project) {
  const payload = { name: data.name || 'Dự án mới', slug: data.slug || slug(data.name), location: data.location || '', status: data.status || 'Đang cập nhật', cover: data.cover || '', summary: data.summary || '', description: data.description || '', featured: Boolean(data.featured), updated_at: new Date().toISOString() };
  const result = project
    ? await supabase.from('projects').update(payload).eq('id', project.id)
    : await supabase.from('projects').insert({ id: newId('project'), ...payload });
  fail(result.error);
}

function renderProjects(view = 'list') {
  const element = $('#projects');
  if (['new', 'edit', 'unit'].includes(view)) {
    const project = view === 'new' ? null : db.projects.find((item) => item.id === window.currentId);
    element.innerHTML = view === 'unit' ? unitForm(project) : projectForm(project);
    element.querySelector('form').onsubmit = async (event) => {
      event.preventDefault(); const form = event.target; const data = Object.fromEntries(new FormData(form));
      try {
        if (view === 'unit') {
          const result = await supabase.from('units').insert({ id: newId('unit'), project_id: project.id, code: data.code || '', type: data.type || 'Căn hộ', area: data.area || '', price: data.price || 'Liên hệ', status: data.status || 'Đang bán', note: data.note || '' });
          fail(result.error);
        } else { data.featured = form.featured.checked; await saveProject(data, project); }
        notice('Đã lưu thay đổi'); await load(); renderProjects();
      } catch (error) { notice(error.message); }
    }; return;
  }
  element.innerHTML = `<div class="section-title"><h2>Dự án & căn đang quản lý</h2><button onclick="renderProjects('new')">+ Thêm dự án</button></div>
  ${db.projects.map((project) => `<div class="item"><div class="item-main"><div class="item-title">${esc(project.name)}</div><div class="item-meta">${esc(project.location)} · ${project.units.length} căn · ${esc(project.status)}</div></div><div class="actions"><button onclick="window.currentId='${esc(project.id)}';renderProjects('unit')">+ Thêm căn</button><button class="ghost" onclick="window.currentId='${esc(project.id)}';renderProjects('edit')">Sửa</button><button class="delete" onclick="removeProject('${esc(project.id)}')">Xóa</button></div></div>`).join('')}`;
}

async function removeProject(id) {
  if (!confirm('Xóa dự án và toàn bộ căn bên trong?')) return;
  const result = await supabase.from('projects').delete().eq('id', id); fail(result.error);
  notice('Đã xóa dự án'); await load(); renderProjects();
}

function articleForm() {
  return `<div class="panel form-panel"><div class="section-title"><h2>Viết bài mới</h2><button class="ghost" onclick="renderArticles()">Đóng</button></div>
  <form id="article-form"><div class="field"><label>TIÊU ĐỀ<input name="title" required></label></div><div class="form-grid">
    <div class="field"><label>CHUYÊN MỤC<input name="category" value="Góc nhìn đầu tư"></label></div>
    <div class="field"><label>NGÀY ĐĂNG<input name="publishedAt" type="date"></label></div>
  </div><div class="field"><label>MÔ TẢ NGẮN<textarea name="excerpt" required></textarea></label></div>
  <div class="field"><label>NỘI DUNG<textarea name="content" placeholder="Có thể viết nội dung dài ở đây…"></textarea></label></div>
  <div class="field"><label>TRẠNG THÁI<select name="status"><option value="draft">Nháp</option><option value="published">Đã đăng</option></select></label></div><button>Lưu bài viết</button></form></div>`;
}

function renderArticles(view = 'list') {
  const element = $('#articles');
  if (view === 'new') {
    element.innerHTML = articleForm();
    element.querySelector('form').onsubmit = async (event) => {
      event.preventDefault(); const data = Object.fromEntries(new FormData(event.target));
      try {
        const result = await supabase.from('articles').insert({ id: newId('article'), title: data.title || 'Bài viết mới', slug: data.slug || slug(data.title), category: data.category || 'Kinh nghiệm', excerpt: data.excerpt || '', content: data.content || '', published_at: data.publishedAt || new Date().toISOString().slice(0, 10), status: data.status || 'draft' });
        fail(result.error); notice('Đã lưu bài viết'); await load(); renderArticles();
      } catch (error) { notice(error.message); }
    }; return;
  }
  element.innerHTML = `<div class="section-title"><h2>Thư viện bài viết</h2><button onclick="renderArticles('new')">+ Viết bài</button></div>
  ${db.articles.map((article) => `<div class="item"><div class="item-main"><div class="item-title">${esc(article.title)}</div><div class="item-meta">${esc(article.category)} · ${esc(article.publishedAt)}</div></div><span class="badge ${article.status !== 'published' ? 'danger' : ''}">${article.status === 'published' ? 'Đã đăng' : 'Nháp'}</span></div>`).join('')}`;
}

$('#login-form').onsubmit = async (event) => {
  event.preventDefault(); $('#login-error').textContent = '';
  const email = $('#email').value.trim(); const password = $('#password').value;
  const result = await supabase.auth.signInWithPassword({ email, password });
  if (result.error) { $('#login-error').textContent = result.error.message; return; }
  await showApp();
};
$('#logout').onclick = async () => { await supabase.auth.signOut(); location.reload(); };
document.querySelectorAll('.tabs button').forEach((button) => button.onclick = () => {
  document.querySelectorAll('.tabs button,.tab').forEach((item) => item.classList.remove('active'));
  document.querySelectorAll('.tab').forEach((item) => item.hidden = true);
  button.classList.add('active'); const tab = $('#' + button.dataset.tab); tab.hidden = false; tab.classList.add('active');
});

(async () => {
  const result = await supabase.auth.getSession();
  if (result.data.session) await showApp();
})();
