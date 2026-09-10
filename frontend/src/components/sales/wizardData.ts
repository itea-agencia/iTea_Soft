import {
  SaleProductId,
  TicketData,
  HotelData,
  InsuranceData,
  PlanData,
  CheckInData,
  MigrationData,
  SimCardData,
  BaggageData,
  CarRentalData,
  FincaData,
  TourData,
  ConventionData,
  RestaurantData,
  VisaData,
  PassportData,
  PetServiceData,
  LandTravelData,
  GuestInfo,
} from "../../types";

import imgTiqueteria from "../../assets/tiqueteria.jpg";
import imgHoteleria from "../../assets/hoteleria.jpg";
import imgSeguros from "../../assets/seguros.jpg";
import imgPlanes from "../../assets/planes.jpg";

export const PRODUCT_IMAGES: Record<string, string> = {
  tiqueteria: imgTiqueteria,
  hoteleria: imgHoteleria,
  seguros_viaje: imgSeguros,
  planes: imgPlanes,
};

export interface PaymentData {
  amount: number;
  methodId: string;
  methodName: string;
  reference: string;
}

export interface WizardFormData {
  clientId: string;
  commissionAgentId: string;
  commissionAgentName: string;
  responsableId?: string;
  commissionAgentPercentage: string;
  commissionAgentAmount: string;
  commissionAgentRetentionPercentage: string;
  commissionAgentNetPayment: string;
  asesorId: string;
  asesorName: string;
  selectedProducts: SaleProductId[];
  observations: string;
  paymentMethod: string;
  payments?: PaymentData[];
  total: string;
  ta: string;
  taCre: string;
  supplierCost: string;
  status: string;
  isCredit: boolean;
  creditDueDate: string;
  tickets: TicketData[];
  hotels: HotelData[];
  insurances: InsuranceData[];
  plans: PlanData[];
  checkIns: CheckInData[];
  migrations: MigrationData[];
  simCards: SimCardData[];
  baggages: BaggageData[];
  carRentals: CarRentalData[];
  fincas: FincaData[];
  tours: TourData[];
  conventions: ConventionData[];
  restaurants: RestaurantData[];
  visas: VisaData[];
  passports: PassportData[];
  petServices: PetServiceData[];
  landTravels: LandTravelData[];
}

export interface WizardProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const INITIAL_TICKET = (client?: any): TicketData => ({
  airline: "",
  supplier: "",
  reservationNumber: "",
  flightNumber: "",
  departureDate: "",
  arrivalDate: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
  supplierPaymentMethod: "",
  baggagePlan: "",
  ticketNumber: "",
  seatNumber: "",
  flightMode: "one_way",
  hasStops: false,
  returnHasStops: false,
  outboundStops: [],
  returnStops: [],
  legs: [{ origin: "", destination: "", flightNumber: "", seat: "", date: "", airline: "", baggagePlan: "" }],
  passengers: [
    {
      name: client?.name || "",
      docType: client?.docType || "",
      docNumber: client?.docNumber || "",
      birthDate: client?.birthDate ? client.birthDate.split('T')[0] : "",
      esTitular: true,
      asiento: "",
      asientoRegreso: "",
      nroReserva: "",
      nroTiquete: ""
    }
  ],
});

export const INITIAL_HOTEL = (client?: any): HotelData => ({
  hotelName: "",
  destination: "",
  supplier: "",
  reservationNumber: "",
  startDate: "",
  endDate: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
  supplierPaymentMethod: "",
  hotelType: "",
  observations: "",
  // El titular se siembra marcado: si se deja sin marcar, el formulario muestra una fila
  // que el estado no reconoce como titular y el backend acaba marcando a todos.
  guests: [
    {
      name: client?.name || "",
      docType: client?.docType || "",
      docNumber: client?.docNumber || "",
      esTitular: true,
      nroReserva: "",
    },
  ],
});

export const INITIAL_INSURANCE = (client?: any): InsuranceData => ({
  insuranceType: "",
  phone: client?.phone || "",
  supplier: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
  supplierPaymentMethod: "",
  members: [
    {
      name: client?.name || "",
      docType: client?.docType || "",
      docNumber: client?.docNumber || "",
    },
  ],
});

