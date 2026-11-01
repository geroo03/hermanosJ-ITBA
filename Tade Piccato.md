# Tadeo Piccato — Tarea 4, Sprints 5 y 6

**Responsable:** Tadeo Piccato (@Flowveep).  
**Fecha:** 1 de noviembre de 2026.  
**Consigna:** tarea 4 de `Reparto_de_Tareas56.md`, «Detalle de producto y formularios de alta/edición».  
**Estado:** implementación y verificaciones locales completadas. La persistencia en MongoDB Atlas debe verificarse con un entorno configurado.

## Análisis inicial

La tarea 3 ya había instalado React Router, montado las rutas de detalle, alta y edición, migrado el catálogo y el carrito a `_id` y creado las cinco funciones de `productsApi.js`. Sin embargo, `App.jsx` todavía mostraba tres componentes provisorios. El archivo anterior de `ProductDetail.jsx` usaba los campos en inglés del sprint previo y no estaba conectado a esas rutas. No existían `ProductForm.jsx`, las páginas de alta/edición ni `admin.css`.

El backend ya contaba con el modelo `Product` y los cinco endpoints. Por eso se implementó la interfaz sobre esos contratos, conservando las funciones del servicio, los campos `nombre`, `descripcion`, `precio`, `stock`, `imagenUrl` y el identificador `_id`.

## Archivos entregados

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
| `Tade Piccato.md` | Este informe, con el nombre de archivo solicitado. |
| `Tadeo Piccato.md` | Enlace a este informe, conservando los registros históricos de los sprints anteriores. |
| `.agents/handoffs/*.json` | Registro de cierre para otros asistentes, con cambios, comprobaciones realizadas y la verificación pendiente en Atlas. |

## Funcionamiento

### Detalle y eliminación

`/productos/:id` obtiene el identificador con `useParams` y consulta `getProductById`. Presenta imagen, nombre, descripción, precio en ARS y stock. Si falta una imagen o falla su carga, muestra «Imagen no disponible»; también ofrece mensajes de respaldo para descripción y stock ausentes.

El botón de carrito llama al callback que administra `App` y muestra una confirmación. El enlace «Editar» abre `/admin/editar-producto/:id`. Para eliminar, se usa la confirmación nativa del navegador, incluyendo el nombre del producto. Cancelar no realiza solicitudes. Confirmar ejecuta `deleteProduct`, bloquea nuevas eliminaciones mientras espera y, al completar, navega a `/productos` mediante `useNavigate`, con un mensaje de éxito. Si la API falla, conserva el detalle y permite reintentar.

Las respuestas 404 muestran «Producto no encontrado». Un ID mal formado conserva el mensaje 400 de la API. Los errores de conexión permiten reintentar y siempre hay un enlace al catálogo.

### Formulario compartido

`ProductForm` recibe `initialValues`, una función `onSubmit`, el texto del botón y la ruta de cancelación. Maneja los cinco campos con `useState`; los valores iniciales de precio y stock se convierten a texto para mantener los inputs controlados.

- Nombre obligatorio después de quitar espacios de los extremos.
- Precio obligatorio, numérico, finito e igual o mayor que cero; se admite precio 0 y decimales.
- Stock opcional, numérico, finito y no negativo; un campo vacío se envía como 0, en línea con el valor predeterminado del modelo.
- Descripción e imagen opcionales. La imagen admite URL o ruta relativa de los assets existentes.
- Se comprueba también `validity.badInput` para entradas numéricas incompletas del navegador.

Antes del envío se recortan los textos y se convierten precio y stock a números. Solo se envían los cinco campos del contrato. Ante errores de validación se enfoca el primer campo inválido; los mensajes se vinculan a sus controles con `aria-describedby` y `aria-invalid`. Los errores de la API se presentan con `role="alert"`, conservando los valores ingresados.

Un bloqueo con `useRef` impide envíos consecutivos incluso antes del siguiente render. Mientras hay una solicitud en curso, el `fieldset` y el botón quedan deshabilitados, la cancelación se bloquea y se informa «Guardando producto…».

### Alta, edición e integración

El alta muestra el formulario vacío y envía un POST a través de `createProduct`. Al recibir el producto creado, vuelve al catálogo, que recarga los datos desde la API, y muestra una confirmación.

La edición carga el producto indicado por `useParams`, muestra el formulario precargado y ejecuta `updateProduct`. Al completar, navega al detalle actualizado. Cada cambio de ID remonta el contenido correspondiente, evitando que se mezclen datos o errores de productos distintos.

