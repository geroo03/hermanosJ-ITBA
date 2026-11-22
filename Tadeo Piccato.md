# Resumen de Entrega — Tadeo Piccato

## Sprint 7-8 — Tarea 3: Frontend de autenticación (`AuthContext`, `ProtectedRoute`, registro y login)

- **Responsable:** Tadeo Piccato (@Flowveep).
- **Fecha:** 21 de noviembre de 2026.
- **Asignación:** tarea 3 de `Reparto_de_Tareas78.md`.
- **Estado:** implementación y pruebas automatizadas completadas.

### Punto de partida

Las tareas 1 y 2 dejaron listos en el backend los endpoints `/api/auth/register`, `/api/auth/login` y `/api/auth/perfil` con contraseñas hasheadas en bcrypt y JWT (`{ id, rol }`), el middleware `verifyToken`, los endpoints `/api/pedidos` y la protección de escrituras en `/api/productos`. En el cliente existían el ruteo con React Router v6, el CRUD de productos y la capa visual de marca, pero no había gestión de sesión, contexto de autenticación, rutas protegidas ni pantallas de `/registro` y `/login`.

### Archivos entregados y modificados

| Archivo | Trabajo realizado |
|---|---|
| `client/src/services/authApi.js` | Servicio de autenticación con `registerUser`, `loginUser` y `getProfile` usando `fetch` y `REACT_APP_API_URL`. Mantiene el mismo manejo de errores de red y respuestas JSON `{ error, status }` que `productsApi.js`, distinguiendo errores de red (`isNetworkError`) y respuestas transitorias de arranque (`retryable`). |
| `client/src/context/AuthContext.jsx` | Contexto global (`AuthContext`, `AuthProvider` y `useAuthContext`) con clave `hermanos-jota-token` en `localStorage`, decodificación Base64URL del payload JWT (`decodeJwtPayload` e `isTokenExpired`), restauración automática de sesión al recargar validando contra `GET /api/auth/perfil`, protección frente a condiciones de carrera al hacer `logout`/`login` durante la restauración, acciones `login`, `register` y `logout` en `useCallback` y memoización del `value` con `useMemo`. |
| `client/src/components/ProtectedRoute.jsx` | Componente de ruta protegida que muestra un estado accesible de espera (`Verificando sesión…`) mientras `loading` es `true`, redirige a `/login` guardando `state.from` cuando no hay sesión y renderiza tanto `children` como `<Outlet />` cuando la sesión está activa. |
| `client/src/components/AuthForm.jsx` | Formulario controlado reutilizable (`mode="login"` y `mode="register"`) con validación pura exportada (`validateAuthForm`: nombre obligatorio en registro, email válido y contraseña de al menos 6 caracteres en registro / obligatoria en login), foco automático al primer campo inválido, accesibilidad (`aria-invalid`, `aria-describedby`, `role="alert"` y `role="status"`), despliegue de errores de la API y bloqueo de envíos duplicados mediante `useRef` + `fieldset` deshabilitado. |
| `client/src/pages/Login.jsx` | Página `/login` conectada a `AuthContext`, aviso contextual al llegar desde una ruta protegida, retorno programático con `useNavigate` hacia `state.from` (admite objeto `location` o ruta string y bloquea redirecciones externas mediante `getRedirectTarget`) o `/`, redirección automática si ya hay sesión y enlace a `/registro` preservando `state.from`. |
| `client/src/pages/Registro.jsx` | Página `/registro` conectada a `AuthContext` usando `AuthForm`, redirección con mensaje de bienvenida al completar el alta, redirección automática si ya hay sesión y enlace a `/login` preservando `state.from`. |
| `client/src/styles/auth.css` | Estilos de formularios y páginas de autenticación integrados con la paleta de marca y las variables de superficie de vidrio (`glass.css`), accesibles (`:focus-visible`, controles de al menos 44 px de alto) y adaptables a móvil. |
| `client/src/index.js` | Montaje de `<AuthProvider>` dentro de `<BrowserRouter>`, listo para convivir con `<CartProvider>` de la tarea 4. |
| `client/src/App.jsx` | Registro de las rutas `/login` y `/registro` manteniendo intactas las rutas existentes y sus pruebas. |
| `client/src/services/authApi.test.js` | 12 pruebas unitarias de `registerUser`, `loginUser` y `getProfile` (201/200, errores 400/401/409, errores de red, respuestas mal formadas y 503 reintentables). |
| `client/src/components/auth.test.jsx` | 22 pruebas de `decodeJwtPayload`, `isTokenExpired`, `AuthContext`/`useAuthContext` (error fuera del provider, restauración al recargar, descarte local de tokens vencidos o 401, preservación ante cortes de red, carrera con `logout`, memoización con `useMemo`), `ProtectedRoute` (espera, redirección con `state.from`, `children` y `<Outlet />`), `AuthForm`, `/registro` y `/login`. |
| `Reparto_de_Tareas78.md` | Asignación de la tarea 3 a Tadeo Piccato (`@Flowveep`), estado actualizado a `Terminada` y resumen técnico. |
| `Tadeo Piccato.md` | Unificación de los registros históricos (absorbiendo `Tade Piccato.md`, que se eliminó) y documentación de esta entrega. |
| `Reparto_de_Tareas56.md` | Actualización de la referencia al informe unificado `Tadeo Piccato.md`. |

