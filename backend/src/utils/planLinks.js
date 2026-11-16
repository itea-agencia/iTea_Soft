/**
 * Los vinculos servicio -> paquete de una venta, validados antes de abrir la transaccion.
 *
 * El asistente manda en `linkedToPlanIndex` la posicion del paquete en `planData`, contando
 * las filas vacias, que `create` salta. Devuelve un vinculo por servicio vinculado, o lanza
 * un 400 que nombra el servicio con el nombre que ve el asesor ("Tour #1", "Paquete #2").
 * Antes la validacion corria dentro de la transaccion, despues de buscar proveedores y crear
 * personas que luego se revertian. Diseño servicios-vinculados-al-paquete-2026-11.
 *
 * @param data     el body de la venta
 * @param products [{ field, category, name }] por cada categoria de PRODUCT_HANDLERS
 * @returns [{ field, itemIndex, planIndex }]
 */
function resolvePlanLinks(data, products) {
  const isEmpty = (item) => !item || Object.keys(item).length === 0;
  const plans = Array.isArray(data.planData) ? data.planData : [];
  const links = [];

  for (const { field, category, name } of products) {
    const items = Array.isArray(data[field]) ? data[field] : [];
    for (const [itemIndex, item] of items.entries()) {
      if (isEmpty(item)) continue;
      const value = item.linkedToPlanIndex;
      if (value === undefined || value === null || value === '') continue;

      const fail = (reason) => {
        throw Object.assign(new Error(`${name} #${itemIndex + 1}: ${reason}`), { statusCode: 400, code: 'VALIDATION_ERROR' });
      };
      if (category === 'planes') fail('un paquete no se puede vincular a otro paquete');

      // Solo enteros escritos como tales: Number() tambien convierte '1e0', '0x1' o ' 1'.
      const ok = (typeof value === 'number' && Number.isInteger(value)) || (typeof value === 'string' && /^\d+$/.test(value));
      const planIndex = ok ? Number(value) : -1;
      if (planIndex < 0 || planIndex >= plans.length || isEmpty(plans[planIndex])) fail('el paquete vinculado no existe');

      links.push({ field, itemIndex, planIndex });
    }
  }
  return links;
}

module.exports = { resolvePlanLinks };
