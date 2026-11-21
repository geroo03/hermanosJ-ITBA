# Resumen de Entrega — Mateo Bouso

## Sprint 7-8 — Backend de pedidos y protección de rutas de la API

**Responsable:** Mateo Bouso (@mbouso420-spec).  
**Asignación:** tarea 2 de `Reparto_de_Tareas78.md`.

---

### Punto de partida

La tarea 1 dejó listos el modelo `User`, los endpoints `/api/auth` con bcrypt y JWT (`utils/token.js`) y el middleware `verifyToken` (`middlewares/auth.js`). Las rutas de `/api/productos` seguían completamente abiertas y todavía no existían el modelo ni los endpoints de pedidos.

### Trabajo Realizado

| Archivo | Responsabilidad / Trabajo |
|---|---|
| `backend/src/models/Order.js` | Esquema Mongoose de pedidos: `usuario` (`ObjectId` ref `User`, obligatorio e indexado), `items` (array no vacío de subdocumentos `{ producto, nombre, precio, cantidad }` con `cantidad` entera `>= 1`), `total` (`Number`, `min: 0`) y `timestamps`. |
| `backend/src/controllers/ordersController.js` | Implementación de `createOrder` (`POST /api/pedidos`) y `getMyOrders` (`GET /api/pedidos/mis-pedidos`). Valida `items`, consolida IDs repetidos, consulta productos en MongoDB, copia `nombre` y `precio` desde la base, calcula `total` en el servidor, asocia `usuario` a `req.user.id`, aplica la política de stock sin descuentos parciales (con reversión ante fallos al guardar) y lista los pedidos del usuario ordenados del más nuevo al más viejo. |
| `backend/src/routes/ordersRouter.js` | Router de pedidos con `POST /` y `GET /mis-pedidos`, ambos protegidos por `verifyToken`. |
| `backend/src/routes/productsRouter.js` | Mantiene públicas las lecturas (`GET /` y `GET /:id`) y protege con `verifyToken` las escrituras (`POST /`, `PUT /:id` y `DELETE /:id`). |
| `backend/src/app.js` | Montaje de `app.use('/api/pedidos', ordersRouter)` junto a `/api/auth` y `/api/productos`. |
| `backend/tests/helpers/fakeOrder.js` | Almacén en memoria para `Order` usando `mock.method` de `node:test`, conservando la validación real de Mongoose, timestamps monotónicos deterministas y filtrado/ordenamiento en `Order.find(...).sort({ createdAt: -1 })`. |
| `backend/tests/orders.test.js` | Doce pruebas HTTP sobre `/api/pedidos` y `/api/pedidos/mis-pedidos`: creación 201, recálculo en servidor ignorando valores manipulados, consolidación de ítems repetidos, descuento y rechazo de stock sin descuentos parciales, piezas «Disponible a pedido» (`stock: 0`), validaciones 400, producto inexistente 404, protección 401 (sin token, inválido y vencido), lista vacía, aislamiento por usuario y orden del más nuevo al más viejo. |
| `backend/tests/products.test.js` | Adaptado para enviar token Bearer en `POST`, `PUT` y `DELETE`, manteniendo `GET` público, más pruebas 401 por token ausente, inválido o vencido (13 pruebas en total). |
| `backend/tests/orders.postman_collection.json` | Colección Postman v2.1.0 de 11 solicitudes en orden: registro/login, creación de producto temporal con stock, `POST /api/pedidos` sin token (401), pedido válido ignorando precios manipulados (201), stock insuficiente (400), ítems vacíos (400), producto inexistente (404), `GET /api/pedidos/mis-pedidos` sin token (401) y con token (200), y eliminación del producto temporal. |
| `backend/tests/products.postman_collection.json` | Actualizada con registro/login, `Authorization: Bearer {{token}}` en escrituras y casos 401 sin token (16 solicitudes). |
| `Reparto_de_Tareas78.md` | Asignación de la tarea 2 a `Mateo Bouso (@mbouso420-spec)`, cambio de estado a `Terminada` y resumen de la implementación. |