### Contrato e integración con la Tarea 4

- `useAuthContext()` expone `{ user, token, isAuthenticated, loading, login, register, logout }`. Lanza un error explícito si se invoca fuera de `<AuthProvider>`.
- `login` acepta tanto `login(email, password)` (contrato de la sección 6) como `login({ email, password })`.
- `ProtectedRoute` funciona tanto envolviendo elementos (`<ProtectedRoute><Perfil /></ProtectedRoute>`) como en rutas agrupadas con `<Outlet />`, para facilitar el cierre de `/perfil`, `/mis-pedidos` y `/admin/*` en la tarea 4.
- `Login` y `Registro` resuelven `location.state?.from` ya sea como objeto `location` (emitido por `ProtectedRoute`) o como cadena de ruta (por ejemplo `'/carrito'` desde «Finalizar compra»).

### Verificación ejecutada

Entorno local: Node.js **26.13.1** y npm **11.20.0**. Se instalaron las dependencias declaradas con `npm ci` en `client/` y `npm install --package-lock=false` en `backend/` sin modificar `package.json` ni `package-lock.json`.

Desde `client/` en PowerShell:

```powershell
$env:CI = 'true'
npm test -- --watchAll=false --runInBand
npm run build
```

- **Pruebas del cliente:** **90/90 pruebas aprobadas en 6 suites** (`auth.test.jsx`, `authApi.test.js`, `productManagement.test.jsx`, `homeSections.test.jsx`, `layout.test.jsx` y `productsApi.test.js`), incluyendo **34 pruebas nuevas** de autenticación.
- **Compilación de producción:** `CI=true npm run build` finalizó sin errores ni advertencias de ESLint.

Desde `backend/`:

```powershell
npm test
```

- **Pruebas del backend:** **44/44 pruebas aprobadas**. Total verificado: **134/134 pruebas aprobadas**.
- La verificación end-to-end contra MongoDB Atlas (y la integración de `CartContext`, `Navbar`, `/perfil`, `/mis-pedidos` y `/admin/*` protegidas) requiere un entorno con `MONGODB_URI` y `JWT_SECRET` y corresponde al cierre conjunto con las tareas 4 y 5.

---

## Sprint 5-6 — Tarea 4: Detalle de producto y formularios de alta/edición

- **Responsable:** Tadeo Piccato (@Flowveep).
- **Fecha:** 1 de noviembre de 2026.
- **Consigna:** tarea 4 de `Reparto_de_Tareas56.md`, «Detalle de producto y formularios de alta/edición».
- **Estado:** implementación y verificaciones locales completadas. La persistencia en MongoDB Atlas debe verificarse con un entorno configurado.
- *(Nota: este informe estaba originalmente en `Tade Piccato.md` y se unificó en este archivo el 21 de noviembre de 2026.)*

