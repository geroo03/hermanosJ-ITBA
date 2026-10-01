# Material Oficial del Campus ITBA - Sprints 3 y 4

**Curso:** (20262Q) FSD.01 - Full Stack Developer - Comisión: 1 TM  
**URL Campus:** https://campusx.itba.edu.ar/ultra/courses/_36254_1/outline  
**Proyecto:** Mueblería Hermanos Jota  

---

## 1. Hoja de Ruta - Sprint 3: Construyendo la Trastienda

> En este sprint, dejamos el navegador para adentrarnos en el corazón de la aplicación: el backend. Usaremos Node.js para que JavaScript cobre vida en el servidor.  
> Con Express.js, el framework estándar para APIs, construiremos la estructura de nuestra API para "Mueblería Hermanos Jota".  
> Definiremos rutas para productos y usuarios, aprenderemos a manejar peticiones y respuestas.  
> Organizaremos nuestro código de forma profesional con módulos y middlewares.  
> Al final, tendremos un servidor funcional, la base de toda la lógica de negocio de nuestra tienda online.

### Objetivos Sprint 3:
1. Conocer el rol de Node.js y Express.js en la construcción de servidores web.
2. Configurar un servidor Express.js básico.
3. Crear endpoints de API simples (rutas) para manejar solicitudes GET.
4. Entender el ciclo básico de solicitud/respuesta HTTP.
5. Usar Postman para probar endpoints de API.

### Clases y Diapositivas Sprint 3:
- **Clase 7 - Node.js:** [Diapositivas Canva](https://canva.link/pujzayj5k1qcu6k)
- **Clase 8 - Express.js, Routers, Middlewares:** [Diapositivas Canva](https://canva.link/o6ssewsjzzm3qmj)

---

## 2. Hoja de Ruta - Sprint 4: Del Catálogo Estático al Showroom Digital Interactivo

> ¡Es hora de revolucionar nuestro frontend!  
> En este sprint, dejamos atrás la manipulación directa del DOM y damos la bienvenida a React, la librería que define el desarrollo de interfaces de usuario modernas.  
> Aprenderás a pensar en componentes, piezas de UI reutilizables que construiremos con JSX.  
> Dominaremos el flujo de datos con props y daremos vida a nuestros componentes con estado y eventos.  
> El objetivo es claro: reconstruir la interfaz de "Mueblería Hermanos Jota" de forma profesional y escalable, lista para consumir la API del sprint anterior.

### Objetivos Sprint 4:
1. Conocer los conceptos centrales de React: componentes, JSX, props y estado.
2. Configurar un entorno de desarrollo React usando Create React App.
3. Construir componentes de UI simples.
4. Gestionar el estado de los componentes y pasar datos usando props.
5. Manejar eventos básicos del usuario.

### Clases y Diapositivas Sprint 4:
- **Clase 10 - React, JSX:** [Diapositivas Canva](https://canva.link/u3uwk1k76d5xtgf)
- **Clase 11 - Componentización, Props, Hooks, Renderizado Condicional:** [Diapositivas Canva](https://canva.link/umrs6nehiyzrlje)

---

## 3. Consigna Final - Sprint 3 y 4 (E-commerce Mueblería Hermanos Jota)

### Resumen del Proyecto
¡Es hora de la gran transformación! Reconstruiremos todo el frontend desde cero usando **React** y construiremos nuestro propio backend con **Node.js y Express** para servir los datos de los productos. El objetivo es crear una verdadera aplicación cliente-servidor: el frontend ya no usará datos locales, sino que hará peticiones a nuestra propia API para obtener la información y mostrarla dinámicamente.

### Objetivos de Aprendizaje
1. Construir un servidor web y una API REST básica utilizando Node.js y Express.
2. Definir y organizar rutas de API de forma modular con `express.Router`.
3. Implementar middlewares personalizados para funcionalidades como el logging.
4. Reconstruir una interfaz de usuario utilizando la arquitectura de componentes de React.
5. Manejar el estado de los componentes y de la aplicación con el hook `useState`.
6. Pasar datos entre componentes utilizando `props`.
7. Manejar la interacción del usuario con eventos de React.
8. Renderizar listas de datos dinámicamente con `.map()` y usar `key`s correctamente.
9. Implementar renderizado condicional para mostrar diferentes vistas en la UI.
10. Conectar una aplicación de React a una API de backend usando `fetch` y manejar el ciclo de vida de la petición (carga, éxito, error).

### Arquitectura del Proyecto Requerida
- `/backend`: Contendrá toda la aplicación de Node.js y Express.
- `/client`: Contendrá toda la aplicación de React.

### Requisitos Técnicos

#### BACKEND — EXPRESS
- Datos de productos en archivo `.js` local (array de objetos).
- `GET /api/productos` → listado completo en formato JSON.
- `GET /api/productos/:id` → producto específico por id, error 404 en formato JSON si no existe.
- Middleware global de logging (registra método HTTP y URL consultada en consola).
- Middleware `express.json()` para parseo del cuerpo de peticiones.
- Middleware `cors` para habilitar el consumo desde el cliente React en distinto puerto.
- Rutas organizadas limpiamente con `express.Router` y controladores modulares.
- Manejador de rutas no encontradas (404) y manejador global de errores centralizado.

#### FRONTEND — REACT
- Componentes modulares obligatorios:
  - `Navbar`: Menú de navegación, branding y contador reactivo del carrito recibido vía props.
  - `Footer`: Pie de página institucional y enlaces.
  - `ProductCard`: Tarjeta individual de producto con imagen, precio, descripción corta, botón para ver detalle y botón para agregar al carrito.
  - `ProductList`: Contenedor que renderiza la lista de tarjetas usando `.map()` y `key`.
  - `ProductDetail`: Vista de detalle extendida del producto seleccionable mediante renderizado condicional, con opción de volver al catálogo y agregar al carrito.
  - `ContactForm`: Formulario de contacto controlado mediante `useState` con validación básica.
- Petición asíncrona mediante `fetch` al endpoint `GET /api/productos` gestionando:
  - Estado de carga (`loading`).
  - Estado de error (`error`).
  - Renderizado exitoso de los datos.
- Carrito de compras:
  - Estado global en `App.js` (`cart`).
  - Contador dinámico en `Navbar` pasado mediante props.
  - Opciones de añadir producto, incrementar/decrementar cantidad, eliminar ítem y ver total.
- Renderizado condicional para alternar fluidamente entre Vistas: Catálogo, Detalle de Producto, Carrito y Contacto.

---

## 4. Criterios de la Rúbrica Oficial de Calificación (100 pts)

1. **Arquitectura de Componentes React (25 pts - 25%):**
   - *Excelente (21-25):* Excelente descomposición en componentes reutilizables y de propósito único. Flujo de props claro y eficiente. Nomenclatura impecable.
2. **Manejo de Estado y Eventos en React (25 pts - 25%):**
   - *Excelente (21-25):* Uso correcto de `useState`. El estado se eleva (*"lifting state up"*) correctamente solo cuando es necesario. El manejo de eventos es limpio y eficiente.
3. **Backend API (Express) (25 pts - 25%):**
   - *Excelente (21-25):* API perfectamente estructurada con `express.Router` y patrón de controladores. El código es limpio y tiene manejo de errores y 404.
4. **Conexión Frontend-Backend (25 pts - 25%):**
   - *Excelente (21-25):* Las llamadas `fetch` desde `useEffect` son perfectas, incluyendo un manejo impecable de los estados de carga (*loading*) y error en la UI.
