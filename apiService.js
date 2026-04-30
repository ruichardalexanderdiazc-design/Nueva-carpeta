const XANO_API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:manga-reader';
const XANO_WORKS_PATH = '/manga_work';
const XANO_CHAPTERS_PATH = '/manga_chapter';
const XANO_LIBRARY_PATH = '/manga_library';
const XANO_INTERACTIONS_PATH = '/manga_interaction';
const XANO_ADMIN_PUBLISH = '/admin/publish-work';
const XANO_ADMIN_ADD_CHAPTER = '/admin/add-chapter';
const ADMIN_EMAIL = 'richardalexanderdiaz0@gmail.com';

function buildHeaders(adminToken = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  return headers;
}

async function request(path, { method = 'GET', body = null, signal = null, adminToken = null } = {}) {
  const url = `${XANO_API_BASE}${path}`;
  const options = {
    method,
    headers: buildHeaders(adminToken),
    signal,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || `Error ${response.status} en ${url}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function buildQueryString(params = {}) {
  const entries = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=eq.${encodeURIComponent(value)}`);
  return entries.length ? `?${entries.join('&')}` : '';
}

export async function fetchObras({ signal, workType, status } = {}) {
  const query = buildQueryString({
    work_type: workType && workType !== 'all' ? workType : undefined,
    status: status && status !== 'all' ? status : undefined,
  });

  const obras = await request(`${XANO_WORKS_PATH}${query}`, { signal });
  return Array.isArray(obras) ? obras : [];
}

export function filterObrasSections(obras = []) {
  const now = Date.now();

  const recientes = obras
    .filter((obra) => {
      const published = new Date(obra.published_at || obra.created_at).getTime();
      return !Number.isNaN(published) && now - published <= 1000 * 60 * 60 * 24 * 14;
    })
    .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));

  const proximamente = obras
    .filter((obra) => String(obra.status || '').toUpperCase() === 'PRÓXIMAMENTE')
    .sort((a, b) => new Date(a.scheduled_at || a.publish_at || a.published_at) - new Date(b.scheduled_at || b.publish_at || b.published_at));

  const terminados = obras
    .filter((obra) => String(obra.status || '').toUpperCase() === 'FINALIZADO')
    .sort((a, b) => new Date(b.updated_at || b.published_at) - new Date(a.updated_at || a.published_at));

  const comicsYManhwas = obras.filter((obra) => ['CÓMIC', 'COMIC', 'MANGA', 'MANHWA'].includes(String(obra.work_type || obra.type || '').toUpperCase()));

  return {
    recientes,
    proximamente,
    terminados,
    comicsYManhwas,
  };
}

export function filterObrasByQuery(obras = [], query = '') {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) return obras;

  return obras.filter((obra) => {
    const title = String(obra.title || '').toLowerCase();
    const author = String(obra.author || '').toLowerCase();
    const tags = Array.isArray(obra.tags) ? obra.tags.join(' ').toLowerCase() : String(obra.tags || '').toLowerCase();
    const categories = Array.isArray(obra.categories) ? obra.categories.join(' ').toLowerCase() : String(obra.categories || '').toLowerCase();
    return title.includes(normalized) || author.includes(normalized) || tags.includes(normalized) || categories.includes(normalized);
  });
}

export function buildSectionLabels(obra) {
  const labels = [];
  const status = String(obra.status || '').toUpperCase();

  if (status === 'PRÓXIMAMENTE') labels.push('PRÓXIMAMENTE');
  if (status === 'FINALIZADO') labels.push('FINALIZADO');
  if (status === 'EN EMISIÓN' || status === 'EN EMISION') labels.push('EN EMISIÓN');
  if (obra.is_new || obra.newRelease || obra.newly_added || String(obra.new).toLowerCase() === 'true') labels.push('NUEVO');
  if ((obra.updated_at || obra.updated_at_at || obra.updated) && Date.now() - new Date(obra.updated_at || obra.updated_at_at || obra.updated).getTime() <= 1000 * 60 * 60 * 24 * 7) labels.push('ACTUALIZADO');

  return labels;
}

export async function publishObra({ obra, currentUser, adminToken = null }) {
  if (!currentUser?.email || currentUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Solo el administrador puede publicar obras. Usa la cuenta de administrador o un token válido.');
  }

  const payload = {
    title: obra.title,
    author: obra.author,
    work_type: obra.work_type || obra.type,
    status: obra.status,
    synopsis: obra.synopsis,
    cover: obra.cover,
    coverLarge: obra.coverLarge || obra.cover,
    categories: obra.categories,
    tags: obra.tags,
    chapterCount: obra.chapterCount,
    visibility: 'public',
    published_at: obra.status === 'PRÓXIMAMENTE' ? obra.scheduled_at || obra.publish_at : new Date().toISOString(),
    scheduled_at: obra.scheduled_at || null,
  };

  const publishedWork = await request(XANO_ADMIN_PUBLISH, {
    method: 'POST',
    body: payload,
    adminToken,
  });

  if (obra.episodes && obra.episodes.length) {
    await Promise.all(obra.episodes.map((episode) => addChapter({ workId: publishedWork.id, episode, currentUser, adminToken })));
  }

  return publishedWork;
}

export async function addChapter({ workId, episode, currentUser, adminToken = null }) {
  if (!currentUser?.email || currentUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error('Solo el administrador puede agregar capítulos.');
  }

  const payload = {
    work_id: workId,
    title: episode.title,
    chapter_number: episode.chapter_number || episode.episode_number || 1,
    cover: episode.cover,
    content: episode.content || [],
    published_at: episode.published_at || new Date().toISOString(),
  };

  return request(XANO_ADMIN_ADD_CHAPTER, {
    method: 'POST',
    body: payload,
    adminToken,
  });
}

export async function fetchObraById(id, { signal } = {}) {
  if (!id) return null;
  return request(`${XANO_WORKS_PATH}/${encodeURIComponent(id)}`, { signal });
}

export async function fetchChaptersByWork(workId, { signal } = {}) {
  if (!workId) return [];
  const url = `${XANO_CHAPTERS_PATH}?work_id=eq.${encodeURIComponent(workId)}`;
  const chapters = await request(url, { signal });
  return Array.isArray(chapters)
    ? chapters.sort((a, b) => Number(a.chapter_number || a.episode_number || 0) - Number(b.chapter_number || b.episode_number || 0))
    : [];
}

export async function saveUserLibrary({ userId, workId, signal } = {}) {
  if (!userId || !workId) return null;
  return request(`${XANO_LIBRARY_PATH}`, {
    method: 'POST',
    body: { user_id: userId, work_id: workId },
    signal,
  });
}

export async function sendInteraction({ workId, userId, type, value, signal } = {}) {
  if (!workId || !type) throw new Error('workId y type son obligatorios para la interacción.');
  return request(`${XANO_INTERACTIONS_PATH}`, {
    method: 'POST',
    body: { work_id: workId, user_id: userId || null, interaction_type: type, value: value || null },
    signal,
  });
}

export function buildShareMessage(obra) {
  const title = obra?.title ? obra.title.toUpperCase() : 'esta obra';
  return `¡NO DEJO DE LEER ${title}! Te invito a leer.`;
}

export function getShareLinks(obra, url) {
  const text = `${buildShareMessage(obra)} ${url}`;
  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };
}

export function formatWorkForReader(obra) {
  return {
    ...obra,
    episodes: (obra.episodes || []).sort((a, b) => Number(a.episode_number) - Number(b.episode_number)),
  };
}
