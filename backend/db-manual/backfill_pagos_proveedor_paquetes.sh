#!/usr/bin/env bash
# Convierte el costo propio de los paquetes en una fila de pago a proveedor.
# Aditivo e idempotente: no cambia ningun total ni ninguna factura.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/../.env.production"
SQL_FILE="$DIR/backfill_pagos_proveedor_paquetes.sql"

[ -f "$ENV_FILE" ] || { echo "No encuentro $ENV_FILE"; exit 1; }
[ -f "$SQL_FILE" ] || { echo "No encuentro $SQL_FILE"; exit 1; }

# DIRECT_URL es el session pooler (puerto 5432). El transaction pooler de DATABASE_URL
# (6543) no sirve para psql.
URL="$(sed -n 's/^DIRECT_URL=//p' "$ENV_FILE" | head -1 | tr -d '"'"'"'\r')"
[ -n "$URL" ] || { echo "No pude leer DIRECT_URL de $ENV_FILE"; exit 1; }

echo "Conectando a $(printf '%s' "$URL" | sed -E 's#//[^@]*@#//***@#')"
echo
psql "$URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
