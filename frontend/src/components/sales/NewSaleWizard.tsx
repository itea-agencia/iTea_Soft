import { useState, useEffect, useRef } from "react";
import {
  User,
  Package,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Link2,
  Plus,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import {
  Sale,
  SaleProductId,
  SALE_PRODUCTS,
} from "../../types";
import {
  HotelForm,
  InsuranceForm,
  CheckInForm,
  PlanForm,
  MigrationForm,
  SimCardForm,
  CarRentalForm,
  FincaForm,
  TourForm,
  ConventionForm,
  RestaurantForm,
  VisaForm,
  PassportForm,
  PetServiceForm,
  BaggageForm,
  TicketForm,
  LandTravelForm,
} from "./forms";
import {
  WizardFormData,
  INITIAL_FORM,
  INITIAL_TICKET,
  INITIAL_LAND_TRAVEL,
  INITIAL_HOTEL,
  INITIAL_INSURANCE,
  INITIAL_PLAN,
  INITIAL_CHECKIN,
  INITIAL_MIGRATION,
  INITIAL_SIMCARD,
  INITIAL_BAGGAGE,
  INITIAL_CAR_RENTAL,
  INITIAL_FINCA,
  INITIAL_TOUR,
  INITIAL_CONVENTION,
  INITIAL_RESTAURANT,
  INITIAL_VISA,
  INITIAL_PASSPORT,
  INITIAL_PET_SERVICE,
  PRODUCTOS, vinculosReindexados, importesDe, estadoDeVenta,
} from "./wizardData";
import { Step1Client } from "./steps/Step1Client";
import { Step2Products } from "./steps/Step2Products";
import { Step3Payment } from "./steps/Step3Payment";
import { todayStr } from "../../utils/formatters";
import { getDaysUntilDue } from "../../utils/creditUtils";
import { findClientById } from "../../utils/clientOptions";
import { validateWizardStep } from "./wizardValidation";
import { listAsesores } from "../../api";
import { Modal } from "../ui/Modal";
import { pendingVoucherWarnings, saleAttachmentsError, saleSuccessMessage, vouchersSentText, VoucherFailure, VoucherIssues } from "../../utils/voucherDelivery";

interface Props {
  onClose: () => void;
  onSuccess: (msg: string, voucherIssues?: VoucherIssues) => void;
}

const STEPS = [
  { id: 1, label: "Cliente", icon: User },
  { id: 2, label: "Productos", icon: Package },
  { id: 3, label: "Pago", icon: CreditCard },
] as const;

export default function NewSaleWizard({ onClose, onSuccess }: Props) {
  const { data, addSale, fetchClients, fetchCommissionAgentsForSale, fetchResponsables } = useData();
  const { user } = useAuth();
  const [voucherWarnings, setVoucherWarnings] = useState<VoucherFailure[]>([]);

  // v3: desde el hallazgo 4, clientId guarda el id; un borrador v2 guarda el nombre y se descarta.
  const draftKey = `itea_new_sale_draft_v3_${user?.id || 'unknown'}`;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardFormData>(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_FORM, ...parsed };
      } catch (e) {
        return INITIAL_FORM;
      }
    }
    return {
      ...INITIAL_FORM,
      asesorId: user?.id ? String(user.id) : "",
      asesorName: user?.name || "",
    };
  });
  const [showOtherProducts, setShowOtherProducts] = useState(false);
  const [activeForm, setActiveForm] = useState<SaleProductId | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 4000);
  };

  // Saber si el formulario de tiquetería está completamente vacío (sin tocar)
  const isTicketFormEmpty = (() => {
    if (activeForm === "tiqueteria" && activeIdx !== null) {
      const ticket = form.tickets[activeIdx];
      if (!ticket) return true;
      
      const hasAirline = !!ticket.airline?.trim();
      const hasSupplier = !!ticket.supplier?.trim();
      const hasResNumber = !!ticket.reservationNumber?.trim();
      const paxList = ticket.passengers || ((ticket as any).passengerInfo ? [(ticket as any).passengerInfo] : []);
      const titular = paxList.find((p: any) => p.esTitular) || paxList[0];
      const hasTicketNumber = titular ? !!titular.nroTiquete?.trim() : false;
      const hasCost = ticket.supplierCost > 0;
      const hasTa = ticket.ta > 0;
      
      // Comprobar si hay tramos con texto
      let hasLegsContent = false;
      if (ticket.legs && ticket.legs.length > 0) {
        hasLegsContent = ticket.legs.some(leg => 
          !!leg.origin?.trim() || !!leg.destination?.trim() || !!leg.flightNumber?.trim() || !!leg.seat?.trim() || !!leg.date?.trim() || !!leg.arrivalDate?.trim()
        );
      }
      
      // Comprobar escalas
      let hasStopsContent = false;
      if (ticket.outboundStops && ticket.outboundStops.length > 0) {
        hasStopsContent = ticket.outboundStops.some(stop =>
          !!stop.origin?.trim() || !!stop.destination?.trim() || !!stop.flightNumber?.trim() || !!stop.seat?.trim() || !!stop.date?.trim() || !!stop.arrivalDate?.trim()
        );
      }
      
      // Comprobar regreso
      let hasReturnContent = false;
      if (ticket.returnLeg) {
        const ret = ticket.returnLeg;
        hasReturnContent = !!ret.origin?.trim() || !!ret.destination?.trim() || !!ret.flightNumber?.trim() || !!ret.seat?.trim() || !!ret.date?.trim() || !!ret.arrivalDate?.trim();
      }
      
      let hasReturnStopsContent = false;
      if (ticket.returnStops && ticket.returnStops.length > 0) {
        hasReturnStopsContent = ticket.returnStops.some(stop =>
          !!stop.origin?.trim() || !!stop.destination?.trim() || !!stop.flightNumber?.trim() || !!stop.seat?.trim() || !!stop.date?.trim() || !!stop.arrivalDate?.trim()
        );
      }

      return !(hasAirline || hasSupplier || hasResNumber || hasTicketNumber || hasCost || hasTa || hasLegsContent || hasStopsContent || hasReturnContent || hasReturnStopsContent);
    }
    return false;
  })();

  const isHotelFormEmpty = (() => {
    if (activeForm === "hoteleria" && activeIdx !== null) {
      const hotel = form.hotels[activeIdx];
      if (!hotel) return true;
      const hasHotelName = !!hotel.hotelName?.trim();
      const hasDestination = !!hotel.destination?.trim();
      const hasSupplier = !!hotel.supplier?.trim();
      const hasReservationNumber = !!hotel.reservationNumber?.trim();
      const hasStartDate = !!hotel.startDate?.trim();
      const hasEndDate = !!hotel.endDate?.trim();
      const hasHotelType = !!hotel.hotelType?.trim();
      const hasObservations = !!hotel.observations?.trim();
      const hasCost = hotel.supplierCost > 0;
      const hasTa = hotel.ta > 0;
      
      // Ignore initial prefilled passenger in guests list for empty check
      const client = findClientById(data.clients, form.clientId);
      const initialGuestName = client?.name || "";
      const initialGuestDoc = client?.docNumber || "";
      
      const hasGuests = hotel.guests && hotel.guests.some(g => {
        if (g.name === initialGuestName && g.docNumber === initialGuestDoc) {
          return false;
        }
        return !!g.name?.trim() || !!g.docNumber?.trim();
      });

      return !(hasHotelName || hasDestination || hasSupplier || hasReservationNumber || hasStartDate || hasEndDate || hasHotelType || hasObservations || hasCost || hasTa || hasGuests);
    }
    return false;
  })();

  const isInsuranceFormEmpty = (() => {
    if (activeForm === "seguros_viaje" && activeIdx !== null) {
      const ins = form.insurances[activeIdx];
      if (!ins) return true;
      const hasInsuranceType = !!ins.insuranceType?.trim();
      const hasPhone = !!ins.phone?.trim();
      const hasSupplier = !!ins.supplier?.trim();
      const hasCost = ins.supplierCost > 0;
      const hasTa = ins.ta > 0;
      
      const client = findClientById(data.clients, form.clientId);
      const initialMemberName = client?.name || "";
      const initialMemberDoc = client?.docNumber || "";
      
      const hasMembers = ins.members && ins.members.some(m => {
        if (m.name === initialMemberName && m.docNumber === initialMemberDoc) {
          return false;
        }
        return !!m.name?.trim() || !!m.docNumber?.trim();
      });

      return !(hasInsuranceType || hasPhone || hasSupplier || hasCost || hasTa || hasMembers);
    }
    return false;
  })();

  const actions = {
    showOtherProducts,
    setShowOtherProducts,
    activeForm,
    activeIdx,
    openForm: (type: SaleProductId, idx: number) => {
      setActiveForm(type);
      setActiveIdx(idx);
    },
  };

  const getCurrentItemLinkedPlanIndex = () => {
    if (!activeForm || activeIdx === null || activeForm === 'planes') return '';
    let targetKey: string | null = null;
    switch (activeForm) {
      case "tiqueteria": targetKey = "tickets"; break;
      case "hoteleria": targetKey = "hotels"; break;
      case "seguros_viaje": targetKey = "insurances"; break;
      case "checkin": targetKey = "checkIns"; break;
      case "documentacion_migratoria": targetKey = "migrations"; break;
      case "simcard": targetKey = "simCards"; break;
      case "renta_vehiculos": targetKey = "carRentals"; break;
      case "viajes_terrestres": targetKey = "landTravels"; break;
      case "renta_fincas": targetKey = "fincas"; break;
      case "tours": targetKey = "tours"; break;
      case "centros_convencion": targetKey = "conventions"; break;
      case "restaurantes": targetKey = "restaurants"; break;
      case "visa": targetKey = "visas"; break;
      case "pasaporte": targetKey = "passports"; break;
      case "servicio_mascotas": targetKey = "petServices"; break;
    }
    if (targetKey) {
      const items = (form as any)[targetKey];
      const currentItem = items?.[activeIdx];
      return currentItem?.linkedToPlanIndex !== undefined && currentItem?.linkedToPlanIndex !== null ? String(currentItem.linkedToPlanIndex) : '';
    }
    return '';
  };

  const setCurrentItemLinkedPlanIndex = (val: string) => {
    if (!activeForm || activeIdx === null || activeForm === 'planes') return;
    let targetKey: string | null = null;
    switch (activeForm) {
      case "tiqueteria": targetKey = "tickets"; break;
      case "hoteleria": targetKey = "hotels"; break;
      case "seguros_viaje": targetKey = "insurances"; break;
      case "checkin": targetKey = "checkIns"; break;
      case "documentacion_migratoria": targetKey = "migrations"; break;
      case "simcard": targetKey = "simCards"; break;
      case "renta_vehiculos": targetKey = "carRentals"; break;
      case "viajes_terrestres": targetKey = "landTravels"; break;
      case "renta_fincas": targetKey = "fincas"; break;
      case "tours": targetKey = "tours"; break;
      case "centros_convencion": targetKey = "conventions"; break;
      case "restaurantes": targetKey = "restaurants"; break;
      case "visa": targetKey = "visas"; break;
      case "pasaporte": targetKey = "passports"; break;
      case "servicio_mascotas": targetKey = "petServices"; break;
    }
    if (targetKey) {
      const items = [...((form as any)[targetKey] || [])];
      if (items[activeIdx]) {
        items[activeIdx] = { ...items[activeIdx], linkedToPlanIndex: val === '' ? null : Number(val) };
        setForm(prev => ({ ...prev, [targetKey!]: items }));
      }
    }
  };

  useEffect(() => {
    try {
      // El borrador es para no perder lo tipeado, sin los adjuntos: los vouchers en base64 son
      // datos de clientes y llenaban la cuota hasta que el guardado fallaba.
      localStorage.setItem(draftKey, JSON.stringify(form, (k, v) => (k === 'voucher' || k === 'vouchers' ? undefined : v)));
    } catch (error) {
      console.warn("No se pudo guardar el borrador en localStorage (probablemente los archivos adjuntos son muy grandes):", error);
    }
  }, [form]);

  // Fetch data needed for comboboxes to ensure freshness
  useEffect(() => {
    fetchClients();
    fetchCommissionAgentsForSale();
    fetchResponsables();
  }, [fetchClients, fetchCommissionAgentsForSale, fetchResponsables]);

  // Los asesores salen de /users/asesores y no de data.users: ese viene de GET /users, que exige
  // users.view, y para un asesor la lista quedaba vacia. Si falla, la lista queda vacia y el
  // paso 1 pide elegir un asesor de la lista.
  const [asesores, setAsesores] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    listAsesores().then(setAsesores).catch(() => setAsesores([]));
  }, []);

  // Compute Totals Automatically
  useEffect(() => {
    let calcSupplierCost = 0;
    let calcTa = 0;
    let calcTaCre = 0;

    // Se recorre PRODUCTOS y no una linea por producto escrita a mano: eran diecisiete
    // lineas casi identicas, y cuando la plata de un paquete se movio a
    // `supplierPayments` habia que acertarle a todas. `importesDe` lo responde en un
    // solo lugar.
    for (const { key } of Object.values(PRODUCTOS)) {
      for (const item of (((form as any)[key] || []) as any[])) {
        const imp = importesDe(item);
        calcSupplierCost += imp.supplierCost;
        calcTa += imp.ta;
        calcTaCre += imp.taCre;
      }
    }

    const calcTotal = calcSupplierCost + calcTa + calcTaCre;

    if (
      form.supplierCost !== calcSupplierCost.toString() ||
      form.ta !== calcTa.toString() ||
      form.taCre !== calcTaCre.toString() ||
      form.total !== calcTotal.toString()
    ) {
      setForm(prev => {
        const commPercentage = parseFloat(prev.commissionAgentPercentage || "0");
        const newCommAmount = (calcTa + calcTaCre) * (commPercentage / 100);
        const retention = parseFloat(prev.commissionAgentRetentionPercentage || "0");
        const newCommNet = newCommAmount * (1 - retention / 100);
        
        return {
          ...prev,
          supplierCost: calcSupplierCost.toString(),
          ta: calcTa.toString(),
          taCre: calcTaCre.toString(),
          total: calcTotal.toString(),
          commissionAgentAmount: newCommAmount.toString(),
          commissionAgentNetPayment: newCommNet.toString()
        };
      });
    }
  }, [
    form.tickets, form.hotels, form.insurances, form.plans, form.checkIns,
    form.migrations, form.simCards, form.baggages, form.carRentals, form.landTravels, form.fincas, form.tours,
    form.conventions, form.restaurants, form.visas, form.passports, form.petServices
  ]);

  /* ---- helpers --------------------------------------------------- */
  const set = <K extends keyof WizardFormData>(
    key: K,
    value: WizardFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    
    // Clear or update validation errors in real time
    if (key === "creditDueDate") {
      const dateStr = value as string;
      if (dateStr) {
        // Por dia de Colombia: new Date('YYYY-MM-DD') es medianoche UTC, que en hora local cae
        // el dia anterior, y elegir hoy daba "anterior al dia de hoy".
        if (getDaysUntilDue(dateStr) < 0) {
          setErrors((prev) => ({ ...prev, creditDueDate: "La fecha de vencimiento no puede ser anterior al día de hoy" }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.creditDueDate;
            return next;
          });
        }
      } else {
        setErrors((prev) => ({ ...prev, creditDueDate: "La fecha de vencimiento es obligatoria" }));
      }
    } else if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const toggleProduct = (id: SaleProductId) => {
    setForm((prev) => {
      const isSelecting = !prev.selectedProducts.includes(id);
      const nextProducts = isSelecting
        ? [...prev.selectedProducts, id]
        : prev.selectedProducts.filter((p) => p !== id);
      return { ...prev, selectedProducts: nextProducts };
    });
  };

  /* ---- navigation ------------------------------------------------ */
  const validateStep = (s: number) => {
    const { errors: errs, message } = validateWizardStep(s, form, data, asesores);
    if (message) triggerError(message);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };
  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const closeActiveForm = () => {
    if (activeForm && activeIdx !== null) {
      let targetKey: string | null = null;
      switch (activeForm) {
        case "tiqueteria": targetKey = "tickets"; break;
        case "hoteleria": targetKey = "hotels"; break;
        case "seguros_viaje": targetKey = "insurances"; break;
        case "planes": targetKey = "plans"; break;
        case "checkin": targetKey = "checkIns"; break;
        case "documentacion_migratoria": targetKey = "migrations"; break;
        case "simcard": targetKey = "simCards"; break;
        case "equipaje": targetKey = "baggages"; break;
        case "renta_vehiculos": targetKey = "carRentals"; break;
      case "viajes_terrestres": targetKey = "landTravels"; break;
        case "renta_fincas": targetKey = "fincas"; break;
        case "tours": targetKey = "tours"; break;
        case "centros_convencion": targetKey = "conventions"; break;
        case "restaurantes": targetKey = "restaurants"; break;
        case "visa": targetKey = "visas"; break;
        case "pasaporte": targetKey = "passports"; break;
        case "servicio_mascotas": targetKey = "petServices"; break;
      }

      if (targetKey) {
        const items = (form as any)[targetKey] || [];
        const currentItem = items[activeIdx];
        if (currentItem && isItemEmpty(currentItem, activeForm)) {
          const nextItems = [...items];
          nextItems.splice(activeIdx, 1);
          
          setForm(prev => {
            // Borrar un paquete desplaza a los que venian despues, y los servicios
            // vinculados apuntan por posicion: sin esto quedarian en el paquete de al lado.
            const updatedForm: any = {
              ...prev,
              [targetKey!]: nextItems,
              ...(targetKey === 'plans' ? vinculosReindexados({ ...prev, plans: nextItems }, activeIdx) : {}),
            };
            if (nextItems.length === 0) {
              updatedForm.selectedProducts = prev.selectedProducts.filter((p: any) => p !== activeForm);
            }
            return updatedForm;
          });
        }
      }
    }
    setActiveForm(null);
    setActiveIdx(null);
  };

  const renderActiveForm = () => {
    if (!activeForm || activeIdx === null) return null;

    const product = SALE_PRODUCTS.find((p) => p.id === activeForm);
    const client = findClientById(data.clients, form.clientId);

    return (
      <form 
        className="flex flex-col flex-1 min-h-0 bg-white animate-fade-in"
        onSubmit={(e) => { 
          e.preventDefault(); 
          if (activeForm === "planes" && activeIdx !== null) {
            const plan = form.plans[activeIdx];
            const errors: string[] = [];
            if (!plan) errors.push("Plan inválido");
            else {
              if (!plan.planName || plan.planName.trim().length > 50) errors.push("Nombre del Plan (máx 50 chars)");
              if (plan.packageType !== "supplier") {
                if (!plan.hotelName || plan.hotelName.trim().length < 2 || plan.hotelName.trim().length > 50) errors.push("Nombre del Hotel (2-50 chars)");
                if (plan.adultsCount === undefined || plan.adultsCount < 0 || plan.adultsCount > 999) errors.push("Adultos (0-999)");
                if (plan.childrenCount === undefined || plan.childrenCount < 0 || plan.childrenCount > 999) errors.push("Menores (0-999)");
                
                if (!plan.flightNumber || plan.flightNumber.trim().length === 0) {
                  errors.push(plan.transportType === 'Terrestre' ? "Placa del Vehículo de ida (requerido)" : "Número de Vuelo de ida (requerido)");
                } else if (plan.transportType !== 'Terrestre') {
                  if (plan.flightNumber.length > 12) {
                    errors.push("Número de Vuelo de ida (máx 12 caracteres)");
                  } else if (!/^[A-Z0-9-]+$/.test(plan.flightNumber)) {
                    errors.push("Número de Vuelo de ida (debe ser alfanumérico en mayúsculas)");
                  }
                }

                // El vuelo de regreso no se exige aunque haya fecha de regreso: el numero
                // puede llegar despues, igual que el booking y el tiquete. Solo se valida
                // el formato si viene.
                if (plan.flightReturnNumber && plan.transportType !== 'Terrestre') {
                  if (plan.flightReturnNumber.length > 12) {
                    errors.push("Número de Vuelo de regreso (máx 12 caracteres)");
                  } else if (!/^[A-Z0-9-]+$/.test(plan.flightReturnNumber)) {
                    errors.push("Número de Vuelo de regreso (debe ser alfanumérico en mayúsculas)");
                  }
                }
                
                // El booking y el tiquete son de cada integrante y son opcionales: llegan
                // dias despues de vender. La Ref. Hotel tambien, y su formato ya no exige
                // 6 caracteres, que rechazaba el valor real del hotel (PH_3510R-1).
                if (plan.hotelReference && !/^[A-Z0-9_-]{3,20}$/.test(plan.hotelReference)) {
                  errors.push("Ref. Hotel (3-20 caracteres: letras, números, guion o guion bajo)");
                }
                if (plan.flightReservationNumber && !/^[A-Z0-9_-]{3,20}$/.test(plan.flightReservationNumber)) {
                  errors.push("N° de Reserva del transporte (3-20 caracteres: letras, números, guion o guion bajo)");
                }
                
                if (!plan.flightDepartureDate) errors.push("Fecha Ida (requerido)");
                if (!plan.flightReturnDate) errors.push("Fecha Vuelta (requerido)");
                if (!plan.startDate) errors.push("Ingreso Hotel (requerido)");
                if (!plan.endDate) errors.push("Salida Hotel (requerido)");
                if (!plan.flightDepartureArrivalDate) errors.push("Llegada Ida (requerido)");
                if (!plan.flightReturnArrivalDate) errors.push("Llegada Vuelta (requerido)");

                const now = new Date();
                now.setHours(0, 0, 0, 0);
                if (plan.flightDepartureDate && new Date(plan.flightDepartureDate) < now) errors.push("Fecha Ida no puede ser anterior a la fecha actual");
                if (plan.flightReturnDate && new Date(plan.flightReturnDate) < now) errors.push("Fecha Vuelta no puede ser anterior a la fecha actual");
                if (plan.startDate && new Date(plan.startDate) < now) errors.push("Ingreso Hotel no puede ser anterior a la fecha actual");
                if (plan.endDate && new Date(plan.endDate) < now) errors.push("Salida Hotel no puede ser anterior a la fecha actual");
                if (plan.flightDepartureArrivalDate && new Date(plan.flightDepartureArrivalDate) < now) errors.push("Llegada Ida no puede ser anterior a la fecha actual");
                if (plan.flightReturnArrivalDate && new Date(plan.flightReturnArrivalDate) < now) errors.push("Llegada Vuelta no puede ser anterior a la fecha actual");

                if (plan.flightDepartureDate && plan.flightDepartureArrivalDate && new Date(plan.flightDepartureArrivalDate) < new Date(plan.flightDepartureDate)) {
                  errors.push("Llegada Ida debe ser posterior a la Fecha Ida");
                }
                if (plan.flightReturnDate && plan.flightReturnArrivalDate && new Date(plan.flightReturnArrivalDate) < new Date(plan.flightReturnDate)) {
                  errors.push("Llegada Vuelta debe ser posterior a la Fecha Vuelta");
                }
                if (plan.flightDepartureDate && plan.flightReturnDate && new Date(plan.flightReturnDate) < new Date(plan.flightDepartureDate)) {
                  errors.push("Fecha Vuelta debe ser posterior a la Fecha Ida");
                }
                if (plan.startDate && plan.endDate && new Date(plan.endDate) < new Date(plan.startDate)) {
                  errors.push("Salida Hotel debe ser posterior al Ingreso Hotel");
                }
              } else {
                // Voucher is optional now
              }

              const pagosDelPlan = plan.supplierPayments || [];
              if (pagosDelPlan.length > 0) {
                // Con pagos, el costo del paquete es su suma. Lo que hay que exigir es que
                // cada pago con dinero tenga proveedor: la linea IT de Siigo lleva el
                // Tercero y sin el la factura se rechaza. Mejor avisarlo al guardar que
                // descubrirlo al facturar.
                pagosDelPlan.forEach((pg, i) => {
                  const monto = (Number(pg.supplierCost) || 0) + (Number(pg.ta) || 0) + (Number(pg.taCre) || 0);
                  if (monto > 0 && !pg.supplier?.trim()) {
                    errors.push(`Pago a proveedor #${i + 1}: falta el proveedor`);
                  }
                  if ((Number(pg.supplierCost) || 0) < 0 || (Number(pg.ta) || 0) < 0 || (Number(pg.taCre) || 0) < 0) {
                    errors.push(`Pago a proveedor #${i + 1}: los valores no pueden ser negativos`);
                  }
                });
              } else if (!(Number(plan.supplierCost) > 0 || Number(plan.ta) > 0 || Number(plan.taCre) > 0)) {
                // El bloque de un solo proveedor se retiro del formulario: el costo del
                // paquete son sus pagos. Un paquete sin ninguno no tiene costo, que
                // practicamente siempre es un olvido. Un paquete viejo que trae el costo
                // de la forma anterior sigue pasando, para no bloquear su edicion.
                errors.push("Pagos a proveedores (agregá al menos uno)");
              }

              if (plan.guests && plan.guests.length > 0) {
                plan.guests.forEach((g, gIdx) => {
                  if (!g.name || g.name.trim().length < 3 || g.name.trim().length > 70) {
                    errors.push(`Integrante #${gIdx + 1}: Nombre Completo (3-70 caracteres)`);
                  } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(g.name)) {
                    errors.push(`Integrante #${gIdx + 1}: Nombre Completo solo permite letras y espacios`);
                  }
                  if (!g.docType || g.docType.trim().length === 0) {
                    errors.push(`Integrante #${gIdx + 1}: Tipo de Documento es requerido`);
                  }
                  if (!g.docNumber || g.docNumber.trim().length < 5 || g.docNumber.trim().length > 20) {
                    errors.push(`Integrante #${gIdx + 1}: Número de Documento (5-20 caracteres)`);
                  } else if (/[^a-zA-Z0-9]/.test(g.docNumber)) {
                    errors.push(`Integrante #${gIdx + 1}: Número de Documento debe ser alfanumérico`);
                  }
                  // Opcionales, pero si vienen tienen que tener forma valida.
                  if (g.nroReserva && !/^[A-Z0-9_-]{1,20}$/.test(g.nroReserva)) {
                    errors.push(`Integrante #${gIdx + 1}: Booking (máx 20, alfanumérico)`);
                  }
                  if (g.nroTiquete && !/^[A-Z0-9]{8,20}$/.test(g.nroTiquete)) {
                    errors.push(`Integrante #${gIdx + 1}: N° Tiquete (8-20 alfanumérico)`);
                  }
                });
                if (plan.guests.filter((g) => g.esTitular).length > 1) {
                  errors.push("Solo puede haber un titular entre los integrantes");
                }
              } else {
                errors.push("Debes registrar al menos un integrante en el plan");
              }
            }
            if (errors.length > 0) {
              triggerError(`El servicio de Paquetes #${activeIdx + 1} tiene errores: ${errors.join(", ")}`);
              return;
            }
          }
          closeActiveForm(); 
        }}
      >
        {/* Sub-form Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-border dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={closeActiveForm}
              className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-600 dark:text-slate-300"
            >
              <ChevronLeft size={18} className="sm:hidden" />
              <ChevronLeft size={20} className="hidden sm:block" />
            </button>
            <div>
              <h3 className="font-bold text-primary dark:text-teal-400 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                {product?.label}
                <span className="text-[10px] sm:text-xs font-normal text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                  Item #{activeIdx + 1}
                </span>
              </h3>
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-slate-400 hidden sm:block">
                Completa la información detallada del servicio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!activeForm) return;
                let targetKey: string | null = null;
                let initialFn: any = null;
                switch (activeForm) {
                  case "tiqueteria": targetKey = "tickets"; initialFn = INITIAL_TICKET; break;
                  case "hoteleria": targetKey = "hotels"; initialFn = INITIAL_HOTEL; break;
                  case "seguros_viaje": targetKey = "insurances"; initialFn = INITIAL_INSURANCE; break;
                  case "planes": targetKey = "plans"; initialFn = INITIAL_PLAN; break;
                  case "checkin": targetKey = "checkIns"; initialFn = INITIAL_CHECKIN; break;
                  case "documentacion_migratoria": targetKey = "migrations"; initialFn = INITIAL_MIGRATION; break;
                  case "simcard": targetKey = "simCards"; initialFn = INITIAL_SIMCARD; break;
                  case "equipaje": targetKey = "baggages"; initialFn = INITIAL_BAGGAGE; break;
                  case "renta_vehiculos": targetKey = "carRentals"; initialFn = INITIAL_CAR_RENTAL; break;
                  case "viajes_terrestres": targetKey = "landTravels"; initialFn = INITIAL_LAND_TRAVEL; break;
                  case "renta_fincas": targetKey = "fincas"; initialFn = INITIAL_FINCA; break;
                  case "tours": targetKey = "tours"; initialFn = INITIAL_TOUR; break;
                  case "centros_convencion": targetKey = "conventions"; initialFn = INITIAL_CONVENTION; break;
                  case "restaurantes": targetKey = "restaurants"; initialFn = INITIAL_RESTAURANT; break;
                  case "visa": targetKey = "visas"; initialFn = INITIAL_VISA; break;
                  case "pasaporte": targetKey = "passports"; initialFn = INITIAL_PASSPORT; break;
                  case "servicio_mascotas": targetKey = "petServices"; initialFn = INITIAL_PET_SERVICE; break;
                }
                if (targetKey && initialFn) {
                  const client = findClientById(data.clients, form.clientId);
                  const currentItems = (form as any)[targetKey] || [];
                  const newItem = initialFn(client);
                  const nextItems = [...currentItems, newItem];
                  setForm((prev: any) => ({ ...prev, [targetKey!]: nextItems }));
                  setActiveIdx(nextItems.length - 1);
                }
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Añadir otro
            </button>
            <Button 
              type="submit"
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm px-3 sm:px-4 py-1.5"
            disabled={(() => {
              if (!activeForm || activeIdx === null) return false;
              if (activeForm === "tiqueteria") return isTicketFormEmpty;
              if (activeForm === "hoteleria") return isHotelFormEmpty;
              if (activeForm === "seguros_viaje") return isInsuranceFormEmpty;
              
              // Generic fallback checking for all other forms
              let targetKey: string | null = null;
              switch (activeForm) {
                case "planes": targetKey = "plans"; break;
                case "checkin": targetKey = "checkIns"; break;
                case "documentacion_migratoria": targetKey = "migrations"; break;
                case "simcard": targetKey = "simCards"; break;
                case "equipaje": targetKey = "baggages"; break;
                case "renta_vehiculos": targetKey = "carRentals"; break;
      case "viajes_terrestres": targetKey = "landTravels"; break;
                case "renta_fincas": targetKey = "fincas"; break;
                case "tours": targetKey = "tours"; break;
                case "centros_convencion": targetKey = "conventions"; break;
                case "restaurantes": targetKey = "restaurants"; break;
                case "visa": targetKey = "visas"; break;
                case "pasaporte": targetKey = "passports"; break;
                case "servicio_mascotas": targetKey = "petServices"; break;
              }
              if (targetKey) {
                const items = (form as any)[targetKey] || [];
                const currentItem = items[activeIdx];
                return isItemEmpty(currentItem, activeForm);
              }
              return false;
            })()}
          >
            Listo
          </Button>
          </div>
        </div>

        {/* Sub-form Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-8 bg-gray-light/30 dark:bg-slate-900/50">
          <div className="max-w-3xl mx-auto space-y-6">

            {activeForm !== "planes" && form.plans.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm animate-fade-in mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 size={16} className="text-primary" />
                  <h4 className="text-sm font-bold text-gray-800 dark:text-slate-200">Vincular a Paquete</h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Si este servicio pertenece a un paquete de esta misma venta, selecciónalo aquí para agruparlos.</p>
                <select 
                  className="w-full text-sm p-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                  value={getCurrentItemLinkedPlanIndex()}
                  onChange={e => setCurrentItemLinkedPlanIndex(e.target.value)}
                >
                  <option value="">-- No vincular a ningún paquete --</option>
                  {form.plans.map((p, idx) => (
                    <option key={idx} value={idx}>
                      Paquete #{idx + 1}: {p.planName || p.packageName || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </div>
            )}

        {(() => {
          switch (activeForm) {
            case "tiqueteria":
              return (
                <TicketForm
                  ticket={form.tickets[activeIdx] || INITIAL_TICKET(client)}
                  mainClient={client}
                  onChange={(updates) => {
                    const next = [...form.tickets];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("tickets", next);
                  }}
                  airlines={data.config.airlines}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  airports={data.config.airports}
                  baggage={data.config.baggage}
                  clients={data.clients}
                  triggerError={triggerError}
                  showErrors={!!errors.tiqueteriaValidation}
                />
              );
            case "hoteleria":
              return (
                <HotelForm
                  hotel={form.hotels[activeIdx] || INITIAL_HOTEL(client)}
                  mainClient={client}
                  onChange={(updates) => {
                    const next = [...form.hotels];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("hotels", next);
                  }}
                  data={data}
                  triggerError={triggerError}
                />
              );
            case "seguros_viaje":
              return (
                <InsuranceForm
                  insurance={form.insurances[activeIdx] || INITIAL_INSURANCE(client)}
                  onChange={(updates) => {
                    const next = [...form.insurances];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("insurances", next);
                  }}
                  data={data}
                  client={client}
                />
              );
            case "planes":
              return (
                <PlanForm
                  plan={form.plans[activeIdx] || INITIAL_PLAN(client)}
                  mainClient={client}
                  onChange={(updates) => {
                    const next = [...form.plans];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("plans", next);
                  }}
                  data={data}
                  triggerError={triggerError}
                />
              );
            case "checkin":
              return (
                <CheckInForm
                  checkIn={form.checkIns[activeIdx] || INITIAL_CHECKIN(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  baggage={data.config.baggage}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.checkIns];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("checkIns", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "documentacion_migratoria":
              return (
                <MigrationForm
                  migration={form.migrations[activeIdx] || INITIAL_MIGRATION(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.migrations];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("migrations", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "simcard":
              return (
                <SimCardForm
                  sim={form.simCards[activeIdx] || INITIAL_SIMCARD(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.simCards];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("simCards", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "renta_vehiculos":
              return (
                <CarRentalForm
                  car={form.carRentals[activeIdx] || INITIAL_CAR_RENTAL(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.carRentals];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("carRentals", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "viajes_terrestres":
              return (
                <LandTravelForm
                  travel={form.landTravels[activeIdx] || INITIAL_LAND_TRAVEL(client)}
                  client={client}
                  clients={data.clients}
                  documentTypes={data.config.documentTypes}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.landTravels];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("landTravels", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "renta_fincas":
              return (
                <FincaForm
                  showErrors={!!errors.fincaValidation}
                  finca={form.fincas[activeIdx] || INITIAL_FINCA(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.fincas];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("fincas", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "tours":
              return (
                <TourForm
                  showErrors={!!errors.tourValidation}
                  tour={form.tours[activeIdx] || INITIAL_TOUR(client)}
                  mainClient={client}
                  data={data}
                  onChange={(updates) => {
                    const next = [...form.tours];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("tours", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "centros_convencion":
              return (
                <ConventionForm
                  showErrors={!!errors.conventionValidation}
                  convention={form.conventions[activeIdx] || INITIAL_CONVENTION(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.conventions];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("conventions", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "restaurantes":
              return (
                <RestaurantForm
                  restaurant={form.restaurants[activeIdx] || INITIAL_RESTAURANT(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.restaurants];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("restaurants", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "visa":
              return (
                <VisaForm
                  visa={form.visas[activeIdx] || INITIAL_VISA(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.visas];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("visas", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "pasaporte":
              return (
                <PassportForm
                  passport={form.passports[activeIdx] || INITIAL_PASSPORT(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.passports];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("passports", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "servicio_mascotas":
              return (
                <PetServiceForm
                  showErrors={!!errors.petValidation}
                  pet={form.petServices[activeIdx] || INITIAL_PET_SERVICE(client)}
                  client={client}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.petServices];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("petServices", next);
                  }}
                  triggerError={triggerError}
                />
              );
            case "equipaje":
              return (
                <BaggageForm
                  baggage={form.baggages[activeIdx] || INITIAL_BAGGAGE(client)}
                  client={client}
                  airlines={data.config.airlines}
                  suppliers={data.config.suppliers}
                  paymentMethods={data.config.cards}
                  onChange={(updates) => {
                    const next = [...form.baggages];
                    next[activeIdx] = { ...next[activeIdx], ...updates };
                    set("baggages", next);
                  }}
                  triggerError={triggerError}
                />
              );

            default:
              return null;
          }
        })()}
          </div>
        </div>
      </form>
    );
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) {
      console.warn("⚠️ Validación falló en Paso 1");
      triggerError("Por favor revisa los datos del cliente en el Paso 1.");
      setStep(1);
      return;
    }
    if (!validateStep(2)) {
      console.warn("⚠️ Validación falló en Paso 2");
      triggerError("Por favor revisa la configuración de los productos seleccionados en el Paso 2.");
      setStep(2);
      return;
    }
    if (!validateStep(3)) {
      console.warn("⚠️ Validación falló en Paso 3. Errores:", errors);
      triggerError("Por favor revisa el estado y la fecha de vencimiento en el Paso 3.");
      return;
    }
    if (isSubmittingRef.current) return;
    const attachmentsError = saleAttachmentsError(form);
    if (attachmentsError) {
      triggerError(attachmentsError);
      return;
    }
    const warnings = pendingVoucherWarnings(form, findClientById(data.clients, form.clientId)?.email);
    if (warnings.length > 0) {
      setVoucherWarnings(warnings);
      return;
    }
    await submitSale();
  };

  const submitSale = async () => {
    setVoucherWarnings([]);
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const client = findClientById(data.clients, form.clientId);
    if (!client) {
      console.warn("⚠️ Cliente no encontrado:", form.clientId);
      triggerError("El cliente seleccionado no es válido.");
      setErrors({ ...errors, clientId: "El cliente no es válido" });
      setStep(1);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const fullObservations = form.observations.trim();

    const mappedTickets = form.tickets.map(t => {
      return {
        ...t,
        seatNumber: t.legs && t.legs.length > 0 ? t.legs[0].seat : ""
      };
    });

    const calculatedPaymentMethod = form.payments && form.payments.length > 0
      ? (form.payments.length === 1 ? form.payments[0].methodName : "Mixto")
      : form.paymentMethod;

    const mappedInsurances = form.insurances.map(ins => ({
      ...ins,
      phone: ins.phone ? ins.phone.replace(/\D/g, "") : ""
    }));

    const saleData: any = {
      clientId: client.id,
      clientName: client.name,
      // Sin respaldo a user.id: un asesor vacio se convertia en silencio en quien estaba
      // logueado. El paso 1 ya exige uno de la lista.
      asesorId: Number(form.asesorId),
      date: todayStr(),
      total: Number(form.total),
      paymentMethod: calculatedPaymentMethod,
      payments: form.payments?.map(p => ({
        amount: Number(p.amount),
        method: p.methodId,
        reference: p.reference
      })),
      responsableId: form.responsableId ? Number(form.responsableId) : undefined,
      observations: fullObservations,
      products: form.selectedProducts,
      ticketData: mappedTickets.length > 0 ? mappedTickets : undefined,
      hotelData: form.hotels.length > 0 ? form.hotels : undefined,
      insuranceData: mappedInsurances.length > 0 ? mappedInsurances : undefined,
      planData: form.plans.length > 0 ? form.plans : undefined,
      checkInData: form.checkIns.length > 0 ? form.checkIns : undefined,
      migrationData: form.migrations.length > 0 ? form.migrations : undefined,
      simCardData: form.simCards.length > 0 ? form.simCards : undefined,
      baggageData: form.baggages.length > 0 ? form.baggages : undefined,
      carRentalData: form.carRentals.length > 0 ? form.carRentals : undefined,
      landTravelData: form.landTravels.length > 0 ? form.landTravels : undefined,
      fincaData: form.fincas.length > 0 ? form.fincas : undefined,
      tourData: form.tours.length > 0 ? form.tours : undefined,
      conventionData: form.conventions.length > 0 ? form.conventions : undefined,
      restaurantData: form.restaurants.length > 0 ? form.restaurants : undefined,
      visaData: form.visas.length > 0 ? form.visas : undefined,
      passportData: form.passports.length > 0 ? form.passports : undefined,
      petServiceData: form.petServices.length > 0 ? form.petServices : undefined,
      // El servidor la descarta si la venta queda pagada.
      creditDueDate: form.creditDueDate || undefined,
      commissionAgentId: Number(form.commissionAgentId) || undefined,
      commissionAgentName: form.commissionAgentName || undefined,
      commissionAgentAmount: Number(form.commissionAgentAmount) || undefined,
      commissionAgentRetentionPercentage: Number(form.commissionAgentRetentionPercentage) || undefined,
      commissionAgentNetPayment: Number(form.commissionAgentNetPayment) || undefined,
      isSettled: !!form.commissionAgentId ? false : undefined,
      ta: Number(form.ta) || 0,
      taCre: Number(form.taCre) || 0,
      supplierCost: Number(form.supplierCost) || 0,
    };

    try {
      const created: any = await addSale(saleData as any);
      localStorage.removeItem(draftKey);

      const delivery = created.voucherDelivery;
      onSuccess(
        saleSuccessMessage(delivery, created.clientEmail),
        delivery?.failed.length > 0
          ? { saleId: created.id, sentText: vouchersSentText(delivery.sent.length, created.clientEmail), failed: delivery.failed }
          : undefined,
      );
      onClose();
    } catch (err: any) {
      console.error("Error al registrar venta:", err);
      const errMsg = err?.response?.data?.error?.message || "Ocurrió un error interno en el servidor al registrar la venta. Por favor, asegúrese de reiniciar el servidor backend local para cargar los nuevos módulos de base de datos.";
      alert(`Error al registrar venta: ${errMsg}`);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem(draftKey);
    onClose();
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <Modal
        isOpen={voucherWarnings.length > 0}
        onClose={() => setVoucherWarnings([])}
        title="Vouchers que no se enviarán"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setVoucherWarnings([])}>Volver</Button>
            <Button onClick={submitSale}>Guardar igual</Button>
          </>
        }
      >
        <ul className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
          {voucherWarnings.map((w) => (
            <li key={w.label}><span className="font-semibold">{w.label}:</span> {w.reason}</li>
          ))}
        </ul>
      </Modal>

      {/* Toast Error Notification */}
      {showError && (
        <div className="fixed top-24 right-6 z-[200] bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in-right">
          <div className="bg-rose-500 text-white rounded-full p-1 flex-shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="font-bold text-sm">Error de Validación</p>
            <p className="text-xs opacity-90">{errorMessage}</p>
          </div>
        </div>
      )}
      {activeForm ? renderActiveForm() : (
        <>
          {/* Header / Stepper */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-border dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
            <div className="flex justify-between items-center max-w-2xl mx-auto relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-slate-700 -translate-y-1/2 -z-10" />
              {STEPS.map((s) => {
                const Icon = s.icon;
                const isCompleted = step > s.id;
                const isActive = step === s.id;

                return (
                  <div key={s.id} className="flex flex-col items-center gap-1.5 sm:gap-2">
                    <div
                      className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                        ${
                          isCompleted
                             ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-950/20"
                             : isActive
                               ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 dark:shadow-primary/5 scale-105 sm:scale-110"
                               : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500"
                        }
                      `}
                    >
                      <Icon size={16} className="sm:hidden" />
                      <Icon size={18} className="hidden sm:block" />
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                        isActive ? "text-primary" : "text-gray-400 dark:text-slate-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-900">
            {step === 1 && <Step1Client form={form} set={set} data={data} errors={errors} asesores={asesores} />}
            {step === 2 && <Step2Products form={form} set={set} data={data} errors={errors} toggleProduct={toggleProduct} actions={actions} />}
            {step === 3 && <Step3Payment form={form} set={set} data={data} errors={errors} />}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-border dark:border-slate-850 bg-white dark:bg-slate-900 flex gap-2 sm:gap-3 flex-shrink-0">
        {activeForm ? (
          <div className="flex justify-between items-center w-full gap-2">
            <Button
              variant="outline"
              onClick={closeActiveForm}
              className="px-3 sm:px-6 text-xs sm:text-sm"
            >
              Regresar
            </Button>
            <Button
              onClick={closeActiveForm}
              disabled={(() => {
                if (!activeForm || activeIdx === null) return false;
                if (activeForm === "tiqueteria") return isTicketFormEmpty;
                if (activeForm === "hoteleria") return isHotelFormEmpty;
                if (activeForm === "seguros_viaje") return isInsuranceFormEmpty;
                
                // Generic fallback checking for all other forms
                let targetKey: string | null = null;
                switch (activeForm) {
                  case "planes": targetKey = "plans"; break;
                  case "checkin": targetKey = "checkIns"; break;
                  case "documentacion_migratoria": targetKey = "migrations"; break;
                  case "simcard": targetKey = "simCards"; break;
                 case "equipaje": targetKey = "baggages"; break;
                  case "renta_vehiculos": targetKey = "carRentals"; break;
      case "viajes_terrestres": targetKey = "landTravels"; break;
                  case "renta_fincas": targetKey = "fincas"; break;
                  case "tours": targetKey = "tours"; break;
                  case "centros_convencion": targetKey = "conventions"; break;
                  case "restaurantes": targetKey = "restaurants"; break;
                  case "visa": targetKey = "visas"; break;
                  case "pasaporte": targetKey = "passports"; break;
                  case "servicio_mascotas": targetKey = "petServices"; break;
                }
                if (targetKey) {
                  const items = (form as any)[targetKey] || [];
                  const currentItem = items[activeIdx];
                  return isItemEmpty(currentItem, activeForm);
                }
                return false;
              })()}
              className="px-3 sm:px-6 text-xs sm:text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirmar y Continuar
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-center w-full gap-2">
            <Button
              variant="outline"
              onClick={goBack}
              disabled={step === 1}
              className="px-3 sm:px-8 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs sm:text-sm"
            >
              Anterior
            </Button>

            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="px-3 sm:px-8 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs sm:text-sm"
                onClick={handleCancel}
              >
                Cancelar
              </Button>

              {step < 3 ? (
                <Button
                  onClick={goNext}
                  disabled={step === 2 && form.selectedProducts.length === 0}
                  className="px-4 sm:px-10 group disabled:bg-gray-300 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Siguiente
                  <ArrowRight
                    size={16}
                    className="ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-4 sm:px-10 text-white shadow-lg dark:shadow-none text-xs sm:text-sm ${
                    isSubmitting
                      ? "bg-emerald-400 cursor-not-allowed shadow-none"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creando...
                    </span>
                  ) : (
                    "Finalizar Venta"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function isItemEmpty(item: any, category: SaleProductId): boolean {
  if (!item) return true;
  
  if (Number(item.supplierCost) > 0 || Number(item.ta) > 0 || Number(item.taCre) > 0) return false;
  if (item.supplierName && item.supplierName.trim() !== "") return false;

  switch (category) {
    case "tiqueteria":
      return (
        !item.airline &&
        !item.reservationNumber &&
        !item.flightNumber &&
        (!item.passengers || item.passengers.length === 0 || !item.passengers[0]?.nroTiquete) &&
        !item.seatNumber &&
        (!item.legs || item.legs.every((l: any) => !l.origin && !l.destination && !l.flightNumber))
      );
    case "hoteleria":
      return (
        !item.hotelName &&
        !item.destination &&
        !item.reservationNumber &&
        !item.observations &&
        !item.hotelType
      );
    case "seguros_viaje":
      return !item.phone && !item.insuranceType;
    case "planes":
      return (
        !item.planName &&
        !item.hotelName &&
        !item.reservationNumber &&
        !item.flightNumber &&
        !item.ticketNumber &&
        !item.airline
      );
    case "checkin":
      return (
        !item.flightOrReservation &&
        !item.travelDate &&
        !item.seat &&
        !item.baggage &&
        !item.specialNeeds
      );
    case "documentacion_migratoria":
      return (
        !item.nationality &&
        !item.docNumber &&
        !item.passportExpiry &&
        !item.destinationCountry
      );
    case "simcard":
      return (
        !item.destinationCountry &&
        !item.arrivalDate &&
        !item.tripDuration &&
        !item.dataPlan
      );
    case "renta_vehiculos":
      return (
        !item.licenseNumber &&
        !item.pickupDate &&
        !item.returnDate &&
        !item.guaranteeCreditCard
      );
    case "viajes_terrestres":
      return (
        !item.transportCompany &&
        !item.origin &&
        !item.destination &&
        !item.departureDate
      );
    case "renta_fincas":
      return !item.checkInDate && !item.checkOutDate && !item.petType;
    case "tours":
      return (
        !item.selectedTour &&
        !item.preferredDate &&
        !item.childrenAges &&
        !item.pickupPoint &&
        !item.medicalConditions &&
        !item.observations
      );
    case "centros_convencion":
      return (
        !item.organization &&
        !item.startDate &&
        !item.endDate &&
        !item.cateringNotes
      );
    case "restaurantes":
      return !item.dateTime;
    case "visa":
      return (
        !item.nationality &&
        !item.docNumber &&
        !item.passportExpiration &&
        !item.countryApplying
      );
    case "pasaporte":
      return !item.residenceCity;
    case "servicio_mascotas":
      return (
        !item.petName &&
        !item.breed &&
        item.weight === 0 &&
        !item.travelDate &&
        !item.destinationCountry &&
        !item.medicalConditions &&
        !item.transportCompany &&
        !item.observations
      );
    case "equipaje":
      return (
        !item.airline &&
        !item.passengerName &&
        !item.reservationNumber &&
        !item.fareType &&
        !item.notes &&
        (!item.personalItem || item.personalItem === "No") &&
        (!item.carryOn || item.carryOn === "No") &&
        (!item.checkedBag || item.checkedBag === "No")
      );
    default:
      return true;
  }
}

