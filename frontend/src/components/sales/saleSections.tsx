import { SALE_PRODUCTS } from '../../types';
import { Plane, Building2, ShieldCheck, Package, Luggage, FileInput, Smartphone, Car, Bus, TreePine, Compass, Music, UtensilsCrossed, FileText, PawPrint } from 'lucide-react';

const sections = [
  { key: 'ticketData', summaryType: 'tiqueteria', icon: Plane },
  { key: 'hotelData', summaryType: 'hoteleria', icon: Building2 },
  { key: 'insuranceData', summaryType: 'seguros_viaje', icon: ShieldCheck },
  { key: 'planData', summaryType: 'planes', icon: Package },
  { key: 'checkInData', summaryType: 'checkin', icon: Luggage },
  { key: 'migrationData', summaryType: 'documentacion_migratoria', icon: FileInput },
  { key: 'simCardData', summaryType: 'simcard', icon: Smartphone },
  { key: 'baggageData', summaryType: 'equipaje', icon: Luggage },
  { key: 'carRentalData', summaryType: 'renta_vehiculos', icon: Car },
  { key: 'landTravelData', summaryType: 'viajes_terrestres', icon: Bus },
  { key: 'fincaData', summaryType: 'renta_fincas', icon: TreePine },
  { key: 'tourData', summaryType: 'tours', icon: Compass },
  { key: 'conventionData', summaryType: 'centros_convencion', icon: Music },
  { key: 'restaurantData', summaryType: 'restaurantes', icon: UtensilsCrossed },
  { key: 'visaData', summaryType: 'visa', icon: FileText },
  { key: 'passportData', summaryType: 'pasaporte', icon: FileText },
  { key: 'petServiceData', summaryType: 'servicio_mascotas', icon: PawPrint },
];

// La pestaña es la categoría: se llama como en el selector de productos del asistente,
// no con una lista de nombres propia que se desalinee (Planes/Paquetes, Evento/Centros de Convención).
export const saleSections = sections.map((s) => ({
  ...s,
  label: SALE_PRODUCTS.find((p) => p.id === s.summaryType)?.label ?? s.summaryType,
}));

export function SaleSectionLabel({ section }: { section: typeof saleSections[number] }) {
  const Icon = section.icon;
  return <><Icon size={16} />{section.label}</>;
}