### Análisis inicial

La tarea 3 ya había instalado React Router, montado las rutas de detalle, alta y edición, migrado el catálogo y el carrito a `_id` y creado las cinco funciones de `productsApi.js`. Sin embargo, `App.jsx` todavía mostraba tres componentes provisorios. El archivo anterior de `ProductDetail.jsx` usaba los campos en inglés del sprint previo y no estaba conectado a esas rutas. No existían `ProductForm.jsx`, las páginas de alta/edición ni `admin.css`.

El backend ya contaba con el modelo `Product` y los cinco endpoints. Por eso se implementó la interfaz sobre esos contratos, conservando las funciones del servicio, los campos `nombre`, `descripcion`, `precio`, `stock`, `imagenUrl` y el identificador `_id`.

### Archivos entregados

| Archivo | Trabajo realizado |
|---|---|
| `client/src/components/ProductDetail.jsx` | Detalle conectado a la URL y a la API; datos completos, carrito, edición, confirmación de borrado y navegación al catálogo; estados de carga/error, reintento y respaldo de imagen. |
| `client/src/components/ProductForm.jsx` | Formulario controlado reutilizable con valores iniciales, validación, mensajes accesibles, normalización del cuerpo JSON y protección contra envíos duplicados. |
| `client/src/pages/CrearProducto.jsx` | Alta mediante `createProduct`, navegación al catálogo y confirmación de éxito. |
| `client/src/pages/EditarProducto.jsx` | Carga y precarga del formulario mediante el ID de la URL, actualización con `updateProduct` y navegación al detalle. |
| `client/src/hooks/useProduct.js` | Carga compartida con estado de espera, error, reintento y descarte de respuestas de una pantalla anterior. |
| `client/src/App.jsx` | Reemplazo de los tres componentes provisorios, presentación de confirmaciones y sincronización del catálogo y el carrito al editar/eliminar. |
| `client/src/styles/products.css` | Estilos del detalle, stock, mensajes, administración y borrado; grilla adaptable, botones de al menos 44 px de alto y foco visible. |
| `client/src/styles/admin.css` | Estilos de formularios con la paleta existente, campos numéricos adaptables, errores, ayudas y estados de espera. |
| `client/src/components/productManagement.test.jsx` | 23 pruebas nuevas de componentes e integración de rutas, formularios, API y carrito. |
| `Reparto_de_Tareas56.md` | Responsable, estado y resumen de la tarea 4. |
| `Tadeo Piccato.md` | Informe consolidado del trabajo (originalmente entregado en `Tade Piccato.md` con enlace desde `Tadeo Piccato.md`). |
| `.agents/handoffs/*.json` | Registro de cierre para otros asistentes, con cambios, comprobaciones realizadas y la verificación pendiente en Atlas. |

### Funcionamiento

#### Detalle y eliminación

`/productos/:id` obtiene el identificador con `useParams` y consulta `getProductById`. Presenta imagen, nombre, descripción, precio en ARS y stock. Si falta una imagen o falla su carga, muestra «Imagen no disponible»; también ofrece mensajes de respaldo para descripción y stock ausentes.

El botón de carrito llama al callback que administra `App` y muestra una confirmación. El enlace «Editar» abre `/admin/editar-producto/:id`. Para eliminar, se usa la confirmación nativa del navegador, incluyendo el nombre del producto. Cancelar no realiza solicitudes. Confirmar ejecuta `deleteProduct`, bloquea nuevas eliminaciones mientras espera y, al completar, navega a `/productos` mediante `useNavigate`, con un mensaje de éxito. Si la API falla, conserva el detalle y permite reintentar.

Las respuestas 404 muestran «Producto no encontrado». Un ID mal formado conserva el mensaje 400 de la API. Los errores de conexión permiten reintentar y siempre hay un enlace al catálogo.

