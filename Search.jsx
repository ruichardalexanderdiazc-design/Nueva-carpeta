import { useEffect, useMemo, useState } from 'react';
import { fetchObras, filterObrasByQuery } from './apiService';
import './search.css';

const WORK_TYPES = ['ALL', 'MANGA', 'MANHWA', 'CÓMIC'];
const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'likes_desc', label: 'Más likes' },
  { value: 'reads_desc', label: 'Más leídos' },
];

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function sortObras(obras, sort) {
  if (!sort) return obras;
  const sorted = [...obras];

  switch (sort) {
    case 'likes_desc':
      return sorted.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0));
    case 'reads_desc':
      return sorted.sort((a, b) => (Number(b.reads) || 0) - (Number(a.reads) || 0));
    case 'recent':
      return sorted.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
    default:
      return sorted;
  }
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-cover" />
      <div className="skeleton-body">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}

function ResultCard({ obra, onSelect }) {
  const workType = String(obra.work_type || obra.type || 'DESCONOCIDO').toUpperCase();
  return (
    <article className="result-card" onClick={() => onSelect(obra)}>
      <img className="result-cover" src={obra.cover || obra.coverLarge || '/logo.svg'} alt={obra.title} />
      <div className="result-body">
        <span className="result-type">{workType}</span>
        <h3>{obra.title}</h3>
        <p>{obra.author || 'Autor desconocido'}</p>
        <div className="result-meta">
          <span>{obra.likes?.toLocaleString() ?? '0'} likes</span>
          <span>{obra.reads?.toLocaleString() ?? '0'} leídos</span>
        </div>
      </div>
    </article>
  );
}

export default function Search() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workType, setWorkType] = useState(getQueryParam('work_type') || 'ALL');
  const [searchTerm, setSearchTerm] = useState(getQueryParam('search') || '');
  const [sortOption, setSortOption] = useState(getQueryParam('sort') || 'likes_desc');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchObras({ signal: controller.signal, workType: workType === 'ALL' ? undefined : workType });
        setObras(data);
      } catch (err) {
        setError(err.message || 'Error cargando resultados.');
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [workType]);

  useEffect(() => {
    const queryFiltered = filterObrasByQuery(obras, searchTerm);
    const sorted = sortObras(queryFiltered, sortOption);
    setFiltered(sorted);
  }, [obras, searchTerm, sortOption]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleWorkTypeChange = (event) => {
    setWorkType(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleSelectWork = (obra) => {
    const params = new URLSearchParams();
    params.set('workId', obra.id);
    window.location.href = `/detail?${params.toString()}`;
  };

  return (
    <div className="search-page">
      <header className="search-hero">
        <div>
          <span className="eyebrow">Buscar</span>
          <h1>Busca tu manga, manhwa o cómic favorito</h1>
          <p>Filtra por género, ordena por likes o por número de leídos y encuentra la historia perfecta.</p>
        </div>
      </header>

      <section className="search-controls">
        <div className="search-field">
          <label>Buscar título o autor</label>
          <input type="search" value={searchTerm} onChange={handleSearchChange} placeholder="Escribe un nombre, autor o etiqueta" />
        </div>
        <div className="search-field">
          <label>Tipo</label>
          <select value={workType} onChange={handleWorkTypeChange}>
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="search-field">
          <label>Ordenar por</label>
          <select value={sortOption} onChange={handleSortChange}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="search-results">
        <div className="section-title">
          <h2>Resultados</h2>
          <span>{filtered.length} obras encontradas</span>
        </div>

        {loading && (
          <div className="cards-grid">
            {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
          </div>
        )}

        {!loading && error && <div className="error-banner">{error}</div>}

        {!loading && !error && !filtered.length && <div className="empty-state">No se encontraron resultados para esta búsqueda.</div>}

        {!loading && !error && filtered.length > 0 && (
          <div className="cards-grid">
            {filtered.map((obra) => (
              <ResultCard key={obra.id} obra={obra} onSelect={handleSelectWork} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
