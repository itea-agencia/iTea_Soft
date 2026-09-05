/**
 * Ciudades colombianas con su código DANE.
 *
 * Siigo no expone catálogo geográfico (`/v1/cities`, `/v1/states` y `/v1/countries`
 * devuelven 404), pero exige códigos DANE en la dirección del tercero:
 *
 *   address: { address, city: { country_code: 'Co', state_code, city_code } }
 *
 * El código de 5 dígitos lleva el departamento en los dos primeros, así que
 * `state_code` se deriva de `city_code` y basta con guardar uno solo.
 *
 * La lista son las 32 capitales de departamento más los municipios de mayor población.
 * No es el DANE completo (1.100+ municipios): es lo que cubre a los clientes de una
 * agencia de viajes sin cargar un catálogo entero. Agregar una ciudad es añadir una línea.
 */

const CIUDADES = [
  { codigo: '05001', nombre: 'Medellín', departamento: 'Antioquia' },
  { codigo: '05088', nombre: 'Bello', departamento: 'Antioquia' },
  { codigo: '05360', nombre: 'Itagüí', departamento: 'Antioquia' },
  { codigo: '05266', nombre: 'Envigado', departamento: 'Antioquia' },
  { codigo: '05129', nombre: 'Caldas', departamento: 'Antioquia' },
  { codigo: '05154', nombre: 'Caucasia', departamento: 'Antioquia' },
  { codigo: '05631', nombre: 'Sabaneta', departamento: 'Antioquia' },
  { codigo: '05308', nombre: 'Girardota', departamento: 'Antioquia' },
  { codigo: '05380', nombre: 'La Estrella', departamento: 'Antioquia' },
  { codigo: '05615', nombre: 'Rionegro', departamento: 'Antioquia' },
  { codigo: '05001', nombre: 'Medellín', departamento: 'Antioquia' },
  { codigo: '08001', nombre: 'Barranquilla', departamento: 'Atlántico' },
  { codigo: '08758', nombre: 'Soledad', departamento: 'Atlántico' },
  { codigo: '11001', nombre: 'Bogotá D.C.', departamento: 'Bogotá D.C.' },
  { codigo: '13001', nombre: 'Cartagena', departamento: 'Bolívar' },
  { codigo: '15001', nombre: 'Tunja', departamento: 'Boyacá' },
  { codigo: '17001', nombre: 'Manizales', departamento: 'Caldas' },
  { codigo: '18001', nombre: 'Florencia', departamento: 'Caquetá' },
  { codigo: '19001', nombre: 'Popayán', departamento: 'Cauca' },
  { codigo: '20001', nombre: 'Valledupar', departamento: 'Cesar' },
  { codigo: '23001', nombre: 'Montería', departamento: 'Córdoba' },
  { codigo: '25754', nombre: 'Soacha', departamento: 'Cundinamarca' },
  { codigo: '25290', nombre: 'Fusagasugá', departamento: 'Cundinamarca' },
  { codigo: '25473', nombre: 'Mosquera', departamento: 'Cundinamarca' },
  { codigo: '25126', nombre: 'Cajicá', departamento: 'Cundinamarca' },
  { codigo: '25175', nombre: 'Chía', departamento: 'Cundinamarca' },
  { codigo: '25269', nombre: 'Facatativá', departamento: 'Cundinamarca' },
  { codigo: '25430', nombre: 'Madrid', departamento: 'Cundinamarca' },
  { codigo: '25899', nombre: 'Zipaquirá', departamento: 'Cundinamarca' },
  { codigo: '27001', nombre: 'Quibdó', departamento: 'Chocó' },
  { codigo: '41001', nombre: 'Neiva', departamento: 'Huila' },
  { codigo: '44001', nombre: 'Riohacha', departamento: 'La Guajira' },
  { codigo: '47001', nombre: 'Santa Marta', departamento: 'Magdalena' },
  { codigo: '50001', nombre: 'Villavicencio', departamento: 'Meta' },
  { codigo: '52001', nombre: 'Pasto', departamento: 'Nariño' },
  { codigo: '52356', nombre: 'Ipiales', departamento: 'Nariño' },
  { codigo: '54001', nombre: 'Cúcuta', departamento: 'Norte de Santander' },
  { codigo: '63001', nombre: 'Armenia', departamento: 'Quindío' },
  { codigo: '66001', nombre: 'Pereira', departamento: 'Risaralda' },
  { codigo: '66170', nombre: 'Dosquebradas', departamento: 'Risaralda' },
  { codigo: '68001', nombre: 'Bucaramanga', departamento: 'Santander' },
  { codigo: '68276', nombre: 'Floridablanca', departamento: 'Santander' },
  { codigo: '68307', nombre: 'Girón', departamento: 'Santander' },
  { codigo: '68547', nombre: 'Piedecuesta', departamento: 'Santander' },
  { codigo: '68081', nombre: 'Barrancabermeja', departamento: 'Santander' },
  { codigo: '70001', nombre: 'Sincelejo', departamento: 'Sucre' },
  { codigo: '73001', nombre: 'Ibagué', departamento: 'Tolima' },
  { codigo: '76001', nombre: 'Cali', departamento: 'Valle del Cauca' },
  { codigo: '76109', nombre: 'Buenaventura', departamento: 'Valle del Cauca' },
  { codigo: '76364', nombre: 'Jamundí', departamento: 'Valle del Cauca' },
  { codigo: '76520', nombre: 'Palmira', departamento: 'Valle del Cauca' },
  { codigo: '76834', nombre: 'Tuluá', departamento: 'Valle del Cauca' },
  { codigo: '76147', nombre: 'Cartago', departamento: 'Valle del Cauca' },
  { codigo: '81001', nombre: 'Arauca', departamento: 'Arauca' },
  { codigo: '85001', nombre: 'Yopal', departamento: 'Casanare' },
  { codigo: '86001', nombre: 'Mocoa', departamento: 'Putumayo' },
  { codigo: '88001', nombre: 'San Andrés', departamento: 'San Andrés y Providencia' },
  { codigo: '91001', nombre: 'Leticia', departamento: 'Amazonas' },
  { codigo: '94001', nombre: 'Inírida', departamento: 'Guainía' },
  { codigo: '95001', nombre: 'San José del Guaviare', departamento: 'Guaviare' },
  { codigo: '97001', nombre: 'Mitú', departamento: 'Vaupés' },
  { codigo: '99001', nombre: 'Puerto Carreño', departamento: 'Vichada' },
];

// Se deduplica por si una ciudad quedó repetida al editar la lista.
const PorCodigo = new Map(CIUDADES.map((c) => [c.codigo, c]));

/** Lista única, ordenada por departamento y luego por ciudad. */
const listar = () =>
  [...PorCodigo.values()].sort(
    (a, b) =>
      a.departamento.localeCompare(b.departamento, 'es') ||
      a.nombre.localeCompare(b.nombre, 'es'),
  );

const buscar = (codigo) => (codigo ? PorCodigo.get(String(codigo)) || null : null);

const existe = (codigo) => PorCodigo.has(String(codigo));

/**
 * Traduce un código DANE al bloque `city` que espera Siigo.
 * El departamento son los dos primeros dígitos del código de municipio.
 */
function aCiudadSiigo(codigo) {
  const ciudad = buscar(codigo);
  if (!ciudad) return null;
  return {
    country_code: 'Co',
    state_code: ciudad.codigo.slice(0, 2),
    city_code: ciudad.codigo,
  };
}

module.exports = { listar, buscar, existe, aCiudadSiigo };
