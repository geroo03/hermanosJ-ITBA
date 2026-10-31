# Resumen de Entrega — Santiago Oroz

## Sprint 5-6 — API REST con CRUD completo

**Responsable:** Santiago Oroz (@SantiagoOroz).
**Asignación:** tarea 2 de `Reparto_de_Tareas56.md`.

### Punto de partida

La tarea 1 dejó listos la conexión a MongoDB (`config/db.js`), el modelo `Product` (`nombre`, `descripcion`, `precio`, `stock`, `imagenUrl`) y la semilla. El controlador y el router seguían leyendo el catálogo local del Sprint 3-4 y solo exponían lecturas.

### Trabajo realizado

| Archivo | Trabajo |
|---|---|
| `backend/src/controllers/productsController.js` | Reescrito con `async/await` sobre el modelo de Mongoose. Cinco funciones: listar, obtener por `_id`, crear (201), actualizar (`new: true`, `runValidators: true`) y eliminar. Los errores pasan a `next()`. El cuerpo se filtra a los cinco campos del modelo. |
| `backend/src/routes/productsRouter.js` | Registra `GET /`, `GET /:id`, `POST /`, `PUT /:id` y `DELETE /:id`. |
| `backend/src/middlewares/errorHandler.js` | Traduce a 400 los errores de validación del modelo, los `CastError` y los JSON mal formados, siempre con el formato `{ error, status }`. Solo registra en consola los errores 5xx. |
| `backend/tests/products.test.js` | Once pruebas HTTP sobre los cinco endpoints y los casos de error. |
| `backend/tests/helpers/fakeProduct.js` | Reemplaza el acceso a la base por un almacén en memoria y conserva la validación real del esquema, de modo que las pruebas no necesitan credenciales. |
| `backend/tests/app.test.js` | Adaptado al nuevo contrato (campos en español y `_id`). |
| `backend/tests/serve-products.js` | Servidor aislado que ahora se conecta a MongoDB y monta `express.json()` y el manejador de errores. |
| `backend/tests/products.postman_collection.json` | Once solicitudes en orden: crear guarda el `_id` en una variable y las siguientes lo usan hasta eliminarlo. |

### Contrato de la API

| Solicitud | Estado | Respuesta |
|---|---|---|
| `GET /api/productos` | 200 | Array de productos. |
| `GET /api/productos/:id` | 200 / 404 / 400 | Producto, o error. |
| `POST /api/productos` | 201 / 400 | Producto creado, o error de validación. |
| `PUT /api/productos/:id` | 200 / 404 / 400 | Documento actualizado, o error. |
| `DELETE /api/productos/:id` | 200 / 404 / 400 | Producto eliminado, o error. |

Los errores tienen la forma `{ "error": "mensaje", "status": 400 }`. Un `_id` con formato inválido devuelve 400 antes de consultar la base; uno válido que no existe devuelve 404.

### Cómo verificarlo

Pruebas automáticas (no requieren base de datos):

```bash
cd backend
npm test
```

Prueba manual con Postman contra la base real: crear `backend/.env` a partir de `.env.example`, ejecutar `node tests/serve-products.js` (o `npm start`) e importar `backend/tests/products.postman_collection.json` en el Collection Runner.