### Política de stock

Coherente con `backend/src/seed.js` y `client/src/components/ProductDetail.jsx`:

- **`stock > 0`:** se valida que `cantidad <= product.stock` en **todos** los ítems (incluyendo productos repetidos consolidados) antes de modificar la base. Si no alcanza, se responde **400** sin descontar stock de ningún otro producto del pedido; si alcanza, se descuenta al confirmar y se revierte automáticamente si falla el guardado del pedido.
- **`stock === 0`:** corresponde a piezas «Disponible a pedido» del taller artesanal; el pedido se permite y el stock permanece en `0`.

### Contrato de la API

| Solicitud | Autenticación | Estado | Respuesta |
|---|---|---|---|
| `POST /api/pedidos` | Bearer JWT | 201 / 400 / 401 / 404 | Pedido creado con `nombre`, `precio` y `total` calculados desde la base, o `{ error, status }`. |
| `GET /api/pedidos/mis-pedidos` | Bearer JWT | 200 / 401 | Array de pedidos del usuario del token, del más nuevo al más viejo, o `{ error, status }`. |
| `GET /api/productos` y `GET /api/productos/:id` | Pública | 200 / 400 / 404 | Catálogo o detalle del producto. |
| `POST`, `PUT`, `DELETE /api/productos` | Bearer JWT | 201 / 200 / 400 / 401 / 404 | Resultado del CRUD, o `{ error, status }`. |

### Cómo verificarlo

Pruebas automáticas (no requieren base de datos; 44 pruebas en total: `app.test.js` 8, `auth.test.js` 11, `products.test.js` 13, `orders.test.js` 12):

```powershell
cd backend
npm install
npm test
```

Prueba manual con Postman contra la base real: configurar `MONGODB_URI` y `JWT_SECRET` en `backend/.env`, iniciar el servidor con `npm start` e importar `backend/tests/orders.postman_collection.json` y `backend/tests/products.postman_collection.json` en el Collection Runner. Contra MongoDB Atlas queda pendiente de un entorno con credenciales (`MONGODB_URI`).

---

## Sprint 5-6 — Ruteo del cliente y consumo de la API

**Responsable:** Mateo Bouso (@mbouso420-spec).  
**Asignación:** tarea 3 de `Reparto_de_Tareas56.md`.

---

### Trabajo Realizado

| Archivo | Responsabilidad / Trabajo |
|---|---|
| `client/package.json` | Instalación de `react-router-dom` (v6) compatible con React 18 y Create React App (`react-scripts`). |
| `client/.env.example` | Documentación de la variable de entorno `REACT_APP_API_URL=http://localhost:3000/api`. |
| `client/src/index.js` | Envoltura de `<App />` con `<BrowserRouter>` para habilitar ruteo declarativo en el navegador. |
| `client/src/services/productsApi.js` | Servicio completo de comunicación con la API usando `fetch` y `REACT_APP_API_URL`: `getProducts`, `getProductById`, `createProduct`, `updateProduct` y `deleteProduct`, propagando errores de red y mensajes `{ error, status }` del backend. |
| `client/src/App.jsx` | Reemplazo de `currentView`/`ViewBridge` por `<Routes>` y `<Route>` (`/`, `/productos`, `/productos/:id`, `/contacto`, `/carrito`, `/admin/crear-producto`, `/admin/editar-producto/:id` y `*`), migración del carrito y `readStoredCart` a `_id` y `precio`, y actualización automática del catálogo al navegar a `/productos`. |
| `client/src/pages/Home.jsx` | Página de Inicio (`/`) con identidad de marca de la Casa Taller, acceso directo al catálogo y vista previa de piezas destacadas. |
| `client/src/pages/Catalogo.jsx` | Página de Catálogo (`/productos`) con estados de carga, alerta de error con reintento, acceso a alta de producto y renderizado de `ProductList`. |
| `client/src/components/Navbar.jsx` | Migración de botones a `<Link>` y `<NavLink>` (con estado activo accesible `aria-current="page"` automático) conservando el contador en vivo del carrito. |
| `client/src/components/ProductList.jsx` y `ProductCard.jsx` | Migración de `key` a `product._id`, adaptación a `nombre`, `descripcion`, `precio` e `imagenUrl`, y enlaces `<Link>` hacia `/productos/:id`. |
| `client/src/components/Cart.jsx` | Migración a `_id`, `nombre`, `precio` e `imagenUrl`, cálculo de total actualizado y enlaces `<Link>` hacia `/productos` y el detalle de cada pieza. |
| `client/src/services/productsApi.test.js` y `client/src/components/layout.test.jsx` | Pruebas automatizadas actualizadas para los cinco métodos de `productsApi`, navegación con `MemoryRouter`, carrito con `_id` y formulario de contacto. |

