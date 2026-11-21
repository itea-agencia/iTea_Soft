/**
 * Forma de pago que muestra el voucher, derivada de los pagos de la venta.
 *
 * Antes mandaba `sale.paymentMethod`, el metodo principal que el servidor guarda solo al
 * crear la venta: un credito abierto en efectivo y abonado por transferencia seguia
 * diciendo "Efectivo". Y con los pagos se contaban filas, no metodos, asi que dos pagos
 * por transferencia salian como "Mixto". El principal guardado queda solo como respaldo
 * de una venta sin pagos.
 */
export function paymentMethodLabel(sale: {
  paymentMethod?: string | null;
  payments?: Array<{ method?: string | null }>;
}): string {
  const methods = Array.from(new Set((sale.payments || []).map((p) => p.method).filter(Boolean)));
  if (methods.length > 1) return 'Mixto';
  if (methods.length === 1) return methods[0] as string;
  return sale.paymentMethod || '—';
}
