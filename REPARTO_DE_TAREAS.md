# Reparto de tareas — documento interno

Este archivo sirve para coordinar el trabajo del equipo. Debe eliminarse en el commit final, junto con `material-campus/`.

Cada tarea tiene archivos propios para que puedan hacerse en paralelo. Los commits indicados son funcionales y acumulativos; no deben crearse commits vacíos solo para subir el contador.

## 1. Santiago Oroz (`SantiagoOroz`) — Estado raíz, consumo de API y vistas

**Archivos:** `client/src/App.jsx`, `client/src/services/productsApi.js`, `client/src/styles/app.css`.

- Crear el punto de entrada de la aplicación y los estados `products`, `loading`, `error`, `currentView`, `selectedProduct` y `cart`.
- Implementar el servicio que consulta `GET /api/productos` con `fetch`.
- Resolver en `App.jsx` los estados de carga, error y éxito.
- Conectar por props y callbacks las vistas de catálogo, detalle, carrito y contacto; no construir componentes visuales de otros integrantes.

Al integrar, esta tarea debe dejar una aplicación capaz de consultar el catálogo sin depender de datos locales. Los componentes visuales de las demás tareas se conectan desde acá mediante props y callbacks: este archivo es el único dueño del estado global del carrito y de la vista actual.

## 2. API de productos

**Archivos:** `backend/src/data/products.js`, `backend/src/controllers/productsController.js`, `backend/src/routes/productsRouter.js`.

- Definir el catálogo local con `id`, `name`, `price`, `image`, `description` y `category`.
- Implementar `GET /api/productos` y `GET /api/productos/:id` mediante `express.Router` y controladores separados.
- Responder con 404 en JSON al solicitar un producto inexistente.

Al terminar, las rutas deben poder probarse de forma independiente con Postman. La respuesta debe ser JSON consistente para que el cliente pueda consumirla sin transformaciones especiales.

## 3. Servidor y middlewares

**Archivos:** `backend/src/app.js`, `backend/src/server.js`, `backend/src/middlewares/logger.js`, `backend/src/middlewares/notFound.js`, `backend/src/middlewares/errorHandler.js`, `backend/package.json`.

- Configurar Express y montar `express.json()`, `cors` y el router de productos.
- Agregar middleware global que registre método y URL.
- Crear manejador de rutas inexistentes y manejador global de errores.

Esta tarea construye la base común del backend. Debe permitir iniciar el servidor con un script claro y conservar separados el arranque, la configuración de la aplicación y los middlewares.

## 4. Catálogo y detalle

**Archivos:** `client/src/components/ProductCard.jsx`, `client/src/components/ProductList.jsx`, `client/src/components/ProductDetail.jsx`, `client/src/styles/products.css`.

- Crear `ProductCard` con imagen, precio, descripción corta y acciones recibidas por props.
- Crear `ProductList` que use `.map()` y `key`, sin hacer consultas HTTP.
- Crear `ProductDetail` con información extendida, regreso al catálogo y agregado al carrito.

Los componentes deben ser reutilizables: reciben el producto y las acciones desde `App`, sin administrar el carrito ni hacer consultas HTTP por cuenta propia.

## 5. Navegación, carrito y contacto

**Archivos:** `client/src/components/Navbar.jsx`, `client/src/components/Cart.jsx`, `client/src/components/ContactForm.jsx`, `client/src/components/Footer.jsx`, `client/src/styles/layout.css`.

- Crear `Navbar` con branding, navegación y contador del carrito recibido por props.
- Crear carrito controlado por props: incrementar, decrementar, eliminar y calcular total.
- Crear formulario controlado con `useState`, validación básica y mensaje de envío; completar el footer.

El carrito debe modificar únicamente el estado que recibe desde `App` a través de callbacks. El formulario debe evitar envíos inválidos y mostrar una respuesta clara para la persona usuaria.

## Contrato de integración

- API: `GET http://localhost:3000/api/productos` y `GET http://localhost:3000/api/productos/:id`.
- Los componentes visuales reciben datos y eventos por props; solo `App.jsx` hace el `fetch` y posee el estado `cart`.
- Cada integrante trabaja en su rama y abre un PR. Conviene separar los avances por funcionalidad terminada y comprobable; cada PR debe conservar al menos un commit funcional de su autor.
- Al finalizar, eliminar `REPARTO_DE_TAREAS.md` y `material-campus/` en un único commit de limpieza antes de la entrega.