#### Formulario compartido

`ProductForm` recibe `initialValues`, una función `onSubmit`, el texto del botón y la ruta de cancelación. Maneja los cinco campos con `useState`; los valores iniciales de precio y stock se convierten a texto para mantener los inputs controlados.

- Nombre obligatorio después de quitar espacios de los extremos.
- Precio obligatorio, numérico, finito e igual o mayor que cero; se admite precio 0 y decimales.
- Stock opcional, numérico, finito y no negativo; un campo vacío se envía como 0, en línea con el valor predeterminado del modelo.
- Descripción e imagen opcionales. La imagen admite URL o ruta relativa de los assets existentes.
- Se comprueba también `validity.badInput` para entradas numéricas incompletas del navegador.

Antes del envío se recortan los textos y se convierten precio y stock a números. Solo se envían los cinco campos del contrato. Ante errores de validación se enfoca el primer campo inválido; los mensajes se vinculan a sus controles con `aria-describedby` y `aria-invalid`. Los errores de la API se presentan con `role="alert"`, conservando los valores ingresados.

Un bloqueo con `useRef` impide envíos consecutivos incluso antes del siguiente render. Mientras hay una solicitud en curso, el `fieldset` y el botón quedan deshabilitados, la cancelación se bloquea y se informa «Guardando producto…».

#### Alta, edición e integración

El alta muestra el formulario vacío y envía un POST a través de `createProduct`. Al recibir el producto creado, vuelve al catálogo, que recarga los datos desde la API, y muestra una confirmación.

La edición carga el producto indicado por `useParams`, muestra el formulario precargado y ejecuta `updateProduct`. Al completar, navega al detalle actualizado. Cada cambio de ID remonta el contenido correspondiente, evitando que se mezclen datos o errores de productos distintos.

`App.jsx` mantiene el estado del carrito y su persistencia en `localStorage`. Al editar se actualiza el producto guardado en el carrito, conservando su cantidad; al eliminar se retira ese producto. Si el usuario cambia de pantalla mientras espera una operación, se sincroniza el estado compartido cuando corresponde y se evita una redirección tardía.

Los mensajes de éxito viajan en el estado de React Router y se muestran con `role="status"`. Se mantuvieron los enlaces al catálogo, el formulario de contacto y el flujo existente del carrito.

### Verificación ejecutada (Sprint 5-6)

Se instalaron las dependencias existentes con `npm ci` en `client/` y `npm install --package-lock=false --no-audit --no-fund` en `backend/`. No se agregaron dependencias ni se modificaron los manifiestos o el lockfile del cliente. Entorno: Node.js **24.22.1** y npm **11.19.1**.

#### Pruebas automatizadas

Desde `client/`, en PowerShell:

```powershell
$env:CI = 'true'
npm test -- --watchAll=false --runInBand
npm run build
```

Resultado: **42/42 pruebas aprobadas en 3 suites** y compilación de producción correcta. Las 23 pruebas nuevas verifican el detalle y el carrito, carga/reintento, errores 400/404, datos opcionales e imagen fallida, validación, POST 201 con campos normalizados, errores al crear/editar, bloqueo de envíos repetidos, precarga y PUT, confirmación/cancelación de DELETE, actualización del catálogo/carrito, cambio de ID con respuesta anterior pendiente y navegación del usuario durante una operación.

Desde `backend/`:

```powershell
npm test
```

Resultado: **17/17 pruebas aprobadas** del backend existente, incluyendo CRUD, validaciones, JSON inválido, errores y CORS. Total de esa verificación: **59 pruebas aprobadas**. La persistencia de esas pruebas se simula en memoria; las validaciones del modelo de Mongoose son reales.

También se revisaron los cambios para verificar manejo de errores, dependencias de hooks, respuestas tardías, ausencia de inserción de HTML sin escapar y conservación del contrato de la API. Se ejecutó `git diff --check`.

#### Revisión en Chrome

