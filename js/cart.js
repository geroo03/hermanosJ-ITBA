/* ============================================================
   Hermanos Jota — Carrito de Compras
   Punto 4: Carrito de Compras, LocalStorage & Drawer Off-Canvas
   ============================================================
   Este módulo es autónomo: no depende de que existan data.js,
   icons.js ni main.js. Lee y escribe el estado del carrito en
   localStorage, renderiza el drawer lateral (#cartDrawer), el
   badge del header y el modal de checkout simulado ya presentes
   en el HTML de las 4 páginas.

   API pública (para que catalog.js / product-detail.js / home.js
   agreguen productos cuando estén listos):

     Cart.add(producto, cantidad)   // producto: {id, nombre, precio, imagen}
     Cart.remove(id)
     Cart.setQuantity(id, cantidad)
     Cart.increment(id)
     Cart.decrement(id)
     Cart.clear()
     Cart.getItems()
     Cart.getSubtotal()
     Cart.getTotalCount()
     Cart.open() / Cart.close()
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'hj_cart';
  const FREE_SHIPPING_THRESHOLD = 350000; // Coincide con el aviso del top-bar
  const MAX_QTY = 99;

  const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });

  const formatPrice = (value) => currencyFormatter.format(Number(value) || 0);

  // Escapa texto antes de inyectarlo como HTML (nombre/imagen pueden venir
  // de datos externos una vez que data.js exista).
  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value === undefined || value === null ? '' : String(value);
    return div.innerHTML;
  }

  let lastFocusedElement = null;

  // ------------------------------------------------------------
  // Estado — lectura/escritura en localStorage
  // ------------------------------------------------------------

  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('[Carrito] No se pudo leer localStorage, se reinicia el carrito.', error);
      return [];
    }
  }

  function writeCart(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('[Carrito] No se pudo guardar el carrito en localStorage.', error);
    }
    renderAll();
  }

  // ------------------------------------------------------------
  // API pública del carrito
  // ------------------------------------------------------------

  function addItem(producto, cantidad = 1) {
    if (!producto || producto.id === undefined || producto.id === null) {
      console.warn('[Carrito] Producto inválido, no se agregó.', producto);
      return;
    }

    const items = readCart();
    const cantidadValida = Math.max(1, Math.min(MAX_QTY, Math.floor(Number(cantidad)) || 1));
    const existente = items.find((item) => String(item.id) === String(producto.id));

    if (existente) {
      existente.cantidad = Math.min(MAX_QTY, existente.cantidad + cantidadValida);
    } else {
      items.push({
        id: producto.id,
        nombre: producto.nombre || 'Producto sin nombre',
        precio: Number(producto.precio) || 0,
        imagen: producto.imagen || '',
        cantidad: cantidadValida,
      });
    }

    writeCart(items);
    window.showToast?.(`${producto.nombre || 'Producto'} agregado al carrito`);
    openDrawer();
  }

  function removeItem(id) {
    writeCart(readCart().filter((item) => String(item.id) !== String(id)));
  }

  function setQuantity(id, cantidad) {
    const items = readCart();
    const item = items.find((item) => String(item.id) === String(id));
    if (!item) return;

    const nuevaCantidad = Math.floor(Number(cantidad));
    if (!Number.isFinite(nuevaCantidad) || nuevaCantidad <= 0) {
      removeItem(id);
      return;
    }
    item.cantidad = Math.min(MAX_QTY, nuevaCantidad);
    writeCart(items);
  }

  function incrementItem(id) {
    const item = readCart().find((item) => String(item.id) === String(id));
    if (item) setQuantity(id, item.cantidad + 1);
  }

  function decrementItem(id) {
    const item = readCart().find((item) => String(item.id) === String(id));
    if (item) setQuantity(id, item.cantidad - 1);
  }

  function clearCart() {
    writeCart([]);
  }

  function getItems() {
    return readCart();
  }

  function getSubtotal() {
    return readCart().reduce((total, item) => total + item.precio * item.cantidad, 0);
  }

  function getTotalCount() {
    return readCart().reduce((total, item) => total + item.cantidad, 0);
  }

  // ------------------------------------------------------------
  // Drawer off-canvas
  // ------------------------------------------------------------

  function openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer || !overlay) return;

    lastFocusedElement = document.activeElement;
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-drawer-open');
    document.getElementById('closeCartBtn')?.focus();
  }

  function closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (!drawer || !overlay) return;

    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-drawer-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  // ------------------------------------------------------------
  // Checkout simulado
  // ------------------------------------------------------------

  function openCheckoutModal() {
    const items = readCart();
    if (items.length === 0) return;

    const subtotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);
    const totalCount = items.reduce((total, item) => total + item.cantidad, 0);

    const detailsEl = document.getElementById('checkoutModalDetails');
    if (detailsEl) {
      detailsEl.innerHTML = `
        <div class="checkout-summary">
          <p>${totalCount} ${totalCount === 1 ? 'producto' : 'productos'} · <strong>${formatPrice(subtotal)}</strong></p>
          <p class="checkout-summary-note">Te contactaremos para coordinar la entrega en San Cristóbal, CABA.</p>
        </div>
      `;
    }

    clearCart(); // La orden queda confirmada: se vacía el carrito
    closeDrawer();
    document.getElementById('checkoutModal')?.classList.add('is-open');
  }

  window.cerrarModalCheckout = function cerrarModalCheckout() {
    document.getElementById('checkoutModal')?.classList.remove('is-open');
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  function renderCartItems(items) {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p>Tu carrito está vacío</p>
          <a href="productos.html" class="btn-outline">Ver Catálogo</a>
        </div>
      `;
      return;
    }

    container.innerHTML = items
      .map((item) => `
        <div class="cart-item" data-id="${escapeHtml(item.id)}">
          <div class="cart-item-img">
            ${item.imagen
              ? `<img src="${escapeHtml(item.imagen)}" alt="${escapeHtml(item.nombre)}" loading="lazy">`
              : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="1"/><path d="M3 7l3-4h12l3 4"/><path d="M3 11h18"/></svg>`}
          </div>
          <div class="cart-item-info">
            <p class="cart-item-name">${escapeHtml(item.nombre)}</p>
            <p class="cart-item-unit-price">${formatPrice(item.precio)} c/u</p>
            <div class="cart-item-qty" role="group" aria-label="Cantidad de ${escapeHtml(item.nombre)}">
              <button type="button" class="qty-btn" data-action="decrement" aria-label="Restar una unidad">−</button>
              <span class="qty-value">${item.cantidad}</span>
              <button type="button" class="qty-btn" data-action="increment" aria-label="Sumar una unidad">+</button>
            </div>
          </div>
          <div class="cart-item-side">
            <span class="cart-item-subtotal">${formatPrice(item.precio * item.cantidad)}</span>
            <button type="button" class="cart-item-remove" data-action="remove" aria-label="Eliminar ${escapeHtml(item.nombre)} del carrito">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>
      `)
      .join('');
  }

  function renderCartFooter(items) {
    const container = document.getElementById('cartFooterContainer');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '';
      return;
    }

    const subtotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);

    container.innerHTML = `
      <div class="cart-summary-row">
        <span>Subtotal</span>
        <span class="cart-summary-total">${formatPrice(subtotal)}</span>
      </div>
      <p class="cart-summary-note">Envío e impuestos se calculan al finalizar la compra.</p>
      <button type="button" class="btn-block" id="checkoutBtn">Finalizar Compra</button>
    `;
  }

  function renderShippingProgress(items) {
    const container = document.getElementById('cartShippingProgress');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '';
      return;
    }

    const subtotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);
    const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

    const message = remaining > 0
      ? `Te faltan <strong>${formatPrice(remaining)}</strong> para <strong>envío gratis</strong>`
      : '¡Envío gratis desbloqueado!';

    container.innerHTML = `
      <p class="shipping-progress-text">${message}</p>
      <div class="shipping-progress-bar"><div class="shipping-progress-fill" style="width:${percent}%"></div></div>
    `;
  }

  function updateBadge(items) {
    const badge = document.getElementById('headerCartBadge');
    if (!badge) return;

    const count = items.reduce((total, item) => total + item.cantidad, 0);
    badge.textContent = String(count);
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  function renderAll() {
    const items = readCart();
    renderCartItems(items);
    renderCartFooter(items);
    renderShippingProgress(items);
    updateBadge(items);
  }

  // ------------------------------------------------------------
  // Eventos (delegados — funcionan aunque el contenido se re-renderice)
  // ------------------------------------------------------------

  document.addEventListener('click', (event) => {
    if (event.target.closest('#openCartBtn')) {
      openDrawer();
      return;
    }

    if (event.target.closest('#closeCartBtn')) {
      closeDrawer();
      return;
    }

    if (event.target.id === 'cartOverlay') {
      closeDrawer();
      return;
    }

    if (event.target.id === 'checkoutModal') {
      window.cerrarModalCheckout();
      return;
    }

    const checkoutBtn = event.target.closest('#checkoutBtn');
    if (checkoutBtn) {
      openCheckoutModal();
      return;
    }

    const actionBtn = event.target.closest('#cartItemsContainer [data-action]');
    if (actionBtn) {
      const itemEl = actionBtn.closest('.cart-item');
      const id = itemEl?.dataset.id;
      if (!id) return;

      switch (actionBtn.dataset.action) {
        case 'increment':
          incrementItem(id);
          break;
        case 'decrement':
          decrementItem(id);
          break;
        case 'remove':
          removeItem(id);
          break;
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const modal = document.getElementById('checkoutModal');
    if (modal?.classList.contains('is-open')) {
      window.cerrarModalCheckout();
      return;
    }

    const drawer = document.getElementById('cartDrawer');
    if (drawer?.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // Sincronización entre pestañas/páginas: si el carrito cambia en otra
  // pestaña, se refleja acá sin necesidad de recargar.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      renderAll();
    }
  });

  document.addEventListener('DOMContentLoaded', renderAll);

  // ------------------------------------------------------------
  // Exposición pública
  // ------------------------------------------------------------

  window.Cart = {
    add: addItem,
    remove: removeItem,
    setQuantity,
    increment: incrementItem,
    decrement: decrementItem,
    clear: clearCart,
    getItems,
    getSubtotal,
    getTotalCount,
    open: openDrawer,
    close: closeDrawer,
  };
})();
