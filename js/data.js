/**
 * Hermanos Jota — Módulo de Datos & Asincronismo JS
 * Rol: Tadeo Piccato (Lógica de Catálogo, Búsqueda Reactiva & Asincronismo JS)
 * 
 * Este módulo estructura el catálogo oficial de 11 piezas artesanales
 * y provee métodos asíncronos basados en Promises, setTimeout y async/await
 * que simulan la latencia de una API REST/backend.
 */

(function () {
  'use strict';

  const PRODUCTOS = [
    {
      id: 'aparador-uspallata',
      name: 'Aparador Uspallata',
      nombre: 'Aparador Uspallata',
      category: 'comedor',
      categoria: 'comedor',
      categories: ['comedor', 'living', 'dormitorio'],
      type: 'Guardado',
      tipo: 'Guardado',
      price: 1480000,
      precio: 1480000,
      image: 'assets/images/aparador-uspallata.png',
      imagen: 'assets/images/aparador-uspallata.png',
      short: 'Nogal argentino, esterilla natural y una silueta que recupera el optimismo de los años sesenta.',
      descripcionCorta: 'Nogal argentino, esterilla natural y una silueta que recupera el optimismo de los años sesenta.',
      description: 'El Uspallata combina una caja de nogal de veta continua con frente de esterilla tejida a mano y tapa mineral clara. Sus puertas corredizas guardan vajilla, libros o textiles sin interrumpir la pureza de la línea.',
      descripcion: 'El Uspallata combina una caja de nogal de veta continua con frente de esterilla tejida a mano y tapa mineral clara. Sus puertas corredizas guardan vajilla, libros o textiles sin interrumpir la pureza de la línea.',
      materials: 'Nogal argentino certificado FSC, esterilla natural, herrajes de latón macizo y terminación con aceite de lino prensado en frío.',
      materiales: 'Nogal argentino certificado FSC, esterilla natural, herrajes de latón macizo y terminación con aceite de lino prensado en frío.',
      wood: 'Nogal argentino',
      madera: 'Nogal argentino',
      dimensions: '180 × 45 × 78 cm',
      dimensiones: '180 × 45 × 78 cm',
      making: 'Ensamblado y tejido a mano en nuestra Casa Taller de San Cristóbal. Tiempo estimado: 6 a 8 semanas.',
      fabricacion: 'Ensamblado y tejido a mano en nuestra Casa Taller de San Cristóbal. Tiempo estimado: 6 a 8 semanas.',
      featured: true,
      destacado: true,
      badge: 'Pieza insignia',
      etiqueta: 'Pieza insignia',
      garantia: '10 años en estructura'
    },
    {
      id: 'biblioteca-recoleta',
      name: 'Biblioteca Recoleta',
      nombre: 'Biblioteca Recoleta',
      category: 'estudio',
      categoria: 'estudio',
      categories: ['estudio', 'living'],
      type: 'Guardado',
      tipo: 'Guardado',
      price: 1890000,
      precio: 1890000,
      image: 'assets/images/biblioteca-recoleta.png',
      imagen: 'assets/images/biblioteca-recoleta.png',
      short: 'Una estructura abierta y liviana que ordena sin quitarle aire al ambiente.',
      descripcionCorta: 'Una estructura abierta y liviana que ordena sin quitarle aire al ambiente.',
      description: 'La Recoleta está pensada como una arquitectura doméstica: estantes amplios, modulación serena y encuentros de latón que celebran el oficio. Puede funcionar como biblioteca o divisor de ambientes.',
      descripcion: 'La Recoleta está pensada como una arquitectura doméstica: estantes amplios, modulación serena y encuentros de latón que celebran el oficio. Puede funcionar como biblioteca o divisor de ambientes.',
      materials: 'Petiribí misionero certificado FSC, uniones de latón natural y acabado con cera de abejas de origen local.',
      materiales: 'Petiribí misionero certificado FSC, uniones de latón natural y acabado con cera de abejas de origen local.',
      wood: 'Petiribí',
      madera: 'Petiribí',
      dimensions: '220 × 38 × 190 cm',
      dimensiones: '220 × 38 × 190 cm',
      making: 'Construcción modular de encastres precisos tipo cola de milano, terminada a mano. Tiempo estimado: 8 semanas.',
      fabricacion: 'Construcción modular de encastres precisos tipo cola de milano, terminada a mano. Tiempo estimado: 8 semanas.',
      featured: false,
      destacado: false,
      badge: 'Edición de taller',
      etiqueta: 'Edición de taller',
      garantia: '10 años en estructura'
    },
    {
      id: 'butaca-mendoza',
      name: 'Butaca Mendoza',
      nombre: 'Butaca Mendoza',
      category: 'living',
      categoria: 'living',
      categories: ['living'],
      type: 'Asientos',
      tipo: 'Asientos',
      price: 895000,
      precio: 895000,
      image: 'assets/images/butaca-mendoza.png',
      imagen: 'assets/images/butaca-mendoza.png',
      short: 'Terciopelo rosa polvoriento y apoyabrazos de madera para una pausa verdaderamente cómoda.',
      descripcionCorta: 'Terciopelo rosa polvoriento y apoyabrazos de madera para una pausa verdaderamente cómoda.',
      description: 'Con proporciones generosas y una inclinación amable, la Mendoza invita a bajar el ritmo. El tapizado rosa polvoriento aporta carácter sin perder calidez, mientras la estructura deja visible la nobleza de la madera.',
      descripcion: 'Con proporciones generosas y una inclinación amable, la Mendoza invita a bajar el ritmo. El tapizado rosa polvoriento aporta carácter sin perder calidez, mientras la estructura deja visible la nobleza de la madera.',
      materials: 'Guatambú macizo certificado, espuma de alta resiliencia sin CFC y terciopelo de fibras recuperadas.',
      materiales: 'Guatambú macizo certificado, espuma de alta resiliencia sin CFC y terciopelo de fibras recuperadas.',
      wood: 'Guatambú',
      madera: 'Guatambú',
      dimensions: '76 × 82 × 84 cm',
      dimensiones: '76 × 82 × 84 cm',
      making: 'Estructura encastrada, cinchado manual y tapizado por artesanos locales en San Cristóbal. Tiempo estimado: 5 semanas.',
      fabricacion: 'Estructura encastrada, cinchado manual y tapizado por artesanos locales en San Cristóbal. Tiempo estimado: 5 semanas.',
      featured: true,
      destacado: true,
      badge: 'Favorita',
      etiqueta: 'Favorita',
      garantia: '10 años en estructura'
    },
    {
      id: 'escritorio-costa',
      name: 'Escritorio Costa',
      nombre: 'Escritorio Costa',
      category: 'estudio',
      categoria: 'estudio',
      categories: ['estudio'],
      type: 'Trabajo',
      tipo: 'Trabajo',
      price: 1320000,
      precio: 1320000,
      image: 'assets/images/escritorio-costa.png',
      imagen: 'assets/images/escritorio-costa.png',
      short: 'Superficie de cuero vegetal, cajones suspendidos y orden para las ideas de todos los días.',
      descripcionCorta: 'Superficie de cuero vegetal, cajones suspendidos y orden para las ideas de todos los días.',
      description: 'Costa reinterpreta el escritorio ejecutivo de mediados de siglo con una escala contemporánea. La bandeja superior organiza objetos pequeños y los cajones suspendidos mantienen libre el espacio de trabajo.',
      descripcion: 'Costa reinterpreta el escritorio ejecutivo de mediados de siglo con una escala contemporánea. La bandeja superior organiza objetos pequeños y los cajones suspendidos mantienen libre el espacio de trabajo.',
      materials: 'Nogal certificado FSC, badana de cuero curtido vegetal, tiradores de latón macizo y adhesivos ecológicos bajo COV.',
      materiales: 'Nogal certificado FSC, badana de cuero curtido vegetal, tiradores de latón macizo y adhesivos ecológicos bajo COV.',
      wood: 'Nogal',
      madera: 'Nogal',
      dimensions: '150 × 70 × 76 cm',
      dimensiones: '150 × 70 × 76 cm',
      making: 'Carpintería de precisión y superficie de cuero repujada y cosida a mano. Tiempo estimado: 7 semanas.',
      fabricacion: 'Carpintería de precisión y superficie de cuero repujada y cosida a mano. Tiempo estimado: 7 semanas.',
      featured: true,
      destacado: true,
      badge: 'Nuevo',
      etiqueta: 'Nuevo',
      garantia: '10 años en estructura'
    },
    {
      id: 'mesa-comedor-pampa',
      name: 'Mesa Comedor Pampa',
      nombre: 'Mesa Comedor Pampa',
      category: 'comedor',
      categoria: 'comedor',
      categories: ['comedor'],
      type: 'Mesas',
      tipo: 'Mesas',
      price: 2140000,
      precio: 2140000,
      image: 'assets/images/mesa-comedor-pampa.png',
      imagen: 'assets/images/mesa-comedor-pampa.png',
      short: 'Una mesa sólida y honesta, preparada para sobremesas largas y muchas historias.',
      descripcionCorta: 'Una mesa sólida y honesta, preparada para sobremesas largas y muchas historias.',
      description: 'La Pampa nace de una tapa de gran espesor y bases escultóricas con vacío central. Su presencia es rotunda, pero las aristas suavizadas y la veta continua mantienen una expresión cercana.',
      descripcion: 'La Pampa nace de una tapa de gran espesor y bases escultóricas con vacío central. Su presencia es rotunda, pero las aristas suavizadas y la veta continua mantienen una expresión cercana.',
      materials: 'Petiribí macizo de reforestación controlada, impregnante al aceite de lino y protectores de fieltro reciclado.',
      materiales: 'Petiribí macizo de reforestación controlada, impregnante al aceite de lino y protectores de fieltro reciclado.',
      wood: 'Petiribí macizo',
      madera: 'Petiribí macizo',
      dimensions: '220 × 100 × 75 cm',
      dimensiones: '220 × 100 × 75 cm',
      making: 'Cada tapa se selecciona y calibra de forma individual por maestros carpinteros. Tiempo estimado: 8 a 10 semanas.',
      fabricacion: 'Cada tapa se selecciona y calibra de forma individual por maestros carpinteros. Tiempo estimado: 8 a 10 semanas.',
      featured: false,
      destacado: false,
      badge: 'Madera maciza',
      etiqueta: 'Madera maciza',
      garantia: '10 años en estructura'
    },
    {
      id: 'mesa-centro-araucaria',
      name: 'Mesa de Centro Araucaria',
      nombre: 'Mesa de Centro Araucaria',
      category: 'living',
      categoria: 'living',
      categories: ['living'],
      type: 'Mesas',
      tipo: 'Mesas',
      price: 780000,
      precio: 780000,
      image: 'assets/images/mesa-centro-araucaria.png',
      imagen: 'assets/images/mesa-centro-araucaria.png',
      short: 'Vidrio de bordes suaves sobre una base orgánica inspirada en el paisaje argentino.',
      descripcionCorta: 'Vidrio de bordes suaves sobre una base orgánica inspirada en el paisaje argentino.',
      description: 'Araucaria equilibra transparencia y materia. El vidrio revela una base de tres apoyos curvos, tallados para encontrarse en un gesto continuo que cambia según el punto de vista.',
      descripcion: 'Araucaria equilibra transparencia y materia. El vidrio revela una base de tres apoyos curvos, tallados para encontrarse en un gesto continuo que cambia según el punto de vista.',
      materials: 'Base de nogal recuperado, cristal templado de 12 mm de canto pulido y acabado con cera natural.',
      materiales: 'Base de nogal recuperado, cristal templado de 12 mm de canto pulido y acabado con cera natural.',
      wood: 'Nogal recuperado',
      madera: 'Nogal recuperado',
      dimensions: '120 × 80 × 38 cm',
      dimensiones: '120 × 80 × 38 cm',
      making: 'Base tallada y pulida a mano con gubia tradicional; cristal elaborado a medida. Tiempo estimado: 5 semanas.',
      fabricacion: 'Base tallada y pulida a mano con gubia tradicional; cristal elaborado a medida. Tiempo estimado: 5 semanas.',
      featured: true,
      destacado: true,
      badge: 'Material recuperado',
      etiqueta: 'Material recuperado',
      garantia: '10 años en estructura'
    },
    {
      id: 'mesa-noche-aconcagua',
      name: 'Mesa de Noche Aconcagua',
      nombre: 'Mesa de Noche Aconcagua',
      category: 'dormitorio',
      categoria: 'dormitorio',
      categories: ['dormitorio'],
      type: 'Guardado',
      tipo: 'Guardado',
      price: 525000,
      precio: 525000,
      image: 'assets/images/mesa-noche-aconcagua.png',
      imagen: 'assets/images/mesa-noche-aconcagua.png',
      short: 'Guardado silencioso y madera cálida para acompañar el final del día.',
      descripcionCorta: 'Guardado silencioso y madera cálida para acompañar el final del día.',
      description: 'Aconcagua concentra utilidad en un volumen sereno. El estante abierto mantiene a mano las lecturas y el cajón profundo esconde aquello que preferís fuera de vista.',
      descripcion: 'Aconcagua concentra utilidad en un volumen sereno. El estante abierto mantiene a mano las lecturas y el cajón profundo esconde aquello que preferís fuera de vista.',
      materials: 'Nogal misionero certificado FSC, tirador de latón envejecido y acabado al aceite vegetal hidrófugo.',
      materiales: 'Nogal misionero certificado FSC, tirador de latón envejecido y acabado al aceite vegetal hidrófugo.',
      wood: 'Nogal',
      madera: 'Nogal',
      dimensions: '62 × 42 × 45 cm',
      dimensiones: '62 × 42 × 45 cm',
      making: 'Frentes seleccionados por continuidad de veta y cajón con ensamble tradicional de cola de milano. Tiempo estimado: 4 semanas.',
      fabricacion: 'Frentes seleccionados por continuidad de veta y cajón con ensamble tradicional de cola de milano. Tiempo estimado: 4 semanas.',
      featured: false,
      destacado: false,
      badge: 'Hecha a mano',
      etiqueta: 'Hecha a mano',
      garantia: '10 años en estructura'
    },
    {
      id: 'silla-trabajo-belgrano',
      name: 'Silla de Trabajo Belgrano',
      nombre: 'Silla de Trabajo Belgrano',
      category: 'estudio',
      categoria: 'estudio',
      categories: ['estudio'],
      type: 'Trabajo',
      tipo: 'Trabajo',
      price: 745000,
      precio: 745000,
      image: 'assets/images/silla-trabajo-belgrano.png',
      imagen: 'assets/images/silla-trabajo-belgrano.png',
      short: 'Ergonomía contemporánea envuelta en madera noble y verde salvia.',
      descripcionCorta: 'Ergonomía contemporánea envuelta en madera noble y verde salvia.',
      description: 'Belgrano lleva la sensibilidad del mobiliario doméstico al espacio de trabajo. Su respaldo respirable, apoyo lumbar y mecanismos regulables acompañan la postura sin adoptar una estética corporativa.',
      descripcion: 'Belgrano lleva la sensibilidad del mobiliario doméstico al espacio de trabajo. Su respaldo respirable, apoyo lumbar y mecanismos regulables acompañan la postura sin adoptar una estética corporativa.',
      materials: 'Estructura laminada de nogal, textil bouclé reciclado verde salvia, estrella de aluminio recuperado y ruedas silenciosas de bajo impacto.',
      materiales: 'Estructura laminada de nogal, textil bouclé reciclado verde salvia, estrella de aluminio recuperado y ruedas silenciosas de bajo impacto.',
      wood: 'Laminado de nogal',
      madera: 'Laminado de nogal',
      dimensions: '68 × 68 × 96–108 cm',
      dimensiones: '68 × 68 × 96–108 cm',
      making: 'Componentes mecánicos 100% reparables y tapizado desmontable para extender su ciclo de vida. Tiempo estimado: 4 semanas.',
      fabricacion: 'Componentes mecánicos 100% reparables y tapizado desmontable para extender su ciclo de vida. Tiempo estimado: 4 semanas.',
      featured: false,
      destacado: false,
      badge: 'Ergonómica',
      etiqueta: 'Ergonómica',
      garantia: '10 años en estructura'
    },
    {
      id: 'sillas-cordoba',
      name: 'Sillas Córdoba (Par)',
      nombre: 'Sillas Córdoba (Par)',
      category: 'comedor',
      categoria: 'comedor',
      categories: ['comedor', 'living'],
      type: 'Asientos',
      tipo: 'Asientos',
      price: 980000,
      precio: 980000,
      image: 'assets/images/sillas-cordoba.png',
      imagen: 'assets/images/sillas-cordoba.png',
      short: 'Un par de sillas livianas, con respaldo de varillas torneadas y asiento verde salvia.',
      descripcionCorta: 'Un par de sillas livianas, con respaldo de varillas torneadas y asiento verde salvia.',
      description: 'Las Córdoba reinterpretan la clásica silla peineta con una curva más envolvente. Su estructura liviana resiste el uso cotidiano familiar y el tapizado artesanal aporta una nota suave de color.',
      descripcion: 'Las Córdoba reinterpretan la clásica silla peineta con una curva más envolvente. Su estructura liviana resiste el uso cotidiano familiar y el tapizado artesanal aporta una nota suave de color.',
      materials: 'Guatambú certificado FSC, lino orgánico verde salvia con contenido reciclado y tintes vegetales al agua.',
      materiales: 'Guatambú certificado FSC, lino orgánico verde salvia con contenido reciclado y tintes vegetales al agua.',
      wood: 'Guatambú',
      madera: 'Guatambú',
      dimensions: '48 × 52 × 82 cm cada una',
      dimensiones: '48 × 52 × 82 cm cada una',
      making: 'Varillas torneadas manualmente en torno de pedal y respaldo ensamblado al vapor. El precio corresponde al juego de dos unidades. Tiempo estimado: 5 semanas.',
      fabricacion: 'Varillas torneadas manualmente en torno de pedal y respaldo ensamblado al vapor. El precio corresponde al juego de dos unidades. Tiempo estimado: 5 semanas.',
      featured: false,
      destacado: false,
      badge: 'Par de Autor',
      etiqueta: 'Par de Autor',
      garantia: '10 años en estructura'
    },
    {
      id: 'sillon-copacabana',
      name: 'Sillón Copacabana',
      nombre: 'Sillón Copacabana',
      category: 'living',
      categoria: 'living',
      categories: ['living'],
      type: 'Asientos',
      tipo: 'Asientos',
      price: 1120000,
      precio: 1120000,
      image: 'assets/images/sillon-copacabana.png',
      imagen: 'assets/images/sillon-copacabana.png',
      short: 'Cuero color caramelo y madera oscura en una pieza que gana nobleza con los años.',
      descripcionCorta: 'Cuero color caramelo y madera oscura en una pieza que gana nobleza con los años.',
      description: 'Copacabana tiene la comodidad franca de un sillón de lectura y la elegancia de una pieza heredada. El cuero desarrolla una pátina única, registrando con belleza el paso de las estaciones.',
      descripcion: 'Copacabana tiene la comodidad franca de un sillón de lectura y la elegancia de una pieza heredada. El cuero desarrolla una pátina única, registrando con belleza el paso de las estaciones.',
      materials: 'Estructura maciza de nogal, cuero vacuno argentino de curtido vegetal y relleno de látex natural y lana merino.',
      materiales: 'Estructura maciza de nogal, cuero vacuno argentino de curtido vegetal y relleno de látex natural y lana merino.',
      wood: 'Nogal',
      madera: 'Nogal',
      dimensions: '79 × 84 × 86 cm',
      dimensiones: '79 × 84 × 86 cm',
      making: 'Bastidor de ebanistería ensamblado a espiga y mortaja, cinchado manual de yute y tapicería cosida punto por punto. Tiempo estimado: 7 semanas.',
      fabricacion: 'Bastidor de ebanistería ensamblado a espiga y mortaja, cinchado manual de yute y tapicería cosida punto por punto. Tiempo estimado: 7 semanas.',
      featured: false,
      destacado: false,
      badge: 'Cuero vegetal',
      etiqueta: 'Cuero vegetal',
      garantia: '10 años en estructura'
    },
    {
      id: 'sofa-patagonia',
      name: 'Sofá Patagonia',
      nombre: 'Sofá Patagonia',
      category: 'living',
      categoria: 'living',
      categories: ['living'],
      type: 'Asientos',
      tipo: 'Asientos',
      price: 2490000,
      precio: 2490000,
      image: 'assets/images/sofa-patagonia.png',
      imagen: 'assets/images/sofa-patagonia.png',
      short: 'Tres cuerpos, textura verde salvia y una comodidad concebida para durar generaciones.',
      descripcionCorta: 'Tres cuerpos, textura verde salvia y una comodidad concebida para durar generaciones.',
      description: 'Patagonia reúne escala familiar, apoyo profundo y líneas limpias inspiradas en los años sesenta. Sus almohadones reversibles y fundas desmontables simplifican el cuidado, mientras el zócalo de madera mantiene el conjunto visualmente liviano.',
      descripcion: 'Patagonia reúne escala familiar, apoyo profundo y líneas limpias inspiradas en los años sesenta. Sus almohadones reversibles y fundas desmontables simplifican el cuidado, mientras el zócalo de madera mantiene el conjunto visualmente liviano.',
      materials: 'Zócalo de quebracho blanco y paraíso certificado, cinchas elásticas de yute, espuma viscoelástica de alta densidad y bouclé reciclado verde salvia.',
      materiales: 'Zócalo de quebracho blanco y paraíso certificado, cinchas elásticas de yute, espuma viscoelástica de alta densidad y bouclé reciclado verde salvia.',
      wood: 'Quebracho blanco y paraíso',
      madera: 'Quebracho blanco y paraíso',
      dimensions: '228 × 92 × 82 cm',
      dimensiones: '228 × 92 × 82 cm',
      making: 'Estructura garantizada por 10 años, bastidor encastrado y tapizado de alta resistencia antimanchas natural. Tiempo estimado: 8 semanas.',
      fabricacion: 'Estructura garantizada por 10 años, bastidor encastrado y tapizado de alta resistencia antimanchas natural. Tiempo estimado: 8 semanas.',
      featured: false,
      destacado: false,
      badge: 'Herencia Viva',
      etiqueta: 'Herencia Viva',
      garantia: '10 años en estructura'
    }
  ];

  // Formateador de moneda oficial para Argentina ($ 1.480.000)
  const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  function formatCurrencyARS(value) {
    const num = Number(value) || 0;
    return currencyFormatter.format(num).replace('ARS', '$ ');
  }

  // Normalizador de texto para búsqueda (remueve acentos, tildes y diacríticos)
  function normalizeText(text) {
    if (!text) return '';
    return String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // ------------------------------------------------------------
  // Métodos Asíncronos Simulados (Promise / setTimeout / async-await)
  // ------------------------------------------------------------

  /**
   * Obtiene todos los productos del catálogo con latencia asíncrona simulada.
   * @param {Object} options
   * @param {number} options.delay - Milisegundos de delay simulado (default 420ms)
   * @returns {Promise<Array>}
   */
  function getProducts({ delay = 420 } = {}) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        resolve(PRODUCTOS.map((p) => ({ ...p })));
      }, Math.max(0, delay));
    });
  }

  /**
   * Obtiene un producto por su ID único de forma asíncrona.
   * @param {string} id
   * @param {Object} options
   * @param {number} options.delay
   * @returns {Promise<Object|null>}
   */
  function getProductById(id, { delay = 250 } = {}) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const found = PRODUCTOS.find((p) => String(p.id).toLowerCase() === String(id).toLowerCase());
        resolve(found ? { ...found } : null);
      }, Math.max(0, delay));
    });
  }

  /**
   * Obtiene las piezas destacadas para portada.
   * @param {Object} options
   * @param {number} options.delay
   * @returns {Promise<Array>}
   */
  function getFeaturedProducts({ delay = 350 } = {}) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const featured = PRODUCTOS.filter((p) => p.featured);
        resolve(featured.map((p) => ({ ...p })));
      }, Math.max(0, delay));
    });
  }

  /**
   * Obtiene productos complementarios o de la misma colección.
   * @param {string} currentId
   * @param {Object} options
   * @param {number} options.limit
   * @param {number} options.delay
   * @returns {Promise<Array>}
   */
  function getRelatedProducts(currentId, { limit = 3, delay = 250 } = {}) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const current = PRODUCTOS.find((p) => p.id === currentId);
        let related = [];
        if (current) {
          related = PRODUCTOS.filter(
            (p) => p.id !== currentId && (p.category === current.category || p.type === current.type)
          );
        }
        if (related.length < limit) {
          const others = PRODUCTOS.filter((p) => p.id !== currentId && !related.includes(p));
          related = related.concat(others);
        }
        resolve(related.slice(0, limit).map((p) => ({ ...p })));
      }, Math.max(0, delay));
    });
  }

  // ------------------------------------------------------------
  // Exposición Global
  // ------------------------------------------------------------

  window.PRODUCTOS = PRODUCTOS;
  window.HJ_PRODUCTS = PRODUCTOS;
  window.HJ_DATA = {
    PRODUCTOS,
    getProducts,
    getProductById,
    getFeaturedProducts,
    getRelatedProducts,
    formatCurrencyARS,
    normalizeText
  };
})();
