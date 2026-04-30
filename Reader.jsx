import { useEffect, useMemo, useState } from 'react';

export function Reader({ obra, episode, onClose, onOpenInfo, onShare, onNavigateEpisode }) {
  const [controlsVisible, setControlsVisible] = useState(false);
  const [liked, setLiked] = useState(false);

  const imageBlocks = useMemo(() => {
    if (!episode?.content) return [];
    return episode.content
      .filter((block) => block.type === 'image')
      .map((block) => block.value);
  }, [episode]);

  useEffect(() => {
    let timer;
    if (controlsVisible) {
      timer = window.setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => window.clearTimeout(timer);
  }, [controlsVisible]);

  const handleScreenClick = () => {
    setControlsVisible((visible) => !visible);
  };

  const handleLike = () => {
    setLiked((current) => !current);
    if (!liked) {
      alert('ENTENDIDO, RECIBIRÁS UNA NOTIFICACIÓN EN TU CAMPANA CUANDO HAYA UNA NUEVA ACTUALIZACIÓN DE CAPÍTULO');
    }
  };

  return (
    <div className="reader-fullscreen" onClick={handleScreenClick}>
      <div className={`reader-overlay ${controlsVisible ? 'visible' : 'hidden'}`}>
        <div className="reader-topbar">
          <button className="icon-btn" onClick={(event) => { event.stopPropagation(); onOpenInfo(); }}>Info</button>
          <button className="icon-btn" onClick={(event) => { event.stopPropagation(); onShare(); }}>Compartir</button>
        </div>

        <div className="reader-center">
          <button className="heart-button" onClick={(event) => { event.stopPropagation(); handleLike(); }}>
            {liked ? '❤️+' : '🤍+'}
          </button>
        </div>

        <div className="reader-bottombar">
          <button className="icon-btn" onClick={(event) => { event.stopPropagation(); onNavigateEpisode('prev'); }}>⬅️</button>
          <button className="icon-btn" onClick={(event) => { event.stopPropagation(); onNavigateEpisode('tocap'); }}>☰</button>
          <button className="icon-btn" onClick={(event) => { event.stopPropagation(); onNavigateEpisode('next'); }}>➡️</button>
        </div>
      </div>

      <div className="reader-content-scroll">
        <div className="reader-header-card">
          <img className="reader-cover" src={obra.coverLarge || obra.cover} alt={obra.title} />
          <div className="reader-header-text">
            <p className="reader-label">{obra.type} · Capítulo {episode.episode_number}</p>
            <h1>{obra.title}</h1>
            <p className="reader-subtitle">{obra.author} · {obra.status}</p>
            <p className="reader-synopsis">{obra.synopsis}</p>
          </div>
        </div>

        <div className="reader-images">
          {imageBlocks.length > 0 ? (
            imageBlocks.map((src, index) => (
              <img key={index} className="reader-image" src={src} alt={`${obra.title} página ${index + 1}`} />
            ))
          ) : (
            <div className="reader-empty">
              <p>No hay imágenes disponibles para este capítulo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
