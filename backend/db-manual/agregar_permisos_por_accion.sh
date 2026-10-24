#!/usr/bin/env bash
# Agrega los permisos por accion del catalogo en PRODUCCION, heredando valores. No borra nada.
# Va antes del deploy del codigo nuevo (ver docs/designs/permisos-por-rol-2026-10.md).
# Funciona desde cualquier directorio y no depende de node ni de dotenv.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/../.env.production"
SQL_FILE="$DIR/agregar_permisos_por_accion.sql"

[ -f "$ENV_FILE" ] || { echo "No encuentro $ENV_FILE"; exit 1; }
[ -f "$SQL_FILE" ] || { echo "No encuentro $SQL_FILE"; exit 1; }

# DIRECT_URL es el session pooler (puerto 5432). El transaction pooler de DATABASE_URL
# (6543) no sirve para psql.
URL="$(sed -n 's/^DIRECT_URL=//p' "$ENV_FILE" | head -1 | tr -d '"'"'"'\r')"
[ -n "$URL" ] || { echo "No pude leer DIRECT_URL de $ENV_FILE"; exit 1; }

echo "Conectando a $(printf '%s' "$URL" | sed -E 's#//[^@]*@#//***@#')"
echo
psql "$URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
