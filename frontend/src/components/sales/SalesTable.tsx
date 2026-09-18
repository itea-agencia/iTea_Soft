import { useState, useEffect, useRef } from "react";
import { Eye, FileDown, Pencil, Ban, ChevronDown, CheckCircle2 } from "lucide-react";
import { RxUpdate } from "react-icons/rx";
import { Table, TableRow, TableCell, Pagination } from "../ui/Table";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatDate, formatSaleId } from "../../utils/formatters";
import { Sale, Client, User } from "../../types";

// Valor centinela del select. Separado de la etiqueta a proposito.
const MARCAR_FACTURADO = 'marcar-facturado';

/**
 * Cómo se ve la factura de Siigo de una venta en el listado.
 *
 * Va en columna propia y no junto al estado de cobro: la marca "Facturado" que ya está
 * ahí es una anotación manual del asesor y significa otra cosa. Dos ejes distintos en una
 * misma celda se leen como si fueran lo mismo.
 *
 * El color dice en qué punto está, y el texto lo repite para que no dependa del color.
 */
function marcaSiigo(sale: Sale) {
  const f = sale.siigoInvoice;
  if (!f) return null;

  if (f.estado === 'emitida') {
    return {
      texto: f.numero || 'Generada',
      detalle: null,
      titulo: 'Factura generada en Siigo',
      clases: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  if (f.estado === 'fallida') {
    return {
      texto: 'Falló',
      detalle: null,
      titulo: 'El último intento de facturar fue rechazado. Abrí el detalle para ver el motivo.',
      clases: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  if (f.estado === 'anulada') {
    return {
      texto: 'Anulada',
      detalle: null,
      titulo: 'La factura fue anulada en Siigo',
      clases: 'bg-gray-100 text-gray-600 border-gray-200',
    };
  }

  // `pendiente`: hubo intentos que no crearon la factura.
  return {
    texto: 'Sin emitir',
    detalle: null,
    titulo: 'Se intentó facturar y la factura no llegó a crearse en Siigo',
    clases: 'bg-gray-100 text-gray-500 border-gray-200',
  };
}

interface SalesTableProps {
  sales: Sale[];
  clients: Client[];
  users: User[];
  onViewDetail: (sale: Sale) => void;
  onPrefetchDetail?: (sale: Sale) => void;
  onDownloadVoucher: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  canEditThis: (sale: Sale) => boolean;
  isAdmin: boolean;
  onReviewStatusChange?: (saleId: number, isReviewed: boolean) => void;
}

export default function SalesTable({
  sales,
  clients,
  users,
  onViewDetail,
  onPrefetchDetail,
  onDownloadVoucher,
  onEdit,
  onDelete,
  canEditThis,
  isAdmin,
  onReviewStatusChange,
}: SalesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Volver a la página 1 cuando se agrega una nueva venta
  useEffect(() => {
    setCurrentPage(1);
  }, [sales.length]);

  const currentSales = sales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col gap-4">
    <Table
      headers={[
        "#",
        "Cliente",
        "Asesor",
        "Comisionista",
        "Total",
        "Fecha",
        "Estado",
        "Siigo",
        <span className="block text-right">Acciones</span>,
      ]}
    >
      {currentSales.map((sale) => {
        const client = clients.find(c => c.id === sale.clientId);
        const asesor = users.find(u => u.id === sale.asesorId);

        return (
          <TableRow key={sale.id}>
            <TableCell>{formatSaleId(sale.id)}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium text-primary leading-tight">
                  {sale.clientName}
                </span>
                <span className="text-[10px] text-gray-500">
                  {sale.clientEmail || "Sin correo"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700 leading-tight">
                    {sale.asesorName}
                  </span>
                 
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="text-s font-medium text-gray-700">
                  {sale.commissionAgentName || "Venta Directa"}
                </span>
              </div>  
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-bold text-primary">
                  {formatCurrency(sale.total)}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-xs text-gray-500">
              {formatDate(sale.date)}
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Badge variant={sale.status} className="uppercase text-[9px] font-black">
                    {sale.status === "pagado"
                      ? "Finalizado"
                      : sale.status === "abonado"
                        ? "Abonado"
                        : sale.status === "anulado"
                          ? "Anulado"
                          : "En Crédito"}
                  </Badge>
                  {sale.status === "pagado" && onReviewStatusChange && (
                    <div className="relative inline-flex items-center">
                      {sale.isReviewed ? (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100" title="Facturado">
                          <CheckCircle2 size={12} />
                        </span>
                      ) : (
                        <div
                          className="relative flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors border border-transparent hover:border-gray-200"
                          title="Marcar como facturado"
                        >
                          <select
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value=""
                            onChange={(e) => {
                              // El valor es un centinela, no la etiqueta: asi renombrar el
                              // texto visible no puede romper la accion.
                              if (e.target.value === MARCAR_FACTURADO) {
                                onReviewStatusChange(sale.id, true);
                              }
                            }}
                          >
                            <option value="" disabled>Opciones...</option>
                            <option value={MARCAR_FACTURADO}>Marcar como facturado</option>
                          </select>
                          <ChevronDown size={14} className="pointer-events-none" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {sale.status === "credito" && sale.creditDueDate && (
                  <span className="text-[10px] text-rose-500 font-medium whitespace-nowrap">
                    Vence: {formatDate(sale.creditDueDate)}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              {(() => {
                const marca = marcaSiigo(sale);
                if (!marca) {
                  return <span className="text-xs text-gray-300 dark:text-slate-600">—</span>;
                }
                return (
                  <span
                    title={marca.titulo}
                    className={`inline-flex items-baseline gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold whitespace-nowrap ${marca.clases}`}
                  >
                    {marca.texto}
                    {marca.detalle && (
                      <span className="font-normal opacity-80">· {marca.detalle}</span>
                    )}
                  </span>
                );
              })()}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewDetail(sale)}
                  onMouseEnter={() => onPrefetchDetail?.(sale)}
                  title="Ver detalle"
                >
                  <Eye size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDownloadVoucher(sale)}
                  title="Descargar Voucher"
                >
                  <FileDown size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(sale)}
                  disabled={!canEditThis(sale)}
                  title={canEditThis(sale) ? "Actualizar abonos" : "No editable"}
                >
                  <RxUpdate size={14} className={canEditThis(sale) ? "text-primary" : "text-gray-300"} />
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                    onClick={() => onDelete(sale)}
                    disabled={sale.status === "anulado"}
                    title={sale.status === "anulado" ? "Venta ya anulada" : "Anular venta"}
                  >
                    <Ban size={14} className={sale.status === "anulado" ? "text-red-300" : ""} />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
    
    <Pagination 
      currentPage={currentPage} 
      totalPages={totalPages} 
      onPageChange={setCurrentPage} 
    />
    </div>
  );
}
