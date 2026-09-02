# E-commerce Mueblería Hermanos Jota — Primera Entrega (Sprint 2)

Proyecto de fachada completa y experiencia interactiva de e-commerce construida 100% con tecnologías del lado del cliente (**HTML5 Semántico, Vanilla CSS3 y JavaScript Moderno**) sin dependencias externas, adaptado rigurosamente al **Manual de Marca Oficial © 2026**.

---

## 👥 Integrantes del Equipo

| Integrante | Rol en el Proyecto |
|---|---|
| **Integrante 1** | Arquitectura HTML5 Semántico & SEO |
| **Integrante 2** | Diseño UI/CSS3, Paleta Oficial & Responsive Design |
| **Integrante 3** | Lógica de Catálogo, Búsqueda Reactiva & Asincronismo JS |
| **Integrante 4** | Carrito de Compras, LocalStorage & Drawer Off-Canvas |
| **Integrante 5** | Formulario de Contacto, Validaciones DOM & QA |

---

## 🌿 Esencia de Marca & Filosofía

> **"Hermanos Jota es el redescubrimiento de un arte olvidado: crear muebles que no solo sirven una función, sino que alimentan el alma. Existimos en la intersección entre herencia e innovación, donde la calidez del optimismo de los años 60 se encuentra con la conciencia de la sustentabilidad del 2026. Cada pieza cuenta una historia de artesanía que honra el pasado mientras abraza el futuro."**

### Personalidad y Tono de Comunicación
- **Cálida pero no empalagosa** — Transmitimos cercanía sin caer en lo artificial.
- **Conocedora pero no pretenciosa** — Compartimos experiencia con humildad.
- **Nostálgica pero no anclada en el pasado** — Honramos la tradición mientras innovamos.
- **Sofisticada pero accesible** — Elegancia que no intimida.

---

## 🎨 Paleta Oficial de Colores (Manual de Marca)

| Color | Nombre | Código HEX | Uso Principal |
|---|---|---|---|
| 🟤 | **Siena Tostado** | `#A0522D` | Color principal de marca, títulos y logotipo |
| 🟢 | **Verde Salvia** | `#87A96B` | Acento secundario, sustentabilidad y stock |
| 📜 | **Alabastro Cálido** | `#F5E6D3` | Fondos principales, contenedores y fotografía |
| 🟡 | **Vara de Oro** | `#D4A437` | Detalles premium, acentos dorados y calificaciones |
| 🌸 | **Rosa Polvoriento**| `#C47A6D` | Acentos suaves y etiquetas destacadas |
| 🪵 | **Madera Noble** | `#1F140E` / `#2D1C13` | Textos de alto contraste y estructura |

---

## ✍️ Sistema Tipográfico

- **Tipografía Primaria**: `Inter` (Sans-Serif de Rasmus Andersson)
  - *Light (300)*: Leyendas y notas secundarias (9pt, espaciado 0.02em).
  - *Regular (400)*: Texto principal y descripciones (11-12pt, interlineado 1.6).
  - *Medium (500) & Bold (700)*: Botones y CTAs en mayúsculas (espaciado 0.08em).
- **Tipografía Secundaria**: `Playfair Display` (Serif Editorial)
  - *Regular & Bold (700)*: Títulos principales y cabeceras editoriales (mayúsculas, espaciado 0.1em).

---

## 🪵 Sustentabilidad & Programa "Herencia Viva"

- **Madera Certificada FSC**: Algarrobo, quebracho, caldén, roble, petiribí, nogal y paraíso de reforestación controlada.
- **Acabados 100% Naturales**: Aceite de lino prensado en frío, cera de abejas local y tintes vegetales al agua de bajo COV.
- **Garantía Extendida**: 10 años en estructura, 5 años en acabados.
- **Cero Plásticos**: Cadena de embalaje y producción libre de plásticos descartables.

---

## 📁 Estructura del Proyecto

