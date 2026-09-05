/**
 * Hermanos Jota — Script Principal de Navegación & Utilidades
 * Maneja:
 * - Header sticky con cambio visual al hacer scroll.
 * - Menú responsive drawer para dispositivos móviles (Mobile-First).
 * - Sistema global de notificaciones Toast (window.showToast).
 * - Sincronización automática de año en el footer.
 * - Formulario de newsletter del footer.
 */

(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. Sistema Global de Notificaciones Toast
  // ------------------------------------------------------------

  let toastTimer = null;

  function ensureToastElement() {
    let toast = document.getElementById('siteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'siteToast';
      toast.className = 'site-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    return toast;
  }

  function showToast(message, duration = 3000) {
    const toast = ensureToastElement();
    if (!toast) return;

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');

    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, duration);
  }

  window.showToast = showToast;

  // ------------------------------------------------------------
  // 2. Menú Responsive Móvil (Off-canvas Drawer)
  // ------------------------------------------------------------

  function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');
    if (!mobileToggle || !mobileNav) return;

    function toggleMenu(forceOpen) {
      const isOpen = typeof forceOpen === 'boolean' 
        ? forceOpen 
        : !mobileNav.classList.contains('is-open');

      mobileNav.classList.toggle('is-open', isOpen);
      mobileToggle.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('menu-open', isOpen);
    }

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Cerrar al hacer clic en enlaces del menú móvil
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        toggleMenu(false);
      }
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (
        mobileNav.classList.contains('is-open') &&
        !mobileNav.contains(e.target) &&
        !mobileToggle.contains(e.target)
      ) {
        toggleMenu(false);
      }
    });
  }

  // ------------------------------------------------------------
  // 3. Header Sticky con elevación al hacer scroll
  // ------------------------------------------------------------

  function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ------------------------------------------------------------
  // 4. Año Dinámico en Footer
  // ------------------------------------------------------------

  function initFooterYear() {
    const yearElem = document.getElementById('currentYear');
    if (yearElem) {
      yearElem.textContent = new Date().getFullYear();
    }
  }

  // ------------------------------------------------------------
  // 5. Formulario de Newsletter
  // ------------------------------------------------------------

  function initNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input?.value?.trim();
      if (email) {
        showToast('¡Bienvenido al Club de Ebanistería! Te enviamos una confirmación por correo.');
        form.reset();
      }
    });
  }

  // ------------------------------------------------------------
  // 6. Scroll-reveal con IntersectionObserver
  // ------------------------------------------------------------

  function initScrollReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => observer.observe(el));
  }

  // ------------------------------------------------------------
  // Inicialización General
  // ------------------------------------------------------------

  function init() {
    initMobileMenu();
    initHeaderScroll();
    initFooterYear();
    initNewsletterForm();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
