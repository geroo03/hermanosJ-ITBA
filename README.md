# Mueblería Hermanos Jota

Tienda online de muebles desarrollada como proyecto integrador de Full Stack Developer en ITBA (Sprints 5 y 6).

La aplicación se compone de un cliente en React, una API REST en Express y una base de datos MongoDB en la nube. Permite navegar el catálogo, administrar un carrito, enviar una consulta y crear, editar o eliminar productos.

## Enlaces

- **Frontend (Vercel):** _pendiente de despliegue_
- **Backend (Render):** _pendiente de despliegue_

## Tecnologías

- **Frontend:** React, React Router DOM
- **Backend:** Node.js, Express
- **Base de datos:** MongoDB Atlas, Mongoose

## Estructura

```text
backend/
  src/
    config/        Conexión a MongoDB
    controllers/   Lógica del CRUD de productos
    data/          Catálogo inicial para la semilla
    middlewares/   Logger, 404 y manejo de errores
    models/        Modelo Product
    routes/        Rutas de /api/productos
    seed.js        Carga inicial de productos
  tests/           Pruebas y colección de Postman
client/
  public/          HTML e imágenes del catálogo
  src/
    components/    Componentes de la interfaz
    hooks/         Hooks reutilizables
    pages/         Páginas de cada ruta
    services/      Consumo de la API
    styles/        Hojas de estilo
    utils/         Funciones auxiliares
```

## Puesta en marcha local

Requisitos: Node.js 20 o superior y una base de datos en MongoDB Atlas.

**1. Backend**, en una terminal:

```bash
cd backend
npm install
cp .env.example .env    # completar MONGODB_URI
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

**Frontend (`client/.env`, Vercel)**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `REACT_APP_API_URL` | URL de la API, terminada en `/api` | `https://tu-api.onrender.com/api` |
| `PORT` | Puerto de desarrollo local | `3001` |

## API

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/productos` | Devuelve todos los productos |
| `GET` | `/api/productos/:id` | Devuelve un producto por su `_id` |
| `POST` | `/api/productos` | Crea un producto |
| `PUT` | `/api/productos/:id` | Actualiza un producto |
| `DELETE` | `/api/productos/:id` | Elimina un producto |

## Equipo

- Santiago Oroz
- Sebastián Gerónimo Peralta
- Mateo Bouso
- Nicolás Benítez
- Tadeo Piccato
