import { Users } from "lucide-react";
import { FormField, Input, Combobox, Select } from "../../ui/Form";
import { WizardFormData } from "../wizardData";
import { clientOption, findClientById } from "../../../utils/clientOptions";

export function Step1Client({ form, set, data, errors, asesores }: any) {
  return (
    <div className="animate-fade-in space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-primary text-base">
              Cliente y Comisionista
            </h3>
            <p className="text-xs text-gray-500">
              Selecciona el cliente y los datos del comisionista si aplica.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Cliente *" error={errors.clientId}>
            <Combobox
              value={form.clientId}
              // Solo cuenta un cliente elegido de la lista: lo escrito sin elegir deja el campo
              // vacio, y al salir se borra (decision del usuario, 2026-11-10).
              onChange={(val, picked) => set("clientId", picked ? val : "")}
              options={data.clients
                .filter((c: any) => c.status === "active")
                .map(clientOption)}
              placeholder="Seleccionar o escribir nombre..."
              error={errors.clientId}
            />
          </FormField>

          <FormField label="Asesor *" error={errors.asesorId}>
            {/* Por id, como el cliente: por nombre, un texto que no era nadie dejaba el id
                anterior y dos usuarios con el mismo nombre se confundian. */}
            <Combobox
              value={form.asesorId}
              onChange={(val, picked) => set("asesorId", picked ? val : "")}
              options={asesores.map((a: { id: number; name: string }) => ({
                value: String(a.id),
                label: a.name,
              }))}
              placeholder="¿Quién realiza la venta?"
              error={errors.asesorId}
            />
          </FormField>

          <FormField label="Comisionista / Referido" error={errors.commissionAgent}>
            <Combobox
              value={form.commissionAgentId || form.commissionAgentName || ""}
              onChange={(val, picked) => {
                if (!val) {
                  set("commissionAgentId", "");
                  set("commissionAgentName", "");
                  set("commissionAgentAmount", "0");
                  set("commissionAgentRetentionPercentage", "0");
                  set("commissionAgentNetPayment", "0");
                } else {
                  // Por id: dos comisionistas con el mismo nombre se confundian. Lo escrito sin
                  // elegir queda como nombre y la validacion del paso 1 lo rechaza.
                  const agent = picked && (data.commissionAgentsForSale || []).find((a: any) => String(a.id) === val);
                  if (agent) {
                    set("commissionAgentId", String(agent.id));
                    set("commissionAgentName", agent.name);
                  } else {
                    set("commissionAgentId", "");
                    set("commissionAgentName", val);
                  }
                }
              }}
              options={(data.commissionAgentsForSale || []).filter((a: any) => a.status === "Activo").map((a: any) => ({
                value: String(a.id),
                label: a.docLast4 ? `${a.name} · …${a.docLast4}` : a.name,
              }))}
              placeholder="Venta Directa (Sin Comisionista)"
              error={errors.commissionAgent}
            />
          </FormField>
        </div>

        {/* Client preview card */}
        {form.clientId && (() => {
          const client = findClientById(data.clients, form.clientId);
          if (!client) return null;
          return (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="font-bold text-gray-800 text-sm truncate">
                {client.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {[
                  [client.docType, client.docNumber].filter(Boolean).join(" "),
                  client.email,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          );
        })()}
      </div>
  );
}