`App.jsx` mantiene el estado del carrito y su persistencia en `localStorage`. Al editar se actualiza el producto guardado en el carrito, conservando su cantidad; al eliminar se retira ese producto. Si el usuario cambia de pantalla mientras espera una operación, se sincroniza el estado compartido cuando corresponde y se evita una redirección tardía.

Los mensajes de éxito viajan en el estado de React Router y se muestran con `role="status"`. Se mantuvieron los enlaces al catálogo, el formulario de contacto y el flujo existente del carrito.

## Verificación ejecutada

Se instalaron las dependencias existentes con `npm ci` en `client/` y `npm install --package-lock=false --no-audit --no-fund` en `backend/`. No se agregaron dependencias ni se modificaron los manifiestos o el lockfile del cliente. Entorno: Node.js **24.22.1** y npm **11.19.1**.

### Pruebas automatizadas

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

Resultado: **17/17 pruebas aprobadas** del backend existente, incluyendo CRUD, validaciones, JSON inválido, errores y CORS. Total de esta verificación: **59 pruebas aprobadas**. La persistencia de esas pruebas se simula en memoria; las validaciones del modelo de Mongoose son reales.

También se revisaron los cambios para verificar manejo de errores, dependencias de hooks, respuestas tardías, ausencia de inserción de HTML sin escapar y conservación del contrato de la API. Se ejecutó `git diff --check`.

### Revisión en Chrome

Se levantó temporalmente el build de producción junto al router, los controladores y el middleware de errores reales del backend. Se usó el helper existente `backend/tests/helpers/fakeProduct.js` para simular el almacenamiento, con los 11 productos iniciales, sin conectar a Atlas.

Se comprobó el formulario vacío y el foco en el primer error, el alta de una pieza de prueba, su aparición en el catálogo, la apertura del detalle, la precarga del formulario de edición y el guardado de nombre, precio, stock e imagen con navegación al detalle y confirmación visible. Se abrió y canceló la confirmación de borrado, conservando la pieza. La revisión visual permitió ajustar la alineación de los campos numéricos y el respaldo de imágenes que no cargan. La eliminación confirmada y su navegación se verificaron mediante las pruebas automatizadas.

Después se verificó por HTTP, contra ese mismo servidor temporal, el listado y detalle 200 con los datos editados, un POST inválido 400, un ID mal formado 400, el DELETE 200 de la pieza creada durante la revisión y el GET posterior 404. El listado final volvió a contener los 11 productos iniciales. Se cerró la pestaña de prueba y se detuvo el servidor temporal.

### Alcance y comprobación con MongoDB

Este checkout no contiene `backend/.env` ni credenciales de MongoDB. No se creó un clúster, no se ejecutó la semilla y no se afirmó persistencia real en Atlas. El servidor temporal de revisión utiliza datos aislados y se detiene al terminar; no forma parte de los archivos entregados.

Para comprobar la persistencia real con las tareas 1 y 2 integradas:

1. Configurar `backend/.env` a partir de su ejemplo, con `MONGODB_URI` del entorno del equipo y un puerto compatible con el cliente. Configurar `client/.env` con `REACT_APP_API_URL` si la API está en otra dirección.
2. Iniciar el backend con `npm start` y el cliente con `npm start`, en terminales distintas. El backend usa 3000 por defecto, por lo que el cliente debe usar otro puerto libre.
3. Crear una pieza desde `/admin/crear-producto`, verificar su aparición en el catálogo y consultar su documento en MongoDB.
4. Editarla desde el detalle y comprobar que los cambios persisten después de recargar la página.
5. Eliminar esa pieza de prueba con confirmación y comprobar que desaparece del catálogo y de MongoDB.

El despliegue, CORS de producción, reglas de recarga de rutas y revisión final del sitio publicado corresponden a la tarea 5.

## Contexto compartido

Se revisaron las instrucciones disponibles y el estado inicial del repositorio. No hay un `AGENTS.md` local ni `.agents/workspace.json` en este checkout. Se consultó el proyecto detectado por Engram (`hermanosj-itba`), sin historial previo relevante, y se usó el ID de sesión nativo. Se reservaron los archivos mediante `agent-context`, y se registraron las decisiones y el cierre de sesión sin credenciales ni datos personales. Se consultó documentación de React 18 y React Router 6 mediante Context7 para los formularios controlados y la navegación.

Los registros previos de los sprints 1-2 y 3-4 permanecen en `Tadeo Piccato.md`; sus cifras de pruebas y contratos describen esas entregas históricas.
