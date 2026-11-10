// Un cliente se elige por id, no por nombre: con dos homónimos se tomaba el primero y la venta
// o los datos de un integrante quedaban con la persona equivocada (hallazgo 4 de la auditoría
// del frontend). La etiqueta lleva el documento para que se puedan distinguir en la lista.

interface ClientLike {
  id: number | string;
  name?: string;
  firstName?: string;
  lastName?: string;
  docType?: string;
  docNumber?: string;
}

export const clientName = (c: ClientLike) =>
  c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim();

export const clientOption = (c: ClientLike) => ({
  value: String(c.id),
  label: [clientName(c), [c.docType, c.docNumber].filter(Boolean).join(' ')].filter(Boolean).join(' · '),
});

// `any` como el resto del asistente: devuelve el cliente completo, no solo lo de ClientLike.
export const findClientById = (clients: any[], id: string | number): any =>
  id === '' ? undefined : clients.find((c) => String(c.id) === String(id));
