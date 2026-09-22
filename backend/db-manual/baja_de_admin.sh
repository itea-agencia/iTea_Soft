#!/usr/bin/env bash
# Da de baja a un administrador en produccion. Uso:
#   ./baja_de_admin.sh persona@samtur.com            # desactiva
#   ./baja_de_admin.sh persona@samtur.com eliminar   # baja definitiva, libera el correo
# Funciona desde cualquier directorio y no depende de node ni de dotenv.
set -euo pipefail

EMAIL="${1:?Falta el correo del admin: ./baja_de_admin.sh persona@samtur.com [eliminar]}"
MODO="${2:-desactivar}"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/../.env.production"
SQL_FILE="$DIR/baja_de_admin.sql"

[ -f "$ENV_FILE" ] || { echo "No encuentro $ENV_FILE"; exit 1; }
[ -f "$SQL_FILE" ] || { echo "No encuentro $SQL_FILE"; exit 1; }

# DIRECT_URL es el session pooler (puerto 5432). El transaction pooler de DATABASE_URL
# (6543) no sirve para psql.
URL="$(sed -n 's/^DIRECT_URL=//p' "$ENV_FILE" | head -1 | tr -d '"'"'"'\r')"
[ -n "$URL" ] || { echo "No pude leer DIRECT_URL de $ENV_FILE"; exit 1; }

echo "Conectando a $(printf '%s' "$URL" | sed -E 's#//[^@]*@#//***@#')"
echo "Admin: $EMAIL   modo: $MODO"
echo
psql "$URL" -v ON_ERROR_STOP=1 -v email="$EMAIL" -v modo="$MODO" -f "$SQL_FILE"