Se levantó temporalmente el build de producción junto al router, los controladores y el middleware de errores reales del backend. Se usó el helper existente `backend/tests/helpers/fakeProduct.js` para simular el almacenamiento, con los 11 productos iniciales, sin conectar a Atlas.

Se comprobó el formulario vacío y el foco en el primer error, el alta de una pieza de prueba, su aparición en el catálogo, la apertura del detalle, la precarga del formulario de edición y el guardado de nombre, precio, stock e imagen con navegación al detalle y confirmación visible. Se abrió y canceló la confirmación de borrado, conservando la pieza. La revisión visual permitió ajustar la alineación de los campos numéricos y el respaldo de imágenes que no cargan. La eliminación confirmada y su navegación se verificaron mediante las pruebas automatizadas.

Después se verificó por HTTP, contra ese mismo servidor temporal, el listado y detalle 200 con los datos editados, un POST inválido 400, un ID mal formado 400, el DELETE 200 de la pieza creada durante la revisión y el GET posterior 404. El listado final volvió a contener los 11 productos iniciales. Se cerró la pestaña de prueba y se detuvo el servidor temporal.

#### Alcance y comprobación con MongoDB

Ese checkout no contenía `backend/.env` ni credenciales de MongoDB. No se creó un clúster, no se ejecutó la semilla y no se afirmó persistencia real en Atlas. El servidor temporal de revisión utilizó datos aislados y se detuvo al terminar; no formó parte de los archivos entregados.

Para comprobar la persistencia real con las tareas 1 y 2 integradas:

1. Configurar `backend/.env` a partir de su ejemplo, con `MONGODB_URI` del entorno del equipo y un puerto compatible con el cliente. Configurar `client/.env` con `REACT_APP_API_URL` si la API está en otra dirección.
2. Iniciar el backend con `npm start` y el cliente con `npm start`, en terminales distintas. El backend usa 3000 por defecto, por lo que el cliente debe usar otro puerto libre.
3. Crear una pieza desde `/admin/crear-producto`, verificar su aparición en el catálogo y consultar su documento en MongoDB.
4. Editarla desde el detalle y comprobar que los cambios persisten después de recargar la página.
5. Eliminar esa pieza de prueba con confirmación y comprobar que desaparece del catálogo y de MongoDB.

El despliegue, CORS de producción, reglas de recarga de rutas y revisión final del sitio publicado correspondieron a la tarea 5.

#### Contexto compartido (Sprint 5-6)

Se revisaron las instrucciones disponibles y el estado inicial del repositorio. No había un `AGENTS.md` local ni `.agents/workspace.json` en ese checkout. Se consultó el proyecto detectado por Engram (`hermanosj-itba`), sin historial previo relevante, y se usó el ID de sesión nativo. Se reservaron los archivos mediante `agent-context`, y se registraron las decisiones y el cierre de sesión sin credenciales ni datos personales. Se consultó documentación de React 18 y React Router 6 mediante Context7 para los formularios controlados y la navegación.

---

## Sprint 3-4 — API de productos

**Responsable:** Tadeo Piccato (@Flowveep).  
**Fecha de trabajo:** 2 de octubre de 2026.  
**Asignación:** tarea 2 de `REPARTO_DE_TAREAS.md`.

### Análisis del proyecto

- El proyecto conserva la tienda del Sprint 1-2 en HTML/CSS/JavaScript y está migrando a `backend/` (Express) y `client/` (React).
- `client/src/services/productsApi.js` espera un array JSON de `GET http://localhost:3000/api/productos`; no necesita envoltorios ni conversión de campos.
- Ya existían el catálogo de 11 muebles y los dos controladores. El router estaba en `backend/src/routers/`, distinto de `backend/src/routes/`, que es la ubicación acordada en el reparto.
- Al revisar, todavía faltaban `backend/package.json`, `backend/src/app.js`, `backend/src/server.js` y los middlewares de la tarea 3. La tarea 1 tenía puntos de integración para los componentes de las tareas 4 y 5.
- La carpeta de trabajo no contiene `.git`; los cambios se realizaron sobre los archivos locales.

