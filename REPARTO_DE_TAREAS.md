# Reparto de tareas — documento interno

Este archivo sirve para coordinar el trabajo del equipo. Debe eliminarse en el commit final, junto con `material-campus/`.

Cada tarea tiene archivos propios para que puedan hacerse en paralelo. Los commits indicados son funcionales y acumulativos; no deben crearse commits vacíos solo para subir el contador.

## 1. Santiago Oroz (`SantiagoOroz`) — Estado raíz, consumo de API y vistas

**Archivos:** `client/src/App.jsx`, `client/src/services/productsApi.js`, `client/src/styles/app.css`.

- Crear el punto de entrada de la aplicación y los estados `products`, `loading`, `error`, `currentView`, `selectedProduct` y `cart`.
- Implementar el servicio que consulta `GET /api/productos` con `fetch`.
- Resolver en `App.jsx` los estados de carga, error y éxito.
- Conectar por props y callbacks las vistas de catálogo, detalle, carrito y contacto; no construir componentes visuales de otros integrantes.

Commits propuestos:

1. `feat(client): create app state and view controller`
2. `feat(client): fetch products with loading and error states`
3. `feat(client): integrate child views through props`

## 2. API de productos

**Archivos:** `backend/src/data/products.js`, `backend/src/controllers/productsController.js`, `backend/src/routes/productsRouter.js`.

- Definir el catálogo local con `id`, `name`, `price`, `image`, `description` y `category`.
- Implementar `GET /api/productos` y `GET /api/productos/:id` mediante `express.Router` y controladores separados.
- Responder con 404 en JSON al solicitar un producto inexistente.

Commits propuestos:

1. `feat(api): add local product catalogue`
2. `feat(api): add product list endpoint`
3. `feat(api): add product detail endpoint and JSON 404`

## 3. Servidor y middlewares

**Archivos:** `backend/src/app.js`, `backend/src/server.js`, `backend/src/middlewares/logger.js`, `backend/src/middlewares/notFound.js`, `backend/src/middlewares/errorHandler.js`, `backend/package.json`.

- Configurar Express y montar `express.json()`, `cors` y el router de productos.
- Agregar middleware global que registre método y URL.
- Crear manejador de rutas inexistentes y manejador global de errores.

Commits propuestos:

1. `chore(api): initialize Express server`
2. `feat(api): add CORS JSON and request logger`
3. `feat(api): add centralized 404 and error handling`

## 4. Catálogo y detalle

**Archivos:** `client/src/components/ProductCard.jsx`, `client/src/components/ProductList.jsx`, `client/src/components/ProductDetail.jsx`, `client/src/styles/products.css`.

- Crear `ProductCard` con imagen, precio, descripción corta y acciones recibidas por props.
- Crear `ProductList` que use `.map()` y `key`, sin hacer consultas HTTP.
- Crear `ProductDetail` con información extendida, regreso al catálogo y agregado al carrito.

Commits propuestos:

1. `feat(catalogue): add reusable product card`
2. `feat(catalogue): render product list from props`
3. `feat(catalogue): add product detail view`

## 5. Navegación, carrito y contacto

**Archivos:** `client/src/components/Navbar.jsx`, `client/src/components/Cart.jsx`, `client/src/components/ContactForm.jsx`, `client/src/components/Footer.jsx`, `client/src/styles/layout.css`.

- Crear `Navbar` con branding, navegación y contador del carrito recibido por props.
- Crear carrito controlado por props: incrementar, decrementar, eliminar y calcular total.
- Crear formulario controlado con `useState`, validación básica y mensaje de envío; completar el footer.

Commits propuestos:

1. `feat(layout): add navbar and footer`
2. `feat(cart): add cart controls and calculated total`
3. `feat(contact): add controlled contact form validation`

## Contrato de integración

- API: `GET http://localhost:3000/api/productos` y `GET http://localhost:3000/api/productos/:id`.
- Los componentes visuales reciben datos y eventos por props; solo `App.jsx` hace el `fetch` y posee el estado `cart`.
- Cada integrante trabaja en su rama y abre un PR. Cada PR debe contener commits funcionales del autor.
- Al finalizar, eliminar `REPARTO_DE_TAREAS.md` y `material-campus/` en un único commit de limpieza antes de la entrega.
