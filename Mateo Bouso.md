# Resumen de Entrega — Mateo Bouso

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