### Trabajo realizado

| Archivo | Trabajo |
|---|---|
| `backend/src/data/products.js` | Se revisó el catálogo y se documentó su origen y contrato. Se conservaron los 11 productos, sus IDs, nombres, precios, imágenes, descripciones y categorías del Sprint 1-2. |
| `backend/src/controllers/productsController.js` | Se simplificaron los comentarios y se hicieron explícitos los retornos. Se conservaron las respuestas 200 del listado y detalle y el error 404 JSON para IDs inexistentes. |
| `backend/src/routes/productsRouter.js` | Se trasladó el router a la ubicación exigida. Define `GET /` y `GET /:id` con `express.Router` y delega en los controladores. Se eliminó el archivo anterior de `backend/src/routers/`. |
| `backend/tests/serve-products.js` | Se agregó un servidor aislado para probar las rutas con Postman antes de integrar la tarea 3. Exporta la app para las pruebas y permite configurar `PORT`. |
| `backend/tests/products.test.js` | Se agregaron seis pruebas con `node:test`, solicitudes HTTP reales y un servidor en puerto disponible, que se cierra al finalizar. |
| `backend/tests/products.postman_collection.json` | Se creó una colección importable con listado, detalle y producto inexistente, variables `baseUrl` y `productId`, y verificaciones de estado HTTP y JSON. |
| `REPARTO_DE_TAREAS.md` | Se agregó el usuario `@Flowveep`, se marcó la tarea 2 como completada y se documentó cómo montar el router. |
| `Tadeo Piccato.md` | Se añadió este registro del Sprint 3-4 y se conservó debajo el registro previo del Sprint 1-2. |

### Contrato de la API

Los productos tienen exactamente `id`, `name`, `price`, `image`, `description` y `category`. El `id` es un slug de texto (por ejemplo, `sofa-patagonia`), el precio es un número en pesos argentinos y `image` conserva la ruta relativa del catálogo anterior.

| Solicitud | Estado | Cuerpo JSON |
|---|---|---|
| `GET /api/productos` | 200 | Array de los 11 productos, sin envoltorio. |
| `GET /api/productos/sofa-patagonia` | 200 | Objeto del producto solicitado, con los mismos campos que en el listado. |
| `GET /api/productos/inexistente` | 404 | `{ "error": "Producto no encontrado: inexistente", "status": 404 }` |

Los IDs se comparan de forma exacta; un ID numérico, incompleto o con mayúsculas que no exista también devuelve 404. El router entrega datos JSON. La publicación de imágenes para React deberá acordarse al integrar el servidor y el cliente, porque aún no hay configuración de archivos estáticos ni imágenes en `client/public/`.

### Cómo probar de forma independiente

Requisito: Node.js 18 o superior y npm. Ejecutar desde la raíz del proyecto. Mientras no exista el paquete de la tarea 3, instalar Express para la prueba sin crear un manifiesto ni un lockfile:

```powershell
npm install --prefix backend --no-save --package-lock=false express@5.2.1
node --test backend/tests/products.test.js
node backend/tests/serve-products.js
```

El último comando mantiene la API de prueba activa en `http://localhost:3000/api/productos`; finalizar con `Ctrl+C`. Si el puerto está ocupado, en PowerShell ejecutar `$env:PORT = '3001'` antes de iniciar y ajustar `baseUrl` en Postman.

En Postman, importar `backend/tests/products.postman_collection.json` y ejecutar las tres solicitudes o el Collection Runner. La variable `productId` inicialmente es `sofa-patagonia`; puede cambiarse por cualquier ID del listado. El servidor de prueba no configura CORS ni los middlewares globales de la aplicación final: esos archivos pertenecen a la tarea 3.

### Integración con la tarea 3

En `backend/src/app.js`, importar y montar el router:

```js
const productsRouter = require('./routes/productsRouter');
app.use('/api/productos', productsRouter);
```

