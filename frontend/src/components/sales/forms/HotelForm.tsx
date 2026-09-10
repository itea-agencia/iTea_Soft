import { useId } from "react";
import { Building2, Users, Briefcase, Trash2, PlusCircle } from "lucide-react";
import * as LuIcons from "react-icons/lu";
import { FormField, Input, Combobox, Select , CurrencyInput} from "../../ui/Form";
import { Button } from "../../ui/Button";
import { HotelData, HotelGuestInfo } from "../../../types";
import { setTitular, hayTitular, sanearCodigo } from "./passengerHelpers";
import { DateTimePicker } from "./TicketForm";

interface HotelFormProps {
  hotel: HotelData;
  onChange: (updates: Partial<HotelData>) => void;
  data: any;
  triggerError?: (msg: string) => void;
  mainClient?: any;
}

export function HotelForm({ hotel, onChange, data, triggerError, mainClient }: HotelFormProps) {
  const minDateTime = (() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  })();

  // Id estable para agrupar los radios de titular. TicketForm usa `titular-${idx}`, que
  // crea un grupo por fila y permite marcar varios titulares a la vez.
  const titularGroup = useId();

  const guests = hotel.guests || [];
  // Derivado en render: si datos heredados no traen titular, se resalta el primero.
  const conTitular = hayTitular(guests);

  const addGuest = () => {
    onChange({
      guests: [...guests, { name: "", docType: "", docNumber: "", esTitular: false, nroReserva: "" }],
    });
  };

  const removeGuest = (gIdx: number) => {
    onChange({ guests: guests.filter((_, i) => i !== gIdx) });
  };

  const updateGuest = (gIdx: number, gUpdates: Partial<HotelGuestInfo>) => {
    const nextGuests = [...guests];
    nextGuests[gIdx] = { ...nextGuests[gIdx], ...gUpdates };
    onChange({ guests: nextGuests });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <Building2 size={14} />
          Reserva de Hotel
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nombre del Hotel">
            <Input
              value={hotel.hotelName}
              onChange={(e) => onChange({ hotelName: e.target.value })}
              placeholder="Ej: Hilton Berlin (Mín 2, Máx 50)"
              maxLength={50}
            />
          </FormField>
          <FormField label="Destino">
            <Combobox
              value={hotel.destination}
              onChange={(val) => onChange({ destination: val })}
              options={data.config.airports.map((a: any) => ({
                value: a.location,
                label: `${a.location} (${a.abbreviation})`,
              }))}
              placeholder="Ej: Berlín, Alemania"
            />
          </FormField>
          <FormField label="Proveedor">
            <Combobox
              value={hotel.supplier}
              onChange={(val) => onChange({ supplier: val })}
              options={data.config.suppliers.map((s: any) => ({ value: s.name, label: s.name }))}
              placeholder="Seleccionar proveedor..."
            />
          </FormField>
          {/* La referencia es una por reserva. El booking de cada huesped esta abajo, en
              Huespedes, y son datos distintos. Se sanea igual que en paquetes: la regla
              anterior borraba el guion y el guion bajo, y convertia PH_3510R-1 en
              PH3510R1. */}
          <FormField label="Ref. Hotel">
            <Input
              value={hotel.reservationNumber}
              onChange={(e) => onChange({ reservationNumber: sanearCodigo(e.target.value) })}
              placeholder="Ej: PH_3510R-1"
              maxLength={20}
            />
          </FormField>
          <FormField label="Ingreso">
            <DateTimePicker
              value={hotel.startDate}
              onChange={(val) => onChange({ startDate: val })}
              min={minDateTime}
              triggerError={triggerError}
              fieldName="Check-in del hotel"
            />
          </FormField>
          <FormField label="Salida">
            <DateTimePicker
              value={hotel.endDate}
              onChange={(val) => onChange({ endDate: val })}
              min={minDateTime}
              triggerError={triggerError}
              fieldName="Check-out del hotel"
            />
          </FormField>
          <FormField label="Tipo de Hotel">
            <Combobox
              value={hotel.hotelType || ""}
              onChange={(val) => onChange({ hotelType: val })}
              options={[
                { value: "", label: "Seleccionar..." },
                { value: "hotel", label: "Hotel" },
                { value: "hotel_turistico", label: "Hotel Turístico" },
                { value: "resort", label: "Resort / Todo Incluido" },
                { value: "boutique", label: "Hotel Boutique" },
                { value: "apartamento", label: "Apartamento / AirBnB" },
                { value: "hostal", label: "Hostal / Albergue" },
                { value: "finca", label: "Finca / Casa Rural" },
              ]}
              placeholder="Seleccionar tipo..."
            />
          </FormField>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <Users size={14} />
            Huéspedes
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
                {/* El titular no se puede borrar: asi el invariante "al menos un huesped"
                    se sostiene sin depender de guests.length. */}
                {!esTitular && (
                  <button
                    type="button"
                    onClick={() => removeGuest(gIdx)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    title="Eliminar huésped"
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

                {/* El hotel entrega un booking por persona, distinto de la referencia de la
                    reserva. Opcional: llega dias despues de vender. */}
                <FormField label="Booking (Opcional)">
                  <Input
                    value={guest.nroReserva || ""}
                    onChange={(e) => updateGuest(gIdx, { nroReserva: sanearCodigo(e.target.value) })}
                    placeholder="Código que da el hotel"
                    maxLength={20}
                    className="text-xs"
                  />
                </FormField>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-emerald-50/20 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Briefcase size={14} /> Finanzas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Costo Proveedor *">
            <CurrencyInput
              required
              value={hotel.supplierCost ?? ""}
              onChange={(val) => {
                onChange({
                  supplierCost: Number(val) || 0,
                });
              }}
            />
          </FormField>
          <FormField label="Tarifa Administrativa (TA) *">
            <CurrencyInput
              required
              value={hotel.ta ?? ""}
              onChange={(val) => {
                onChange({
                  ta: Number(val) || 0,
                });
              }}
            />
          </FormField>
          <FormField label="Valor TA CRE">
            <CurrencyInput
              value={hotel.taCre ?? ""}
              onChange={(val) => {
                onChange({
                  taCre: val === "" ? undefined : Number(val),
                });
              }}
            />
          </FormField>
          <FormField label="Método de Pago">
            <Combobox
              value={hotel.supplierPaymentMethod || ""}
              onChange={(val) => onChange({ supplierPaymentMethod: val })}
              options={data.config.cards.map((m: any) => ({
                value: m.name,
                label: m.lastFourDigits ? `${m.name} (**${m.lastFourDigits})` : m.name,
              }))}
              placeholder="Seleccionar método..."
            />
          </FormField>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between p-4 bg-emerald-100/50 dark:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tighter">
              Costo Total del Servicio
            </span>
            <span className="text-[9px] text-gray-400 dark:text-slate-400 font-medium">
              (Costo Proveedor + TA + TA CRE)
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-lg font-black text-emerald-900 dark:text-emerald-300 leading-none">
                ${((Number(hotel.supplierCost) || 0) + (Number(hotel.ta) || 0) + (Number(hotel.taCre) || 0)).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
          <LuIcons.LuFileText size={14} /> Observaciones
        </h4>
        <textarea
          className="w-full h-24 p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
          placeholder="Ej: Habitación con vista al mar, late check-out solicitado, etc."
          value={hotel.observations || ""}
          onChange={(e) => onChange({ observations: e.target.value })}
        />
      </div>
    </div>
  );
}