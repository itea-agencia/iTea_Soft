// Se anunciaba un maximo de 10 MB sin comprobarlo (hallazgo 13 de la auditoria del frontend).
// Se mira la extension: `accept` solo orienta el selector y no valida nada.
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png|docx?)$/i;

export function voucherFileProblem(file: { name: string; size: number }) {
  if (!ALLOWED_EXTENSIONS.test(file.name)) return `${file.name} no es PDF, imagen o DOC y no se agregó.`;
  if (file.size > MAX_FILE_BYTES) return `${file.name} pesa más de 10 MB y no se agregó.`;
  return null;
}