```
primera entrega/
├── index.html               # Inicio: Hero de autor, colecciones, 4 destacados asíncronos y Casa Taller
├── productos.html           # Catálogo: Buscador reactivo, filtros por categoría, ordenamiento y grilla
├── producto.html            # Detalle: Galería interactiva, especificaciones de ebanistería y compra
├── contacto.html            # Casa Taller: Formulario validado con JS, mapa gráfico e info de contacto
├── Kit de imágenes/         # Kit oficial provisto por la cátedra
├── assets/
│   └── images/              # Imágenes optimizadas del catálogo oficial y logo.svg
├── css/
│   ├── styles.css           # Tokens del Manual de Marca, layout, drawer de carrito, toasts y footer
│   ├── home.css             # Estilos de Hero, colecciones y propuesta de valor
│   ├── catalog.css          # Estilos de buscador reactivo, pills de filtro y ordenamiento
│   ├── product-detail.css   # Estilos de galería con zoom, selector de cantidad y sellos
│   └── contact.css          # Estilos de formulario con feedback en vivo y mensaje en DOM
├── js/
│   ├── icons.js             # Módulo de iconos vectoriales SVG limpios y escalables
│   ├── data.js              # Array de objetos con los 11 productos y métodos asíncronos (setTimeout/async-await)
│   ├── cart.js              # Carrito con LocalStorage, barra de envío y modal de checkout
│   ├── main.js              # Header dinámico, menú responsive y sistema de notificaciones toast
│   ├── home.js              # Inyección asíncrona de piezas destacadas con skeleton loading
│   ├── catalog.js           # Filtrado en tiempo real, búsqueda reactiva y ordenación dinámica
│   ├── product-detail.js    # Carga dinámica por parámetro URL (?id=), galería y cálculo de cuotas
│   └── contact.js           # Validación de formulario en tiempo real y confirmación en el DOM
└── README.md                # Documentación oficial de entrega
```

---

## 🚀 Cómo Visualizar el Proyecto Localmente

1. **Abrir directamente en el navegador**:
   - Hacer doble clic en [`index.html`](file:///c:/Users/Hijos/Desktop/desarrollo/curso%20de%20desarrollo%20full%20stack/primera%20entrega/index.html) desde el explorador de archivos.
2. **Utilizar una extensión de servidor local** (Recomendado):
   - Con VS Code / Antigravity IDE, hacer clic derecho en `index.html` y seleccionar **"Open with Live Server"**.
   - O ejecutar: `npx serve .`

---

## 📋 Requerimientos Cumplidos (Criterios de Evaluación)

### 1. HTML5 Semántico y Accesibilidad
- Jerarquía semántica estricta (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
- Formulario de contacto con etiquetas `<label>`, atributos `required`, `aria-label` e inputs tipados.
- Iconografía 100% vectorial SVG escalable y accesible con `currentColor`.

### 2. CSS3, Modelo de Cajas & Flexbox/Grid
- Uso exhaustivo de variables CSS (`:root`) basadas en el Manual de Marca Oficial.
- Diseño **Mobile-First** con breakpoints en 640px, 768px, 900px, 1024px y 1200px.
- Animaciones suaves de interacción, micro-interacciones hover y skeleton loaders.

### 3. JavaScript Vanilla & Manipulación del DOM
- **Array de Objetos (`PRODUCTOS`)**: Catálogo estructurado con 11 piezas oficiales.
- **Asincronismo**: Carga simulada con `Promise`, `setTimeout` y `async/await`.
- **Búsqueda Reactiva**: Filtro instantáneo por texto en título, categoría o madera.
- **Filtros Combinados**: Filtros por categoría y ordenamiento por precio o nombre.
- **Persistencia**: Carrito guardado en `localStorage` sincronizado en todas las páginas.
- **Validación de Formulario**: Validación en tiempo real (expresión regular para email, requeridos) y renderizado de tarjeta de éxito en el DOM sin recargar la página.

---

## 🏛️ Casa Taller & Contacto Oficial

- **Ubicación**: Av. San Juan 2847 (C1232AAB), Barrio de San Cristóbal, CABA, Argentina.
- **Horarios**: Lunes a Viernes de 10:00 a 19:00 hs | Sábados de 10:00 a 14:00 hs.
- **WhatsApp**: `+54 11 4567-8900`
- **Email**: `info@hermanosjota.com.ar` | `ventas@hermanosjota.com.ar`
- **Instagram**: `@hermanosjota_ba`

---

## 📜 Créditos del Manual de Marca
- **Dirección Creativa**: Estudio Hermanos
- **Diseño**: María Fernanda López
- **Fotografía**: Santiago Ciuffo
- **Redacción**: Carolina Mendez
- **Tipografía**: Inter por Rasmus Andersson & Playfair Display
- © 2026 Hermanos Jota. Todos los derechos reservados.