export const INITIAL_PLAN = (client?: any): PlanData => ({
  planName: "",
  packageId: "",
  packageName: "",
  packageRateId: "",
  hotelName: "",
  supplier: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
  supplierPaymentMethod: "",
  hotelReference: "",
  flightReturnNumber: "",
  supplierPayments: [],
  flightReservationNumber: "",
  observations: "",
  flightNumber: "",
  adultsCount: 2,
  childrenCount: 0,
  startDate: "",
  endDate: "",
  flightDepartureDate: "",
  flightDepartureArrivalDate: "",
  flightReturnDate: "",
  flightReturnArrivalDate: "",
  airline: "",
  // Siempre se siembra el titular (igual que INITIAL_TICKET). Si se dejara vacio, el
  // formulario mostraria una fila que no existe en el estado y no se guardaria.
  guests: [
    {
      name: client?.name || "",
      docType: client?.docType || "",
      docNumber: client?.docNumber || "",
      esTitular: true,
      nroReserva: "",
      nroTiquete: "",
      asiento: "",
      asientoRegreso: "",
    },
  ],
  packageType: "own",
  voucher: undefined,
  sendVoucher: false,
});

export const INITIAL_CHECKIN = (client?: any): CheckInData => ({
  passengerName: client?.name || "",
  docType: client?.docType || "CC",
  docNumber: client?.docNumber || "",
  flightOrReservation: "",
  travelDate: "",
  seat: "",
  baggage: "",
  phone: client?.phone || "",
  specialNeeds: "",
  needsWheelchair: false,
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_MIGRATION = (client?: any): MigrationData => ({
  passengerName: client?.name || "",
  birthDate: client?.birthDate ? client.birthDate.split('T')[0] : "",
  nationality: "",
  docType: client?.docType || "CC",
  docNumber: client?.docNumber || "",
  passportExpiry: "",
  destinationCountry: "",
  requestedDocType: "Visa Turismo",
  email: client?.email || "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_SIMCARD = (client?: any): SimCardData => ({
  passengerName: client?.name || "",
  docNumber: client?.docNumber || "",
  destinationCountry: "",
  arrivalDate: "",
  tripDuration: "",
  dataPlan: "",
  simType: "eSIM",
  deliveryMethod: "Correo Electrónico",
  email: client?.email || "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
});

export const INITIAL_BAGGAGE = (client?: any): BaggageData => ({
  passengerName: client?.name || "",
  airline: "",
  airlineId: undefined,
  reservationNumber: "",
  fareType: "",
  personalItem: "No",
  carryOn: "No",
  checkedBag: "No",
  supplierName: "",
  supplierCost: 0,
  taCre: 0,
  ta: 0,
  notes: "",
  sendVoucher: false,
});

export const INITIAL_CAR_RENTAL = (client?: any): CarRentalData => ({
  mainDriver: client?.name || "",
  licenseNumber: "",
  pickupDate: "",
  returnDate: "",
  pickupLocation: "Aeropuerto",
  vehicleCategory: "compacto",
  additionalDrivers: 0,
  insuranceType: "basic",
  guaranteeCreditCard: "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_LAND_TRAVEL = (client?: any): LandTravelData => ({
  transportCompany: "",
  origin: "",
  destination: "",
  departureDate: "",
  departureTime: "",
  ticketLocator: "",
  isRoundTrip: false,
  returnDate: "",
  returnTime: "",
  // Siempre se siembra el titular (igual que INITIAL_TICKET). Si se dejara vacio,
  // el formulario mostraria una fila que no existe en el estado y no se guardaria.
  passengers: [{
    name: client?.name || `${client?.firstName || ''} ${client?.lastName || ''}`.trim(),
    docType: client?.docType || '',
    docNumber: client?.docNumber || '',
    esTitular: true,
    asiento: '',
    asientoRegreso: ''
  }],
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_FINCA = (client?: any): FincaData => ({
  fincaName: "",
  fincaAddress: "",
  fincaCity: "",
  observations: "",
  responsibleName: client?.name || "",
  docNumber: client?.docNumber || "",
  checkInDate: "",
  checkOutDate: "",
  adultsCount: 2,
  childrenCount: 0,
  hasPets: false,
  petType: "",
  additionalServices: [],
  phone: client?.phone || "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_TOUR = (client?: any): TourData => ({
  passengerName: client?.name || "",
  selectedTour: "",
  preferredDate: "",
  adultsCount: 2,
  childrenCount: 0,
  childrenAges: "",
  guideLanguage: "español",
  needsTransport: false,
  pickupPoint: "",
  medicalConditions: "",
  phone: client?.phone || "",
  observations: "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
  guests: [{ name: client?.name || "", docType: client?.docType || "CC", docNumber: client?.docNumber || "" }],
  vouchers: [],
});

export const INITIAL_CONVENTION = (client?: any): ConventionData => ({
  city: "",
  address: "",
  placeName: "",
  organization: "",
  contactName: client?.name || "",
  startDate: "",
  endDate: "",
  estimatedAttendance: 0,
  requiredSpace: "sala A",
  eventType: "congreso",
  avEquipment: [],
  hasCatering: false,
  cateringNotes: "",
  email: client?.email || "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_RESTAURANT = (client?: any): RestaurantData => ({
  reservationName: client?.name || "",
  dateTime: "",
  peopleCount: 2,
  tablePreference: "interior",
  menuType: "à la carte",
  dietaryRestrictions: [],
  specialOccasion: "cumpleaños",
  phone: client?.phone || "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_VISA = (client?: any): VisaData => ({
  fullName: client?.name || "",
  birthDate: client?.birthDate ? client.birthDate.split('T')[0] : "",
  nationality: "",
  docType: client?.docType || "CC",
  docNumber: client?.docNumber || "",
  passportExpiration: "",
  countryApplying: "",
  visaType: "turista",
  estimatedTravelDate: "",
  email: client?.email || "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_PASSPORT = (client?: any): PassportData => ({
  fullName: client?.name || "",
  idNumber: client?.docNumber || "",
  birthDate: client?.birthDate ? client.birthDate.split('T')[0] : "",
  residenceCity: "",
  processType: "primera vez",
  estimatedTravelDate: "",
  phone: client?.phone || "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_PET_SERVICE = (client?: any): PetServiceData => ({
  ownerName: client?.name || "",
  petName: "",
  species: "perro",
  breed: "",
  weight: 0,
  size: "mediano",
  travelType: "cabina",
  travelDate: "",
  destinationCountry: "",
  medicalConditions: "",
  phone: client?.phone || "",
  transportCompany: "",
  observations: "",
  voucher: undefined,
  sendVoucher: false,
  supplierName: "",
  supplierCost: 0,
  ta: 0,
  taCre: 0,
});

export const INITIAL_FORM: WizardFormData = {
  clientId: "",
  commissionAgentId: "",
  commissionAgentName: "",
  responsableId: "",
  commissionAgentPercentage: "",
  commissionAgentAmount: "",
  commissionAgentRetentionPercentage: "0",
  commissionAgentNetPayment: "0",
  asesorId: "",
  asesorName: "",
  selectedProducts: [],
  observations: "",
  paymentMethod: "",
  payments: [],
  total: "",
  ta: "",
  taCre: "",
  supplierCost: "",
  status: "",
  isCredit: false,
  creditDueDate: "",
  tickets: [],
  hotels: [],
  insurances: [],
  plans: [],
  checkIns: [],
  migrations: [],
  simCards: [],
  baggages: [],
  carRentals: [],
  fincas: [],
  tours: [],
  conventions: [],
  restaurants: [],
  visas: [],
  passports: [],
  petServices: [],
  landTravels: [],
};

/**
 * Mapa de cada categoria de producto a su array en el formulario y a su estado inicial.
 *
 * Este mapeo estaba repetido como un `switch` de 17 casos en cuatro lugares del wizard
 * (leer el vinculo al paquete, escribirlo, "Anadir otro" y agregar un pago al paquete).
 * Cuatro copias del mismo switch es cuatro sitios donde un producto nuevo se olvida.
 *
 * `label` es como lo llama el usuario, con la misma palabra que usa el selector de
 * productos, para que la accion y lo que aparece despues se llamen igual.
 */
export const PRODUCTOS: Record<string, { key: string; label: string; initial: (client?: any) => any }> = {
  tiqueteria:               { key: 'tickets',      label: 'Tiquetería',            initial: INITIAL_TICKET },
  hoteleria:                { key: 'hotels',       label: 'Hotelería',             initial: INITIAL_HOTEL },
  seguros_viaje:            { key: 'insurances',   label: 'Seguro de Viaje',       initial: INITIAL_INSURANCE },
  planes:                   { key: 'plans',        label: 'Paquete',               initial: INITIAL_PLAN },
  checkin:                  { key: 'checkIns',     label: 'Check-in',              initial: INITIAL_CHECKIN },
  documentacion_migratoria: { key: 'migrations',   label: 'Documentación Migratoria', initial: INITIAL_MIGRATION },
  simcard:                  { key: 'simCards',     label: 'SIM Card',              initial: INITIAL_SIMCARD },
  equipaje:                 { key: 'baggages',     label: 'Equipaje',              initial: INITIAL_BAGGAGE },
  renta_vehiculos:          { key: 'carRentals',   label: 'Renta de Vehículo',     initial: INITIAL_CAR_RENTAL },
  viajes_terrestres:        { key: 'landTravels',  label: 'Viaje Terrestre',       initial: INITIAL_LAND_TRAVEL },
  renta_fincas:             { key: 'fincas',       label: 'Renta de Finca',        initial: INITIAL_FINCA },
  tours:                    { key: 'tours',        label: 'Tour',                  initial: INITIAL_TOUR },
  centros_convencion:       { key: 'conventions',  label: 'Centro de Convención',  initial: INITIAL_CONVENTION },
  restaurantes:             { key: 'restaurants',  label: 'Restaurante',           initial: INITIAL_RESTAURANT },
  visa:                     { key: 'visas',        label: 'Visa',                  initial: INITIAL_VISA },
  pasaporte:                { key: 'passports',    label: 'Pasaporte',             initial: INITIAL_PASSPORT },
  servicio_mascotas:        { key: 'petServices',  label: 'Servicio de Mascotas',  initial: INITIAL_PET_SERVICE },
};

/**
 * Los importes de un item del formulario.
 *
 * Un paquete pagado a varios proveedores tiene la plata en `supplierPayments`, no en
 * `supplierCost`: leer el campo suelto dejaba el total de la venta en cero, y con el
 * total en cero el paso de pagos marcaba la venta como pagada sin registrar ningun pago.
 *
 * Existe para que "cuanto cuesta este item" se responda en un solo lugar. Antes estaba
 * escrito a mano en dieciocho lineas del wizard, una por producto, asi que un cambio en
 * donde vive la plata tenia que acertarle a las dieciocho.
 */
export function importesDe(item: any): { supplierCost: number; ta: number; taCre: number } {
  const pagos = Array.isArray(item?.supplierPayments) ? item.supplierPayments : null;
  if (!pagos || pagos.length === 0) {
    return {
      supplierCost: Number(item?.supplierCost) || 0,
      ta: Number(item?.ta) || 0,
      taCre: Number(item?.taCre) || 0,
    };
  }
  const suma = (campo: string) => pagos.reduce((t: number, p: any) => t + (Number(p?.[campo]) || 0), 0);
  return { supplierCost: suma('supplierCost'), ta: suma('ta'), taCre: suma('taCre') };
}

/**
 * Los vinculos a paquetes que hay que reescribir despues de borrar el paquete de la
 * posicion `idx`. Devuelve SOLO los arrays que cambian, para que valga igual en el wizard
 * (que puede escribir el formulario completo) y en el paso de productos (que tiene un
 * setter por clave).
 *
 * `linkedToPlanIndex` es la POSICION del paquete en el array, asi que un `splice` desplaza
 * a los que venian despues y los servicios quedan apuntando al paquete equivocado sin que
 * nada lo detecte. Los que apuntaban al borrado se desvinculan.
 *
 * Lo robusto de verdad seria un id estable en vez de un indice, pero eso cambia el
 * contrato con el backend, que traduce el indice a `parentDetalleId` al guardar.
 */
export function vinculosReindexados(form: Record<string, any>, idx: number): Record<string, any> {
  const cambios: Record<string, any> = {};
  for (const { key } of Object.values(PRODUCTOS)) {
    const items = form[key];
    if (key === 'plans' || !Array.isArray(items)) continue;

    let cambio = false;
    const siguientes = items.map((item: any) => {
      const i = item?.linkedToPlanIndex;
      if (i === undefined || i === null) return item;
      if (i === idx) { cambio = true; return { ...item, linkedToPlanIndex: null }; }
      if (i > idx) { cambio = true; return { ...item, linkedToPlanIndex: i - 1 }; }
      return item;
    });
    if (cambio) cambios[key] = siguientes;
  }
  return cambios;
}
