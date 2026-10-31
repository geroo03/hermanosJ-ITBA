# Resumen de Entrega — Mateo Bouso

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
