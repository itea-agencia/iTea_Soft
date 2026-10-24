#!/usr/bin/env bash
# Rellena creado_por_id de responsables, comisionistas y usuarios en PRODUCCION.
# Va despues de que la migracion 20261024120000_creado_por_id este aplicada.
# Funciona desde cualquier directorio y no depende de node ni de dotenv.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/../.env.production"
SQL_FILE="$DIR/rellenar_creado_por.sql"

[ -f "$ENV_FILE" ] || { echo "No encuentro $ENV_FILE"; exit 1; }
[ -f "$SQL_FILE" ] || { echo "No encuentro $SQL_FILE"; exit 1; }

# DIRECT_URL es el session pooler (puerto 5432). El transaction pooler de DATABASE_URL
# (6543) no sirve para psql.
URL="$(sed -n 's/^DIRECT_URL=//p' "$ENV_FILE" | head -1 | tr -d '"'"'"'\r')"
[ -n "$URL" ] || { echo "No pude leer DIRECT_URL de $ENV_FILE"; exit 1; }

echo "Conectando a $(printf '%s' "$URL" | sed -E 's#//[^@]*@#//***@#')"
echo
psql "$URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
