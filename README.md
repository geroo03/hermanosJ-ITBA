# Mueblería Hermanos Jota

Tienda online de muebles desarrollada como proyecto integrador de Full Stack Developer en ITBA (Sprints 5 a 8).

La aplicación se compone de un cliente en React, una API REST en Express y una base de datos MongoDB en la nube. Permite navegar el catálogo, crear una cuenta e iniciar sesión, armar un carrito, finalizar la compra (el pedido queda guardado a nombre del usuario), consultar «Mis pedidos» y el perfil, enviar una consulta y, con sesión iniciada, crear, editar o eliminar productos.

## Enlaces

- **Frontend (Vercel):** https://hermanos-j-itba.vercel.app
- **Backend (Render):** https://hermanos-jota-api-a94j.onrender.com/api/productos

## Tecnologías

- **Frontend:** React, React Router DOM, Context API (`AuthContext` y `CartContext`)
- **Backend:** Node.js, Express, bcrypt (`bcryptjs`), JSON Web Tokens (`jsonwebtoken`)
- **Base de datos:** MongoDB Atlas, Mongoose

## Estructura

```text
backend/
  src/
    config/        Conexión a MongoDB
    controllers/   Lógica de autenticación, productos y pedidos
    data/          Catálogo inicial para la semilla
    middlewares/   Logger, 404, manejo de errores y verifyToken (JWT)
    models/        Modelos User, Product y Order
    routes/        Rutas de /api/auth, /api/productos y /api/pedidos
    utils/         Firma y verificación de tokens
    seed.js        Carga inicial de productos
  tests/           Pruebas y colección de Postman
client/
  public/          HTML e imágenes del catálogo
  src/
    components/    Componentes de la interfaz (incluye ProtectedRoute)
    context/       AuthContext (sesión y token) y CartContext (carrito)
    hooks/         Hooks reutilizables
    pages/         Páginas de cada ruta
    services/      Consumo de la API
    styles/        Hojas de estilo
    utils/         Funciones auxiliares
```

## Arquitectura y flujo de datos

```text
React (Vercel) ──fetch + JSON──▶ Express (Render) ──Mongoose──▶ MongoDB Atlas
```

- **Sesión:** al registrarse o iniciar sesión, la API devuelve un JWT. `AuthContext` lo guarda en `localStorage` (`hermanos-jota-token`), lo decodifica para saber quién es el usuario y, al recargar la página, lo valida contra `GET /api/auth/perfil`; si venció, cierra la sesión.
- **Rutas protegidas:** `ProtectedRoute` envía a `/login` a quien no tiene sesión y, después de ingresar, lo devuelve a la página que quería ver.
- **Carrito:** vive en `CartContext` y se guarda en `localStorage` (`hermanos-jota-cart`), así que sobrevive a una recarga.
- **Compra:** «Finalizar compra» → `POST /api/pedidos` con `Authorization: Bearer <token>` → `verifyToken` valida el token y deja `req.user` → el controlador busca cada producto en la base, toma su nombre y precio, calcula el total y guarda el pedido a nombre del usuario → el cliente vacía el carrito y muestra «Mis pedidos».
- **Productos:** las lecturas son públicas; crear, editar y eliminar envían el mismo token.

**Pantallas del cliente**

| Ruta | Pantalla | Requiere sesión |
|---|---|---|
| `/` | Inicio | No |
| `/productos`, `/productos/:id` | Catálogo y detalle | No |
| `/carrito` | Carrito (para finalizar la compra pide iniciar sesión) | No |
| `/contacto` | Formulario de contacto | No |
| `/registro`, `/login` | Crear cuenta e ingresar | No |
| `/perfil`, `/mis-pedidos` | Datos de la cuenta y pedidos realizados | Sí |
| `/admin/crear-producto`, `/admin/editar-producto/:id` | Alta y edición de productos | Sí |

## Puesta en marcha local

Requisitos: Node.js 20 o superior y una base de datos en MongoDB Atlas.

**1. Backend**, en una terminal:

```bash
cd backend
npm install
cp .env.example .env    # completar MONGODB_URI y JWT_SECRET
npm run seed            # opcional, ver la advertencia
npm run dev
```

La API queda disponible en `http://localhost:3000/api/productos`.

> **Advertencia:** `npm run seed` borra todos los productos de la base a la que apunta `MONGODB_URI` y carga los 11 iniciales.

**2. Frontend**, en otra terminal:

```bash
cd client
npm install
cp .env.example .env
npm start
```

La aplicación se abre en `http://localhost:3001`.

**Pruebas:** `npm test` dentro de `backend/` y de `client/`.

## Variables de entorno

Los archivos `.env` no se suben al repositorio. En producción, las variables se cargan desde el panel de cada servicio.

**Backend (`backend/.env`, Render)**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `MONGODB_URI` | Cadena de conexión a MongoDB Atlas | `mongodb+srv://USUARIO:CONTRASEÑA@CLUSTER.mongodb.net/NOMBRE_BASE_DATOS` |
| `CLIENT_URL` | Origen del frontend permitido por CORS | `https://tu-sitio.vercel.app` |
| `PORT` | Puerto del servidor. Render lo define solo | `3000` |
| `JWT_SECRET` | Clave para firmar los tokens de sesión. Obligatoria: sin ella el servidor no arranca | Una cadena larga y aleatoria, por ejemplo la salida de `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Vencimiento de los tokens. Opcional | `7d` |

**Frontend (`client/.env`, Vercel)**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `REACT_APP_API_URL` | URL de la API, terminada en `/api` | `https://tu-api.onrender.com/api` |
| `PORT` | Puerto de desarrollo local | `3001` |

## API

Las rutas marcadas con 🔒 exigen el header `Authorization: Bearer <token>` y responden **401** si el token falta, es inválido o venció. Los errores siempre tienen la forma `{ "error": "mensaje", "status": 401 }`.

**Autenticación**

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/auth/register` | Crea una cuenta con `{ nombre, email, password }` y responde **201** con `{ token, user }`. **409** si el email ya existe |
| `POST` | `/api/auth/login` | Inicia sesión con `{ email, password }` y responde `{ token, user }`. **401** si las credenciales no son correctas |
| `GET` | `/api/auth/perfil` 🔒 | Devuelve el usuario del token |

**Productos**

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/productos` | Devuelve todos los productos |
| `GET` | `/api/productos/:id` | Devuelve un producto por su `_id` |
| `POST` | `/api/productos` 🔒 | Crea un producto |
| `PUT` | `/api/productos/:id` 🔒 | Actualiza un producto |
| `DELETE` | `/api/productos/:id` 🔒 | Elimina un producto |

**Pedidos**

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/pedidos` 🔒 | Crea un pedido con `{ items: [{ producto, cantidad }] }` a nombre del usuario del token. El servidor toma nombre y precio de la base y calcula el total |
| `GET` | `/api/pedidos/mis-pedidos` 🔒 | Devuelve los pedidos del usuario, del más nuevo al más viejo |

Las contraseñas se guardan hasheadas con bcrypt y nunca se devuelven en las respuestas.

## Equipo

- Santiago Oroz
- Sebastián Gerónimo Peralta
- Mateo Bouso
- Nicolás Benítez
- Tadeo Piccato