La tarea 3 debe declarar Express en `backend/package.json`, configurar `express.json()`, CORS, logging, rutas no encontradas y errores globales, y agregar el arranque final. Cuando esté integrada, usar `npm install` y los scripts que defina esa tarea. El servidor de `backend/tests/` queda exclusivamente como herramienta de verificación.

### Verificación ejecutada (Sprint 3-4)

- Node.js **24.19.0**, Express **5.2.1**.
- **6/6 pruebas automatizadas aprobadas**, sin errores: campos e IDs, existencia de las 11 imágenes en el proyecto, igualdad con el catálogo anterior, listado 200, los 11 detalles 200, cuatro variantes de ID inexistente con 404 JSON y conservación del catálogo tras consultas repetidas.
- Se ejecutó la colección de Postman mediante **Newman 6.2.2** contra el servidor aislado: **3 solicitudes y 6/6 verificaciones aprobadas**, sin fallos.
- Para esta verificación se instalaron las dependencias en una carpeta temporal externa y se resolvieron mediante `NODE_PATH`; no se creó ni modificó el `backend/package.json` asignado a otro integrante.
- El registro del Sprint 1-2 que sigue es histórico; sus afirmaciones sobre 73 pruebas corresponden al trabajo anterior y no al resultado de esa sesión.

---

## Registro previo — Sprint 1-2

### Lógica de Catálogo, Búsqueda Reactiva & Asincronismo JS

Se completó minuciosamente la implementación de la capa de datos oficial, motor de búsqueda reactiva en tiempo real, filtros combinados por ambientes, ordenamiento dinámico, asincronismo simulado con skeletons y sistema de estilos **Mobile-First** adaptado al **Manual de Marca Oficial © 2026** de Hermanos Jota.

---

### 📦 Archivos Implementados y Entregados

| Archivo | Responsabilidad / Contenido |
|---|---|
| `js/data.js` | Array estructurado con las 11 piezas oficiales de autor, normalizador de texto, formateador de moneda ARS y métodos asíncronos (`getProducts`, `getProductById`, `getFeaturedProducts`, `getRelatedProducts`). |
| `js/catalog.js` | Motor reactivo del catálogo: carga con skeleton loader, búsqueda instantánea insensible a tildes/mayúsculas, pills de categorías, ordenación, feedback de filtros activos, estado de vacío (*Empty State*) e integración con el carrito sin duplicados. |
| `js/icons.js` | Catálogo de iconos SVG vectoriales accesibles con `currentColor` y helper `HJ_ICONS.get()`. |
| `js/main.js` | Header sticky dinámico, menú off-canvas drawer para móviles, sistema de toasts (`window.showToast`) y año automático. |
| `js/home.js` | Inyección asíncrona de las 4 piezas destacadas de portada con skeleton loaders en `index.html`. |
| `js/product-detail.js` | Carga dinámica por parámetro `?id=...`, cálculo de 6 cuotas fijas, especificaciones de ebanistería y piezas relacionadas en `producto.html`. |
| `js/contact.js` | Validación en tiempo real del formulario de contacto y renderizado de tarjeta de éxito en el DOM. |
| `css/styles.css` | Tokens oficiales del Manual de Marca (`--siena-tostado`, `--verde-salvia`, `--vara-de-oro`, etc.), reset, tipografías `Inter` y `Playfair Display`, botones y footer. |
| `css/catalog.css` | Estilos mobile-first de catálogo: barra de búsqueda con botón de limpieza, pills táctiles con scroll horizontal, grilla responsiva (1 col móvil, 2 tablet, 3 desktop), micro-interacciones hover, skeletons con animación shimmer y empty state. |
| `css/home.css` | Estilos para Hero, colecciones por ambiente y pilares de sustentabilidad. |
| `css/product-detail.css` | Estilos para la ficha técnica del mueble y piezas complementarias. |
| `css/contact.css` | Estilos para paneles del showroom, mapa gráfico y formulario. |
| `assets/images/` | Catálogo completo de imágenes normalizadas sin rutas rotas ni errores 404. |

