# Reparto de tareas — Sprints 5 y 6

> **Antes de la entrega final:** quien realice cada una de las tareas 1 a 5 debe completar la línea **Responsable** de su tarea con su nombre y usuario de GitHub, usando el formato `Nombre Apellido (@usuario)`. Por ejemplo: `Nombre Apellido (@usuario) — Modelo y conexión a MongoDB`. Así el resto del equipo sabe quién hizo cada parte. También se marca el **Estado** como `completada` y se agrega una breve descripción de lo que se hizo. Este bloque de instrucciones se elimina en el último commit; el resto del documento se conserva como registro del aporte de cada integrante.

Este archivo sirve para coordinar el trabajo y para dejar documentada la responsabilidad de cada integrante. Hay **5 tareas, una por integrante**. Cada tarea tiene archivos propios para que puedan hacerse en paralelo. Ninguna tarea está asignada de antemano: cada persona elige una libre y escribe su nombre en ella.

Este trabajo continúa el repositorio del Sprint 3-4: la API de Express (`backend/`) y la aplicación de React (`client/`) ya existen, con el catálogo cargado en un archivo local. En estos sprints se las conecta a una base de datos real y se agregan rutas y formularios. La identidad de marca (paleta, tipografías, imágenes) y el carrito se conservan.

---

## 1. Resumen del proyecto

**Sprint 6 — Persistencia de Datos y CRUD Completo.** **Entrega: fin del Sprint 6.**

Este es el sprint que transforma el proyecto en una aplicación web real y persistente. Se conecta la API de Express a una base de datos **MongoDB en la nube** y se implementa el **CRUD completo** (Crear, Leer, Actualizar, Borrar) para los productos de "Mueblería Jota". El frontend de React evoluciona para **crear, editar y eliminar productos** a través de formularios interactivos, todo gestionado con un sistema de ruteo profesional.

## 2. Objetivos de aprendizaje

1. Conectar una aplicación de Node.js a una base de datos MongoDB usando **Mongoose**.
2. Definir **Esquemas y Modelos** de datos para estructurar la información.
3. Implementar una **API RESTful con funcionalidad CRUD completa** (GET, POST, PUT, DELETE) en Express.
4. Gestionar la configuración de la aplicación y los secretos de forma segura con **variables de entorno (`.env`)**.
5. Crear una aplicación de React con **múltiples páginas y rutas dinámicas** utilizando React Router DOM (`useParams`).
6. Realizar **navegación programática** en React con `useNavigate` después de acciones del usuario.
7. Construir **formularios controlados** en React para enviar datos de creación y edición a la API.
8. Manejar el **ciclo completo de una petición full stack**, desde la interacción del usuario hasta el cambio en la base de datos.

## 3. Arquitectura del proyecto

```text
React Client (Frontend)  ⇄  Express API (Backend)  ⇄  MongoDB (Persistencia)
```

El cliente nunca habla directamente con la base de datos: todo pasa por la API. El flujo completo de una acción (por ejemplo, crear un producto) es: formulario de React → `fetch` a la API → controlador de Express → modelo de Mongoose → MongoDB → respuesta JSON → el cliente navega a otra página.

## 4. Requisitos del backend (API)

**Modelo `Product`:**

| Campo | Tipo | Requerido |
|---|---|---|
| `nombre` | String | Sí |
| `descripcion` | String | No |
| `precio` | Number | Sí |
| `stock` | Number | No |
| `imagenUrl` | String | No |

