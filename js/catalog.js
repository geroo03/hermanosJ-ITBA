/**
 * Hermanos Jota — Módulo de Catálogo & Búsqueda Reactiva
 * Rol: Tadeo Piccato (Lógica de Catálogo, Búsqueda Reactiva & Asincronismo JS)
 * 
 * Funcionalidades:
 * - Carga asíncrona simulada con skeletons de alta fidelidad.
 * - Búsqueda reactiva en tiempo real insensible a mayúsculas y tildes.
 * - Filtros combinados por ambientes/categorías y ordenamiento dinámico.
 * - Sincronización bidireccional con URL query params (?cat=... & q=... & sort=...).
 * - Tarjetas interactivas conectadas a Cart.add() sin productos duplicados.
 * - Estado de resultados vacíos interactivo (Empty State).
 * - Enfoque Mobile-First y accesibilidad WAI-ARIA.
 */

(function () {
  'use strict';

  // Referencias a elementos del DOM
  let searchInput = null;
  let searchClearBtn = null;
  let categoryPillsContainer = null;
  let sortSelect = null;
  let resultsCount = null;
  let activeFilterBadge = null;
  let activeFilterText = null;
  let clearActiveFilterBtn = null;
  let catalogGrid = null;

  // Estado local del catálogo
  let allProducts = [];
  let currentCategory = 'todos';
  let currentSearchQuery = '';
  let currentSort = 'default';
  let searchDebounceTimer = null;

  /**
   * Genera el HTML de las tarjetas Skeleton mientras se simula la carga asíncrona.
   * @param {number} count
   * @returns {string}
   */
  function renderSkeletons(count = 6) {
    return Array.from({ length: count }, () => `
      <div class="product-card skeleton-card" aria-hidden="true">
        <div class="skeleton-image-wrapper">
          <div class="skeleton-box skeleton-image"></div>
        </div>
        <div class="product-card-body">
          <div class="skeleton-box skeleton-tag"></div>
          <div class="skeleton-box skeleton-title"></div>
          <div class="skeleton-box skeleton-desc"></div>
          <div class="skeleton-box skeleton-desc short"></div>
          <div class="product-card-footer">
            <div class="skeleton-box skeleton-price"></div>
            <div class="skeleton-box skeleton-button"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Determina si un producto ya se encuentra en el carrito persistente.
   * @param {string} productId
   * @returns {boolean}
   */
  function isProductInCart(productId) {
    if (!window.Cart || typeof window.Cart.getItems !== 'function') return false;
    const items = window.Cart.getItems();
    return items.some((item) => String(item.id) === String(productId));
  }

  /**
   * Genera el HTML de una tarjeta de producto individual.
   * @param {Object} product
   * @returns {string}
   */
  function createProductCardHTML(product) {
    const inCart = isProductInCart(product.id);
    const formatPrice = window.HJ_DATA ? window.HJ_DATA.formatCurrencyARS : (v) => `$ ${v.toLocaleString('es-AR')}`;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card-visual">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <a href="producto.html?id=${product.id}" class="product-card-img-link" aria-label="Ver detalle de ${product.name}">
            <img 
              src="${product.image}" 
              alt="${product.name} — ${product.wood}" 
              loading="lazy" 
              class="product-card-img"
              onerror="this.onerror=null; this.src='assets/images/logo.svg'; this.style.padding='2rem';"
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

          <p class="product-card-description">${product.short || product.description}</p>
          
          <div class="product-card-meta">
            <span class="meta-item">
              <svg class="icon icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.3 15.3l-6.6 6.6c-.4.4-1 .4-1.4 0l-11-11c-.4-.4-.4-1 0-1.4l6.6-6.6c.4-.4 1-.4 1.4 0l11 11c.4.4.4 1 0 1.4z"/></svg>
              ${product.dimensions}
            </span>
          </div>

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

  /**
   * Genera el HTML para el estado vacío (sin coincidencias).
   * @returns {string}
   */
  function createEmptyStateHTML() {
    return `
      <div class="catalog-empty-state" role="status">
        <div class="empty-icon-wrapper">
          <svg class="icon icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
        <h2 class="empty-title">No encontramos esa pieza artesanal</h2>
        <p class="empty-description">
          Intentá con otros términos (ej: <em>roble</em>, <em>petiribí</em>, <em>nogal</em>, <em>comedor</em>, <em>living</em>) 
          o restablecé los filtros para ver la colección completa.
        </p>
        <button type="button" class="btn btn-outline" id="btnResetFilters">
          Ver todo el catálogo de autor
        </button>
      </div>
    `;
  }

  /**
   * Filtra y ordena los productos en base al estado actual.
   * @returns {Array}
   */
  function getFilteredAndSortedProducts() {
    const normalize = window.HJ_DATA ? window.HJ_DATA.normalizeText : (t) => (t || '').toLowerCase();
    const query = normalize(currentSearchQuery);
    const cat = currentCategory.toLowerCase();

    // 1. Filtrado
    let filtered = allProducts.filter((product) => {
      // Coincidencia de Categoría / Ambiente
      let matchesCategory = false;
      if (cat === 'todos') {
        matchesCategory = true;
      } else {
        const prodCat = normalize(product.category);
        const prodType = normalize(product.type);
        const prodCategories = Array.isArray(product.categories) ? product.categories.map(normalize) : [];
        matchesCategory = prodCat === cat || prodType === cat || prodCategories.includes(cat);
      }

      if (!matchesCategory) return false;

      // Coincidencia de Búsqueda Reactiva
      if (!query) return true;

      const haystack = normalize(`
        ${product.name} 
        ${product.category} 
        ${product.type} 
        ${product.wood} 
        ${product.materials} 
        ${product.short} 
        ${product.description}
      `);

      return haystack.includes(query);
    });

    // 2. Ordenamiento Dinámico
    switch (currentSort) {
      case 'price-asc':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name, 'es', { sensitivity: 'base' }));
        break;
      case 'default':
      default:
        // Destacados primero, luego orden del catálogo original
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }

  /**
   * Renderiza los productos en la grilla y actualiza contadores y badges.
   */
  function renderCatalog() {
    if (!catalogGrid) return;

    const filtered = getFilteredAndSortedProducts();

    // Renderizar tarjetas o estado de vacío
    if (filtered.length === 0) {
      catalogGrid.innerHTML = createEmptyStateHTML();
      document.getElementById('btnResetFilters')?.addEventListener('click', resetAllFilters);
    } else {
      catalogGrid.innerHTML = filtered.map(createProductCardHTML).join('');
    }

    // Actualizar Contador de Resultados
    if (resultsCount) {
      const total = filtered.length;
      if (total === 0) {
        resultsCount.textContent = '0 piezas encontradas';
      } else if (total === 1) {
        resultsCount.textContent = '1 pieza artesanal disponible';
      } else {
        resultsCount.textContent = `${total} piezas artesanales disponibles`;
      }
    }

    // Actualizar Badge de Filtro Activo
    updateActiveFilterBadge();

    // Sincronizar visibilidad del botón de limpiar búsqueda
    if (searchClearBtn) {
      searchClearBtn.style.display = currentSearchQuery.trim() ? 'flex' : 'none';
    }
  }

  /**
   * Actualiza el badge visual que indica qué filtro está activo.
   */
  function updateActiveFilterBadge() {
    if (!activeFilterBadge || !activeFilterText) return;

    const hasCategoryFilter = currentCategory !== 'todos';
    const hasSearchFilter = Boolean(currentSearchQuery.trim());

    if (!hasCategoryFilter && !hasSearchFilter) {
      activeFilterBadge.style.display = 'none';
      return;
    }

    const labels = [];
    if (hasCategoryFilter) {
      const catName = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
      labels.push(`Ambiente: ${catName}`);
    }
    if (hasSearchFilter) {
      labels.push(`Búsqueda: "${currentSearchQuery.trim()}"`);
    }

    activeFilterText.textContent = labels.join(' · ');
    activeFilterBadge.style.display = 'inline-flex';
  }

  /**
   * Sincroniza el estado de los botones "Agregar al carrito" en todo el catálogo.
   */
  function syncCatalogButtons() {
    if (!catalogGrid) return;
    const buttons = catalogGrid.querySelectorAll('[data-add-id]');
    buttons.forEach((btn) => {
      const id = btn.getAttribute('data-add-id');
      const inCart = isProductInCart(id);
      btn.disabled = inCart;
      btn.classList.toggle('is-added', inCart);
      const textSpan = btn.querySelector('.btn-text');
      const iconSpan = btn.querySelector('.btn-icon');
      if (textSpan) textSpan.textContent = inCart ? 'En el Carrito' : 'Agregar';
      if (iconSpan) {
        iconSpan.innerHTML = inCart 
          ? `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` 
          : `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
      }
    });
  }

  /**
   * Restablece todos los filtros de búsqueda y categoría al estado predeterminado.
   */
  function resetAllFilters() {
    currentCategory = 'todos';
    currentSearchQuery = '';
    currentSort = 'default';

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';

    // Actualizar pills visualmente
    if (categoryPillsContainer) {
      categoryPillsContainer.querySelectorAll('.pill-btn').forEach((btn) => {
        const cat = btn.getAttribute('data-category') || btn.getAttribute('data-cat');
        btn.classList.toggle('active', cat === 'todos');
        btn.setAttribute('aria-selected', cat === 'todos' ? 'true' : 'false');
      });
    }

    updateURLParams();
    renderCatalog();
  }

  /**
   * Actualiza los parámetros de la URL sin recargar la página.
   */
  function updateURLParams() {
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== 'todos') {
      params.set('cat', currentCategory);
    }
    if (currentSearchQuery.trim()) {
      params.set('q', currentSearchQuery.trim());
    }
    if (currentSort && currentSort !== 'default') {
      params.set('sort', currentSort);
    }

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState(null, '', newUrl);
  }

  /**
   * Lee los parámetros de la URL al cargar la página.
   */
  function readURLParams() {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat') || params.get('category');
    const searchParam = params.get('q') || params.get('search');
    const sortParam = params.get('sort');

    if (catParam) {
      currentCategory = catParam.toLowerCase();
    }
    if (searchParam) {
      currentSearchQuery = searchParam;
      if (searchInput) searchInput.value = searchParam;
    }
    if (sortParam) {
      currentSort = sortParam;
      if (sortSelect) sortSelect.value = sortParam;
    }

    // Activar el pill correspondiente
    if (categoryPillsContainer) {
      categoryPillsContainer.querySelectorAll('.pill-btn').forEach((btn) => {
        const cat = (btn.getAttribute('data-category') || btn.getAttribute('data-cat') || '').toLowerCase();
        const isActive = cat === currentCategory;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  }

  /**
   * Manejador de clic en la grilla (Event Delegation) para agregar al carrito.
   */
  function handleGridClick(event) {
    const addBtn = event.target.closest('[data-add-id]');
    if (!addBtn) return;

    const id = addBtn.getAttribute('data-add-id');
    const product = allProducts.find((p) => p.id === id);
    if (!product) return;

    // Regla de Recursos/adicional.md: No agregar si ya existe en el carrito
    if (isProductInCart(product.id)) {
      if (window.showToast) {
        window.showToast(`${product.name} ya está en tu carrito.`);
      }
      window.Cart?.open?.();
      return;
    }

    // Agregar al carrito mediante la API de Cart.js
    if (window.Cart && typeof window.Cart.add === 'function') {
      window.Cart.add({
        id: product.id,
        nombre: product.name,
        precio: product.price,
        imagen: product.image
      }, 1);

      // Micro-interacción: animar el botón
      addBtn.classList.add('is-added');
      addBtn.disabled = true;
      const textSpan = addBtn.querySelector('.btn-text');
      const iconSpan = addBtn.querySelector('.btn-icon');
      if (textSpan) textSpan.textContent = '¡Agregado!';
      if (iconSpan) {
        iconSpan.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      }

      window.setTimeout(() => {
        if (textSpan) textSpan.textContent = 'En el Carrito';
      }, 1200);
    }
  }

  /**
   * Configuración de los listeners de eventos para reactividad y controles.
   */
  function setupEventListeners() {
    // 1. Búsqueda Reactiva en tiempo real con debounce
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        window.clearTimeout(searchDebounceTimer);
        searchDebounceTimer = window.setTimeout(() => {
          currentSearchQuery = e.target.value;
          updateURLParams();
          renderCatalog();
        }, 120);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          currentSearchQuery = '';
          updateURLParams();
          renderCatalog();
        }
      });
    }

    // 2. Limpiar búsqueda
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        currentSearchQuery = '';
        updateURLParams();
        renderCatalog();
      });
    }

    // 3. Filtros por Pills de Categoría/Ambiente
    if (categoryPillsContainer) {
      categoryPillsContainer.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill-btn');
        if (!pill) return;

        const cat = (pill.getAttribute('data-category') || pill.getAttribute('data-cat') || 'todos').toLowerCase();
        if (cat === currentCategory) return;

        currentCategory = cat;

        categoryPillsContainer.querySelectorAll('.pill-btn').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        updateURLParams();
        renderCatalog();
      });
    }

    // 4. Selector de Ordenamiento Dinámico
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        updateURLParams();
        renderCatalog();
      });
    }

    // 5. Botón de Descarte de Filtro Activo
    if (clearActiveFilterBtn) {
      clearActiveFilterBtn.addEventListener('click', resetAllFilters);
    }

    // 6. Delegación de eventos en la grilla para agregar al carrito
    if (catalogGrid) {
      catalogGrid.addEventListener('click', handleGridClick);
    }

    // 7. Sincronización cuando el carrito cambie (en caso de eliminar items)
    window.addEventListener('storage', syncCatalogButtons);
    window.addEventListener('hj:cart-updated', syncCatalogButtons);
  }

  /**
   * Inicialización asíncrona del catálogo oficial.
   */
  async function initCatalog() {
    catalogGrid = document.getElementById('catalogGrid');
    if (!catalogGrid) return; // No estamos en la página productos.html

    searchInput = document.getElementById('searchInput');
    searchClearBtn = document.getElementById('searchClearBtn');
    categoryPillsContainer = document.getElementById('categoryPills');
    sortSelect = document.getElementById('sortSelect');
    resultsCount = document.getElementById('resultsCount');
    activeFilterBadge = document.getElementById('activeFilterBadge');
    activeFilterText = document.getElementById('activeFilterText');
    clearActiveFilterBtn = document.getElementById('clearActiveFilterBtn');

    // 1. Mostrar skeletons inicialmente simulando latencia asíncrona
    catalogGrid.innerHTML = renderSkeletons(6);
    if (resultsCount) resultsCount.textContent = 'Cargando catálogo oficial de autor...';

    // 2. Cargar datos mediante el método asíncrono simulación API
    try {
      if (window.HJ_DATA && typeof window.HJ_DATA.getProducts === 'function') {
        allProducts = await window.HJ_DATA.getProducts({ delay: 450 });
      } else if (Array.isArray(window.PRODUCTOS)) {
        allProducts = [...window.PRODUCTOS];
      } else {
        allProducts = [];
      }
    } catch (err) {
      console.error('[Catálogo] Error al cargar productos asíncronos:', err);
      allProducts = [];
    }

    // 3. Leer parámetros iniciales de la URL
    readURLParams();

    // 4. Configurar escuchadores reactivos
    setupEventListeners();

    // 5. Renderizar catálogo
    renderCatalog();
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalog);
  } else {
    initCatalog();
  }

  // Exponer API pública del catálogo
  window.Catalog = {
    init: initCatalog,
    render: renderCatalog,
    resetFilters: resetAllFilters,
    syncButtons: syncCatalogButtons
  };
})();
