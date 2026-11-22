# Reparto de tareas — Sprints 7 y 8

Este archivo sirve para coordinar el trabajo y para dejar documentada la responsabilidad de cada integrante. Hay **5 tareas, una por integrante**. Cada tarea tiene archivos propios para que puedan hacerse en paralelo. Ninguna tarea está asignada de antemano: cada persona elige una libre y escribe su nombre y usuario en ella.

Este trabajo continúa el repositorio del Sprint 5-6: la API de Express con MongoDB y el CRUD de productos, y la aplicación de React con React Router, el detalle y los formularios de alta/edición ya existen y están desplegados (Render y Vercel). En estos sprints se agregan **usuarios con autenticación**, **estado global con Context API**, **pedidos asociados al cliente** y el **lanzamiento final**. La identidad de marca (paleta, tipografías, imágenes), el catálogo y el CRUD se conservan.

---

## 1. Resumen del proyecto

**Sprints 7 y 8 — Autenticación, estado global y lanzamiento.** **Entrega: fin del Sprint 8.**

El objetivo es transformar la aplicación en una plataforma de e-commerce completa, segura y funcional: registro y login con contraseñas hasheadas (**bcrypt**) y sesiones con **JSON Web Tokens (JWT)**, rutas protegidas en backend y frontend, **autenticación y carrito gestionados con la Context API de React**, pedidos registrados a nombre del cliente y el despliegue público de todo el conjunto.

## 2. Objetivos de aprendizaje

1. Implementar un sistema de autenticación full stack seguro usando hashing (bcrypt) y JSON Web Tokens (JWT).
2. Proteger rutas de la API en el backend con un middleware de autorización.
3. Gestionar estado global complejo (autenticación, carrito) de forma eficiente con la **React Context API** (`createContext`, `useContext`, `useMemo`).
4. Crear y gestionar **rutas protegidas** en el frontend con React Router.
5. Realizar un despliegue completo de una aplicación MERN (frontend, backend y base de datos en producción).
6. Configurar variables de entorno para producción en plataformas de hosting.
7. Consolidar todas las habilidades del stack MERN en un único proyecto cohesivo.

## 3. Requisitos funcionales y de negocio

- **Registro (`/registro`)**: formulario que envía los datos a la API; la contraseña se hashea en el backend antes de guardarse.
- **Login (`/login`)**: valida las credenciales contra la base de datos y devuelve un JWT.
- **Persistencia de sesión**: el frontend guarda el JWT y mantiene al usuario logueado tras recargar la página.
- **UI condicional**: la navegación cambia según el usuario esté logueado o no.
- **Logout**: limpia el token y actualiza el estado global.
- **Rutas protegidas (`/perfil`, `/mis-pedidos`)**: inaccesibles sin autenticación; redirigen a login.
- **Carrito global con Context API.** **"Finalizar compra"** solo funciona logueado y el `POST` del pedido usa el JWT para asociarlo al usuario. El carrito se vacía solo tras un pedido exitoso.
- **Despliegue público** del frontend (Vercel o Netlify), de la API (Render) y de la base de datos (MongoDB Atlas), con los secretos como variables de entorno y nunca en el código.

## 4. Arquitectura del proyecto

```text
React Client (AuthContext + CartContext)  ⇄  Express API (JWT)  ⇄  MongoDB Atlas
```

Flujo de una compra: el usuario inicia sesión (`AuthContext` guarda el JWT) → agrega productos al carrito (`CartContext`) → «Finalizar compra» → `fetch` a `POST /api/pedidos` con `Authorization: Bearer <token>` → el middleware `verifyToken` valida el token y deja `req.user` → el controlador crea el pedido a nombre de ese usuario → MongoDB → respuesta JSON → el cliente vacía el carrito y navega a `/mis-pedidos`.

## 5. Entregables

- Repositorio de GitHub con el código final de `/client` y `/backend`.
- Enlace al frontend desplegado y público (por ejemplo Vercel).
- Enlace a la API desplegada y pública (por ejemplo Render).
- `README.md` final y pulido, con los enlaces a los sitios desplegados y la descripción de la arquitectura.

---

## 6. Contrato de integración