**Endpoints:**

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/productos` | Devuelve todos los productos. |
| `GET` | `/api/productos/:id` | Devuelve un producto por su `_id`. |
| `POST` | `/api/productos` | Crea un producto y responde **201**. |
| `PUT` | `/api/productos/:id` | Actualiza un producto existente. |
| `DELETE` | `/api/productos/:id` | Elimina un producto. |

## 5. Requisitos del frontend (React)

| Ruta | Pantalla |
|---|---|
| `/` | Inicio |
| `/productos` | Catálogo |
| `/productos/:id` | Detalle (usa `useParams`) |
| `/contacto` | Formulario de contacto |
| `/admin/crear-producto` | Alta de producto |

Además, para cumplir con el resumen del sprint (crear, **editar** y **eliminar** desde formularios) y con el objetivo de `useNavigate`, el equipo agrega una ruta de edición, por ejemplo `/admin/editar-producto/:id`, y un botón de eliminar en el detalle. Esa ruta no figura en la lista de la consigna, pero se deriva de ella.

## 6. Entregables

- Repositorio de GitHub con las carpetas `/client` y `/backend`.
- Frontend desplegado en **Vercel o Netlify**.
- Backend desplegado en **Render**.
- `README.md` actualizado con los enlaces a ambos despliegues y las instrucciones para configurar las variables de entorno necesarias.

---

## 7. Contrato de integración

Para que las cinco tareas encajen sin pisarse, todo el equipo respeta estos acuerdos:

- **Rutas de la API:** se mantienen en `/api/productos` y `/api/productos/:id`. Local: `http://localhost:3000`.
- **Campos del producto:** pasan a ser los de la consigna, en español: `nombre`, `descripcion`, `precio`, `stock`, `imagenUrl`. Dejan de usarse `name`, `image`, `category` y el `id` de texto del Sprint 3-4.
- **Identificador:** MongoDB entrega `_id`. El cliente debe usar `_id` donde antes usaba `id` (claves de listas, carrito, rutas).
- **Respuestas de error en JSON:** `{ "error": "mensaje", "status": 404 }`, el mismo formato que ya usa `errorHandler`.
- **Códigos de estado:** `200` lectura/actualización/borrado correctos, `201` creación, `400` datos inválidos o `_id` mal formado, `404` producto inexistente, `500` error interno.
- **Variables de entorno:**
  - Backend (`backend/.env`): `MONGODB_URI`, `PORT`, y el origen permitido del frontend para CORS (por ejemplo `CLIENT_URL`).
  - Frontend (`client/.env`): `REACT_APP_API_URL` (el cliente usa Create React App, por eso el prefijo `REACT_APP_`).
  - Los archivos `.env` **nunca se suben a GitHub** (ya están en `.gitignore`). Cada tarea que agregue una variable la documenta en un archivo `.env.example`.
- **Estado del carrito:** sigue viviendo solo en `App.jsx` y se persiste en `localStorage`, como en los sprints anteriores.

---

## Tarea 1. Responsable: **Nicolás Benitez** — (@usuario de GitHub pendiente) — Base de datos, modelo y variables de entorno

**Estado: Terminada**

**Archivos:** `backend/src/config/db.js`, `backend/src/models/Product.js`, `backend/src/server.js`, `backend/package.json`, `backend/.env.example`, `backend/src/seed.js`.

**Qué hay que hacer:**

- Crear un clúster gratuito en **MongoDB Atlas**, un usuario de base de datos y habilitar el acceso de red necesario (para el despliegue en Render hay que permitir conexiones desde cualquier IP, `0.0.0.0/0`). Compartir la cadena de conexión con el equipo por un canal privado, **nunca** en el repositorio.
- Instalar `mongoose` y `dotenv` en `backend/` y declararlos en `package.json`.
- Crear `config/db.js` con una función que se conecte con `mongoose.connect(process.env.MONGODB_URI)`, muestre en consola si la conexión salió bien o mal y no deje arrancar el servidor si falla.
- Definir el **esquema y modelo `Product`** en `models/Product.js` con los campos de la sección 4: `nombre` (String, requerido), `descripcion` (String), `precio` (Number, requerido), `stock` (Number) e `imagenUrl` (String). Agregar mensajes de validación claros y los `timestamps`.
- Modificar `server.js` para cargar `dotenv`, conectar a la base de datos y recién entonces llamar a `app.listen`.
- Crear `backend/.env.example` con las variables necesarias y sin valores reales.
- Crear un script de **semilla** (`seed.js`, con un script `npm run seed`) que tome los 11 productos de `backend/src/data/products.js`, los convierta a los campos nuevos y los inserte en MongoDB, para que el catálogo no arranque vacío.

