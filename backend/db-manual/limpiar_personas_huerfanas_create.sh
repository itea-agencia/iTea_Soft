#!/usr/bin/env bash
# Borra las 6 personas huerfanas de personas.id en {66,67,68,69,70,71}, dejadas por el bug
# viejo de users.controller.js `create` (ya arreglado). Ver limpiar_personas_huerfanas_create.sql.
# Funciona desde cualquier directorio y no depende de node ni de dotenv.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/../.env.production"
SQL_FILE="$DIR/limpiar_personas_huerfanas_create.sql"

[ -f "$ENV_FILE" ] || { echo "No encuentro $ENV_FILE"; exit 1; }
[ -f "$SQL_FILE" ] || { echo "No encuentro $SQL_FILE"; exit 1; }

# DIRECT_URL es el session pooler (puerto 5432). El transaction pooler de DATABASE_URL
# (6543) no sirve para psql.
URL="$(sed -n 's/^DIRECT_URL=//p' "$ENV_FILE" | head -1 | tr -d '"'"'"'\r')"
[ -n "$URL" ] || { echo "No pude leer DIRECT_URL de $ENV_FILE"; exit 1; }

echo "Conectando a $(printf '%s' "$URL" | sed -E 's#//[^@]*@#//***@#')"
echo
psql "$URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
