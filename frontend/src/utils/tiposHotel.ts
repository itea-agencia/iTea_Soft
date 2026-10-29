// Tipos de hotel. Los `value` tienen que ser los del enum TipoHotel de la base
// (backend/prisma/schema.prisma). Habia dos listas escritas a mano, la del formulario de
// ventas y la de paquetes, y divergieron: la de ventas mandaba "hotel_turistico" (no existia)
// y "finca" (en la base es "fincas"), y Prisma rechazaba la venta entera con un 500.
export const TIPOS_HOTEL = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'hotel_turistico', label: 'Hotel Turístico' },
  { value: 'resort', label: 'Resort / Todo Incluido' },
  { value: 'boutique', label: 'Hotel Boutique' },
  { value: 'apartamento', label: 'Apartamento / AirBnB' },
  { value: 'hostal', label: 'Hostal / Albergue' },
  { value: 'fincas', label: 'Finca / Casa Rural' },
];

// Lo que se muestra (el voucher lo ve el cliente): la etiqueta, no la clave guardada.
export const etiquetaTipoHotel = (valor?: string | null) =>
  TIPOS_HOTEL.find((t) => t.value === valor)?.label || valor || '';