**Al terminar:** el servidor debe conectarse a MongoDB Atlas, el modelo debe estar disponible para el resto del equipo y la base debe tener los productos iniciales cargados.

### Resumen de la tarea

Se creó y configuró una base de datos en MongoDB Atlas para el proyecto Hermanos Jota. Se instalaron las dependencias `mongoose` y `dotenv`, y se desarrolló el archivo `db.js` para gestionar la conexión con la base de datos mediante variables de entorno.

También se creó el modelo `Product.js`, definiendo los campos `nombre`, `descripcion`, `precio`, `stock` e `imagenUrl`, junto con sus validaciones y fechas automáticas de creación y actualización (`timestamps`).

Se modificó `server.js` para que el backend cargue las variables de entorno y establezca la conexión con MongoDB antes de iniciar el servidor Express. Además, se crearon los archivos `.env` y `.env.example` para separar las credenciales reales de la configuración de ejemplo.

Por último, se desarrolló `seed.js` y se agregó el comando `npm run seed`, que permite cargar los 11 productos iniciales del catálogo en MongoDB, adaptándolos al nuevo modelo. Se comprobó que la conexión funciona correctamente y que los 11 productos quedaron almacenados en MongoDB Atlas.
---

## Tarea 2. Responsable: _(escribir nombre y @usuario)_ — API REST con CRUD completo

**Archivos:** `backend/src/controllers/productsController.js`, `backend/src/routes/productsRouter.js`, `backend/src/middlewares/errorHandler.js`, `backend/tests/products.test.js`, `backend/tests/products.postman_collection.json`.

**Qué hay que hacer:**

- Reescribir el controlador para que use el modelo `Product` de Mongoose en lugar del arreglo local, con funciones `async/await` y manejo de errores.
- Implementar los cinco endpoints:
  - `GET /api/productos`: devuelve todos los productos.
  - `GET /api/productos/:id`: devuelve uno por `_id`; `404` en JSON si no existe.
  - `POST /api/productos`: crea el producto con los datos del cuerpo y responde **201** con el producto creado.
  - `PUT /api/productos/:id`: actualiza un producto existente (con `new: true` y `runValidators: true`) y devuelve el documento actualizado; `404` si no existe.
  - `DELETE /api/productos/:id`: elimina el producto; `404` si no existe.
- Registrar en el router (`productsRouter.js`) las cinco rutas, con `POST`, `PUT` y `DELETE` incluidos.
- Responder `400` cuando los datos no pasan la validación del modelo (por ejemplo falta `nombre` o `precio`) y cuando el `_id` recibido no tiene formato válido de MongoDB (`CastError`). Ajustar `errorHandler.js` si hace falta, manteniendo el formato `{ error, status }`.
- Actualizar las pruebas automatizadas y la colección de Postman: deben probar los cinco endpoints y los casos de error. Como las pruebas actuales dependen del catálogo local, hay que adaptarlas al nuevo contrato (campos en español y `_id`).

**Al terminar:** las cinco rutas deben poder probarse de forma independiente con Postman contra la base real, y las respuestas deben ser JSON consistentes para que el cliente las use sin transformaciones especiales.

---

## Tarea 3. Responsable: _(escribir nombre y @usuario)_ — Ruteo del cliente y consumo de la API

**Archivos:** `client/package.json`, `client/src/index.js`, `client/src/App.jsx`, `client/src/services/productsApi.js`, `client/src/components/Navbar.jsx`, `client/src/components/ProductList.jsx`, `client/src/components/ProductCard.jsx`, `client/src/components/Cart.jsx`, `client/src/pages/Home.jsx`, `client/src/pages/Catalogo.jsx`, `client/.env.example`.

