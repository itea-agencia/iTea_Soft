---
paths:
  - "frontend/**"
---

# En el frontend

- Estado derivado se calcula en el render, no en un `useEffect` que escribe estado.
- No mutar: `next[idx].campo = valor` tras un spread superficial escribe sobre el estado.
- Los radios de "titular" se agrupan con `useId()`. Con `` name={`titular-${idx}`} `` se
  pueden marcar varios a la vez.
- El voucher lo ve el cliente: **no expone costos de proveedor**.
- Un cambio de interfaz no se puede verificar visualmente en este entorno: decilo en vez de
  darlo por bueno.
