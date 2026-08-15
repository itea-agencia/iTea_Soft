import { useState, useEffect } from "react";
import {
  Plane,
  Building2,
  ShieldCheck,
  Package,
  Luggage,
  FileInput,
  Smartphone,
  Car,
  TreePine,
  Compass,
  Music,
  UtensilsCrossed,
  FileText,
  PawPrint,
  ShoppingBag,
  Loader2,
  AlertCircle,
  Receipt
} from "lucide-react";
import * as api from "../../api";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatDate, formatSaleId } from "../../utils/formatters";
import { Sale, Client, Responsable } from "../../types";

const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  Tiquetería: <Plane size={16} className="text-primary" />,
  Hotelería: <Building2 size={16} className="text-primary" />,
  Seguros: <ShieldCheck size={16} className="text-primary" />,
  Planes: <Package size={16} className="text-primary" />,
  CheckIn: <Luggage size={16} className="text-primary" />,
  Migración: <FileInput size={16} className="text-primary" />,
  SimCard: <Smartphone size={16} className="text-primary" />,
  AlquilerAutos: <Car size={16} className="text-primary" />,
  Finca: <TreePine size={16} className="text-primary" />,
  Tour: <Compass size={16} className="text-primary" />,
  Evento: <Music size={16} className="text-primary" />,
  Restaurante: <UtensilsCrossed size={16} className="text-primary" />,
  Visa: <FileText size={16} className="text-primary" />,
  Pasaporte: <FileText size={16} className="text-primary" />,
  Mascotas: <PawPrint size={16} className="text-primary" />,
  Equipaje: <Luggage size={16} className="text-primary" />,
};

function getProductDetails(type: string, data: any[]): { label: string; count: number } {
  const arr = data || [];
  return { label: type, count: arr.length };
}

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSale: Sale | null;
  clients: Client[];
  responsables: Responsable[];
  onViewProductDetails: (product: { type: string; data: any[] }) => void;
}

const isAlreadyFull = (sale: Sale | null): boolean => {
  if (!sale) return false;
  return (
    sale.ticketData !== undefined ||
    sale.hotelData !== undefined ||
    sale.insuranceData !== undefined ||
    sale.planData !== undefined ||
    sale.checkInData !== undefined ||
    sale.migrationData !== undefined ||
    sale.simCardData !== undefined ||
    sale.baggageData !== undefined ||
    sale.carRentalData !== undefined ||
    sale.fincaData !== undefined ||
    sale.tourData !== undefined ||
    sale.conventionData !== undefined ||
    sale.restaurantData !== undefined ||
    sale.visaData !== undefined ||
    sale.passportData !== undefined ||
    sale.petServiceData !== undefined
  );
};

