import { useEffect, useMemo, useState } from 'react';
import { fetchObras, filterObrasSections, buildSectionLabels } from './apiService';
import './home.css';

const COUNTDOWN_INTERVAL_MS = 1000;

function formatCountdown(dateString) {
  const target = new Date(dateString).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return 'Disponible ahora';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`;
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-cover" />
      <div className="skeleton-body">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line smaller" />
      </div>
    </div>
  );
}

function SectionCard({ obra, onSelect }) {
  const labels = buildSectionLabels(obra);
  const workType = String(obra.work_type || obra.type || 'Historia').toUpperCase();
  return (
    <article className="card home-card" onClick={() => onSelect(obra)}>
      <div className="card-badge-row">
        {labels.map((label) => (
          <span key={label} className={`card-badge badge-${label.toLowerCase().replace(' ', '-')}`}>{label}</span>
        ))}
      </div>
      <img className="card-cover" src={obra.cover || obra.coverLarge || '/logo.svg'} alt={obra.title} />
      <div className="card-body">
        <h3 className="card-title">{obra.title}</h3>
        <p className="card-subtitle">{obra.author || 'Autor anónimo'} · {workType}</p>
        <div className="card-meta">
          <span>{obra.reads?.toLocaleString() ?? '0'} leídos</span>
          <span>{obra.likes?.toLocaleString() ?? '0'} likes</span>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchObras({ signal: controller.signal });
        if (!ignore) {
          setObras(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError.message || 'No se pudo cargar las obras.');
          setObras([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), COUNTDOWN_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const { recientes, proximamente, terminados, comicsYManhwas } = useMemo(
    () => filterObrasSections(obras),
    [obras],
  );

  const navigateSearch = (filter = {}) => {
    const params = new URLSearchParams();
    if (filter.work_type) params.set('work_type', filter.work_type);
    if (filter.sort) params.set('sort', filter.sort);
    if (filter.likes) params.set('likes', filter.likes);
    if (filter.reads) params.set('reads', filter.reads);
    if (filter.search) params.set('search', filter.search);
    params.set('source', 'home');
    window.location.href = `/search?${params.toString()}`;
  };

  const handleWorkSelect = (obra) => {
    const params = new URLSearchParams();
    params.set('workId', obra.id);
    window.location.href = `/detail?${params.toString()}`;
  };

  return (
    <div className="home-page">
      <header className="home-hero">
        <div>
          <span className="eyebrow">Inicio</span>
          <h1>AÑADIDOS RECIENTEMENTE, PRÓXIMAMENTE Y TERMINADOS</h1>
          <p>Encuentra las mejores historias que solo publica el administrador en una sola app.</p>
        </div>
        <button className="primary home-action" onClick={() => navigateSearch({ work_type: 'all', sort: 'likes_desc', likes: 'desc', reads: 'desc' })}>
          CÓMICS Y MANHWAS
        </button>
      </header>

      <section className="home-section">
        <div className="section-title">
          <h2>AÑADIDOS RECIENTEMENTE</h2>
          <button className="secondary" onClick={() => navigateSearch({ sort: 'recent' })}>Ver todo</button>
        </div>
        <div className="cards-grid">
          {loading && Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
          {!loading && !recientes.length && <p className="empty-state">No hay obras añadidas recientemente.</p>}
          {!loading && recientes.map((obra) => (
            <SectionCard key={obra.id} obra={obra} onSelect={handleWorkSelect} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">
          <h2>PRÓXIMAMENTE</h2>
          <span className="section-hint">Actualizado {new Date(now).toLocaleTimeString()}</span>
        </div>
        <div className="cards-grid">
          {loading && Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
          {!loading && !proximamente.length && <p className="empty-state">No hay próximos lanzamientos por ahora.</p>}
          {!loading && proximamente.map((obra) => (
            <article key={obra.id} className="card home-card home-card--countdown" onClick={() => handleWorkSelect(obra)}>
              <div className="card-badge-row">
                <span className="card-badge badge-próximamente">PRÓXIMAMENTE</span>
              </div>
              <img className="card-cover" src={obra.cover || '/logo.svg'} alt={obra.title} />
              <div className="card-body">
                <h3 className="card-title">{obra.title}</h3>
                <p className="card-subtitle">{obra.author || 'Autor anónimo'}</p>
                <div className="card-meta countdown-meta">
                  <span>{obra.publish_at ? formatCountdown(obra.publish_at) : 'Fecha pendiente'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">
          <h2>TERMINADOS</h2>
          <button className="secondary" onClick={() => navigateSearch({ sort: 'completed' })}>Ver todo</button>
        </div>
        <div className="cards-grid">
          {loading && Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
          {!loading && !terminados.length && <p className="empty-state">No hay obras terminadas todavía.</p>}
          {!loading && terminados.map((obra) => (
            <SectionCard key={obra.id} obra={obra} onSelect={handleWorkSelect} />
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-title">
          <h2>CÓMICS Y MANHWAS</h2>
          <button className="secondary" onClick={() => navigateSearch({ genre: 'all' })}>Explorar todo</button>
        </div>
        <div className="cards-grid">
          {loading && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
          {!loading && !comicsYManhwas.length && <p className="empty-state">No hay cómics o manhwas disponibles aún.</p>}
          {!loading && comicsYManhwas.map((obra) => (
            <SectionCard key={obra.id} obra={obra} onSelect={handleWorkSelect} />
          ))}
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}