Para que las cinco tareas encajen sin pisarse, todo el equipo respeta estos acuerdos. Es la fuente de verdad: si algo se cambia, se cambia aquí primero.

### Backend

- **Modelo `User`** (`backend/src/models/User.js`): `nombre` (obligatorio), `email` (obligatorio, único, en minúsculas), `password` (hash de bcrypt, nunca se devuelve), `rol` (`cliente` por defecto, o `admin`) y `timestamps`.
- **Objeto de usuario público** en las respuestas: `{ _id, nombre, email, rol, createdAt, updatedAt }`.
- **Endpoints de autenticación** (`/api/auth`):

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ nombre, email, password }` | **201** `{ token, user }` |
| `POST` | `/api/auth/login` | `{ email, password }` | **200** `{ token, user }` |
| `GET` | `/api/auth/perfil` | — (con token) | **200** `user` |

- **JWT:** payload `{ id, rol }`, firmado con `JWT_SECRET` y con vencimiento `JWT_EXPIRES_IN` (7 días por defecto). Se envía en cada petición protegida con el header `Authorization: Bearer <token>`.
- **Middleware** (`backend/src/middlewares/auth.js`): `verifyToken` valida el token y deja `req.user = { id, rol }`; `requireRole('admin')` se usa después para restringir por rol. Cualquier ruta protegida se declara así: `router.post('/', verifyToken, handler)`.
- **Modelo `Order`** (Tarea 2): `usuario` (ref a `User`), `items` (`[{ producto, nombre, precio, cantidad }]`, con `nombre` y `precio` copiados del producto al momento de la compra), `total` y `timestamps`.
- **Endpoints de pedidos** (`/api/pedidos`, todos protegidos):

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| `POST` | `/api/pedidos` | `{ items: [{ producto: "<_id>", cantidad: 2 }] }` | **201** el pedido creado |
| `GET` | `/api/pedidos/mis-pedidos` | — | **200** array con los pedidos del usuario del token, del más nuevo al más viejo |

  El servidor **recalcula precios y total desde la base**: nunca confía en los valores que manda el cliente.
- **Rutas de productos:** `GET` siguen públicas; `POST`, `PUT` y `DELETE` pasan a requerir token.
- **Códigos de estado y errores:** el mismo formato `{ "error": "mensaje", "status": 401 }`. Se suman `401` (sin token, token inválido/vencido o credenciales incorrectas), `403` (rol insuficiente) y `409` (email ya registrado), además de los ya existentes (`200`, `201`, `400`, `404`, `500`).
- **Variables de entorno nuevas** (backend, documentadas en `backend/.env.example`): `JWT_SECRET` (obligatoria: el servidor no arranca sin ella) y `JWT_EXPIRES_IN` (opcional). Nunca se suben a GitHub.

### Frontend

- **Token:** se guarda en `localStorage` con la clave `hermanos-jota-token`. El carrito conserva su clave `hermanos-jota-cart`.
- **`AuthContext`** (`client/src/context/AuthContext.jsx`): `AuthProvider` y el hook `useAuthContext()`. Expone `{ user, token, isAuthenticated, loading, login(email, password), register({ nombre, email, password }), logout() }`. El `value` se memoiza con `useMemo`. `loading` es `true` mientras se restaura la sesión al cargar la página.
- **`CartContext`** (`client/src/context/CartContext.jsx`): `CartProvider` y el hook `useCartContext()`. Expone `{ cart, cartItemCount, total, addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart }`. Cada elemento del carrito mantiene la forma actual `{ product, quantity }`. Es un contexto **separado** del de autenticación (separar por responsabilidad evita renders innecesarios).
- **Cliente de la API:** `client/src/services/authApi.js` (`registerUser`, `loginUser`, `getProfile`) y `client/src/services/ordersApi.js` (`createOrder(items, token)`, `getMyOrders(token)`), con el mismo manejo de errores que `productsApi.js`.
- **`ProtectedRoute`** (`client/src/components/ProtectedRoute.jsx`): envuelve las rutas privadas. Mientras `loading` muestra un estado de espera; si no hay sesión redirige a `/login` guardando en `state.from` la ruta pedida, para volver tras iniciar sesión.
- **Rutas nuevas:** `/registro`, `/login`, `/perfil` (protegida) y `/mis-pedidos` (protegida). Las rutas `/admin/crear-producto` y `/admin/editar-producto/:id` también pasan a ser protegidas.
- **Providers:** `AuthProvider` y `CartProvider` se montan en `client/src/index.js`, dentro de `BrowserRouter`. `App.jsx` deja de guardar el carrito en su estado y lo consume del contexto.

---

## Tarea 1. Responsable: **(sin asignar)** — Backend de autenticación: usuarios, bcrypt, JWT y middleware

**Estado: Terminada**

**Archivos:** `backend/package.json`, `backend/src/models/User.js`, `backend/src/utils/token.js`, `backend/src/controllers/authController.js`, `backend/src/routes/authRouter.js`, `backend/src/middlewares/auth.js`, `backend/src/app.js`, `backend/src/server.js`, `backend/.env.example`, `backend/tests/auth.test.js`, `backend/tests/helpers/fakeUser.js`, `backend/tests/auth.postman_collection.json`.

**Qué hay que hacer:**

- Instalar `bcryptjs` (hash de contraseñas, en JavaScript puro para que compile igual en Windows y en Render) y `jsonwebtoken` en `backend/` y declararlos en `package.json`.
- Crear el modelo `User` en `models/User.js` con los campos del contrato, validación del formato de email, `email` único y en minúsculas, `password` con `select: false` y `toJSON` que nunca exponga el hash.
- Crear el controlador de autenticación con tres funciones `async/await`:
  - `register`: valida que la contraseña tenga al menos 6 caracteres, rechaza emails repetidos con **409**, **hashea la contraseña con bcrypt** antes de guardar y responde **201** con `{ token, user }`. El rol nunca se toma del cuerpo.
  - `login`: busca por email, compara con `bcrypt.compare` y responde `{ token, user }`. Ante email inexistente o contraseña incorrecta responde **401** con el **mismo** mensaje, para no revelar qué cuentas existen.
  - `getProfile`: devuelve el usuario del token.
- Crear `utils/token.js` para firmar y verificar JWT con `JWT_SECRET` y `JWT_EXPIRES_IN`.
- Crear el middleware `verifyToken` (y `requireRole`) en `middlewares/auth.js`: lee `Authorization: Bearer <token>`, deja `req.user = { id, rol }` y responde **401** con `{ error, status }` si falta, es inválido o venció. Este middleware es el que usa la Tarea 2.
- Registrar las rutas en `authRouter.js` y montarlas en `app.js` bajo `/api/auth`.
- Hacer que `server.js` no arranque si falta `JWT_SECRET` y documentar `JWT_SECRET` y `JWT_EXPIRES_IN` en `backend/.env.example`.
- Escribir pruebas automatizadas y una colección de Postman: registro, login, perfil, y los casos de error (datos inválidos, email repetido, credenciales incorrectas, token ausente, inválido y vencido).

**Al terminar:** se puede crear una cuenta, iniciar sesión y consultar el perfil con Postman contra la API; las contraseñas quedan hasheadas en MongoDB y existe un middleware reutilizable para proteger cualquier ruta.

### Resumen de la tarea

Se instalaron `bcryptjs` y `jsonwebtoken` y se creó el modelo `User` (`nombre`, `email` único en minúsculas con formato validado, `password` oculto por defecto, `rol` y `timestamps`), cuyo `toJSON` elimina siempre el hash. `authController.js` implementa `register` (contraseña mínima de 6 caracteres, **409** ante email repetido, hash con bcrypt de 10 rondas, **201** con `{ token, user }` y rol siempre `cliente`), `login` (mismo **401** para email inexistente y contraseña incorrecta) y `getProfile`.

`utils/token.js` firma y verifica los JWT con payload `{ id, rol }`, y `middlewares/auth.js` exporta `verifyToken` (header `Authorization: Bearer`, deja `req.user`, distingue token vencido de token inválido) y `requireRole`. Las rutas viven en `authRouter.js` bajo `/api/auth`, y `server.js` se niega a arrancar sin `JWT_SECRET`.

Se agregaron 11 pruebas en `auth.test.js` (con un modelo `User` simulado en memoria, `tests/helpers/fakeUser.js`, que conserva la validación real del esquema) y la colección `auth.postman_collection.json`. Todo el backend pasa **30/30**. La verificación contra MongoDB Atlas queda pendiente de un entorno con `MONGODB_URI`, ya que este checkout no tiene credenciales. Detalles y comandos en `Santiago Oroz.md`.

---

## Tarea 2. Responsable: **Mateo Bouso** (@mbouso420-spec) — Backend de pedidos y protección de rutas de la API

**Estado: Terminada**

**Archivos:** `backend/src/models/Order.js`, `backend/src/controllers/ordersController.js`, `backend/src/routes/ordersRouter.js`, `backend/src/routes/productsRouter.js`, `backend/src/app.js`, `backend/tests/orders.test.js`, `backend/tests/products.test.js`, `backend/tests/helpers/fakeOrder.js`, `backend/tests/orders.postman_collection.json`, `backend/tests/products.postman_collection.json`.

**Qué hay que hacer:**

- Crear el modelo `Order` con los campos del contrato (`usuario`, `items` con `producto`, `nombre`, `precio` y `cantidad`, `total` y `timestamps`), con validaciones claras (al menos un ítem, cantidades enteras mayores a cero).
- Crear `POST /api/pedidos` protegido con `verifyToken` (de la Tarea 1): recibe `{ items: [{ producto, cantidad }] }`, valida los `_id`, **busca cada producto en la base**, copia su `nombre` y `precio`, calcula el `total` en el servidor y asocia el pedido a `req.user.id`. Responde **201** con el pedido, **400** si el carrito está vacío, un `_id` es inválido o la cantidad no es válida, y **404** si algún producto no existe.
- Decidir y documentar qué pasa con el `stock` (por ejemplo, rechazar con 400 si no alcanza y descontarlo al confirmar) y aplicarlo de forma coherente.
- Crear `GET /api/pedidos/mis-pedidos` protegido: devuelve solo los pedidos del usuario del token, del más nuevo al más viejo.
- Montar el router en `app.js` bajo `/api/pedidos`.
- Proteger `POST`, `PUT` y `DELETE` de `/api/productos` con `verifyToken`; las lecturas siguen públicas. Adaptar `products.test.js` y la colección de Postman de productos para enviar el token.
- Escribir pruebas automatizadas y la colección de Postman de pedidos, incluyendo el caso sin token (**401**), precios manipulados por el cliente (deben ignorarse) y pedidos de otro usuario (no deben aparecer).

**Al terminar:** un usuario autenticado puede crear un pedido y listar los suyos con Postman, el total lo calcula siempre el servidor y las escrituras de productos exigen sesión.

### Resumen de la tarea

Se creó el modelo `Order` (`backend/src/models/Order.js`) con `usuario` (referencia a `User`, obligatorio e indexado), `items` (array no vacío de subdocumentos `{ producto, nombre, precio, cantidad }` con cantidades enteras mayores a cero), `total` (`min: 0`) y `timestamps`. En `backend/src/controllers/ordersController.js` se implementaron `createOrder` (`POST /api/pedidos`) y `getMyOrders` (`GET /api/pedidos/mis-pedidos`), registrados en `backend/src/routes/ordersRouter.js` bajo `/api/pedidos` (montado en `backend/src/app.js`), ambos protegidos con `verifyToken`.

`createOrder` valida el formato de `items`, consolida productos repetidos preservando el orden de aparición, consulta cada producto en la base de datos (respondiendo **404** si no existe), copia siempre `nombre` y `precio` desde la base, calcula `total` en el servidor y asocia el pedido a `req.user.id`, ignorando cualquier precio, nombre, total o usuario enviado por el cliente. **Política de stock** (coherente con `seed.js` y `ProductDetail.jsx`): si `product.stock > 0`, se valida disponibilidad en todos los ítems antes de modificar la base (rechazando con **400** y sin descuentos parciales si no alcanza) y se descuenta al confirmar con reversión si falla el guardado del pedido; si `product.stock === 0`, la pieza se trata como «Disponible a pedido» (taller artesanal), se permite el pedido y el stock se mantiene en `0`. `getMyOrders` devuelve únicamente los pedidos del usuario autenticado ordenados del más nuevo al más viejo (`createdAt: -1`).

En `backend/src/routes/productsRouter.js` se mantuvieron públicas las lecturas (`GET /` y `GET /:id`) y se protegieron con `verifyToken` las escrituras (`POST /`, `PUT /:id` y `DELETE /:id`), actualizando `products.test.js` (13 pruebas) y `products.postman_collection.json` (16 solicitudes con autenticación y casos 401). Se agregaron `backend/tests/helpers/fakeOrder.js` (almacén en memoria con validación real de Mongoose y timestamps monotónicos), 12 pruebas en `backend/tests/orders.test.js` y la colección `backend/tests/orders.postman_collection.json` (11 solicitudes). La suite completa del backend suma **44 pruebas** (`app.test.js`: 8, `auth.test.js`: 11, `products.test.js`: 13, `orders.test.js`: 12). La verificación contra MongoDB Atlas queda pendiente de un entorno con `MONGODB_URI`, ya que este checkout no tiene credenciales. Detalles y comandos en `Mateo Bouso.md`.

---

## Tarea 3. Responsable: **Tadeo Piccato** (@Flowveep) — Frontend: `AuthContext`, `ProtectedRoute` y páginas de registro y login

**Estado: Terminada**

**Archivos:** `client/src/context/AuthContext.jsx`, `client/src/services/authApi.js`, `client/src/components/ProtectedRoute.jsx`, `client/src/components/AuthForm.jsx`, `client/src/pages/Registro.jsx`, `client/src/pages/Login.jsx`, `client/src/index.js`, `client/src/App.jsx`, `client/src/styles/auth.css`, `client/src/services/authApi.test.js`, `client/src/components/auth.test.jsx`.

**Qué hay que hacer:**

- Crear `services/authApi.js` con `registerUser`, `loginUser` y `getProfile`, usando `fetch`, `REACT_APP_API_URL` y el mismo manejo de errores de conexión y de respuesta que `productsApi.js` (propagando `error` y `status` de la API).
- Crear `AuthContext` con `createContext`, el componente `AuthProvider` y el custom hook `useAuthContext()` (si se usa fuera del provider, lanza un error claro). Debe: guardar el token en `localStorage` (`hermanos-jota-token`), **decodificar el payload del JWT** para conocer al usuario, **restaurar la sesión al recargar la página** (verificando el token contra `GET /api/auth/perfil` y descartándolo si venció), exponer `login`, `register` y `logout`, y **memoizar el `value` con `useMemo`** para no re-renderizar a todos los consumidores.
- Crear `ProtectedRoute`: muestra un estado de espera mientras `loading`, redirige a `/login` (guardando `state.from`) si no hay sesión y renderiza la ruta si la hay.
- Crear las páginas `/registro` y `/login` con formularios controlados (reutilizando un `AuthForm`), validación básica (nombre, email válido, contraseña de al menos 6 caracteres), mensajes claros por campo, errores de la API (por ejemplo «Email o contraseña incorrectos», «Ya existe una cuenta con ese email»), bloqueo de envíos duplicados y navegación con `useNavigate`: tras iniciar sesión, vuelve a `state.from` o al inicio. Si ya hay sesión, redirige.
- Montar `AuthProvider` en `index.js` y registrar `/registro` y `/login` en `App.jsx` (coordinar con la Tarea 4, que también toca `App.jsx`).
- Agregar pruebas del contexto, de `ProtectedRoute` y de los formularios.

**Al terminar:** se puede registrar una cuenta e iniciar sesión desde el navegador, la sesión sobrevive a recargar la página, y existe un `ProtectedRoute` listo para envolver cualquier ruta privada.

### Resumen de la tarea

Se implementó `client/src/services/authApi.js` con `registerUser`, `loginUser` y `getProfile` usando `fetch` y `REACT_APP_API_URL`, conservando el manejo de errores de red y respuestas JSON `{ error, status }` de `productsApi.js`. En `client/src/context/AuthContext.jsx` se crearon `AuthContext`, `AuthProvider` y `useAuthContext()` (lanza un error claro si se usa fuera del provider), con persistencia en `localStorage` bajo `hermanos-jota-token`, decodificación Base64URL del payload JWT (`decodeJwtPayload` e `isTokenExpired`), restauración de sesión al recargar validando contra `GET /api/auth/perfil` (descartando tokens vencidos o rechazados con 401 y evitando condiciones de carrera con `logout`/`login`), acciones `login`, `register` y `logout` en `useCallback`, y `value` memoizado con `useMemo`.

Se creó `client/src/components/ProtectedRoute.jsx` (muestra estado de espera mientras `loading`, redirige a `/login` preservando `state.from` si no hay sesión y soporta tanto `children` como `<Outlet />`), `client/src/components/AuthForm.jsx` (formulario controlado reutilizable para registro y login, validación por campo, foco al primer error, errores de API y bloqueo de envíos duplicados), las páginas `client/src/pages/Login.jsx` y `client/src/pages/Registro.jsx` (navegación de retorno a `state.from` o `/`, redirección automática si ya hay sesión y preservación de `state.from` entre ambas pantallas) y los estilos en `client/src/styles/auth.css`. Se montó `<AuthProvider>` en `client/src/index.js` y se registraron `/login` y `/registro` en `client/src/App.jsx` manteniendo intactas las rutas y pruebas existentes para coordinar sin fricciones con la Tarea 4.

Se agregaron **34 pruebas nuevas** (`client/src/services/authApi.test.js`: 12 y `client/src/components/auth.test.jsx`: 22). La verificación pasó completa: **90/90 pruebas del cliente en 6 suites**, `CI=true npm run build` sin errores ni advertencias, y **44/44 pruebas del backend** (**134/134** en total). También se unificaron los registros históricos de `Tade Piccato.md` y `Tadeo Piccato.md` en `Tadeo Piccato.md`. Detalles y comandos en `Tadeo Piccato.md`.

---

## Tarea 4. Responsable: **(sin asignar)** — Frontend: `CartContext`, navegación según sesión, perfil y pedidos

**Estado: Pendiente**

**Archivos:** `client/src/context/CartContext.jsx`, `client/src/services/ordersApi.js`, `client/src/components/Cart.jsx`, `client/src/components/Navbar.jsx`, `client/src/pages/Perfil.jsx`, `client/src/pages/MisPedidos.jsx`, `client/src/App.jsx`, `client/src/index.js`, `client/src/styles/orders.css`, y las pruebas correspondientes.

**Qué hay que hacer:**

- Crear `CartContext` con `CartProvider` y el hook `useCartContext()`: mover a este contexto el estado del carrito y sus funciones (hoy viven en `App.jsx`), con su persistencia en `localStorage` y la validación de `readStoredCart`, calcular `cartItemCount` y `total`, agregar `clearCart`, y **memoizar el `value`** (`useMemo`, con las funciones en `useCallback`). Montar `CartProvider` en `index.js` y adelgazar `App.jsx`.
- Adaptar `Navbar`, `ProductCard`, `ProductDetail`, `Home`, `Catalogo` y `Cart` para consumir el contexto en lugar de recibir el carrito por props (`onAddToCart`, etc.), sin cambiar su aspecto.
- Crear `services/ordersApi.js` con `createOrder(items, token)` y `getMyOrders(token)`, que envían `Authorization: Bearer <token>` y propagan los errores de la API.
- **Finalizar compra** en `Cart`: si no hay sesión, el botón lleva a `/login` (con `state.from` hacia el carrito); si la hay, llama a `createOrder` con los `_id` y cantidades, **vacía el carrito solo si el pedido salió bien**, muestra el resultado (éxito o error de la API) y navega a `/mis-pedidos`. Evitar envíos duplicados mientras se espera la respuesta.
- **Navegación condicional** en `Navbar`: sin sesión, enlaces a «Ingresar» y «Crear cuenta»; con sesión, saludo con el nombre, enlaces a «Mis pedidos» y «Perfil» y un botón «Salir» que ejecuta `logout`. El contador del carrito se mantiene.
- Crear la página `/perfil` (datos del usuario) y `/mis-pedidos` (lista de pedidos con fecha, ítems y total, con estados de carga, vacío y error), ambas dentro de `ProtectedRoute`. Envolver también las rutas `/admin/*` con `ProtectedRoute`.
- Agregar pruebas del contexto del carrito, de la navegación condicional y del flujo de finalizar compra.

**Al terminar:** el carrito funciona desde el contexto, solo se puede finalizar la compra con sesión iniciada, el pedido queda guardado a nombre del usuario y aparece en «Mis pedidos». Depende de `AuthContext` y `ProtectedRoute` de la Tarea 3 y de los endpoints de la Tarea 2: conviene coordinar los nombres al comienzo, usando el contrato de la sección 6.

---

## Tarea 5. Responsable: **(sin asignar)** — Sprint 8: despliegue, variables de producción, README y revisión final

**Estado: Pendiente**

**Archivos:** `README.md`, `backend/.env.example` y `client/.env.example` (revisión), `backend/src/app.js` (CORS, si hace falta), configuración de Render, Vercel/Netlify y MongoDB Atlas, y este archivo.

**Qué hay que hacer:**

- **Variables de producción en Render:** agregar `JWT_SECRET` (una cadena larga y aleatoria, distinta de la de desarrollo, generada para este fin) y, si se quiere, `JWT_EXPIRES_IN`, además de `MONGODB_URI`, `CLIENT_URL` y `PORT`. Nunca en el código ni en el repositorio.
- **Redespliegue:** una vez integradas las tareas 1 a 4, redesplegar el backend en Render y el frontend en Vercel (o Netlify) desde `main`, y comprobar que `GET /api/productos` y `POST /api/auth/login` responden en la URL pública.
- **CORS:** verificar que el header `Authorization` está permitido desde el sitio publicado (preflight de `POST /api/pedidos` y de `POST`, `PUT` y `DELETE` de productos con token) y ajustar `app.js` si hace falta.
- **README.md final:** actualizar la descripción, las tecnologías (sumar bcrypt, JWT y Context API), la estructura de carpetas, la **descripción de la arquitectura** y del flujo de datos de una petición full stack (incluyendo el JWT), la tabla de endpoints (autenticación y pedidos), la lista de variables de entorno (sin valores reales, con `JWT_SECRET` y `JWT_EXPIRES_IN`) y los **enlaces a ambos despliegues**.
- **Revisión final:** recorrer la aplicación publicada de punta a punta con el checklist de abajo, confirmar que no hay credenciales en el repositorio ni en el historial y que están las carpetas `/client` y `/backend`. Quitar el bloque de instrucciones de este archivo en el último commit.

**Al terminar:** los dos despliegues funcionan con la autenticación activa, el README refleja el estado final y cualquier persona puede levantar el proyecto en local siguiendo sus instrucciones.

---

## Checklist de entrega final

Cuando las cinco tareas estén integradas, el equipo verifica en la aplicación **desplegada**:

- [ ] Se puede crear una cuenta en `/registro` y la contraseña queda hasheada en la base (nunca en texto plano).
- [ ] `/login` con credenciales correctas inicia sesión, y con credenciales incorrectas muestra un error claro.
- [ ] Recargar la página mantiene la sesión iniciada.
- [ ] La barra de navegación cambia según haya o no sesión, y «Salir» cierra la sesión.
- [ ] `/perfil` y `/mis-pedidos` redirigen a `/login` sin sesión y, tras iniciar sesión, vuelven a la ruta pedida.
- [ ] Sin sesión, «Finalizar compra» lleva a iniciar sesión; con sesión, crea el pedido a nombre del usuario.
- [ ] Tras un pedido exitoso el carrito se vacía, y el pedido aparece en `/mis-pedidos` con el total correcto.
- [ ] Un pedido con un token ausente, inválido o vencido responde 401 desde la API.
- [ ] Crear, editar y eliminar productos exige sesión; el catálogo y el detalle siguen siendo públicos.
- [ ] El catálogo, el detalle, el carrito y el formulario de contacto siguen funcionando.
- [ ] No hay archivos `.env` ni credenciales (incluido `JWT_SECRET`) en el repositorio.
- [ ] El README incluye los enlaces de ambos despliegues, la arquitectura y las variables de entorno.
- [ ] Cada integrante escribió su nombre y usuario en su tarea de este archivo.
