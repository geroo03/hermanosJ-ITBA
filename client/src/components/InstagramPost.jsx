import { useEffect, useRef, useState } from 'react';
import { getImageUrl } from '../utils/productHelpers';
import '../styles/instagram.css';

const INITIAL_LIKES = 12386;
const INSTAGRAM_URL = 'https://instagram.com/hermanosjota_ba';
const INITIAL_COMMENTS = [
  { id: 1, author: 'carolo_l', text: 'Esa veta es preciosa 🌿' },
  { id: 2, author: 'estudio.tarum', text: 'El Aparador Uspallata es un lujo 👏' },
];

const numberFormatter = new Intl.NumberFormat('es-AR');

/**
 * Simula una publicación de Instagram con su diseño interactivo.
 * Es una demostración: nada se envía ni se conserva al recargar la página.
 */
function InstagramPost() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hearted, setHearted] = useState(false);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('');
  const inputRef = useRef(null);
  const heartTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(heartTimeoutRef.current), []);

  function handleShare() {
    const data = {
      title: 'Hermanos Jota',
      text: 'Muebles que alimentan el alma.',
      url: INSTAGRAM_URL,
    };

    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(INSTAGRAM_URL);
        setStatus('Enlace copiado al portapapeles');
      } catch {
        setStatus('Compartí esta pieza: @hermanosjota_ba');
      }
    };

    if (navigator.share) {
      navigator.share(data).catch((error) => {
        if (error?.name !== 'AbortError') copyLink();
      });
      return;
    }
    copyLink();
  }

  function handleDoubleClick() {
    setLiked(true);
    setHearted(true);
    clearTimeout(heartTimeoutRef.current);
    heartTimeoutRef.current = setTimeout(() => setHearted(false), 900);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }
    setComments((current) => [...current, { id: Date.now(), author: 'vos', text }]);
    setDraft('');
    setStatus('Comentario publicado en esta demostración');
  }

  return (
    <section className="instagram-section" aria-labelledby="instagram-title">
      <div className="instagram-layout">
        <div className="instagram-copy">
          <p className="home-tag">Desde el Taller</p>
          <h2 id="instagram-title" className="instagram-copy__title">
            Una historia, treinta segundos
          </h2>
          <p className="instagram-copy__text">
            El oficio también vive en los gestos cotidianos: el cepillo sobre la veta, el aceite de lino tibio, la pausa justa antes del ensamble. Reproducí el video, dejá tu corazón, guardalo o sumate a la conversación.
          </p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
            Seguinos en @hermanosjota_ba
          </a>
        </div>

        <article
          className={`ig-post${hearted ? ' is-hearted' : ''}`}
          aria-label="Publicación interactiva de Instagram de Hermanos Jota"
        >
          <header className="ig-post__header">
            <span className="ig-avatar">
              <img src={getImageUrl('assets/images/logo.svg')} alt="" width="44" height="44" />
            </span>
            <div className="ig-account">
              <strong>muebleria_hnos_jota</strong>
              <small>Buenos Aires, Argentina</small>
            </div>
          </header>

          <div className="ig-media" onDoubleClick={handleDoubleClick}>
            <video
              className="ig-video"
              controls
              playsInline
              preload="metadata"
              poster={getImageUrl('assets/images/historia-taller.jpg')}
              aria-label="Video: el taller de Hermanos Jota en treinta segundos"
            >
              <source src={getImageUrl('assets/video/instagram-hermanos-jota.mp4')} type="video/mp4" />
            </video>
          </div>

          <div className="ig-actions">
            <button
              type="button"
              className={`ig-action ig-action--like${liked ? ' is-active' : ''}`}
              aria-label="Me gusta"
              aria-pressed={liked}
              onClick={() => setLiked((current) => !current)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
            </button>
            <button
              type="button"
              className="ig-action"
              aria-label="Comentar esta publicación"
              onClick={() => inputRef.current?.focus()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.5A8.6 8.6 0 1 1 21 11.5Z" /></svg>
            </button>
            <button type="button" className="ig-action" aria-label="Compartir publicación" onClick={handleShare}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
            </button>
            <button
              type="button"
              className={`ig-action ig-action--save${saved ? ' is-active' : ''}`}
              aria-label="Guardar publicación"
              aria-pressed={saved}
              onClick={() => setSaved((current) => !current)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z" /></svg>
            </button>
          </div>

          <div className="ig-caption">
            <p className="ig-likes">{numberFormatter.format(INITIAL_LIKES + (liked ? 1 : 0))} Me gusta</p>
            <p className="ig-text">
              <strong>muebleria_hnos_jota</strong> Renová tu hogar con piezas que envejecen con gracia. ✨ Nogal argentino certificado FSC, aceite de lino prensado en frío y 10 años de garantía estructural.{' '}
              <span className="ig-hashtag">#HerenciaViva</span> <span className="ig-hashtag">#MaderaNoble</span>
            </p>
          </div>

          <ul className="ig-comments" aria-live="polite">
            {comments.map(({ id, author, text }) => (
              <li key={id}>
                <strong>{author}</strong> {text}
              </li>
            ))}
          </ul>

          <p className="ig-meta">Hace 2 días</p>
          <p className="ig-status" role="status">{status}</p>

          <form className="ig-comment-form" onSubmit={handleSubmit} noValidate>
            <input
              ref={inputRef}
              type="text"
              className="ig-comment-input"
              aria-label="Agregar un comentario"
              placeholder="Agregá un comentario…"
              maxLength="140"
              autoComplete="off"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="submit" className="ig-publish">Publicar</button>
          </form>
        </article>
      </div>
    </section>
  );
}

export default InstagramPost;
