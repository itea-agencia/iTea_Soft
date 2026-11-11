// Que paso con los vouchers de una venta. El mensaje decia "enviados" si habia alguno marcado,
// sin saber si habian salido (hallazgo 10 de la auditoria del frontend, invariante 4).

export interface VoucherFailure {
  label: string;
  reason: string;
}

export interface VoucherDelivery {
  sent: string[];
  failed: VoucherFailure[];
}

export interface VoucherIssues {
  saleId: number;
  sentText: string | null;
  failed: VoucherFailure[];
}

// Los mismos nombres que `nombreServicio` de PRODUCT_HANDLERS en el backend.
const VOUCHER_PRODUCTS: [string, string][] = [
  ['plans', 'Planes'],
  ['checkIns', 'Check-in'],
  ['migrations', 'Documentación Migratoria'],
  ['simCards', 'SIM Card'],
  ['baggages', 'Equipaje'],
  ['carRentals', 'Renta de Vehículos'],
  ['landTravels', 'Viajes Terrestres'],
  ['fincas', 'Renta de Fincas'],
  ['tours', 'Tours'],
  ['conventions', 'Centros de Convención'],
  ['restaurants', 'Restaurantes'],
  ['visas', 'Visa'],
  ['passports', 'Pasaporte'],
  ['petServices', 'Servicio de Mascotas'],
];

// "Enviado" es que el proveedor acepto el correo: no se afirma que el cliente lo recibio.
export function vouchersSentText(count: number, email?: string | null) {
  if (count === 0) return null;
  return count === 1 ? `1 voucher enviado a ${email}` : `${count} vouchers enviados a ${email}`;
}

export function saleSuccessMessage(delivery: VoucherDelivery | undefined, email?: string | null) {
  const sentText = vouchersSentText(delivery?.sent.length ?? 0, email);
  return sentText ? `Venta registrada. ${sentText}` : 'Venta registrada exitosamente';
}

// Lo que ya se sabe que no va a salir, para avisar antes de guardar.
export function pendingVoucherWarnings(form: Record<string, any>, clientEmail?: string | null): VoucherFailure[] {
  const warnings: VoucherFailure[] = [];
  for (const [field, name] of VOUCHER_PRODUCTS) {
    const items: any[] = form[field] || [];
    items.forEach((item, index) => {
      if (!item.sendVoucher) return;
      const label = items.length > 1 ? `${name} ${index + 1}` : name;
      const hasFile = Boolean(item.voucher?.base64) || (item.vouchers || []).some((v: any) => v?.base64);
      if (!clientEmail) warnings.push({ label, reason: 'El cliente no tiene correo' });
      else if (!hasFile) warnings.push({ label, reason: 'No tiene archivo' });
    });
  }
  return warnings;
}
