/**
 * Hermanos Jota — Portada & Piezas Destacadas Asíncronas
 * Inyecta las 4 piezas destacadas con simulación de carga y skeletons.
 */

(function () {
  'use strict';

  function renderFeaturedSkeletons(container, count = 4) {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }, () => `
      <div class="product-card skeleton-card" aria-hidden="true">
        <div class="skeleton-image-wrapper">
          <div class="skeleton-box skeleton-image"></div>
        </div>
        <div class="product-card-body">
          <div class="skeleton-box skeleton-tag"></div>
          <div class="skeleton-box skeleton-title"></div>
          <div class="skeleton-box skeleton-desc"></div>
          <div class="product-card-footer">
            <div class="skeleton-box skeleton-price"></div>
            <div class="skeleton-box skeleton-button"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function isProductInCart(productId) {
    if (!window.Cart || typeof window.Cart.getItems !== 'function') return false;
    return window.Cart.getItems().some((item) => String(item.id) === String(productId));
  }

  function renderFeaturedCard(product) {
    const inCart = isProductInCart(product.id);
    const formatPrice = window.HJ_DATA ? window.HJ_DATA.formatCurrencyARS : (v) => `$ ${v.toLocaleString('es-AR')}`;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card-visual">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <a href="producto.html?id=${product.id}" class="product-card-img-link" aria-label="Ver detalle de ${product.name}">
            <img 
              src="${product.image}" 
              alt="${product.name}" 
              loading="lazy" 
              class="product-card-img"
              onerror="this.onerror=null; this.src='assets/images/logo.svg';"
            >
          </a>
        </div>
        <div class="product-card-body">
          <div class="product-card-header">
            <span class="product-category-tag">${product.type || product.category}</span>
            <span class="product-wood-tag">${product.wood}</span>
          </div>
          <h3 class="product-card-title">
            <a href="producto.html?id=${product.id}">${product.name}</a>
          </h3>
          <p class="product-card-description">${product.short}</p>
          <div class="product-card-footer">
            <div class="product-price-box">
              <span class="price-label">Valor artesanal</span>
              <strong class="product-price">${formatPrice(product.price)}</strong>
            </div>
            <button 
              type="button" 
              class="btn-add-cart ${inCart ? 'is-added' : ''}" 
              data-add-id="${product.id}"
              aria-label="${inCart ? `${product.name} ya está en tu carrito` : `Agregar ${product.name} al carrito`}"
              ${inCart ? 'disabled' : ''}
            >
              <span class="btn-text">${inCart ? 'En el Carrito' : 'Agregar'}</span>
              <span class="btn-icon">
                ${inCart 
                  ? `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` 
                  : `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
                }
              </span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  async function initHome() {
    const container = document.getElementById('featuredProductsContainer');
    if (!container) return;

    renderFeaturedSkeletons(container, 4);

    try {
      const featured = window.HJ_DATA 
        ? await window.HJ_DATA.getFeaturedProducts({ delay: 400 })
        : (window.PRODUCTOS || []).filter((p) => p.featured);

      container.innerHTML = featured.map(renderFeaturedCard).join('');

      container.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-add-id]');
        if (!btn) return;
        const id = btn.getAttribute('data-add-id');
        const product = (window.PRODUCTOS || []).find((p) => p.id === id);
        if (!product) return;

        if (isProductInCart(product.id)) {
          window.showToast?.(`${product.name} ya está en tu carrito.`);
          window.Cart?.open?.();
          return;
        }

        window.Cart?.add?.({
          id: product.id,
          nombre: product.name,
          precio: product.price,
          imagen: product.image
        }, 1);

        btn.classList.add('is-added');
        btn.disabled = true;
        const text = btn.querySelector('.btn-text');
        if (text) text.textContent = 'En el Carrito';
      });
    } catch (error) {
      console.error('[Home] Error al cargar destacados:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHome);
  } else {
    initHome();
  }
})();
