import { useState, useEffect, useRef } from "react";
import { User, Package, CreditCard, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { SaleProductId } from "../../types";
import { WizardFormData, INITIAL_FORM, PRODUCTOS, vinculosReindexados, importesDe } from "./wizardData";
import { Step1Client } from "./steps/Step1Client";
import { Step2Products } from "./steps/Step2Products";
import { Step3Payment } from "./steps/Step3Payment";
import { todayStr } from "../../utils/formatters";
import { getDaysUntilDue } from "../../utils/creditUtils";
import { findClientById } from "../../utils/clientOptions";
import { validateWizardStep } from "./wizardValidation";
import { ActiveProductForm } from "./ActiveProductForm";
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
      const created = await addSale(saleData as any);
      localStorage.removeItem(draftKey);

      const delivery = created.voucherDelivery;
      onSuccess(
        saleSuccessMessage(delivery, created.clientEmail),
        delivery && delivery.failed.length > 0
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
      {activeForm ? <ActiveProductForm activeForm={activeForm} activeIdx={activeIdx} closeActiveForm={closeActiveForm} data={data} errors={errors} form={form} getCurrentItemLinkedPlanIndex={getCurrentItemLinkedPlanIndex} isHotelFormEmpty={isHotelFormEmpty} isInsuranceFormEmpty={isInsuranceFormEmpty} isItemEmpty={isItemEmpty} isTicketFormEmpty={isTicketFormEmpty} set={set} setActiveIdx={setActiveIdx} setCurrentItemLinkedPlanIndex={setCurrentItemLinkedPlanIndex} setForm={setForm} triggerError={triggerError} /> : (
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

