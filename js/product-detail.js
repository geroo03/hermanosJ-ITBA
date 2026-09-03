/**
 * Hermanos Jota — Detalle de Mueble de Autor
 * Carga dinámica mediante URL query param (?id=...), galería, cuotas y piezas relacionadas.
 */

(function () {
  'use strict';

  function isProductInCart(productId) {
    if (!window.Cart || typeof window.Cart.getItems !== 'function') return false;
    return window.Cart.getItems().some((item) => String(item.id) === String(productId));
  }

  function renderDetailCard(product) {
    const formatPrice = window.HJ_DATA ? window.HJ_DATA.formatCurrencyARS : (v) => `$ ${v.toLocaleString('es-AR')}`;
    const inCart = isProductInCart(product.id);
    const cuota6 = Math.round(product.price / 6);

    return `
      <div class="product-detail-layout">
        <!-- Columna Visual -->
        <div class="detail-gallery-column">
          <div class="detail-image-card">
            ${product.badge ? `<span class="detail-badge">${product.badge}</span>` : ''}
            <img 
              src="${product.image}" 
              alt="${product.name}" 
              class="detail-main-img"
              onerror="this.onerror=null; this.src='assets/images/logo.svg';"
            >
          </div>
          <div class="detail-guarantee-strip">
            <div class="guarantee-item">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>10 Años de Garantía Estructural</span>
            </div>
            <div class="guarantee-item">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"/></svg>
              <span>Madera Nativa Certificada FSC</span>
            </div>
          </div>
        </div>

        <!-- Columna de Información -->
        <div class="detail-info-column">
          <div class="detail-header-tags">
            <span class="detail-tag-room">${product.type || product.category}</span>
            <span class="detail-tag-wood">${product.wood}</span>
          </div>

          <h1 class="detail-title">${product.name}</h1>
          
          <div class="detail-price-box">
            <span class="detail-price-amount">${formatPrice(product.price)}</span>
            <p class="detail-installments">
              o 6 cuotas de <strong>${formatPrice(cuota6)}</strong> con todas las tarjetas. 
              <span class="discount-badge">15% OFF por transferencia</span>
            </p>
          </div>

          <div class="detail-actions">
            <button 
              type="button" 
              class="btn btn-primary btn-lg btn-block ${inCart ? 'is-added' : ''}" 
              id="detailAddToCartBtn"
              data-id="${product.id}"
              ${inCart ? 'disabled' : ''}
            >
              ${inCart ? '✓ Ya en tu Selección' : 'Agregar a mi Selección'}
            </button>
            <p class="detail-delivery-notice">
              <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Envío bonificado a todo el país. Producción artesanal bajo encargo.
            </p>
          </div>

          <div class="detail-description">
            <p class="lead-text">${product.description}</p>
          </div>

          <!-- Especificaciones de Ebanistería -->
          <div class="detail-specs">
            <h3 class="specs-heading">Ficha de Ebanistería</h3>
            <dl class="specs-list">
              <div class="spec-row">
                <dt>Materiales:</dt>
                <dd>${product.materials}</dd>
              </div>
              <div class="spec-row">
                <dt>Dimensiones:</dt>
                <dd>${product.dimensions}</dd>
              </div>
              <div class="spec-row">
                <dt>Fabricación:</dt>
                <dd>${product.making}</dd>
              </div>
              <div class="spec-row">
                <dt>Programa Herencia Viva:</dt>
                <dd>Garantía decenal, trazabilidad forestal y servicio de restauración vitalicia en San Cristóbal.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    `;
  }

  function renderRelatedCard(product) {
    const formatPrice = window.HJ_DATA ? window.HJ_DATA.formatCurrencyARS : (v) => `$ ${v.toLocaleString('es-AR')}`;
    return `
      <article class="product-card">
        <div class="product-card-visual">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <a href="producto.html?id=${product.id}">
            <img src="${product.image}" alt="${product.name}" loading="lazy" class="product-card-img">
          </a>
        </div>
        <div class="product-card-body">
          <div class="product-card-header">
            <span class="product-category-tag">${product.type || product.category}</span>
          </div>
          <h3 class="product-card-title"><a href="producto.html?id=${product.id}">${product.name}</a></h3>
          <p class="product-card-description">${product.short}</p>
          <div class="product-card-footer">
            <strong class="product-price">${formatPrice(product.price)}</strong>
            <a href="producto.html?id=${product.id}" class="btn btn-sm btn-outline">Ver Pieza</a>
          </div>
        </div>
      </article>
    `;
  }

  async function initDetail() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'aparador-uspallata';

    try {
      const product = window.HJ_DATA 
        ? await window.HJ_DATA.getProductById(id, { delay: 300 })
        : (window.PRODUCTOS || []).find((p) => p.id === id);

      if (!product) {
        container.innerHTML = `
          <div class="catalog-empty-state">
            <h2>Pieza no encontrada</h2>
            <p>La pieza que buscas no existe o fue descontinuada.</p>
            <a href="productos.html" class="btn btn-primary">Volver al Catálogo</a>
          </div>
        `;
        return;
      }

      document.title = `${product.name} | Hermanos Jota`;
      const breadcrumb = document.getElementById('breadcrumbCurrent');
      if (breadcrumb) breadcrumb.textContent = product.name;

      container.innerHTML = renderDetailCard(product);

      // Botón agregar al carrito
      const addBtn = document.getElementById('detailAddToCartBtn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
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

          addBtn.classList.add('is-added');
          addBtn.disabled = true;
          addBtn.textContent = '✓ Ya en tu Selección';
        });
      }

      // Productos relacionados
      const relatedContainer = document.getElementById('relatedProductsContainer');
      const relatedSection = document.getElementById('relatedSection');
      if (relatedContainer && window.HJ_DATA) {
        const related = await window.HJ_DATA.getRelatedProducts(product.id, { limit: 3, delay: 200 });
        if (related.length > 0) {
          relatedContainer.innerHTML = related.map(renderRelatedCard).join('');
          if (relatedSection) relatedSection.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('[Detalle] Error al cargar producto:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetail);
  } else {
    initDetail();
  }
})();
