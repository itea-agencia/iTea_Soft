import { ChevronLeft, Link2, Plus } from "lucide-react";
import { Button } from "../ui/Button";
import { AppData, Sale, SALE_PRODUCTS } from "../../types";
import { WizardFormData } from "./wizardData";
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
import { INITIAL_TICKET, INITIAL_LAND_TRAVEL, INITIAL_HOTEL, INITIAL_INSURANCE, INITIAL_PLAN, INITIAL_CHECKIN, INITIAL_MIGRATION, INITIAL_SIMCARD, INITIAL_BAGGAGE, INITIAL_CAR_RENTAL, INITIAL_FINCA, INITIAL_TOUR, INITIAL_CONVENTION, INITIAL_RESTAURANT, INITIAL_VISA, INITIAL_PASSPORT, INITIAL_PET_SERVICE } from "./wizardData";
import { findClientById } from "../../utils/clientOptions";

// El formulario del producto que se esta editando. Sale del asistente sin cambios: el estado
// sigue viviendo alla (hallazgo 16 de la auditoria del frontend).
export function ActiveProductForm({ activeForm, activeIdx, closeActiveForm, data, errors, form, getCurrentItemLinkedPlanIndex, isHotelFormEmpty, isInsuranceFormEmpty, isItemEmpty, isTicketFormEmpty, set, setActiveIdx, setCurrentItemLinkedPlanIndex, setForm, triggerError }: { form: WizardFormData; data: AppData; [prop: string]: any }) {
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
                documentTypes={data.config.documentTypes}
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
                documentTypes={data.config.documentTypes}
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
                documentTypes={data.config.documentTypes}
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
                documentTypes={data.config.documentTypes}
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
}