---

### 🌟 Características Clave Desarrolladas

#### 1. Asincronismo JS & Skeletons Shimmer
- Al ingresar a `productos.html`, la grilla `#catalogGrid` muestra inmediatamente 6 tarjetas con siluetas y gradiente animado shimmer mientras el indicador superior avisa: *"Cargando catálogo oficial de autor..."*.
- La promesa `getProducts({ delay: 450 })` resuelve el listado simulando una llamada a API real, transicionando suavemente al renderizado final.

#### 2. Búsqueda Reactiva en Tiempo Real
- Filtrado instantáneo por evento `input` con debounce de 120ms para máxima fluidez.
- Normalización fonética y de acentos con `String.prototype.normalize('NFD')`:
  - Escribir `petiribi` encuentra piezas con **Petiribí**.
  - Escribir `cordoba` encuentra las **Sillas Córdoba**.
  - Escribir `sillon` encuentra el **Sillón Copacabana**.
  - Escribir `nogal`, `roble` o `guatambu` filtra por la madera de ebanistería.
- Botón `#searchClearBtn` que aparece dinámicamente al tipear y limpia el término con un click o presionando `Escape`.

#### 3. Filtros Combinados y Parámetros URL
- Filtrado por ambientes: `Todos`, `Comedor`, `Living`, `Estudio`, `Dormitorio`.
- Sincronización con query strings de la URL: `productos.html?cat=living` activa automáticamente el pill correspondiente y filtra las piezas sin recargar la página.
- Badge `#activeFilterBadge` con el estado activo y botón `×` para resetearlo.

#### 4. Ordenación Dinámica
- Selector `#sortSelect`:
  - **Recomendados**: piezas insignia y favoritas primero.
  - **Menor precio**: desde la *Mesa de Noche Aconcagua* ($ 525.000).
  - **Mayor precio**: hasta el *Sofá Patagonia* ($ 2.490.000).
  - **Nombre A-Z** y **Nombre Z-A**.

#### 5. Regla de Oro del Carrito (Sin Duplicados)
- Conforme a `Recursos/adicional.md` (*"No debe ser posible agregar un producto al carrito más de una vez"*):
  - Al agregar un producto, el botón de la tarjeta pasa a estado deshabilitado con etiqueta **"En el Carrito"** y tilde `✓`.
  - Si el usuario lo intenta agregar de nuevo, se le notifica mediante un Toast y se abre el drawer lateral sin duplicar el registro.
  - Al eliminar un item desde el drawer, el botón del catálogo vuelve a habilitarse de inmediato gracias al listener de sincronización de eventos.

#### 6. Estado de Vacío (*Empty State*)
- Si una búsqueda (ej: `"inexistente"`) no produce resultados, se presenta una tarjeta estética con ilustración SVG, mensaje de sugerencia de maderas y el botón **"Ver todo el catálogo de autor"** que resetea la búsqueda y los filtros.

---

### 🧪 Resultados del Bughunting & Verificación Automatizada (Sprint 1-2)

Se ejecutó una suite de 73 pruebas automatizadas cubriendo:
- Estructura de archivos y presencia de todos los módulos vinculados en el HTML.
- Presencia y validez de todas las 13 imágenes y logotipos en `assets/images/`.
- Integridad de los 11 objetos de producto en `PRODUCTOS` y sus atributos.
- Métodos asíncronos (`getProducts`, `getProductById`, `getFeaturedProducts`, `getRelatedProducts`).
- Búsqueda reactiva con y sin acentos, mayúsculas y filtros por madera.
- Filtros por categoría y ordenamiento ascendente/descendente.
- Verificación de respuestas HTTP 200 en todos los endpoints estáticos del servidor local.

**Resultado final**: `73 / 73 PRUEBAS SUPERADAS EXITOSAMENTE` sin excepciones en tiempo de ejecución ni errores 404.
