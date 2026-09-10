import { useId } from "react";
import { Package, Plane, Bus, Building2, Users, Briefcase, Trash2, PlusCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { FormField, Input, Combobox, Select , CurrencyInput} from "../../ui/Form";
import { Button } from "../../ui/Button";
import { PlanData, PlanGuestInfo } from "../../../types";
import { setTitular, hayTitular, sanearCodigo } from "./passengerHelpers";
import { DateTimePicker } from "./TicketForm";
import { VoucherField } from "./VoucherField";

/** Un servicio vinculado a este paquete, con su proveedor y lo que se le paga. */
export interface ServicioVinculado {
  category: string;
  label: string;
  supplier?: string;
  paymentMethod?: string;
  supplierCost?: number;
  ta?: number;
  taCre?: number;
}

interface PlanFormProps {
  plan: PlanData;
  onChange: (updates: Partial<PlanData>) => void;
  data: any;
  triggerError?: (msg: string) => void;
  mainClient?: any;
  /**
   * Los servicios que cuelgan de este paquete. El costo de un paquete vive en ellos, uno
   * por proveedor, porque a cada proveedor se le paga aparte y de cada uno sale una linea
   * IT distinta en la factura de Siigo.
   */
  linkedServices?: ServicioVinculado[];
}

export function PlanForm({ plan, onChange, data, triggerError, mainClient, linkedServices = [] }: PlanFormProps) {
  const minDateTime = (() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  })();

  // Id estable para agrupar los radios de titular. TicketForm usa `titular-${idx}`, que
  // crea un grupo por fila y permite marcar varios titulares a la vez.
  const titularGroup = useId();

  const guests = plan.guests || [];
  // Derivado en render: si datos heredados no traen titular, se resalta el primero.
  const conTitular = hayTitular(guests);

  const esTerrestre = plan.transportType === 'Terrestre';
  // Ida y vuelta se deriva de la fecha de regreso: un paquete con regreso ES de ida y
  // vuelta. Guardar una bandera aparte, como hace viajes terrestres, permite que la
  // bandera y las fechas se contradigan.
  const hayRegreso = Boolean(plan.flightReturnDate);

  // Total pagado a proveedores del paquete: lo propio mas cada servicio vinculado.
  // Derivado en el render; el servidor calcula el que se persiste.
  const propio = {
    supplierCost: Number(plan.supplierCost) || 0,
    ta: Number(plan.ta) || 0,
    taCre: Number(plan.taCre) || 0,
  };
  const agregado = linkedServices.reduce(
    (acc, s) => ({
      supplierCost: acc.supplierCost + (Number(s.supplierCost) || 0),
      ta: acc.ta + (Number(s.ta) || 0),
      taCre: acc.taCre + (Number(s.taCre) || 0),
    }),
    propio,
  );
  const totalPaquete = agregado.supplierCost + agregado.ta + agregado.taCre;

  // Cuando el costo vive en los servicios vinculados, los campos del paquete quedan de
  // solo lectura: si se pudieran editar tambien, el mismo hotel se contaria dos veces.
  // Un paquete sin vinculados los conserva editables, que es el caso del paquete comprado
  // armado a un operador.
  const costoEnVinculados = linkedServices.length > 0;

  const addGuest = () => {
    onChange({
      guests: [
        ...guests,
        { name: "", docType: "", docNumber: "", esTitular: false, nroReserva: "", nroTiquete: "", asiento: "", asientoRegreso: "" },
      ],
    });
  };

  const removeGuest = (gIdx: number) => {
    onChange({ guests: guests.filter((_, i) => i !== gIdx) });
  };

  const updateGuest = (gIdx: number, gUpdates: Partial<PlanGuestInfo>) => {
    const nextGuests = [...guests];
    nextGuests[gIdx] = { ...nextGuests[gIdx], ...gUpdates };
    onChange({ guests: nextGuests });
  };

  const packages = data.config.packages || [];

  const handleSelectPackage = (packageName: string) => {
    const pkg = packages.find((p: any) => p.name === packageName);
    if (pkg) {
      const isTerrestre = pkg.flight?.transportType === 'Terrestre';
      const rawFlightNumber = pkg.flight?.legs?.[0]?.flightNumber || "";
      const processedFlightNumber = isTerrestre 
        ? rawFlightNumber 
        : rawFlightNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);

      onChange({
        packageId: pkg.id,
        packageName: pkg.name,
        planName: pkg.name,
        hotelName: pkg.accommodation?.hotel || "",
        supplier: pkg.accommodation?.supplier || "",
        transportType: pkg.flight?.transportType || "Aéreo",
        airline: pkg.flight?.airline || "",
        flightNumber: processedFlightNumber,
        observations: `Incluye: ${pkg.includedServices || 'N/A'}\nNo Incluye: ${pkg.notIncluded || 'N/A'}`,
        adultsCount: 2,
        childrenCount: 0,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Selector de Tipo de Paquete */}
      <div className="bg-white p-4 rounded-xl border border-gray-250/60 shadow-sm flex flex-col gap-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Tipo de Paquete
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ packageType: "own" })}
            className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
              plan.packageType !== "supplier"
                ? "border-primary bg-primary/5 text-primary shadow-sm"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
            }`}
          >
            <Package size={16} />
            Propio de la Empresa
          </button>
          <button
            type="button"
            disabled
            className="py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-70"
            title="Sección inhabilitada temporalmente por mantenimiento"
          >
            <Users size={16} />
            Por Proveedor (Inhabilitado)
          </button>
        </div>
      </div>

      {/* Selector de Catálogo */}
      {plan.packageType !== "supplier" && (
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-4">
          <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
            <Package size={14} className="text-accent" /> Importar desde Catálogo de Paquetes
          </h4>
          <Combobox
            value={plan.planName}
            onChange={(val) => handleSelectPackage(val)}
            options={packages.map((p: any) => ({ value: p.name, label: `${p.name} - ${p.destination} (${p.nights} noches)` }))}
            placeholder="Busca un paquete registrado..."
          />
          <p className="text-[10px] text-gray-500 mt-2 italic">
            * Al seleccionar un paquete se autocompletarán los datos base (Hotel, Aerolínea, Vuelo).
          </p>
        </div>
      )}

      {plan.packageType === "supplier" && (
        <VoucherField
          multiple={true}
          vouchers={plan.vouchers || (plan.voucher ? [plan.voucher] : undefined)}
          sendVoucher={plan.sendVoucher}
          onChange={(updates) => {
            if (updates.vouchers) {
              onChange({ vouchers: updates.vouchers, voucher: updates.vouchers[0] });
            } else if ('vouchers' in updates) {
              onChange({ vouchers: undefined, voucher: undefined });
            }
            if (updates.sendVoucher !== undefined) {
              onChange({ sendVoucher: updates.sendVoucher });
            }
          }}
        />
      )}

      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <Package size={14} />
          Datos del Plan Vacacional
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nombre del Plan">
            <Input
              value={plan.planName}
              onChange={(e) => onChange({ planName: e.target.value })}
              placeholder="Ej: Plan Cancún Todo Incluido (Máx 50)"
              maxLength={50}
            />
          </FormField>
          {plan.packageType !== "supplier" && (
            <>
              <FormField label="Tipo de Transporte">
                <Select
                  value={plan.transportType || "Aéreo"}
                  onChange={(e) => onChange({ transportType: e.target.value as 'Aéreo' | 'Terrestre' })}
                  options={[
                    { value: "Aéreo", label: "Aéreo" },
                    { value: "Terrestre", label: "Terrestre" }
                  ]}
                />
              </FormField>

              <FormField label={plan.transportType === 'Terrestre' ? "Empresa de Transporte" : "Aerolínea"}>
                {plan.transportType === 'Terrestre' ? (
                  <Input
                    value={plan.airline}
                    onChange={(e) => onChange({ airline: e.target.value })}
                    placeholder="Ej: Flota Magdalena"
                  />
                ) : (
                  <Combobox
                    value={plan.airline}
                    onChange={(val) => onChange({ airline: val })}
                    options={data.config.airlines.map((a: any) => ({ value: a.name, label: a.name }))}
                    placeholder="Seleccionar aerolínea..."
                  />
                )}
              </FormField>
              <FormField label="Adultos">
                <Input
                  type="text"
                  value={plan.adultsCount !== undefined ? plan.adultsCount : ""}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 3);
                    onChange({ adultsCount: cleaned === "" ? undefined : Number(cleaned) });
                  }}
                  placeholder="Solo números, máx 999"
                />
              </FormField>
              <FormField label="Menores">
                <Input
                  type="text"
                  value={plan.childrenCount !== undefined ? plan.childrenCount : ""}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 3);
                    onChange({ childrenCount: cleaned === "" ? undefined : Number(cleaned) });
                  }}
                  placeholder="Solo números, máx 999"
                />
              </FormField>
            </>
          )}
        </div>
      </div>

      {/* ── Reserva de Hotel ──────────────────────────────────
          Separado del transporte a proposito: antes un solo bloque mezclaba el codigo de
          reserva, el de tiquete, la confirmacion y las fechas de vuelo y de hotel, y no se
          sabia que dato pertenecia a que servicio. */}
      {plan.packageType !== "supplier" && (
        <div className="bg-amber-50/20 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
          <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Building2 size={14} />
            Reserva de Hotel
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Nombre del Hotel">
              <Input
                value={plan.hotelName}
                onChange={(e) => onChange({ hotelName: e.target.value })}
                placeholder="Ej: Sol Caribe Campo"
                maxLength={50}
              />
            </FormField>
            <FormField label="Ref. Hotel">
              <Input
                value={plan.hotelReference || ""}
                onChange={(e) => onChange({ hotelReference: sanearCodigo(e.target.value) })}
                placeholder="Ej: PH_3510R-1"
                maxLength={20}
              />
            </FormField>
            <div className="hidden md:block" />
            <FormField label="Ingreso">
              <DateTimePicker
                value={plan.startDate || ""}
                onChange={(val) => onChange({ startDate: val })}
                min={minDateTime}
                triggerError={triggerError}
                fieldName="Ingreso al hotel del plan"
              />
            </FormField>
            <FormField label="Salida">
              <DateTimePicker
                value={plan.endDate || ""}
                onChange={(val) => onChange({ endDate: val })}
                min={minDateTime}
                triggerError={triggerError}
                fieldName="Salida del hotel del plan"
              />
            </FormField>
          </div>
          <p className="text-[10px] text-amber-700/70 dark:text-amber-400/60 mt-3">
            El booking de cada huésped se registra abajo, en Integrantes.
          </p>
        </div>
      )}

      {/* ── Transporte ─────────────────────────────────────── */}
      {plan.packageType !== "supplier" && (
        <div className="bg-blue-50/20 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
          <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            {plan.transportType === 'Terrestre' ? <Bus size={14} /> : <Plane size={14} />}
            {plan.transportType === 'Terrestre' ? 'Transporte Terrestre' : 'Transporte Aéreo'}
          </h4>
          {/* Arriba va solo lo que cubre los dos tramos. El numero de vuelo baja a su
              tramo: un paquete de ida y vuelta son dos vuelos distintos, y las fechas ya
              modelaban los dos tramos mientras el numero era uno solo para ambos. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* El PNR es uno por reserva y cubre los dos tramos. El Booking de cada
                integrante esta abajo, en Integrantes, y son datos distintos. Opcional
                como los demas codigos del paquete: llegan dias despues de vender. */}
            <FormField label={plan.transportType === 'Terrestre' ? 'Localizador' : 'N° de Reserva'}>
              <Input
                value={plan.flightReservationNumber || ""}
                onChange={(e) => onChange({ flightReservationNumber: sanearCodigo(e.target.value) })}
                placeholder={plan.transportType === 'Terrestre' ? 'Ej: RO-88421' : 'Ej: KJH8RT'}
                maxLength={20}
              />
            </FormField>
          </div>

          <div className="mt-4 pt-3 border-t border-dashed border-blue-100 dark:border-blue-500/20">
            <p className="text-[10px] font-bold text-blue-700/80 dark:text-blue-400/70 uppercase tracking-widest mb-2 flex items-center gap-1">
              <ArrowRight size={11} /> Ida
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label={esTerrestre ? 'Placa del Vehículo' : 'Número de Vuelo'}>
                <Input
                  value={plan.flightNumber}
                  onChange={(e) => onChange({ flightNumber: sanearCodigo(e.target.value, 12) })}
                  placeholder={esTerrestre ? 'Ej: SRG123' : 'Ej: AV9720'}
                  maxLength={12}
                />
              </FormField>
              <FormField label={plan.transportType === 'Terrestre' ? 'Salida (Origen)' : 'Salida'}>
                <DateTimePicker
                  value={plan.flightDepartureDate || ""}
                  onChange={(val) => onChange({ flightDepartureDate: val })}
                  min={minDateTime}
                  triggerError={triggerError}
                  fieldName="Salida de ida del plan"
                />
              </FormField>
              <FormField label={plan.transportType === 'Terrestre' ? 'Llegada (Destino)' : 'Llegada'}>
                <DateTimePicker
                  value={plan.flightDepartureArrivalDate || ""}
                  onChange={(val) => onChange({ flightDepartureArrivalDate: val })}
                  min={plan.flightDepartureDate || minDateTime}
                  triggerError={triggerError}
                  fieldName="Llegada de ida del plan"
                />
              </FormField>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-dashed border-blue-100 dark:border-blue-500/20">
            <p className="text-[10px] font-bold text-blue-700/80 dark:text-blue-400/70 uppercase tracking-widest mb-2 flex items-center gap-1">
              <ArrowLeft size={11} /> Regreso
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label={esTerrestre ? 'Placa del Vehículo' : 'Número de Vuelo'}>
                <Input
                  value={plan.flightReturnNumber || ""}
                  onChange={(e) => onChange({ flightReturnNumber: sanearCodigo(e.target.value, 12) })}
                  placeholder={esTerrestre ? 'Ej: SRG455' : 'Ej: AV9721'}
                  maxLength={12}
                />
              </FormField>
              <FormField label={plan.transportType === 'Terrestre' ? 'Regreso (Destino)' : 'Salida'}>
                <DateTimePicker
                  value={plan.flightReturnDate || ""}
                  onChange={(val) => onChange({ flightReturnDate: val })}
                  min={plan.flightDepartureDate || minDateTime}
                  triggerError={triggerError}
                  fieldName="Salida de regreso del plan"
                />
              </FormField>
              <FormField label={plan.transportType === 'Terrestre' ? 'Llegada Regreso (Origen)' : 'Llegada'}>
                <DateTimePicker
                  value={plan.flightReturnArrivalDate || ""}
                  onChange={(val) => onChange({ flightReturnArrivalDate: val })}
                  min={plan.flightReturnDate || minDateTime}
                  triggerError={triggerError}
                  fieldName="Llegada de regreso del plan"
                />
              </FormField>
            </div>
          </div>

          <p className="text-[10px] text-blue-700/70 dark:text-blue-400/60 mt-3">
            El {plan.transportType === 'Terrestre' ? 'tiquete o puesto' : 'tiquete'} de cada pasajero se registra abajo, en Integrantes.
          </p>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <Users size={14} />
            Integrantes del Plan
          </h4>
          <Button type="button" variant="outline" size="sm" onClick={addGuest}>
            <PlusCircle size={14} className="mr-1" />
            Agregar
          </Button>
        </div>
        <div className="space-y-4">
          {guests.map((guest, gIdx) => {
            const esTitular = guest.esTitular || (!conTitular && gIdx === 0);

            return (
              <div
                key={gIdx}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 relative group"
              >
                {/* El titular no se puede borrar: asi el invariante "al menos un
                    integrante" se sostiene sin depender de guests.length. */}
                {!esTitular && (
                  <button
                    type="button"
                    onClick={() => removeGuest(gIdx)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    title="Eliminar integrante"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <div className="flex items-center justify-between mb-3 pr-8">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-200 truncate">
                      {gIdx + 1}. {guest.name || "Sin Nombre"}
                    </span>
                    {esTitular && (
                      <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shrink-0">
                        Titular
                      </span>
                    )}
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <input
                      type="radio"
                      name={titularGroup}
                      checked={esTitular}
                      onChange={() => onChange({ guests: setTitular(guests, gIdx) })}
                      className="w-3 h-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">
                      Es Titular
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <FormField label="Nombre Completo">
                    <Combobox
                      value={guest.name}
                      onChange={(val) => {
                        const cleaned = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                        const client = (data?.clients || []).find(
                          (c: any) =>
                            (c.name === cleaned || `${c.firstName} ${c.lastName || ""}`.trim() === cleaned) &&
                            c.status === "active"
                        );
                        if (client) {
                          updateGuest(gIdx, {
                            name: client.name || `${client.firstName} ${client.lastName || ""}`.trim(),
                            docType: client.docType || guest.docType,
                            docNumber: client.docNumber || guest.docNumber,
                          });
                        } else {
                          updateGuest(gIdx, { name: cleaned });
                        }
                      }}
                      options={(data?.clients || [])
                        .filter((c: any) => c.status === "active" && String(c.id) !== String(mainClient?.id))
                        .map((c: any) => ({
                          value: c.name || `${c.firstName} ${c.lastName || ""}`.trim(),
                          label: c.name || `${c.firstName} ${c.lastName || ""}`.trim(),
                        }))}
                      placeholder="Nombre completo"
                      preventNumbers={true}
                    />
                  </FormField>
                  <FormField label="Tipo de Doc.">
                    <Select
                      value={guest.docType}
                      onChange={(e) => updateGuest(gIdx, { docType: e.target.value })}
                      options={[
                        { value: "", label: "Sel..." },
                        ...data.config.documentTypes.map((d: any) => ({
                          value: d.abreviatura,
                          label: d.abreviatura,
                        })),
                      ]}
                    />
                  </FormField>
                  <FormField label="N° Documento">
                    <Input
                      value={guest.docNumber}
                      onChange={(e) =>
                        updateGuest(gIdx, {
                          docNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
                        })
                      }
                      placeholder="Número de documento"
                      maxLength={20}
                    />
                  </FormField>
                </div>

                {/* Los codigos son de cada integrante, no del paquete: el hotel entrega un
                    booking por persona y la aerolinea un tiquete por persona. Antes vivian
                    a nivel paquete y el backend los copiaba a todos por igual. */}
                {/* Los codigos identifican la reserva de esta persona. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <FormField label="Booking (Opcional)">
                    <Input
                      value={guest.nroReserva || ""}
                      onChange={(e) => updateGuest(gIdx, { nroReserva: sanearCodigo(e.target.value) })}
                      placeholder="Código que da el hotel"
                      maxLength={20}
                      className="text-xs"
                    />
                  </FormField>
                  {/* Antes esta etiqueta decia "Tiquete / Puesto" con placeholder
                      "Ej: Asiento 12" en los paquetes terrestres: un parche por no tener
                      campo de asiento, que metia el puesto dentro del numero de tiquete.
                      Con asientos propios abajo, el tiquete vuelve a ser el tiquete. */}
                  <FormField label="N° Tiquete (Opcional)">
                    <Input
                      value={guest.nroTiquete || ""}
                      onChange={(e) => updateGuest(gIdx, { nroTiquete: sanearCodigo(e.target.value) })}
                      placeholder={esTerrestre ? "Ej: 4587-221" : "Ej: 0000000127297"}
                      maxLength={20}
                      className="text-xs"
                    />
                    {!esTerrestre && guest.nroTiquete && guest.nroTiquete.length > 0 && guest.nroTiquete.length < 8 && (
                      <p className="text-[10px] text-amber-500 mt-1 font-medium animate-fade-in">
                        Mínimo 8 caracteres.
                      </p>
                    )}
                  </FormField>
                </div>

                {/* El asiento es de cada persona y de cada tramo: dos integrantes del
                    mismo paquete van en asientos distintos, y cada uno puede ir en otro
                    al regreso. Fila aparte de los codigos porque son dos clases de dato:
                    el codigo identifica la reserva, el asiento dice donde va sentado.
                    Sin regreso, la fila se reduce a un solo campo, como en terrestre. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label={hayRegreso ? "Asiento Ida (Opcional)" : "Asiento (Opcional)"}>
                    <Input
                      value={guest.asiento || ""}
                      onChange={(e) => updateGuest(gIdx, { asiento: sanearCodigo(e.target.value, 6) })}
                      placeholder="Ej: 12A"
                      maxLength={6}
                      className="text-xs"
                    />
                  </FormField>
                  {hayRegreso && (
                    <FormField label="Asiento Regreso (Opcional)">
                      <Input
                        value={guest.asientoRegreso || ""}
                        onChange={(e) => updateGuest(gIdx, { asientoRegreso: sanearCodigo(e.target.value, 6) })}
                        placeholder="Ej: 4C"
                        maxLength={6}
                        className="text-xs"
                      />
                    </FormField>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <FormField label="Observaciones">
            <textarea
              className="w-full text-sm p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              rows={3}
              value={plan.observations || ""}
              onChange={(e) => onChange({ observations: e.target.value })}
              placeholder="Notas, inclusiones, excepciones..."
            />
          </FormField>
        </div>
      </div>
      <div className="bg-emerald-50/20 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Briefcase size={14} /> Finanzas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nombre del Proveedor">
            <Combobox
              value={plan.supplier}
              onChange={(val) => onChange({ supplier: val })}
              options={data.config.suppliers.map((s: any) => ({ value: s.name, label: s.name }))}
              placeholder="Seleccionar proveedor..."
            />
          </FormField>
          {/* Cuando el costo vive en los servicios vinculados, estos campos quedan de
              solo lectura: si se pudieran editar tambien, el mismo hotel se contaria dos
              veces y nada lo detectaria. */}
          <FormField label="Costo Proveedor">
            <CurrencyInput
              value={plan.supplierCost ?? ""}
              disabled={costoEnVinculados}
              onChange={(val) =>
                onChange({
                  supplierCost: val === "" ? undefined : Number(val),
                })
              }
            />
          </FormField>
          <FormField label="Valor TA">
            <CurrencyInput
              value={plan.ta ?? ""}
              disabled={costoEnVinculados}
              onChange={(val) =>
                onChange({
                  ta: val === "" ? undefined : Number(val),
                })
              }
            />
          </FormField>
          {/* Faltaba: el paquete no tenia donde ingresar la TA CRE, aunque el total de la
              venta ya la sumaba y el resto de los productos si la capturan. */}
          <FormField label="Valor TA CRE">
            <CurrencyInput
              value={plan.taCre ?? ""}
              disabled={costoEnVinculados}
              onChange={(val) =>
                onChange({
                  taCre: val === "" ? undefined : Number(val),
                })
              }
            />
          </FormField>
          <FormField label="Método de Pago">
            <Combobox
              value={plan.supplierPaymentMethod || ""}
              onChange={(val) => onChange({ supplierPaymentMethod: val })}
              options={data.config.cards.map((m: any) => ({
                value: m.name,
                label: m.lastFourDigits ? `${m.name} (**${m.lastFourDigits})` : m.name,
              }))}
              placeholder="Seleccionar método..."
            />
          </FormField>
        </div>

        {/* Desglose por proveedor. A cada uno se le paga aparte y con su propio metodo,
            asi que lo que hay que conciliar es esta lista, no un unico numero. */}
        {linkedServices.length > 0 && (
          <div className="mt-4 pt-3 border-t border-dashed border-emerald-200 dark:border-emerald-500/30">
            <p className="text-[10px] font-bold text-emerald-700/80 dark:text-emerald-400/70 uppercase tracking-widest mb-2">
              Servicios que componen el paquete
            </p>
            <div className="space-y-1.5">
              {[
                { label: "Paquete", supplier: plan.supplier, paymentMethod: plan.supplierPaymentMethod, ...propio },
                ...linkedServices.map((sv) => ({
                  label: sv.label,
                  supplier: sv.supplier,
                  paymentMethod: sv.paymentMethod,
                  supplierCost: Number(sv.supplierCost) || 0,
                  ta: Number(sv.ta) || 0,
                  taCre: Number(sv.taCre) || 0,
                })),
              ]
                // Una fila sin importe no es un pago; misma regla que en el servidor.
                .filter((l) => l.supplierCost > 0 || l.ta > 0 || l.taCre > 0)
                .map((l, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-gray-700 dark:text-slate-200">{l.label}</span>
                      <span className="text-gray-500 dark:text-slate-400">
                        {l.supplier ? ` · ${l.supplier}` : " · sin proveedor"}
                        {l.paymentMethod ? ` · ${l.paymentMethod}` : ""}
                      </span>
                    </div>
                    <span className="font-mono text-gray-800 dark:text-slate-200 shrink-0">
                      ${l.supplierCost.toLocaleString("es-CO")}
                      {l.ta + l.taCre > 0 && (
                        <span className="text-gray-500 dark:text-slate-400">
                          {" "}+ TA ${(l.ta + l.taCre).toLocaleString("es-CO")}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between p-4 bg-emerald-100/50 dark:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tighter">
              Total del Paquete
            </span>
            <span className="text-[9px] text-gray-500 dark:text-slate-400 font-medium">
              Pagado a proveedores ${agregado.supplierCost.toLocaleString("es-CO")} + TA y TA CRE $
              {(agregado.ta + agregado.taCre).toLocaleString("es-CO")}
            </span>
          </div>
          <span className="text-lg font-black text-emerald-900 dark:text-emerald-300 leading-none">
            ${totalPaquete.toLocaleString("es-CO")}
          </span>
        </div>
      </div>

    </div>
  );
}