export default function SaleDetailModal({
  isOpen,
  onClose,
  selectedSale,
  clients,
  responsables,
  onViewProductDetails,
}: SaleDetailModalProps) {
  const [fullSale, setFullSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingProductView, setPendingProductView] = useState<{ key: string; label: string } | null>(null);
  
  // Siigo Integration State
  const [isInvoicing, setIsInvoicing] = useState(false);
  const [invoiceSuccess, setInvoiceSuccess] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");

  useEffect(() => {
    if (isOpen && selectedSale) {
      if (isAlreadyFull(selectedSale)) {
        setFullSale(selectedSale);
        setLoading(false);
        setError("");
      } else {
        setLoading(true);
        setError("");
        setFullSale(null);
        api.getSale(selectedSale.id).then(fetched => {
          setFullSale(fetched);
        }).catch(() => {
          setFullSale(selectedSale);
          setError("No se pudieron cargar los detalles completos");
        }).finally(() => setLoading(false));
      }
    } else {
      setFullSale(null);
      setPendingProductView(null);
    }
  }, [isOpen, selectedSale]);

  useEffect(() => {
    if (fullSale && isAlreadyFull(fullSale) && pendingProductView) {
      const data = (fullSale as any)[pendingProductView.key] || [];
      onViewProductDetails({ type: pendingProductView.label, data });
      setPendingProductView(null);
    }
  }, [fullSale, pendingProductView]);

  const handleGenerateInvoice = async () => {
    if (!sale) return;
    setIsInvoicing(true);
    setInvoiceError("");
    setInvoiceSuccess(false);
    
    try {
      await api.createSiigoInvoice(sale.id);
      setInvoiceSuccess(true);
      setTimeout(() => setInvoiceSuccess(false), 5000);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || "Ocurrió un error inesperado al facturar en Siigo.";
      setInvoiceError(msg);
    } finally {
      setIsInvoicing(false);
    }
  };

  if (!selectedSale) return null;

  const currentFullSale = fullSale?.id === selectedSale.id ? fullSale : null;
  const sale = currentFullSale || selectedSale;
  const client = clients.find((c) => c.id === sale.clientId);
  // Find full responsable data if the sale has one assigned
  const responsable = sale.responsableId
    ? responsables.find((r) => r.id === sale.responsableId)
    : undefined;
  const commissionAmount = sale.commissionAgentNetPayment || 0;
  const supplierCost = sale.supplierCost || 0;
  const ta = sale.ta || 0;
  const taCre = sale.taCre || 0;
  const ivaAmount = (ta + taCre) * 0.19;
  const gananciaNeta = sale.total - supplierCost - commissionAmount;

  const productSections = [
    { key: "ticketData", label: "Tiquetería", summaryType: "tiqueteria" },
    { key: "hotelData", label: "Hotelería", summaryType: "hoteleria" },
    { key: "insuranceData", label: "Seguros", summaryType: "seguros_viaje" },
    { key: "planData", label: "Planes", summaryType: "planes" },
    { key: "checkInData", label: "CheckIn", summaryType: "checkin" },
    { key: "migrationData", label: "Migración", summaryType: "documentacion_migratoria" },
    { key: "simCardData", label: "SimCard", summaryType: "simcard" },
    { key: "baggageData", label: "Equipaje", summaryType: "equipaje" },
    { key: "carRentalData", label: "AlquilerAutos", summaryType: "renta_vehiculos" },
    { key: "fincaData", label: "Finca", summaryType: "renta_fincas" },
    { key: "tourData", label: "Tour", summaryType: "tours" },
    { key: "conventionData", label: "Evento", summaryType: "centros_convencion" },
    { key: "restaurantData", label: "Restaurante", summaryType: "restaurantes" },
    { key: "visaData", label: "Visa", summaryType: "visa" },
    { key: "passportData", label: "Pasaporte", summaryType: "pasaporte" },
    { key: "petServiceData", label: "Mascotas", summaryType: "servicio_mascotas" },
  ];

  const suppliersList = (() => {
    const suppliers = new Set<string>();
    productSections.forEach(({ key }) => {
      const dataArr = (sale as any)[key];
      if (Array.isArray(dataArr)) {
        dataArr.forEach((item: any) => {
          const name = item.supplier || item.supplierName;
          if (name && typeof name === "string" && name.trim()) {
            suppliers.add(name.trim());
          }
        });
      }
    });
    return Array.from(suppliers).join(", ") || "No especificado";
  })();

  const hasAnyProduct = (sale.servicesSummary && sale.servicesSummary.length > 0) || productSections.some(
    ({ key }) => (sale as any)[key] && (sale as any)[key].length > 0
  );

  const getCustomObservations = (obs: string) => {
    if (!obs) return "";
    const parts = obs.split("\n---\n");
    if (parts.length > 1) {
      return parts[1].trim();
    }
    const txt = parts[0].trim();
    const hasServiceKeywords = productSections.some(({ label }) => 
      txt.toLowerCase().includes(label.toLowerCase())
    ) || txt.toLowerCase().includes("luticket") || txt.toLowerCase().includes("decameron");
    
    if (hasServiceKeywords && txt.split("\n").length <= 2) {
      return "";
    }
    return txt;
  };

  const onViewProductClick = (key: string, label: string) => {
    if (fullSale && isAlreadyFull(fullSale)) {
      const data = (fullSale as any)[key] || [];
      onViewProductDetails({ type: label, data });
    } else {
      setPendingProductView({ key, label });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Venta #${formatSaleId(sale.id)}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button 
            className="bg-gray-400 text-white flex items-center gap-2 cursor-not-allowed"
            disabled={true}
          >
            <Receipt size={16} />
            Generar Factura en Siigo (Mantenimiento)
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Cargando detalles completos...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Mensajes de Siigo */}
          {invoiceSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 shadow-sm animate-fade-in">
              <ShieldCheck size={18} />
              <strong>¡Éxito!</strong> La factura electrónica ha sido generada correctamente en Siigo.
            </div>
          )}
          {invoiceError && (
            <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 shadow-sm animate-fade-in">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div>
                <strong>Error al facturar:</strong> {invoiceError}
              </div>
            </div>
          )}

          {/* Sección Venta */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
            Información de la Venta
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <span className="text-gray-500 text-xs block">Venta #</span>
              <span className="font-bold text-gray-800">{formatSaleId(sale.id)}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Fecha</span>
              <span className="font-medium text-gray-800">
                {formatDate(sale.date)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Estado</span>
              <Badge variant={sale.status}>{sale.status}</Badge>
            </div>
            <div>
              <span className="text-gray-500 text-xs block">Valor Final</span>
              <span className="font-black text-emerald-600">
                {formatCurrency(sale.total)}
              </span>
            </div>
            {sale.isCredit && sale.creditDueDate && (
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-500 text-xs block">Vence Crédito</span>
                <span className="font-medium text-rose-600">
                  {formatDate(sale.creditDueDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sección Cliente */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
            Detalles del Cliente
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-500 text-xs block">Nombre Titular</span>
              <span className="font-medium text-gray-800">
                {sale.clientName}
              </span>
            </div>
            {client ? (
              <>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Documento</span>
                  <span className="font-medium text-gray-800">
                    {client.docType} {client.docNumber}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Correo</span>
                  <span className="font-medium text-gray-800 break-words">
                    {client.email}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-xs block">Teléfono</span>
                  <span className="font-medium text-gray-800">
                    {client.phone}
                  </span>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-sm text-gray-400 italic flex items-center">
                Detalles adicionales del cliente no disponibles
              </div>
            )}
          </div>

          {/* Lista de Clientes Registrados para la Venta */}
          {(() => {
            const allClients: any[] = [];

            // 1. Añadir al cliente titular de la venta
            if (sale.clientName) {
              allClients.push({
                name: sale.clientName,
                esTitular: true,
                docType: (sale as any).clientDocType || '',
                docNumber: (sale as any).clientDocNumber || ''
              });
            }

            // 2. Extraer de los servicios resumidos o los objetos de producto
            productSections.forEach(({ key }) => {
              const items = (sale as any)[key];
              if (Array.isArray(items)) {
                items.forEach((item: any) => {
                  const paxList = item.passengers || item.guests || item.members || 
                    (item.passengerName ? [{ name: item.passengerName, docType: item.docType || item.tipoDocumento, docNumber: item.docNumber || item.nroDocumento }] : 
                    (item.passengerInfo ? [item.passengerInfo] : []));

                  if (Array.isArray(paxList)) {
                    paxList.forEach((pax: any) => {
                      const paxNameCandidate = pax?.name || pax?.passengerName || pax?.fullName || 
                               (pax?.firstName ? `${pax.firstName} ${pax.lastName || ''}`.trim() : null) ||
                               (pax?.nombres ? `${pax.nombres} ${pax.apellidos || ''}`.trim() : null) ||
                               (pax?.persona?.nombres ? `${pax.persona.nombres} ${pax.persona.apellidos || ''}`.trim() : null);
                      const name = typeof pax === 'string' ? pax : paxNameCandidate;
                      
                      if (name && name.trim() !== "" && !allClients.some(existing => existing.name?.toLowerCase().trim() === name.toLowerCase().trim())) {
                        allClients.push({
                          name: name.trim(),
                          esTitular: typeof pax === 'object' ? (pax.esTitular || false) : false,
                          docType: typeof pax === 'object' ? (pax.docType || pax.tipoDocumento || pax.documentType || '') : '',
                          docNumber: typeof pax === 'object' ? (pax.docNumber || pax.nroDocumento || pax.nroTiquete || pax.documentNumber || '') : ''
                        });
                      }
                    });
                  }
                });
              }
            });

            // 3. Revisar también en servicesSummary si existen detalles
            if (Array.isArray(sale.servicesSummary)) {
              sale.servicesSummary.forEach((s: any) => {
                if (s.detail) {
                  // Los nombres suelen concatenarse con " · "
                  const parts = s.detail.split(' · ');
                  parts.forEach((p: string) => {
                    const trimmed = p.trim();
                    // Evitar rutas con flechas "Medellin→Bogota" o términos genéricos
                    if (trimmed && !trimmed.includes('→') && !allClients.some(existing => existing.name?.toLowerCase().trim() === trimmed.toLowerCase())) {
                      // Si tiene al menos dos palabras o pinta como nombre de persona
                      if (trimmed.split(/\s+/).length >= 2) {
                        allClients.push({
                          name: trimmed,
                          esTitular: false,
                          docType: '',
                          docNumber: ''
                        });
                      }
                    }
                  });
                }
              });
            }

            if (allClients.length === 0) return null;

            return (
              <div className="mt-3 bg-gray-50/80 dark:bg-slate-800/80 p-4 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide block mb-2">
                  Clientes Registrados en la Venta ({allClients.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allClients.map((c, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-white dark:bg-slate-700 px-3 py-2 rounded-lg border border-gray-150 dark:border-slate-600 shadow-2xs transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 dark:text-slate-200">{c.name}</span>
                        {c.esTitular && (
                          <span className="text-[9px] bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-1.5 py-0.5 rounded font-bold uppercase">
                            Titular
                          </span>
                        )}
                      </div>
                      {(c.docNumber || c.docType) && (
                        <span className="text-gray-500 dark:text-slate-400 font-mono">
                          {c.docType ? `${c.docType}: ` : ''}{c.docNumber}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sección Operativo y Financiero */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
            Detalles Operativos y Financieros
          </h4>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            {/* Fila 1: Asesor, Proveedor(es), Pago a Proveedores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-xs block">
                  Asesor
                </span>
                <span className="font-medium text-gray-800">
                  {sale.asesorName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">
                  Pago a Proveedores
                </span>
                <span className="font-medium text-rose-600">
                  {formatCurrency(supplierCost)}
                </span>
              </div>
            </div>

            <hr className="border-gray-100 dark:border-slate-800" />

            {/* Fila 2: Valor TA, Valor TA CRE, TA TOTAL NETA, IVA, Pago Comisionista */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <span className="text-gray-500 text-xs block">
                  Valor TA
                </span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(ta)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">
                  TA SAE
                </span>
                <span className="font-medium text-amber-600">
                  {formatCurrency(taCre)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">
                  TA TOTAL NETA
                </span>
                <span className="font-bold text-indigo-600">
                  {formatCurrency((ta + taCre) - commissionAmount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">
                  IVA (19%)
                </span>
                <span className="font-medium text-emerald-600">
                  {formatCurrency(ivaAmount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">
                  Pago Comisionista
                </span>
                <span className="font-medium text-amber-600">
                  {formatCurrency(commissionAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Comisionista */}
        {(sale.commissionAgentName || commissionAmount > 0) && (
          <div>
            <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3">
              Detalles del Comisionista
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <span className="text-gray-500 text-xs block">Nombre</span>
                <span className="font-medium text-gray-800">
                  {sale.commissionAgentName || "-"}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">% Retención Oficina</span>
                <span className="font-medium text-gray-800">
                  {sale.commissionAgentRetentionPercentage || 0}%
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-xs block">Neto a Pagar</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(commissionAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sección Responsable */}
        {(sale.responsableId || sale.responsableName) && (
          <div>
            <h4 className="text-sm font-bold text-primary border-b border-gray-200 dark:border-slate-700 pb-2 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">R</span>
              Responsable Asignado
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-500 dark:text-slate-400 text-xs block">Nombre</span>
                <span className="font-semibold text-gray-800 dark:!text-[#ffffff]">
                  {responsable ? `${responsable.firstName} ${responsable.lastName}` : (sale.responsableName || "-")}
                </span>
              </div>
              {responsable ? (
                <>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 text-xs block">Documento</span>
                    <span className="font-medium text-gray-800 dark:!text-[#ffffff]">
                      {responsable.docType ? `${responsable.docType} ` : ""}{responsable.docNumber || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 text-xs block">Teléfono</span>
                    <span className="font-medium text-gray-800 dark:!text-[#ffffff]">
                      {responsable.phone || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 text-xs block">Correo</span>
                    <span className="font-medium text-gray-800 dark:!text-[#ffffff] break-words">
                      {responsable.email || "-"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="col-span-3 text-sm text-gray-400 italic flex items-center">
                  Datos adicionales del responsable no disponibles
                </div>
              )}
            </div>
          </div>
        )}

        {/* Servicios Vendidos */}
        <div>
          <h4 className="text-sm font-bold text-primary border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
            <ShoppingBag size={16} className="text-accent" /> Desglose de Servicios
          </h4>
          {!hasAnyProduct ? (
            <p className="text-sm text-gray-400 italic p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No hay servicios registrados para esta venta.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {productSections.map(({ key, label, summaryType }) => {
                // If fullSale has loaded, check if this section has products.
                // Otherwise, check if this category exists in servicesSummary.
                const hasProduct = fullSale 
                  ? ((fullSale as any)[key] && (fullSale as any)[key].length > 0)
                  : (sale.servicesSummary || []).some(s => s.tipo === summaryType);

                if (!hasProduct) return null;
                
                const isPending = pendingProductView?.key === key;
                const itemsCount = fullSale ? ((fullSale as any)[key]?.length || 0) : 1;

                return (
                  <div key={key} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      {PRODUCT_ICONS[label] || <ShoppingBag size={16} className="text-primary" />}
                      {label} {fullSale ? `(${itemsCount})` : ""}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => onViewProductClick(key, label)}
                      className="text-xs py-1.5 px-3 border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      {isPending ? (
                        <span className="flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin text-accent" />
                          Cargando...
                        </span>
                      ) : (
                        "Ver Detalles"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Observaciones */}
        {(() => {
          const customObs = getCustomObservations(sale.observations || "");
          if (!customObs) return null;
          return (
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Observaciones Adicionales
              </h5>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap shadow-inner">
                {customObs}
              </p>
            </div>
          );
        })()}

        {/* Historial de Pagos */}
        {(() => {
          const payments = sale.payments || [];
          if (payments.length === 0) return null;
          return (
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Historial de Pagos
              </h5>
              <div className="space-y-2">
                {payments.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                    <span className="font-bold text-gray-800 text-sm">{formatCurrency(p.amount)}</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {p.method}
                      {p.reference && <span className="ml-1 text-slate-400 font-normal">(Ref: {p.reference})</span>}
                      {' '}· {formatDate(p.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
      )}
    </Modal>
  );
}
