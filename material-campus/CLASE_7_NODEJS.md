# Clase 7 - Node.js

Fuente: presentación oficial del curso “Clase 7 - Sprint 3 - Node.js” (42 diapositivas).

## Ideas centrales

- Node.js es un entorno de ejecución de JavaScript del lado del servidor; no es un lenguaje nuevo.
- El stack MERN permite usar JavaScript tanto en React (cliente) como en Node.js (servidor).
- Su modelo de entrada/salida asíncrono y no bloqueante favorece aplicaciones con muchas conexiones, como APIs y chats.
- npm es el gestor de paquetes de Node y permite incorporar librerías y herramientas reutilizables.

## Preparación de un proyecto

1. Instalar la versión LTS desde `nodejs.org`.
2. Crear una carpeta de proyecto y ejecutar `npm init -y`.
3. Usar el `package.json` generado para declarar metadatos, scripts y dependencias.

## Herramientas y módulos core

Node incluye módulos ya instalados, entre ellos:

| Módulo | Uso principal |
| --- | --- |
| `fs` | Leer y escribir archivos |
| `http` | Crear servidores web |
| `path` | Trabajar con rutas de archivos |
| `os` | Consultar información del sistema operativo |
| `repl` | Probar JavaScript de manera interactiva |
| `crypto` | Operaciones criptográficas |
| `events` | Manejo de eventos |

## REPL y ejecución de archivos

El REPL (Read-Eval-Print-Loop) se abre ejecutando `node` en la terminal y permite evaluar JavaScript sin crear un archivo. Para ejecutar un archivo, se utiliza `node nombre-del-archivo.js`.

## Relación con el proyecto

Para la Mueblería, Node.js será el entorno que ejecute el backend. Sobre él se instalará Express y se implementará una API que responda solicitudes HTTP para los productos.

> Documento interno de estudio. Debe eliminarse junto con `material-campus/` en el commit final de entrega.