**Qué hay que hacer:**

- Instalar `react-router-dom` en `client/` y envolver la aplicación en `BrowserRouter` (`index.js`).
- Reemplazar el sistema actual de vistas por estado (`currentView`, `selectedProduct`, `ViewBridge`) por **rutas reales** con `Routes` y `Route` en `App.jsx`: `/` (Inicio), `/productos` (Catálogo), `/productos/:id` (Detalle), `/contacto` (formulario de contacto ya existente), `/admin/crear-producto` y la ruta de edición. Las pantallas de detalle y formularios las construye la Tarea 4; esta tarea deja las rutas montadas y funcionando con componentes provisorios hasta que estén listos.
- Crear la página de Inicio (`/`) con la identidad de marca y un acceso al catálogo.
- Completar `services/productsApi.js` con todas las funciones que hablan con la API usando `fetch` y `REACT_APP_API_URL`: `getProducts`, `getProductById`, `createProduct`, `updateProduct` y `deleteProduct`, con el mismo manejo de errores de conexión y de respuesta que ya tiene `getProducts`. La Tarea 4 usa estas funciones.
- Reemplazar los botones de navegación por `Link`/`NavLink` en `Navbar`, `ProductCard` y `ProductList` (para ir al detalle) y mantener el contador del carrito.
- **Migrar de `id` a `_id`** en `ProductList`, `Cart`, `App.jsx` (carrito y `readStoredCart`) y en cualquier otro lugar que use el identificador, y adaptar los campos de los productos a `nombre`, `descripcion`, `precio` e `imagenUrl`.
- Mantener los estados de carga y error con reintento al pedir el catálogo.

**Al terminar:** se puede navegar entre Inicio, Catálogo, Contacto y el carrito con la URL cambiando, el catálogo se lee de MongoDB a través de la API y el carrito sigue funcionando con los nuevos identificadores.

---

## Tarea 4. Responsable: _(escribir nombre y @usuario)_ — Detalle de producto y formularios de alta/edición

**Archivos:** `client/src/components/ProductDetail.jsx`, `client/src/components/ProductForm.jsx`, `client/src/pages/CrearProducto.jsx`, `client/src/pages/EditarProducto.jsx`, `client/src/styles/products.css`, `client/src/styles/admin.css`.

**Qué hay que hacer:**

- **Detalle (`/productos/:id`):** usar `useParams` para leer el `id` de la URL, pedir el producto con `getProductById` y mostrar sus datos (imagen, nombre, descripción, precio, stock). Manejar los estados de carga, error y "producto no encontrado". Incluir el botón de agregar al carrito (que recibe el callback desde `App`), un enlace para volver al catálogo, un botón **Editar** y un botón **Eliminar**.
- **Eliminar:** pedir confirmación antes de borrar, llamar a `deleteProduct` y, al terminar, **navegar programáticamente** con `useNavigate` de vuelta a `/productos`.
- **Formulario reutilizable (`ProductForm.jsx`):** formulario **controlado** con `useState` para `nombre`, `descripcion`, `precio`, `stock` e `imagenUrl`, con validación básica (nombre y precio obligatorios, precio y stock numéricos y no negativos) y mensajes claros. Recibe valores iniciales y una función de envío por props, así sirve para crear y para editar.
- **Alta (`/admin/crear-producto`):** usa `ProductForm` vacío, envía con `createProduct` y, tras el `201`, navega con `useNavigate` al catálogo o al detalle del producto creado.
- **Edición (`/admin/editar-producto/:id`):** lee el `id` con `useParams`, carga el producto, precarga el formulario, envía con `updateProduct` y navega al detalle al terminar.
- Mostrar al usuario el resultado de cada acción (éxito o error de la API) y evitar envíos inválidos o duplicados mientras se espera la respuesta.
- Aplicar los estilos con la paleta de marca en `products.css` y `admin.css`.

