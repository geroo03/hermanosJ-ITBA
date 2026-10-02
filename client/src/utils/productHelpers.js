// Obtiene la URL base para los assets desde las variables de entorno de React.
// Si no está definida REACT_APP_ASSETS_URL, usa 'http://localhost:3000' como valor por defecto (mecanismo Nullish Coalescing ??)
const ASSETS_BASE_URL = process.env.REACT_APP_ASSETS_URL ?? 'http://localhost:3000';

// Crea una instancia reusable del formateador de números nativo de JavaScript (Intl.NumberFormat)
// Configurada para moneda local de Argentina (ARS, pesos argentinos) y sin decimales
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/**
 * Convierte un número o string numérico a formato moneda en pesos argentinos.
 * Ejemplo: 1480000 -> "$ 1.480.000"
 * Si el valor no es un número válido o no existe, usa 0 como respaldo.
 */
export function formatPrice(value) {
  return currencyFormatter.format(Number(value) || 0);
}

/**
 * Construye la URL completa de una imagen recibida como parámetro.
 * Ejemplo: 'assets/images/sofa.png' -> 'http://localhost:3000/assets/images/sofa.png'
 */
export function getImageUrl(image) {
  // Si no se proporciona ninguna ruta de imagen, retorna un string vacío
  if (!image) return '';

  // Si la ruta ya es una URL absoluta (empieza con http:// o https://), la retorna intacta
  if (/^https?:\/\//.test(image)) return image;

  // Remueve las barras iniciales del string (ej: '/assets/...' pasa a 'assets/...')
  // y lo concatena con la URL base para evitar barras dobles no deseadas
  return `${ASSETS_BASE_URL}/${image.replace(/^\/+/, '')}`;
}

/**
 * Recorta un texto si supera la longitud máxima especificada y le añade puntos suspensivos ("…").
 * Por defecto, el límite es de 110 caracteres.
 */
export function truncate(text = '', maxLength = 110) {
  // Si el texto entra dentro del límite, lo devuelve sin modificar
  if (text.length <= maxLength) return text;

  // Recorta el texto hasta maxLength, elimina espacios en blanco al final y concatena el carácter '…'
  return `${text.slice(0, maxLength).trimEnd()}…`;
}