# Resumen de Entrega — Sebastián Gerónimo Peralta

## Sprint 5-6 — Despliegue, CORS, README y revisión final

**Responsable:** Sebastián Gerónimo Peralta (@geroo03).  
**Fecha de trabajo:** 1 de noviembre de 2026.  
**Asignación:** tarea 5 de `Reparto_de_Tareas56.md`.

### Despliegues

- **Frontend (Vercel):** https://hermanos-j-itba.vercel.app
- **Backend (Render):** https://hermanos-jota-api-a94j.onrender.com/api/productos

### Trabajo realizado

| Archivo | Trabajo |
|---|---|
| `backend/src/app.js` | CORS limitado a `CLIENT_URL` y `localhost`, con pruebas en `backend/tests/app.test.js`. |
| `client/vercel.json` | Redirige las rutas a `index.html` para que recargar una página no dé 404. |
| `client/public/assets/` | Imágenes y videos publicados por el cliente, porque ningún servicio los servía. |
| `README.md` y `.env.example` | Enlaces, instrucciones locales, variables de entorno y puertos separados (API 3000, cliente 3001). |
| `client/src/components/HomeHero.jsx` e `InstagramPost.jsx` | Portada con video y publicación interactiva recuperadas del sitio del Sprint 1-2. |
| `client/src/pages/Home.jsx` y `Catalogo.jsx` | Filosofía del taller, estados de carga y error en inicio, y buscador en el catálogo. |
| `client/src/styles/glass.css` | Capa visual de vidrio y tipografías de marca. |

### Verificación

Se instaló el proyecto desde un clon limpio y pasaron las pruebas del backend y del cliente. En el sitio publicado se recorrió el checklist de entrega: catálogo, detalle, recarga de rutas, carrito, contacto, errores de `_id` y alta, edición y borrado contra MongoDB Atlas con productos temporales, eliminados al terminar. No hay archivos `.env` ni credenciales en el repositorio ni en su historial.

### Limitaciones conocidas

- El formulario de contacto valida los datos pero no los envía a un servidor.
- Las rutas de administración no tienen autenticación, porque la consigna no la pide.

---

## Sprint 3-4 — Navegación, carrito y contacto

**Responsable:** Sebastián Gerónimo Peralta (@geroo03).  
**Fecha de trabajo:** 3 de octubre de 2026.  
**Asignación:** tarea 5 de `REPARTO_DE_TAREAS.md`.

---

### Objetivos

- Crear `Navbar` con branding, navegación y contador del carrito recibido por props.
- Crear un carrito controlado por props que permita incrementar, decrementar, eliminar y calcular el total.
- Crear un formulario de contacto controlado con `useState`, validación básica y mensaje de envío.
- Completar el footer con los datos de la Casa Taller.
- Respetar el contrato de integración: solo `App.jsx` posee el estado `cart` y la vista actual; los componentes reciben datos y eventos por props.

---

### Trabajo realizado

| Archivo | Trabajo |
|---|---|
| `client/src/components/Navbar.jsx` | Barra superior fija con la marca (vuelve al catálogo), los enlaces que recibe en `links` y el botón del carrito con contador. Marca la vista activa con `aria-current="page"` y anuncia la cantidad del carrito con `aria-label`. Cambia de vista solo mediante `onChangeView`. |
| `client/src/components/Cart.jsx` | Lista cada pieza con imagen, nombre, precio unitario, cantidad y subtotal. Los botones `−`, `+` y **Eliminar** llaman a `onDecreaseQuantity`, `onIncreaseQuantity` y `onRemoveFromCart` con el `id` del producto. Exporta `getCartTotal(cart)` para calcular el total. Con el carrito vacío ofrece volver al catálogo. |
| `client/src/components/ContactForm.jsx` | Formulario controlado (nombre, email y mensaje) con `useState`. `validateContact` exige nombre, un email con formato válido y un mensaje de al menos 10 caracteres. Un envío inválido muestra los errores junto a cada campo (`aria-invalid` y `aria-describedby`); al corregir un campo, su error se actualiza en vivo. Un envío válido muestra una confirmación con el nombre y permite enviar otra consulta. |
| `client/src/components/Footer.jsx` | Footer con la frase de marca, dirección de la Casa Taller, horarios, email, WhatsApp, Instagram y año automático. |
| `client/src/styles/layout.css` | Estilos de navbar, carrito, formulario y footer con la paleta de `app.css` y los botones `.btn` compartidos. El carrito pasa a una grilla compacta en pantallas de menos de 640px. |
| `client/src/components/layout.test.jsx` | Siete pruebas con Jest y `react-dom`: contador y navegación del `Navbar`, cálculo del total, delegación de los tres callbacks del carrito, carrito vacío, validación del formulario, bloqueo de envíos inválidos y confirmación de un envío válido. |
| `client/src/App.jsx` | Integración: se reemplazaron la navegación provisoria y los textos de las vistas carrito y contacto por `Navbar`, `Cart`, `ContactForm` y `Footer`, pasando los callbacks ya definidos en `App`. Se restauró `export default App;`, que se había perdido en un commit anterior y hacía fallar la compilación. `readStoredCart` ahora descarta ítems corruptos de `localStorage` (sin `product.id`, sin precio numérico o con cantidad no positiva), que antes dejaban la aplicación en blanco. |

---

### Verificación

```bash
cd client
npm install
npm test -- --watchAll=false
```

- **11/11 pruebas del cliente aprobadas**: las 4 de `productsApi.test.js` y las 7 nuevas.
- `CI=true npm run build` compila sin errores ni advertencias de ESLint.
- Prueba manual con el backend (`npm run dev` en `backend/`) y el build del cliente en Chrome: agregar productos actualiza el contador; `+`, `−` y **Eliminar** recalculan subtotales y total; el carrito se conserva al recargar (`localStorage`); el formulario bloquea envíos vacíos y muestra los errores. Se revisó en 1280px y 390px de ancho.
- Prueba de casos borde en modo desarrollo, sin errores ni advertencias en la consola: carrito corrupto o JSON inválido en `localStorage`, bajar una cantidad a 0, vaciar el carrito, agregar desde el detalle, corrección en vivo de errores del formulario y API caída con reintento (navbar y footer siguen visibles).

### Pendiente fuera de esta tarea

Las imágenes de los productos no cargan todavía: la API devuelve rutas como `assets/images/aparador-uspallata.png`, pero el backend no sirve archivos estáticos y los archivos de `assets/images/` usan otros nombres (`Aparador Uspallata.png`). Se resuelve en el backend (tareas 2 y 3), sin cambios en los componentes del cliente.
