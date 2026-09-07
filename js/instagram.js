/**
 * Hermanos Jota — Fragmento de Instagram Interactivo (index.html)
 *
 * Implementa la consigna de `Recursos/fragmento instagram/Instrucción.md`:
 * una sección que simula un video extraído de Instagram con su diseño
 * interactivo incluido (me gusta, guardado, comentarios y compartir).
 *
 * Es una demostración de front-end: no hay backend, nada se persiste
 * más allá de la sesión de la página.
 */

(function () {
  'use strict';

  const LIKES_INICIALES = 12386;
  const numberFormatter = new Intl.NumberFormat('es-AR');

  function initInstagramPost() {
    const post = document.querySelector('.ig-post');
    if (!post) return;

    const likeBtn = post.querySelector('[data-ig-like]');
    const saveBtn = post.querySelector('[data-ig-save]');
    const shareBtn = post.querySelector('[data-ig-share]');
    const focusBtn = post.querySelector('[data-ig-focus-comment]');
    const likeCount = post.querySelector('[data-ig-like-count]');
    const commentsList = post.querySelector('[data-ig-comments]');
    const commentForm = post.querySelector('[data-ig-comment-form]');
    const commentInput = post.querySelector('.ig-comment-input');
    const video = post.querySelector('.ig-video');

    let likes = LIKES_INICIALES;

    const renderLikes = () => {
      if (likeCount) likeCount.textContent = `${numberFormatter.format(likes)} Me gusta`;
    };

    // ----- Me gusta (toggle con contador) -----
    likeBtn?.addEventListener('click', () => {
      const activo = likeBtn.classList.toggle('is-active');
      likeBtn.setAttribute('aria-pressed', String(activo));
      likes += activo ? 1 : -1;
      renderLikes();
      window.showToast?.(activo ? 'Te gusta esta publicación' : 'Ya no te gusta esta publicación');
    });

    // ----- Guardar (toggle) -----
    saveBtn?.addEventListener('click', () => {
      const activo = saveBtn.classList.toggle('is-active');
      saveBtn.setAttribute('aria-pressed', String(activo));
      window.showToast?.(activo ? 'Publicación guardada' : 'Publicación quitada de guardados');
    });

    // ----- Compartir -----
    shareBtn?.addEventListener('click', async () => {
      const datos = {
        title: 'Hermanos Jota',
        text: 'Muebles que alimentan el alma.',
        url: 'https://instagram.com/hermanosjota_ba',
      };

      if (navigator.share) {
        try {
          await navigator.share(datos);
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return; // el usuario canceló
        }
      }

      try {
        await navigator.clipboard.writeText(datos.url);
        window.showToast?.('Enlace copiado al portapapeles');
      } catch (error) {
        window.showToast?.('Compartí esta pieza: @hermanosjota_ba');
      }
    });

    // ----- Doble clic sobre el video: corazón, como en la app -----
    post.querySelector('.ig-media')?.addEventListener('dblclick', () => {
      if (likeBtn && !likeBtn.classList.contains('is-active')) likeBtn.click();
      post.classList.add('is-hearted');
      window.setTimeout(() => post.classList.remove('is-hearted'), 900);
    });

    // ----- Comentarios -----
    focusBtn?.addEventListener('click', () => commentInput?.focus());

    commentForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const texto = (commentInput?.value || '').trim();
      if (!texto) {
        commentInput?.focus();
        return;
      }

      const item = document.createElement('li');
      const autor = document.createElement('strong');
      autor.textContent = 'vos';
      item.appendChild(autor);
      // textContent (no innerHTML): el comentario del usuario nunca se
      // interpreta como HTML.
      item.appendChild(document.createTextNode(` ${texto}`));
      commentsList?.appendChild(item);

      commentInput.value = '';
      window.showToast?.('Comentario publicado en esta demostración');
    });

    // ----- Una sola reproducción a la vez -----
    video?.addEventListener('play', () => {
      document.querySelectorAll('video').forEach((otro) => {
        if (otro !== video && !otro.paused && !otro.muted) otro.pause();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstagramPost);
  } else {
    initInstagramPost();
  }
})();
