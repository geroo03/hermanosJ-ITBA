# Reparto de tareas

> **Antes de la entrega final:** quien realice cada una de las tareas 2 a 5 debe reemplazar el título genérico por su nombre y usuario de GitHub, usando el mismo formato de la tarea de Santiago: `Nombre Apellido (@usuario) — título de la tarea`. Por ejemplo: `Nombre Apellido (@usuario) — API de productos`. Este bloque de instrucciones se elimina en el último commit; el resto del documento se conserva como registro del aporte de cada integrante.

Este archivo sirve para coordinar el trabajo y para dejar documentada la responsabilidad de cada integrante. Cada tarea tiene archivos propios para que puedan hacerse en paralelo.

Este trabajo continúa el repositorio del Sprint 1-2: la versión anterior (HTML, CSS y JavaScript) se conserva en `Recursos/` y `assets/`, y la nueva aplicación (`backend/` y `client/`) reutiliza su identidad de marca (paleta, tipografías, imágenes y comportamiento del carrito).

## 1. Santiago Oroz (`SantiagoOroz`) — Estado raíz, consumo de API y vistas

**Archivos:** `client/src/App.jsx`, `client/src/services/productsApi.js`, `client/src/styles/app.css`.

- Crear el punto de entrada de la aplicación y los estados `products`, `loading`, `error`, `currentView`, `selectedProduct` y `cart`.
- Implementar el servicio que consulta `GET /api/productos` con `fetch`.
- Resolver en `App.jsx` los estados de carga, error y éxito.
- Conectar por props y callbacks las vistas de catálogo, detalle, carrito y contacto; no construir componentes visuales de otros integrantes.

**Estado: completada.** `App.jsx` resuelve carga, error (con reintento sin recargar) y éxito; `productsApi.js` distingue fallas de conexión, respuestas con error y respuestas inválidas, con tests; el carrito se persiste en `localStorage` como en el Sprint 2; `app.css` aplica la paleta oficial de marca.

Al integrar, esta tarea debe dejar una aplicación capaz de consultar el catálogo sin depender de datos locales. Los componentes visuales de las demás tareas se conectan desde acá mediante props y callbacks: este archivo es el único dueño del estado global del carrito y de la vista actual.

## 2. Tadeo Piccato (@Flowveep) — API de productos

**Archivos:** `backend/src/data/products.js`, `backend/src/controllers/productsController.js`, `backend/src/routes/productsRouter.js`.

- Definir el catálogo local con `id`, `name`, `price`, `image`, `description` y `category`.
- Implementar `GET /api/productos` y `GET /api/productos/:id` mediante `express.Router` y controladores separados.
- Responder con 404 en JSON al solicitar un producto inexistente.

**Estado: completada.** Catálogo de 11 productos con los seis campos del contrato, controladores separados y router en `backend/src/routes/productsRouter.js`. Incluye pruebas HTTP en `backend/tests/products.test.js`, un servidor aislado de prueba y una colección de Postman en `backend/tests/products.postman_collection.json`. La tarea 3 debe montar el router con `app.use('/api/productos', productsRouter)`; las instrucciones de verificación están en `Tadeo Piccato.md`.

Al terminar, las rutas deben poder probarse de forma independiente con Postman. La respuesta debe ser JSON consistente para que el cliente pueda consumirla sin transformaciones especiales.

## 3. Mateo Bouso (@mbouso420-spec) — Servidor y middlewares

**Archivos:** `backend/src/app.js`, `backend/src/server.js`, `backend/src/middlewares/logger.js`, `backend/src/middlewares/notFound.js`, `backend/src/middlewares/errorHandler.js`, `backend/package.json`.

- Configurar Express y montar `express.json()`, `cors` y el router de productos.
- Agregar middleware global que registre método y URL.
- Crear manejador de rutas inexistentes y manejador global de errores.

**Estado: completada.** Servidor Express configurado con separación clara entre inicialización (`server.js`), configuración de aplicación (`app.js`) y middlewares modulares (`logger.js`, `notFound.js`, `errorHandler.js`). Configurado `cors` y `express.json()`, montado el router de productos en `/api/productos` e implementado `package.json` con dependencias y scripts (`start`, `dev`, `test`). Incluye suite de pruebas automatizadas en `backend/tests/app.test.js`.

Esta tarea construye la base común del backend. Debe permitir iniciar el servidor con un script claro y conservar separados el arranque, la configuración de la aplicación y los middlewares.

## 4. Nicolás Benitez (@Nico-5525) Catálogo y detalle

**Archivos:** `client/src/components/ProductCard.jsx`, `client/src/components/ProductList.jsx`, `client/src/components/ProductDetail.jsx`, `client/src/styles/products.css`.

- Crear `ProductCard` con imagen, precio, descripción corta y acciones recibidas por props.
- Crear `ProductList` que use `.map()` y `key`, sin hacer consultas HTTP.
- Crear `ProductDetail` con información extendida, regreso al catálogo y agregado al carrito.

Los componentes deben ser reutilizables: reciben el producto y las acciones desde `App`, sin administrar el carrito ni hacer consultas HTTP por cuenta propia.

## 5. Sebastián Gerónimo Peralta (@geroo03) — Navegación, carrito y contacto

**Archivos:** `client/src/components/Navbar.jsx`, `client/src/components/Cart.jsx`, `client/src/components/ContactForm.jsx`, `client/src/components/Footer.jsx`, `client/src/styles/layout.css`.

- Crear `Navbar` con branding, navegación y contador del carrito recibido por props.
- Crear carrito controlado por props: incrementar, decrementar, eliminar y calcular total.
- Crear formulario controlado con `useState`, validación básica y mensaje de envío; completar el footer.

**Estado: completada.** `Navbar` muestra la marca, la vista activa (`aria-current`) y el contador del carrito recibido por props; `Cart` lista imagen, precio unitario, cantidad y subtotal de cada pieza, con controles para incrementar, decrementar y eliminar que solo llaman a los callbacks de `App`, y calcula el total con `getCartTotal`; `ContactForm` es un formulario controlado con `useState` que valida nombre, email y mensaje, bloquea envíos inválidos y confirma el envío en pantalla; `Footer` reúne la dirección, horarios y canales de la Casa Taller. Se conectaron en `App.jsx` y se cubrieron con pruebas en `client/src/components/layout.test.jsx`. Detalle en `Sebastian Geronimo Peralta.md`.

El carrito debe modificar únicamente el estado que recibe desde `App` a través de callbacks. El formulario debe evitar envíos inválidos y mostrar una respuesta clara para la persona usuaria.

## Contrato de integración

- API: `GET http://localhost:3000/api/productos` y `GET http://localhost:3000/api/productos/:id`.
- Los componentes visuales reciben datos y eventos por props; solo `App.jsx` hace el `fetch` y posee el estado `cart`.
