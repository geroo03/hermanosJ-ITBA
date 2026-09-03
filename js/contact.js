/**
 * Hermanos Jota — Formulario de Contacto & Showroom
 * Validaciones en tiempo real del lado del cliente y renderizado en DOM.
 */

(function () {
  'use strict';

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const formContainer = document.getElementById('formContainer');
    if (!form || !formContainer) return;

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showFieldError(field, message) {
      field.classList.toggle('is-invalid', Boolean(message));
      const parent = field.closest('.form-group');
      const err = parent ? parent.querySelector('.error-message') : null;
      if (err) {
        err.textContent = message || '';
        err.style.display = message ? 'block' : 'none';
      }
      return !message;
    }

    // Validación interactiva
    form.querySelectorAll('input, textarea, select').forEach((input) => {
      input.addEventListener('input', () => {
        if (input.hasAttribute('required') && !input.value.trim()) {
          showFieldError(input, 'Este campo es requerido.');
        } else if (input.type === 'email' && !validateEmail(input.value.trim())) {
          showFieldError(input, 'Ingresá un correo electrónico válido.');
        } else {
          showFieldError(input, '');
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nombre = form.querySelector('#nombre');
      const email = form.querySelector('#email');
      const mensaje = form.querySelector('#mensaje');

      if (nombre && !nombre.value.trim()) {
        showFieldError(nombre, 'Por favor, ingresá tu nombre y apellido.');
        isValid = false;
      }
      if (email && (!email.value.trim() || !validateEmail(email.value.trim()))) {
        showFieldError(email, 'Por favor, ingresá un correo válido.');
        isValid = false;
      }
      if (mensaje && !mensaje.value.trim()) {
        showFieldError(mensaje, 'Por favor, contanos tu consulta o proyecto.');
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando consulta...';
      }

      window.setTimeout(() => {
        formContainer.innerHTML = `
          <div class="contact-success-card" role="alert">
            <div class="success-icon">
              <svg class="icon icon-xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>¡Mensaje Recibido, ${nombre ? nombre.value.trim().split(' ')[0] : 'gracias'}!</h2>
            <p>
              Tu consulta ya está en manos de nuestros maestros ebanistas de San Cristóbal. 
              Nos pondremos en contacto a la brevedad al correo <strong>${email ? email.value.trim() : ''}</strong>.
            </p>
            <div class="success-actions">
              <a href="productos.html" class="btn btn-primary">Explorar Catálogo de Autor</a>
              <a href="index.html" class="btn btn-outline">Volver al Inicio</a>
            </div>
          </div>
        `;
        window.showToast?.('¡Consulta enviada con éxito!');
      }, 700);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
