// Catálogo del Sprint 1-2: mismos IDs, precios en ARS e imágenes de js/data.js.
// Contrato de la API: id, name, price, image, description y category.
const products = [
  {
    id: 'aparador-uspallata',
    name: 'Aparador Uspallata',
    price: 1480000,
    image: 'assets/images/aparador-uspallata.png',
    description:
      'El Uspallata combina una caja de nogal de veta continua con frente de esterilla tejida a mano y tapa mineral clara. Sus puertas corredizas guardan vajilla, libros o textiles sin interrumpir la pureza de la línea.',
    category: 'comedor',
  },
  {
    id: 'biblioteca-recoleta',
    name: 'Biblioteca Recoleta',
    price: 1890000,
    image: 'assets/images/biblioteca-recoleta.png',
    description:
      'La Recoleta está pensada como una arquitectura doméstica: estantes amplios, modulación serena y encuentros de latón que celebran el oficio. Puede funcionar como biblioteca o divisor de ambientes.',
    category: 'estudio',
  },
  {
    id: 'butaca-mendoza',
    name: 'Butaca Mendoza',
    price: 895000,
    image: 'assets/images/butaca-mendoza.png',
    description:
      'Con proporciones generosas y una inclinación amable, la Mendoza invita a bajar el ritmo. El tapizado rosa polvoriento aporta carácter sin perder calidez, mientras la estructura deja visible la nobleza de la madera.',
    category: 'living',
  },
  {
    id: 'escritorio-costa',
    name: 'Escritorio Costa',
    price: 1320000,
    image: 'assets/images/escritorio-costa.png',
    description:
      'Costa reinterpreta el escritorio ejecutivo de mediados de siglo con una escala contemporánea. La bandeja superior organiza objetos pequeños y los cajones suspendidos mantienen libre el espacio de trabajo.',
    category: 'estudio',
  },
  {
    id: 'mesa-comedor-pampa',
    name: 'Mesa Comedor Pampa',
    price: 2140000,
    image: 'assets/images/mesa-comedor-pampa.png',
    description:
      'La Pampa nace de una tapa de gran espesor y bases escultóricas con vacío central. Su presencia es rotunda, pero las aristas suavizadas y la veta continua mantienen una expresión cercana.',
    category: 'comedor',
  },
  {
    id: 'mesa-centro-araucaria',
    name: 'Mesa de Centro Araucaria',
    price: 780000,
    image: 'assets/images/mesa-centro-araucaria.png',
    description:
      'Araucaria equilibra transparencia y materia. El vidrio revela una base de tres apoyos curvos, tallados para encontrarse en un gesto continuo que cambia según el punto de vista.',
    category: 'living',
  },
  {
    id: 'mesa-noche-aconcagua',
    name: 'Mesa de Noche Aconcagua',
    price: 525000,
    image: 'assets/images/mesa-noche-aconcagua.png',
    description:
      'Aconcagua concentra utilidad en un volumen sereno. El estante abierto mantiene a mano las lecturas y el cajón profundo esconde aquello que preferís fuera de vista.',
    category: 'dormitorio',
  },
  {
    id: 'silla-trabajo-belgrano',
    name: 'Silla de Trabajo Belgrano',
    price: 745000,
    image: 'assets/images/silla-trabajo-belgrano.png',
    description:
      'Belgrano lleva la sensibilidad del mobiliario doméstico al espacio de trabajo. Su respaldo respirable, apoyo lumbar y mecanismos regulables acompañan la postura sin adoptar una estética corporativa.',
    category: 'estudio',
  },
  {
    id: 'sillas-cordoba',
    name: 'Sillas Córdoba (Par)',
    price: 980000,
    image: 'assets/images/sillas-cordoba.png',
    description:
      'Las Córdoba reinterpretan la clásica silla peineta con una curva más envolvente. Su estructura liviana resiste el uso cotidiano familiar y el tapizado artesanal aporta una nota suave de color.',
    category: 'comedor',
  },
  {
    id: 'sillon-copacabana',
    name: 'Sillón Copacabana',
    price: 1120000,
    image: 'assets/images/sillon-copacabana.png',
    description:
      'Copacabana tiene la comodidad franca de un sillón de lectura y la elegancia de una pieza heredada. El cuero desarrolla una pátina única, registrando con belleza el paso de las estaciones.',
    category: 'living',
  },
  {
    id: 'sofa-patagonia',
    name: 'Sofá Patagonia',
    price: 2490000,
    image: 'assets/images/sofa-patagonia.png',
    description:
      'Patagonia reúne escala familiar, apoyo profundo y líneas limpias inspiradas en los años sesenta. Sus almohadones reversibles y fundas desmontables simplifican el cuidado, mientras el zócalo de madera mantiene el conjunto visualmente liviano.',
    category: 'living',
  },
];

module.exports = products;
