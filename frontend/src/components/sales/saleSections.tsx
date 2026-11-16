import { Plane, Building2, ShieldCheck, Package, Luggage, FileInput, Smartphone, Car, Bus, TreePine, Compass, Music, UtensilsCrossed, FileText, PawPrint } from 'lucide-react';

export const saleSections = [
  { key: 'ticketData', label: 'Tiquetería', summaryType: 'tiqueteria', icon: Plane },
  { key: 'hotelData', label: 'Hotelería', summaryType: 'hoteleria', icon: Building2 },
  { key: 'insuranceData', label: 'Seguros', summaryType: 'seguros_viaje', icon: ShieldCheck },
  { key: 'planData', label: 'Planes', summaryType: 'planes', icon: Package },
  { key: 'checkInData', label: 'Check-in', summaryType: 'checkin', icon: Luggage },
  { key: 'migrationData', label: 'Migración', summaryType: 'documentacion_migratoria', icon: FileInput },
  { key: 'simCardData', label: 'SIM Card', summaryType: 'simcard', icon: Smartphone },
  { key: 'baggageData', label: 'Equipaje', summaryType: 'equipaje', icon: Luggage },
  { key: 'carRentalData', label: 'Renta de Vehículos', summaryType: 'renta_vehiculos', icon: Car },
  { key: 'landTravelData', label: 'Viajes Terrestres', summaryType: 'viajes_terrestres', icon: Bus },
  { key: 'fincaData', label: 'Finca', summaryType: 'renta_fincas', icon: TreePine },
  { key: 'tourData', label: 'Tour', summaryType: 'tours', icon: Compass },
  { key: 'conventionData', label: 'Evento', summaryType: 'centros_convencion', icon: Music },
  { key: 'restaurantData', label: 'Restaurante', summaryType: 'restaurantes', icon: UtensilsCrossed },
  { key: 'visaData', label: 'Visa', summaryType: 'visa', icon: FileText },
  { key: 'passportData', label: 'Pasaporte', summaryType: 'pasaporte', icon: FileText },
  { key: 'petServiceData', label: 'Mascotas', summaryType: 'servicio_mascotas', icon: PawPrint },
];

export function SaleSectionLabel({ section }: { section: typeof saleSections[number] }) {
  const Icon = section.icon;
  return <><Icon size={16} />{section.label}</>;
}
