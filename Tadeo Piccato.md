# Resumen de Entrega — Tadeo Piccato

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

### Verificación ejecutada

- Node.js **24.19.0**, Express **5.2.1**.
- **6/6 pruebas automatizadas aprobadas**, sin errores: campos e IDs, existencia de las 11 imágenes en el proyecto, igualdad con el catálogo anterior, listado 200, los 11 detalles 200, cuatro variantes de ID inexistente con 404 JSON y conservación del catálogo tras consultas repetidas.
- Se ejecutó la colección de Postman mediante **Newman 6.2.2** contra el servidor aislado: **3 solicitudes y 6/6 verificaciones aprobadas**, sin fallos.
- Para esta verificación se instalaron las dependencias en una carpeta temporal externa y se resolvieron mediante `NODE_PATH`; no se creó ni modificó el `backend/package.json` asignado a otro integrante.
- El registro del Sprint 1-2 que sigue es histórico; sus afirmaciones sobre 73 pruebas corresponden al trabajo anterior y no al resultado de esta sesión.

---

## Registro previo — Sprint 1-2

## Lógica de Catálogo, Búsqueda Reactiva & Asincronismo JS

Se completó minuciosamente la implementación de la capa de datos oficial, motor de búsqueda reactiva en tiempo real, filtros combinados por ambientes, ordenamiento dinámico, asincronismo simulado con skeletons y sistema de estilos **Mobile-First** adaptado al **Manual de Marca Oficial © 2026** de Hermanos Jota.

---

### 📦 Archivos Implementados y Entregados

| Archivo | Responsabilidad / Contenido |
|---|---|
| [js/data.js](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/js/data.js) | Array estructurado con las 11 piezas oficiales de autor, normalizador de texto, formateador de moneda ARS y métodos asíncronos (`getProducts`, `getProductById`, `getFeaturedProducts`, `getRelatedProducts`). |
| [js/catalog.js](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/js/catalog.js) | Motor reactivo del catálogo: carga con skeleton loader, búsqueda instantánea insensible a tildes/mayúsculas, pills de categorías, ordenación, feedback de filtros activos, estado de vacío (*Empty State*) e integración con el carrito sin duplicados. |
| [js/icons.js](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/js/icons.js) | Catálogo de iconos SVG vectoriales accesibles con `currentColor` y helper `HJ_ICONS.get()`. |
| [js/main.js](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/js/main.js) | Header sticky dinámico, menú off-canvas drawer para móviles, sistema de toasts (`window.showToast`) y año automático. |
| [js/home.js](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/js/home.js) | Inyección asíncrona de las 4 piezas destacadas de portada con skeleton loaders en `index.html`. |
| [js/product-detail.js](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/js/product-detail.js) | Carga dinámica por parámetro `?id=...`, cálculo de 6 cuotas fijas, especificaciones de ebanistería y piezas relacionadas en `producto.html`. |
| [js/contact.js](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/js/contact.js) | Validación en tiempo real del formulario de contacto y renderizado de tarjeta de éxito en el DOM. |
| [css/styles.css](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/css/styles.css) | Tokens oficiales del Manual de Marca (`--siena-tostado`, `--verde-salvia`, `--vara-de-oro`, etc.), reset, tipografías `Inter` y `Playfair Display`, botones y footer. |
| [css/catalog.css](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/css/catalog.css) | Estilos mobile-first de catálogo: barra de búsqueda con botón de limpieza, pills táctiles con scroll horizontal, grilla responsiva (1 col móvil, 2 tablet, 3 desktop), micro-interacciones hover, skeletons con animación shimmer y empty state. |
| [css/home.css](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/css/home.css) | Estilos para Hero, colecciones por ambiente y pilares de sustentabilidad. |
| [css/product-detail.css](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/css/product-detail.css) | Estilos para la ficha técnica del mueble y piezas complementarias. |
| [css/contact.css](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/css/contact.css) | Estilos para paneles del showroom, mapa gráfico y formulario. |
| [assets/images/](file:///c:/Users/Tadeo%20Piccato/Documents/GitHub/hermanosJ-ITBA/assets/images/) | Catálogo completo de imágenes normalizadas sin rutas rotas ni errores 404. |

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

### 🧪 Resultados del Bughunting & Verificación Automatizada

Se ejecutó una suite de 73 pruebas automatizadas cubriendo:
- Estructura de archivos y presencia de todos los módulos vinculados en el HTML.
- Presencia y validez de todas las 13 imágenes y logotipos en `assets/images/`.
- Integridad de los 11 objetos de producto en `PRODUCTOS` y sus atributos.
- Métodos asíncronos (`getProducts`, `getProductById`, `getFeaturedProducts`, `getRelatedProducts`).
- Búsqueda reactiva con y sin acentos, mayúsculas y filtros por madera.
- Filtros por categoría y ordenamiento ascendente/descendente.
- Verificación de respuestas HTTP 200 en todos los endpoints estáticos del servidor local.

**Resultado final**: `73 / 73 PRUEBAS SUPERADAS EXITOSAMENTE` sin excepciones en tiempo de ejecución ni errores 404.