### Cómo verificarlo

```powershell
cd client
npm install
npm test -- --watchAll=false
npm run build
```

---

## Sprint 3-4 — Servidor y middlewares

**Responsable:** Mateo Bouso (@mbouso420-spec).  
**Fecha de trabajo:** 3 de octubre de 2026.  
**Asignación:** tarea 3 de `REPARTO_DE_TAREAS.md`.

---

### Análisis y Objetivos

- Configurar la infraestructura central del servidor backend con Node.js y Express.
- Mantener una arquitectura modular, separando la inicialización del servidor (`src/server.js`), la configuración de la aplicación Express (`src/app.js`) y la capa de middlewares (`src/middlewares/`).
- Habilitar CORS para permitir la comunicación fluida con el frontend React alojado en otro puerto.
- Incorporar parseo de cuerpos JSON con `express.json()`.
- Montar el enrutador de productos (`/api/productos`) desarrollado en la tarea 2.
- Registrar metadatos de las peticiones mediante un middleware global de logging.
- Manejar rutas no encontradas (404) y errores no controlados (500) con respuestas JSON consistentes.
- Configurar `backend/package.json` con dependencias y scripts de ejecución y pruebas.

---

### Trabajo Realizado

| Archivo | Responsabilidad / Trabajo |
|---|---|
| `backend/package.json` | Declaración del paquete `hermanosj-backend`, dependencias `express` y `cors`, y scripts `start`, `dev` (con flag `--watch`) y `test`. |
| `backend/src/middlewares/logger.js` | Middleware global que registra en consola timestamp, método HTTP y la URL solicitada. |
| `backend/src/middlewares/notFound.js` | Middleware de captura para endpoints no mapeados; responde con status HTTP 404 y JSON estructurado. |
| `backend/src/middlewares/errorHandler.js` | Middleware centralizado de errores con firma de 4 parámetros `(err, req, res, next)`; captura excepciones y devuelve status HTTP correspondiente y mensaje en JSON. |
| `backend/src/app.js` | Instancia principal de Express. Configura `cors()`, `express.json()`, `logger`, monta el router `/api/productos` y anexa los middlewares de 404 y de errores. Exporta la aplicación para pruebas y despliegue. |
| `backend/src/server.js` | Punto de entrada del servidor; inicia la escucha en el puerto configurado por variable de entorno `PORT` o `3000` por defecto. |
| `backend/tests/app.test.js` | Suite de pruebas automatizadas con `node:test` verificando CORS, parsing JSON, catálogo 200, detalle 200, 404 de producto, 404 de ruta no encontrada y middleware de errores. |
| `REPARTO_DE_TAREAS.md` | Actualización del título de la tarea 3 con `Mateo Bouso (@mbouso420-spec)` y documentación del estado completado. |

---

### Verificación y Pruebas

Para ejecutar el servidor o la suite de pruebas desde la terminal:

```powershell
# En la carpeta backend:
cd backend
npm install
npm test
```

Para iniciar el servidor en modo desarrollo:
```powershell
npm run dev
```

El servidor quedará disponible en:
- `http://localhost:3000`
- `http://localhost:3000/api/productos`
- `http://localhost:3000/api/productos/sofa-patagonia`
