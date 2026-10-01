# Mueblería Hermanos Jota — Sprints 3 y 4

Proyecto grupal del ITBA: una tienda de muebles con una API en Node.js/Express y una interfaz en React.

## Reparto de trabajo

Cada integrante trabaja sobre archivos distintos para que las tareas puedan desarrollarse en paralelo. Antes de integrar, cada PR debe conservar el contrato de props y endpoints indicado.

### 1. Santiago Oroz (`SantiagoOroz`) — Aplicación e integración del catálogo

**Archivos propios:** `client/src/App.jsx`, `client/src/services/productsApi.js`, `client/src/styles/app.css`.

- Configurar la aplicación React y el estado raíz: productos, `loading`, `error`, vista activa y producto seleccionado.
- Consumir `GET /api/productos` con `fetch` desde `useEffect` y mostrar correctamente carga, error y éxito.
- Conectar las vistas Catálogo, Detalle, Carrito y Contacto mediante renderizado condicional, pasando props y callbacks sin duplicar estado.

Commits sugeridos: `feat(client): scaffold app views and product API service`; `feat(client): fetch products with loading and error states`; `feat(client): integrate catalogue and navigation views`.

### 2. API de productos

**Archivos propios:** `backend/src/data/products.js`, `backend/src/controllers/productsController.js`, `backend/src/routes/productsRouter.js`.

- Definir un catálogo local consistente de productos (id, nombre, precio, imagen, descripción y categoría).
- Implementar `GET /api/productos` y `GET /api/productos/:id` con `express.Router` y controladores separados.
- Devolver un 404 JSON claro cuando el producto solicitado no exista.

Commits sugeridos: `feat(api): add local product catalogue`; `feat(api): add product list controller`; `feat(api): add product detail endpoint and JSON 404`.

### 3. Infraestructura y middlewares del backend

**Archivos propios:** `backend/src/app.js`, `backend/src/server.js`, `backend/src/middlewares/logger.js`, `backend/src/middlewares/notFound.js`, `backend/src/middlewares/errorHandler.js`, `backend/package.json`.

- Crear el servidor Express y montar `express.json()`, `cors` y el router de productos en `/api/productos`.
- Implementar logging global de método y URL.
- Añadir manejador de ruta inexistente y manejador global de errores; documentar cómo iniciar el servidor.

Commits sugeridos: `chore(api): initialize Express server`; `feat(api): add CORS JSON and request logger`; `feat(api): add centralized 404 and error handling`.

### 4. Componentes de catálogo y detalle

**Archivos propios:** `client/src/components/ProductCard.jsx`, `client/src/components/ProductList.jsx`, `client/src/components/ProductDetail.jsx`, `client/src/styles/products.css`.

- Construir `ProductCard` con imagen, precio, descripción corta, “Ver detalle” y “Agregar al carrito”.
- Construir `ProductList` con `.map()` y `key` correcta, sin hacer fetch dentro del componente.
- Construir `ProductDetail` con información extendida y callbacks para volver y agregar; recibir todo por props.

Commits sugeridos: `feat(catalogue): add reusable product card`; `feat(catalogue): render product list from props`; `feat(catalogue): add product detail view`.

### 5. Carrito, navegación, contacto y pie

**Archivos propios:** `client/src/components/Navbar.jsx`, `client/src/components/Cart.jsx`, `client/src/components/ContactForm.jsx`, `client/src/components/Footer.jsx`, `client/src/styles/layout.css`.

- Crear `Navbar` con branding, navegación y contador reactivo recibido por props.
- Implementar carrito controlado por props: incrementar, decrementar, eliminar y total calculado.
- Implementar formulario de contacto controlado con `useState`, validación básica y mensaje de éxito; completar el footer institucional.

Commits sugeridos: `feat(layout): add navbar and footer`; `feat(cart): add cart controls and calculated total`; `feat(contact): add controlled contact form validation`.

## Contrato de integración

- El backend expone `GET http://localhost:3000/api/productos` y `GET http://localhost:3000/api/productos/:id`.
- Los componentes visuales no hacen `fetch`; reciben datos y eventos por props.
- `App.jsx` es el único dueño de `cart`, que usa elementos `{ product, quantity }`.
- Cada tarea se desarrolla en una rama/PR propia y se integra mediante revisión. Así cada integrante conserva al menos un commit de funcionalidad verificable en la rama principal.

## Orden sugerido de integración

Las cinco tareas pueden empezar a la vez. Para probar el producto completo, integrar primero las tareas 2 y 3, luego 1, 4 y 5 en cualquier orden.
