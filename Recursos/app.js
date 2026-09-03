(function () {
  "use strict";

  const products = window.HJ_PRODUCTS || [];
  const CART_KEY = "hermanos-jota-cart";
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
  let memoryCart = [];

  const icons = {
    cart: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 3h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 7H6"/><circle cx="10" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>',
    close: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    trash: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/></svg>',
    arrow: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
    heart: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>',
    comment: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.5A8.6 8.6 0 1 1 21 11.5Z"/></svg>',
    send: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    bookmark: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4Z"/></svg>'
  };

  function money(value) {
    return formatter.format(value).replace("ARS", "$ ");
  }

  function readCart() {
    try {
      const ids = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      memoryCart = Array.isArray(ids) ? ids.filter((id) => products.some((p) => p.id === id)) : [];
      return [...memoryCart];
    } catch (_) {
      return [...memoryCart];
    }
  }

  function saveCart(ids) {
    memoryCart = [...ids];
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(ids));
    } catch (_) {
      /* La sesión conserva el carrito aunque el navegador bloquee localStorage en file://. */
    }
  }

  function cartProducts() {
    const ids = readCart();
    return ids.map((id) => products.find((product) => product.id === id)).filter(Boolean);
  }

  function productCard(product) {
    const added = readCart().includes(product.id);
    return `
      <article class="product-card reveal-item">
        <a class="product-card__visual" href="producto.html?id=${product.id}" aria-label="Ver ${product.name}">
          <span class="product-card__badge">${product.badge}</span>
          <img src="${product.image}" alt="${product.name}" loading="lazy" width="1024" height="1024">
        </a>
        <div class="product-card__body">
          <p class="eyebrow">${product.category}</p>
          <h3><a href="producto.html?id=${product.id}">${product.name}</a></h3>
          <p>${product.short}</p>
          <div class="product-card__footer">
            <strong>${money(product.price)}</strong>
            <button class="icon-add ${added ? "is-added" : ""}" type="button" data-add-to-cart="${product.id}" aria-label="${added ? "Producto ya agregado" : `Agregar ${product.name} al carrito`}" ${added ? "disabled" : ""}>
              ${added ? "Agregado" : "Agregar"} <span>${icons.arrow}</span>
            </button>
          </div>
        </div>
      </article>`;
  }

  function skeletons(count) {
    return Array.from({ length: count }, () => `
      <div class="product-card skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton--image"></div>
        <div class="product-card__body"><span class="skeleton skeleton--small"></span><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--line"></span><span class="skeleton skeleton--line short"></span></div>
      </div>`).join("");
  }

  function simulateLoad(result, delay = 520) {
    return new Promise((resolve) => window.setTimeout(() => resolve(result), delay));
  }

  function createCartUI() {
    const root = document.createElement("div");
    root.innerHTML = `
      <div class="drawer-backdrop" data-cart-close></div>
      <aside class="cart-drawer" id="cart-drawer" aria-hidden="true" aria-labelledby="cart-title">
        <div class="cart-drawer__header">
          <div><p class="eyebrow">Tu selección</p><h2 id="cart-title">Carrito</h2></div>
          <button class="round-button" type="button" data-cart-close aria-label="Cerrar carrito">${icons.close}</button>
        </div>
        <div class="cart-drawer__body" id="cart-items"></div>
        <div class="cart-drawer__footer" id="cart-footer"></div>
      </aside>
      <div class="toast" id="site-toast" role="status" aria-live="polite"></div>`;
    while (root.firstChild) document.body.appendChild(root.firstChild);
  }

  function renderCart() {
    const selected = cartProducts();
    document.querySelectorAll("[data-cart-count]").forEach((counter) => {
      counter.textContent = selected.length;
      counter.setAttribute("aria-label", `${selected.length} productos en el carrito`);
    });

    const items = document.getElementById("cart-items");
    const footer = document.getElementById("cart-footer");
    if (!items || !footer) return;

    if (!selected.length) {
      items.innerHTML = `
        <div class="empty-cart">
          <span class="empty-cart__icon">${icons.cart}</span>
          <h3>Tu casa todavía espera</h3>
          <p>Explorá la colección y guardá acá las piezas que quieras consultar.</p>
          <a class="button button--primary" href="productos.html">Ver colección</a>
        </div>`;
      footer.innerHTML = "";
      return;
    }

    items.innerHTML = selected.map((product) => `
      <article class="cart-item">
        <a href="producto.html?id=${product.id}" class="cart-item__image"><img src="${product.image}" alt="" width="1024" height="1024"></a>
        <div class="cart-item__info">
          <p class="eyebrow">${product.category}</p>
          <h3><a href="producto.html?id=${product.id}">${product.name}</a></h3>
          <p>${product.short}</p>
          <strong>${money(product.price)}</strong>
        </div>
        <button class="cart-item__remove" type="button" data-remove-from-cart="${product.id}" aria-label="Quitar ${product.name}">${icons.trash}</button>
      </article>`).join("");

    const total = selected.reduce((sum, product) => sum + product.price, 0);
    const message = encodeURIComponent(`Hola Hermanos Jota, quisiera consultar por: ${selected.map((p) => p.name).join(", ")}.`);
    footer.innerHTML = `
      <div class="cart-total"><span>Total estimado</span><strong>${money(total)}</strong></div>
      <p>El valor final y los plazos se confirman de forma personal.</p>
      <a class="button button--primary button--wide" href="https://wa.me/541145678900?text=${message}" target="_blank" rel="noreferrer">Consultar selección</a>`;
  }

  function setCartOpen(open) {
    const drawer = document.getElementById("cart-drawer");
    if (!drawer) return;
    document.body.classList.toggle("cart-is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    if (open) drawer.querySelector("[data-cart-close]")?.focus();
  }

  let toastTimer;
  function toast(message) {
    const element = document.getElementById("site-toast");
    if (!element) return;
    window.clearTimeout(toastTimer);
    element.textContent = message;
    element.classList.add("is-visible");
    toastTimer = window.setTimeout(() => element.classList.remove("is-visible"), 2600);
  }

  function syncAddButtons() {
    const ids = readCart();
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      const added = ids.includes(button.dataset.addToCart);
      button.disabled = added;
      button.classList.toggle("is-added", added);
      const label = button.matches(".button") ? (added ? "Ya está en tu carrito" : "Agregar al carrito") : (added ? "Agregado" : "Agregar");
      const arrow = button.matches(".icon-add") ? ` <span>${icons.arrow}</span>` : "";
      button.innerHTML = `${label}${arrow}`;
    });
  }

  function addToCart(id) {
    const ids = readCart();
    const product = products.find((item) => item.id === id);
    if (!product) return;
    if (ids.includes(id)) {
      toast(`${product.name} ya está en tu carrito.`);
      setCartOpen(true);
      return;
    }
    ids.push(id);
    saveCart(ids);
    renderCart();
    syncAddButtons();
    toast(`${product.name} se agregó al carrito.`);
    setCartOpen(true);
  }

  function removeFromCart(id) {
    const product = products.find((item) => item.id === id);
    saveCart(readCart().filter((item) => item !== id));
    renderCart();
    syncAddButtons();
    if (product) toast(`${product.name} se quitó del carrito.`);
  }

  async function initFeatured() {
    const grid = document.getElementById("featured-grid");
    if (!grid) return;
    grid.innerHTML = skeletons(4);
    const featured = await simulateLoad(products.filter((product) => product.featured));
    grid.innerHTML = featured.map(productCard).join("");
    syncAddButtons();
  }

  async function initCatalog() {
    const grid = document.getElementById("catalog-grid");
    if (!grid) return;
    const search = document.getElementById("product-search");
    const filters = document.getElementById("category-filters");
    const count = document.getElementById("catalog-count");
    let category = "Todos";
    let loaded = [];

    function normalize(text) {
      return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    function paint() {
      const query = normalize(search?.value.trim() || "");
      const filtered = loaded.filter((product) => {
        const matchesCategory = category === "Todos" || product.category === category;
        const haystack = normalize(`${product.name} ${product.short} ${product.category} ${product.materials}`);
        return matchesCategory && haystack.includes(query);
      });
      grid.innerHTML = filtered.length ? filtered.map(productCard).join("") : `
        <div class="no-results"><p class="eyebrow">Sin resultados</p><h2>No encontramos esa pieza</h2><p>Probá con otro nombre, material o categoría.</p></div>`;
      if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? "pieza" : "piezas"}`;
      syncAddButtons();
    }

    grid.innerHTML = skeletons(6);
    loaded = await simulateLoad(products, 680);
    paint();
    search?.addEventListener("input", paint);
    filters?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      category = button.dataset.category;
      filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
      paint();
    });
  }

  function initDetail() {
    const root = document.getElementById("product-detail");
    if (!root) return;
    const id = new URLSearchParams(window.location.search).get("id") || products[0]?.id;
    const product = products.find((item) => item.id === id) || products[0];
    if (!product) return;
    document.title = `${product.name} — Hermanos Jota`;
    root.innerHTML = `
      <div class="detail__visual">
        <span class="detail__index">HJ / ${String(products.indexOf(product) + 1).padStart(2, "0")}</span>
        <img src="${product.image}" alt="${product.name}" width="1024" height="1024">
      </div>
      <div class="detail__content">
        <nav class="breadcrumb" aria-label="Migas de pan"><a href="productos.html">Colección</a><span>/</span><span>${product.category}</span></nav>
        <p class="eyebrow">${product.badge}</p>
        <h1>${product.name}</h1>
        <p class="detail__lead">${product.description}</p>
        <p class="detail__price">${money(product.price)}</p>
        <button class="button button--primary button--wide" type="button" data-add-to-cart="${product.id}">Agregar al carrito</button>
        <p class="detail__note">Precio estimado en pesos argentinos. Producción por encargo.</p>
        <dl class="detail-specs">
          <div><dt>Materiales</dt><dd>${product.materials}</dd></div>
          <div><dt>Dimensiones</dt><dd>${product.dimensions}</dd></div>
          <div><dt>Fabricación</dt><dd>${product.making}</dd></div>
          <div><dt>Herencia Viva</dt><dd>10 años de garantía estructural, servicio de restauración y certificado de trazabilidad.</dd></div>
        </dl>
      </div>`;
    syncAddButtons();

    const related = document.getElementById("related-grid");
    if (related) {
      related.innerHTML = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3).map(productCard).join("");
    }
  }

  function fieldError(field, message) {
    const group = field.closest(".field");
    group?.classList.toggle("has-error", Boolean(message));
    const error = group?.querySelector(".field__error");
    if (error) error.textContent = message || "";
    field.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const success = document.getElementById("form-success");

    function validate(field) {
      const value = field.value.trim();
      if (!value) return fieldError(field, "Este dato es necesario.");
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return fieldError(field, "Ingresá un email válido.");
      if (field.name === "message" && value.length < 20) return fieldError(field, "Contanos un poco más (mínimo 20 caracteres).");
      return fieldError(field, "");
    }

    form.querySelectorAll("input, textarea").forEach((field) => field.addEventListener("blur", () => validate(field)));
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fields = [...form.querySelectorAll("input, textarea")];
      const valid = fields.map(validate).every(Boolean);
      if (!valid) {
        fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
        return;
      }
      const submit = form.querySelector("button[type='submit']");
      submit.disabled = true;
      submit.textContent = "Enviando…";
      await simulateLoad(null, 760);
      form.reset();
      submit.disabled = false;
      submit.textContent = "Enviar consulta";
      success.hidden = false;
      success.focus();
    });
  }

  function initInstagram() {
    const post = document.querySelector(".instagram-post");
    if (!post) return;
    const like = post.querySelector("[data-like]");
    const save = post.querySelector("[data-save]");
    const count = post.querySelector("[data-like-count]");
    const commentForm = post.querySelector(".instagram-comment");
    const comments = post.querySelector(".instagram-comments");
    let likes = 12386;

    like?.addEventListener("click", () => {
      const active = like.classList.toggle("is-active");
      like.setAttribute("aria-pressed", String(active));
      likes += active ? 1 : -1;
      if (count) count.textContent = `${new Intl.NumberFormat("es-AR").format(likes)} Me gusta`;
    });
    save?.addEventListener("click", () => {
      const active = save.classList.toggle("is-active");
      save.setAttribute("aria-pressed", String(active));
      toast(active ? "Publicación guardada." : "Publicación quitada de guardados.");
    });
    post.querySelector("[data-focus-comment]")?.addEventListener("click", () => commentForm?.querySelector("input")?.focus());
    commentForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = commentForm.querySelector("input");
      if (!input.value.trim()) return;
      const p = document.createElement("p");
      p.innerHTML = `<strong>vos</strong> ${input.value.trim().replace(/[<>]/g, "")}`;
      comments.appendChild(p);
      input.value = "";
      toast("Comentario publicado en esta demostración.");
    });
  }

  function initNavigation() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    menuButton?.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const href = link.getAttribute("href");
      const current = window.location.pathname.endsWith(href) ||
        (window.location.pathname.endsWith("/") && href === "index.html") ||
        (window.location.pathname.endsWith("producto.html") && href === "productos.html");
      if (current) link.setAttribute("aria-current", "page");
    });
  }

  function initGlobalEvents() {
    document.addEventListener("click", (event) => {
      const add = event.target.closest("[data-add-to-cart]");
      const remove = event.target.closest("[data-remove-from-cart]");
      if (add) addToCart(add.dataset.addToCart);
      if (remove) removeFromCart(remove.dataset.removeFromCart);
      if (event.target.closest("[data-cart-open]")) setCartOpen(true);
      if (event.target.closest("[data-cart-close]")) setCartOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setCartOpen(false);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    createCartUI();
    renderCart();
    initNavigation();
    initGlobalEvents();
    initFeatured();
    initCatalog();
    initDetail();
    initContactForm();
    initInstagram();
    document.querySelectorAll("[data-year]").forEach((item) => { item.textContent = new Date().getFullYear(); });
  });
})();
