# Resumen de Entrega — Tadeo Piccato
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
