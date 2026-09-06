/**
 * Hermanos Jota — Formulario de Contacto
 * Validaciones DOM, mensajes de error y pruebas QA.
 */

(function () {
  'use strict';

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const formContainer = document.getElementById('formContainer');

    if (!form || !formContainer) return;

    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const telefono = document.getElementById('telefono');
    const asunto = document.getElementById('asunto');
    const mensaje = document.getElementById('mensaje');

    const submitBtn = form.querySelector('button[type="submit"]');

    // ------------------------------------------------------------
    // Validadores
    // ------------------------------------------------------------

    function validateName(value) {
      const name = value.trim();

      if (!name) {
        return 'Por favor, ingresá tu nombre y apellido.';
      }

      if (name.length < 3) {
        return 'El nombre debe tener al menos 3 caracteres.';
      }

      if (name.length > 60) {
        return 'El nombre no puede superar los 60 caracteres.';
      }

      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/.test(name)) {
        return 'El nombre contiene caracteres no válidos.';
      }

      return '';
    }


    function validateEmail(value) {
      const emailValue = value.trim();

      if (!emailValue) {
        return 'Por favor, ingresá tu correo electrónico.';
      }

      if (emailValue.length > 100) {
        return 'El correo electrónico es demasiado largo.';
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      if (!emailRegex.test(emailValue)) {
        return 'Ingresá un correo electrónico válido.';
      }

      return '';
    }


    function validatePhone(value) {
      const phone = value.trim();

      // El teléfono es opcional.
      if (!phone) {
        return '';
      }

      if (phone.length < 8) {
        return 'Ingresá un número de teléfono válido.';
      }

      if (phone.length > 20) {
        return 'El teléfono no puede superar los 20 caracteres.';
      }

      if (!/^[0-9+\-\s()]+$/.test(phone)) {
        return 'El teléfono contiene caracteres no válidos.';
      }

      return '';
    }


    function validateSubject(value) {
      if (!value) {
        return 'Seleccioná un motivo de consulta.';
      }

      return '';
    }


    function validateMessage(value) {
      const message = value.trim();

      if (!message) {
        return 'Por favor, escribí tu consulta.';
      }

      if (message.length < 10) {
        return 'El mensaje debe tener al menos 10 caracteres.';
      }

      if (message.length > 500) {
        return 'El mensaje no puede superar los 500 caracteres.';
      }

      return '';
    }


    // ------------------------------------------------------------
    // Manejo visual de errores
    // ------------------------------------------------------------

    function showFieldError(field, message) {
      if (!field) return false;

      const errorElement = document.getElementById(
        `${field.id}Error`
      );

      const hasError = Boolean(message);

      field.classList.toggle('is-invalid', hasError);
      field.classList.toggle('is-valid', !hasError);

      field.setAttribute(
        'aria-invalid',
        String(hasError)
      );

      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.toggle(
          'is-visible',
          hasError
        );
      }

      return !hasError;
    }


    // ------------------------------------------------------------
    // Validación individual de cada campo
    // ------------------------------------------------------------

    function validateField(field) {
      if (!field) return false;

      let error = '';

      switch (field.id) {
        case 'nombre':
          error = validateName(field.value);
          break;

        case 'email':
          error = validateEmail(field.value);
          break;

        case 'telefono':
          error = validatePhone(field.value);
          break;

        case 'asunto':
          error = validateSubject(field.value);
          break;

        case 'mensaje':
          error = validateMessage(field.value);
          break;

        default:
          return true;
      }

      return showFieldError(field, error);
    }


    // ------------------------------------------------------------
    // Validación en tiempo real mediante DOM
    // ------------------------------------------------------------

    const fields = [
      nombre,
      email,
      telefono,
      asunto,
      mensaje
    ];

    fields.forEach((field) => {
      if (!field) return;

      field.addEventListener('input', () => {
        validateField(field);
      });

      field.addEventListener('change', () => {
        validateField(field);
      });

      field.addEventListener('blur', () => {
        validateField(field);
      });
    });


    // ------------------------------------------------------------
    // Validación completa antes de enviar
    // ------------------------------------------------------------

    function validateForm() {
      let isValid = true;

      fields.forEach((field) => {
        if (!field) return;

        const fieldIsValid = validateField(field);

        if (!fieldIsValid) {
          isValid = false;
        }
      });

      return isValid;
    }


    // ------------------------------------------------------------
    // Envío del formulario
    // ------------------------------------------------------------

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const isValid = validateForm();

      if (!isValid) {
        const firstInvalidField = form.querySelector(
          '.is-invalid'
        );

        if (firstInvalidField) {
          firstInvalidField.focus();
        }

        window.showToast?.(
          'Revisá los campos marcados antes de enviar.'
        );

        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;

        const buttonText =
          submitBtn.querySelector('span');

        if (buttonText) {
          buttonText.textContent =
            'Enviando consulta...';
        }
      }

      /*
       * Como este proyecto es frontend, el envío se simula.
       * No se realiza ninguna petición a un servidor.
       */
      window.setTimeout(() => {
        showSuccessMessage();

      }, 700);
    });


    // ------------------------------------------------------------
    // Mensaje de confirmación
    // ------------------------------------------------------------

    function showSuccessMessage() {
      const firstName =
        nombre.value.trim().split(/\s+/)[0];

      const userEmail =
        email.value.trim();

      formContainer.innerHTML = '';

      const successCard =
        document.createElement('div');

      successCard.className =
        'contact-success-card';

      successCard.setAttribute(
        'role',
        'alert'
      );

      const iconWrapper =
        document.createElement('div');

      iconWrapper.className =
        'success-icon';

      iconWrapper.innerHTML = `
        <svg 
          class="icon icon-xl"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;


      const title =
        document.createElement('h2');

      title.textContent =
        `¡Mensaje recibido, ${firstName}!`;


      const paragraph =
        document.createElement('p');

      paragraph.textContent =
        `Tu consulta ya está en manos de nuestros maestros ebanistas de San Cristóbal. Nos pondremos en contacto a la brevedad al correo ${userEmail}.`;


      const actions =
        document.createElement('div');

      actions.className =
        'success-actions';

      actions.innerHTML = `
        <a 
          href="productos.html"
          class="btn btn-primary"
        >
          Explorar Catálogo de Autor
        </a>

        <a 
          href="index.html"
          class="btn btn-outline"
        >
          Volver al Inicio
        </a>
      `;


      successCard.appendChild(iconWrapper);
      successCard.appendChild(title);
      successCard.appendChild(paragraph);
      successCard.appendChild(actions);

      formContainer.appendChild(successCard);

      window.showToast?.(
        '¡Consulta enviada con éxito!'
      );
    }


    // ------------------------------------------------------------
    // QA — Pruebas básicas del formulario
    // ------------------------------------------------------------

    window.HJContactQA = {

      run: function () {

        const results = [];

        function test(name, condition) {
          results.push({
            prueba: name,
            resultado: condition
              ? 'OK'
              : 'ERROR'
          });
        }


        // Comprobamos que los elementos principales existen.
        test(
          'El formulario existe',
          Boolean(form)
        );

        test(
          'Campo nombre existe',
          Boolean(nombre)
        );

        test(
          'Campo email existe',
          Boolean(email)
        );

        test(
          'Campo teléfono existe',
          Boolean(telefono)
        );

        test(
          'Campo asunto existe',
          Boolean(asunto)
        );

        test(
          'Campo mensaje existe',
          Boolean(mensaje)
        );

        test(
          'Botón de envío existe',
          Boolean(submitBtn)
        );


        // Comprobamos que los campos obligatorios
        // realmente tengan el atributo required.
        test(
          'Nombre es obligatorio',
          nombre?.hasAttribute('required')
        );

        test(
          'Email es obligatorio',
          email?.hasAttribute('required')
        );

        test(
          'Asunto es obligatorio',
          asunto?.hasAttribute('required')
        );

        test(
          'Mensaje es obligatorio',
          mensaje?.hasAttribute('required')
        );


        // Pruebas de las funciones de validación.
        test(
          'Nombre vacío es rechazado',
          validateName('') !== ''
        );

        test(
          'Nombre válido es aceptado',
          validateName('Juan Pérez') === ''
        );

        test(
          'Email vacío es rechazado',
          validateEmail('') !== ''
        );

        test(
          'Email inválido es rechazado',
          validateEmail('correo-invalido') !== ''
        );

        test(
          'Email válido es aceptado',
          validateEmail('usuario@example.com') === ''
        );

        test(
          'Teléfono vacío es permitido',
          validatePhone('') === ''
        );

        test(
          'Teléfono inválido es rechazado',
          validatePhone('abc123') !== ''
        );

        test(
          'Asunto vacío es rechazado',
          validateSubject('') !== ''
        );

        test(
          'Mensaje vacío es rechazado',
          validateMessage('') !== ''
        );

        test(
          'Mensaje demasiado corto es rechazado',
          validateMessage('Hola') !== ''
        );

        test(
          'Mensaje válido es aceptado',
          validateMessage(
            'Quisiera consultar por un mueble.'
          ) === ''
        );


        const failedTests =
          results.filter(
            (item) =>
              item.resultado === 'ERROR'
          );


        console.table(results);


        if (failedTests.length === 0) {
          console.log(
            'QA: Todas las pruebas del formulario fueron aprobadas.'
          );
        } else {
          console.error(
            `QA: Se encontraron ${failedTests.length} pruebas con errores.`
          );
        }

        return results;
      }
    };
  }


  // ------------------------------------------------------------
  // Inicialización
  // ------------------------------------------------------------

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      initContactForm
    );

  } else {

    initContactForm();

  }

})();