**Al terminar:** desde el navegador se puede crear, editar y eliminar un producto y ver el cambio reflejado en MongoDB. Esta tarea usa las funciones de `productsApi.js` de la Tarea 3 y las rutas montadas en `App.jsx`: conviene coordinar los nombres de las funciones al comienzo.

---

## Tarea 5. Responsable: _(escribir nombre y @usuario)_ — Despliegue, CORS, README y revisión final

**Archivos:** `backend/src/app.js` (configuración de CORS), `README.md`, `client/vercel.json` o `client/public/_redirects`, `backend/.env.example` y `client/.env.example` (revisión), configuración de Render y de Vercel/Netlify.

**Qué hay que hacer:**

- **Backend en Render:** crear un *Web Service* conectado al repositorio con la carpeta raíz `backend`, comando de instalación `npm install` y de inicio `npm start`. Cargar en Render las variables de entorno (`MONGODB_URI`, `CLIENT_URL`, y `PORT` si hace falta) desde el panel, nunca en el código. Verificar que `GET /api/productos` responde en la URL pública.
- **Frontend en Vercel o Netlify:** conectar el repositorio con la carpeta raíz `client`, comando de build `npm run build` y carpeta de salida `build`. Definir `REACT_APP_API_URL` apuntando a la URL pública del backend en Render (terminada en `/api`).
- **Rutas del cliente en producción:** como la aplicación usa React Router, agregar la regla que redirige cualquier ruta a `index.html` (`vercel.json` con *rewrites* o `_redirects` en Netlify). Sin esto, recargar `/productos/123` da error 404.
- **CORS:** ajustar `cors()` en `app.js` para permitir el origen del frontend desplegado (`CLIENT_URL`), además de `localhost` para desarrollo, y verificar que `POST`, `PUT` y `DELETE` funcionan desde el sitio publicado.
- **README.md actualizado:** reemplazar el contenido desactualizado de los sprints 3 y 4 por: descripción del proyecto, tecnologías (Node.js, Express, MongoDB, Mongoose, React, React Router), estructura de carpetas, **enlaces a ambos despliegues**, instrucciones para correr el proyecto en local y la **lista de variables de entorno** necesarias para el backend y el frontend (sin valores reales), más los comandos para la semilla de datos.
- **Revisión final:** recorrer la aplicación publicada de punta a punta (ver el checklist de abajo), confirmar que no hay credenciales en el repositorio ni en el historial de commits y que están las carpetas `/client` y `/backend`. Quitar el bloque de instrucciones de este archivo en el último commit.

**Al terminar:** los dos despliegues funcionan, el README tiene los enlaces correctos y cualquier persona puede levantar el proyecto en local siguiendo sus instrucciones.

---

## Checklist de entrega final

Cuando las cinco tareas estén integradas, el equipo verifica en la aplicación **desplegada**:

- [ ] El catálogo en `/productos` muestra los productos que están en MongoDB.
- [ ] `/productos/:id` muestra el detalle correcto, y recargar la página en esa URL no da error.
- [ ] Crear un producto desde `/admin/crear-producto` lo guarda en la base y lo muestra en el catálogo.
- [ ] Editar un producto actualiza sus datos en la base.
- [ ] Eliminar un producto lo borra de la base y lleva de vuelta al catálogo.
- [ ] Un `_id` inexistente o mal formado muestra un mensaje de error claro, no una pantalla en blanco.
- [ ] El carrito y el formulario de contacto siguen funcionando.
- [ ] No hay archivos `.env` ni credenciales en el repositorio.
- [ ] El README incluye los enlaces de ambos despliegues y las variables de entorno.
- [ ] Cada integrante escribió su nombre y usuario en su tarea de este archivo.
