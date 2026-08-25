import { useEffect, useId } from "react";
import { Bus, PlusCircle, User, Trash2 } from "lucide-react";
import { FormField, Input, Combobox } from "../../ui/Form";
import { LandTravelData } from "../../../types";
import { ClientInfoSection, VoucherField, FinancialSection } from "./VoucherField";
import { DateTimePicker } from "./TicketForm";

interface LandTravelFormProps {
  travel: LandTravelData;
  client: any;
  clients?: any[];
  documentTypes?: any[];
  suppliers?: any[];
  paymentMethods?: any[];
  onChange: (updates: Partial<LandTravelData>) => void;
  triggerError?: (msg: string) => void;
}

export function LandTravelForm({ travel, client, clients = [], documentTypes, suppliers, paymentMethods, onChange, triggerError }: LandTravelFormProps) {
  // Id estable para agrupar los radios de titular. Antes se usaba
  // `travel.ticketLocator || Math.random()`, que generaba un grupo distinto en cada
  // render mientras el localizador estuviera vacio y permitia marcar varios titulares.
  const titularGroup = useId();

  const passengers = travel.passengers || [];

  // Garantiza un pasajero y exactamente un titular, COMMITEANDO al estado.
  // Antes esto se calculaba dentro del render, asi que la fila que se veia en
  // pantalla no existia en el formulario y no llegaba al backend.
  useEffect(() => {
    if (passengers.length === 0) {
      onChange({
        passengers: [{
          name: client?.name || `${client?.firstName || ''} ${client?.lastName || ''}`.trim(),
          docType: client?.docType || '',
          docNumber: client?.docNumber || '',
          esTitular: true,
          asiento: '',
          asientoRegreso: ''
        }]
      });
    } else if (!passengers.some((p) => p.esTitular)) {
      onChange({ passengers: passengers.map((p, i) => ({ ...p, esTitular: i === 0 })) });
    }
  }, [travel.passengers]);

  const minDateTime = (() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  })();

  return (
    <div className="space-y-6 animate-fade-in">
      {client && <ClientInfoSection client={client} />}

      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <Bus size={14} /> Viaje Terrestre
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Empresa de Transporte (Operador)">
            <Input
              value={travel.transportCompany}
              onChange={(e) => onChange({ transportCompany: e.target.value })}
              placeholder="Ej: Expreso Bolivariano"
            />
          </FormField>
          
          <FormField label="Localizador o Número de Ticket">
            <Input
              value={travel.ticketLocator}
              onChange={(e) => onChange({ ticketLocator: e.target.value.toUpperCase() })}
              placeholder="Ej: BOG-12345"
            />
          </FormField>

          <FormField label="Origen">
            <Input
              value={travel.origin}
              onChange={(e) => onChange({ origin: e.target.value })}
              placeholder="Ciudad o terminal"
            />
          </FormField>

          <FormField label="Destino">
            <Input
              value={travel.destination}
              onChange={(e) => onChange({ destination: e.target.value })}
              placeholder="Ciudad o terminal"
            />
          </FormField>

          <FormField label="Salida (Fecha y Hora)">
            <DateTimePicker
              value={travel.departureDate ? `${travel.departureDate}T${travel.departureTime || '00:00'}` : ''}
              onChange={(val) => {
                if (!val) {
                  onChange({ departureDate: '', departureTime: '' });
                } else {
                  const [date, time] = val.split('T');
                  onChange({ departureDate: date, departureTime: time });
                }
              }}
              min={minDateTime}
              triggerError={triggerError}
              fieldName="Salida"
            />
          </FormField>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              ¿Es viaje de ida y vuelta?
            </span>
            <button
              type="button"
              onClick={() => onChange({ isRoundTrip: !travel.isRoundTrip })}
              className={`${
                travel.isRoundTrip ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${
                  travel.isRoundTrip ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>

          {travel.isRoundTrip && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <FormField label="Regreso (Fecha y Hora)">
                <DateTimePicker
                  value={travel.returnDate ? `${travel.returnDate}T${travel.returnTime || '00:00'}` : ''}
                  onChange={(val) => {
                    if (!val) {
                      onChange({ returnDate: '', returnTime: '' });
                    } else {
                      const [date, time] = val.split('T');
                      onChange({ returnDate: date, returnTime: time });
                    }
                  }}
                  min={travel.departureDate ? `${travel.departureDate}T${travel.departureTime || '00:00'}` : minDateTime}
                  triggerError={triggerError}
                  fieldName="Regreso"
                />
              </FormField>
            </div>
          )}
        </div>
      </div>

      
      {/* ── Información de Pasajeros ────────────────────────── */}
      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
          <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <User size={14} /> Pasajeros
          </h4>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3"
            onClick={() => {
              const currentPax = travel.passengers || [];
              onChange({ passengers: [...currentPax, { name: '', docType: '', docNumber: '', esTitular: false, asiento: '', asientoRegreso: '' }] });
            }}
          >
            <PlusCircle size={14} className="mr-2" />
            Añadir Pasajero
          </button>
        </div>

        <div className="space-y-4">
          {passengers.map((pax: any, idx: number) => {
              const isNew = !pax.name && !pax.docNumber;

              return (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-4 rounded-lg relative shadow-sm group">
                  <div className="absolute -top-2 -left-2 bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
                    {idx + 1}
                  </div>
                  {!pax.esTitular && passengers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...passengers];
                        next.splice(idx, 1);
                        onChange({ passengers: next });
                      }}
                      className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white transition-colors w-6 h-6 rounded-full flex items-center justify-center shadow-sm md:opacity-0 md:group-hover:opacity-100 z-10"
                      title="Eliminar pasajero"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  
                  {isNew ? (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Seleccionar Cliente Registrado</span>
                      <Combobox
                        value=""
                        onChange={(val) => {
                          if (!val) return;
                          const foundClient = clients.find(c => String(c.id) === val);
                          if (foundClient) {
                            const next = [...passengers];
                            next[idx] = {
                              ...next[idx],
                              name: foundClient.name || `${foundClient.firstName} ${foundClient.lastName || ''}`.trim(),
                              docType: foundClient.docType || '',
                              docNumber: foundClient.docNumber || ''
                            };
                            onChange({ passengers: next });
                          }
                        }}
                        options={clients.map(c => ({ value: String(c.id), label: `${c.name || `${c.firstName} ${c.lastName || ''}`} - ${c.docNumber || ''}` }))}
                        placeholder="Buscar cliente..."
                      />
                    </div>
                  ) : (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${travel.isRoundTrip ? "md:grid-cols-6" : "md:grid-cols-5"} gap-3 mt-2`}>
                      <FormField label="Nombre Completo">
                        <Input
                          value={pax.name || ''}
                          onChange={(e) => {
                            const next = [...passengers];
                            next[idx] = { ...next[idx], name: e.target.value.toUpperCase() };
                            onChange({ passengers: next });
                          }}
                          placeholder="Nombres y Apellidos"
                          className="text-gray-900 dark:text-white"
                        />
                      </FormField>
                      <FormField label="Tipo Doc.">
                        <select
                          value={pax.docType || ''}
                          onChange={(e) => {
                            const next = [...passengers];
                            next[idx] = { ...next[idx], docType: e.target.value };
                            onChange({ passengers: next });
                          }}
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Sel...</option>
                          {documentTypes ? documentTypes.map((d: any) => (
                            <option key={d.id || d.abreviatura} value={d.abreviatura}>{d.abreviatura}</option>
                          )) : (
                            <>
                              <option value="CC">CC</option>
                              <option value="CE">CE</option>
                              <option value="PASAPORTE">Pasaporte</option>
                              <option value="TI">TI</option>
                              <option value="RC">RC</option>
                            </>
                          )}
                          {pax.docType && (!documentTypes?.find((d: any) => d.abreviatura === pax.docType)) && !['CC', 'CE', 'PASAPORTE', 'TI', 'RC'].includes(pax.docType) && (
                            <option value={pax.docType}>{pax.docType}</option>
                          )}
                        </select>
                      </FormField>
                      <FormField label="No. Documento">
                        <Input
                          value={pax.docNumber || ''}
                          onChange={(e) => {
                            const next = [...passengers];
                            next[idx] = { ...next[idx], docNumber: e.target.value.replace(/[^0-9A-Za-z]/g, '') };
                            onChange({ passengers: next });
                          }}
                          placeholder="Número"
                          className="text-gray-900 dark:text-white"
                        />
                      </FormField>
                      <FormField label={travel.isRoundTrip ? "Asiento Ida" : "Asiento"}>
                        <Input
                          value={pax.asiento || ''}
                          onChange={(e) => {
                            const next = [...passengers];
                            next[idx] = { ...next[idx], asiento: e.target.value.toUpperCase() };
                            onChange({ passengers: next });
                          }}
                          placeholder="Ej. 4B"
                          className="text-gray-900 dark:text-white"
                        />
                      </FormField>
                      {travel.isRoundTrip && (
                        <FormField label="Asiento Regreso">
                          <Input
                            value={pax.asientoRegreso || ''}
                            onChange={(e) => {
                              const next = [...passengers];
                              next[idx] = { ...next[idx], asientoRegreso: e.target.value.toUpperCase() };
                              onChange({ passengers: next });
                            }}
                            placeholder="Ej. 9C"
                            className="text-gray-900 dark:text-white"
                          />
                        </FormField>
                      )}
                      <div className="flex items-end h-[68px] pb-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className="relative flex items-center justify-center w-5 h-5">
                            <input
                              type="radio"
                              name={titularGroup}
                              checked={pax.esTitular}
                              onChange={() => {
                                const next = passengers.map((p: any, i: number) => ({ ...p, esTitular: i === idx }));
                                onChange({ passengers: next });
                              }}
                              className="peer sr-only"
                            />
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-primary peer-checked:bg-primary transition-all"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Es Titular</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <FinancialSection 
        supplierName={travel.supplierName}
        supplierCost={travel.supplierCost}
        supplierPaymentMethod={travel.supplierPaymentMethod}
        isPaymentMethodRequired={true}
        paymentMethods={paymentMethods}
        ta={travel.ta}
        taCre={travel.taCre}
        suppliers={suppliers}
        onChange={(updates) => onChange(updates)}
      />

      <VoucherField 
        voucher={travel.voucher} 
        sendVoucher={travel.sendVoucher} 
        onChange={(updates) => onChange(updates)} 
      />
    </div>
  );
}
