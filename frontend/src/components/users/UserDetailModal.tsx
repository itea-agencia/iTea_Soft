import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TrendingUp, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { User, Sale } from '../../types';
import { DatePicker } from '../sales/forms/TicketForm';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userSales: Sale[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  asesor: "Asesor",
  freelancer: "Freelancer",
};

export default function UserDetailModal({ isOpen, onClose, user, userSales }: UserDetailModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredSales = useMemo(() => {
    return userSales.filter((s) => {
      let matches = true;
      if (startDate) {
        matches = matches && new Date(s.date) >= new Date(startDate);
      }
      if (endDate) {
        matches = matches && new Date(s.date) <= new Date(endDate + "T23:59:59");
      }
      return matches;
    });
  }, [userSales, startDate, endDate]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle: ${user.name}`}
      size="lg"
      footer={<Button variant="outline" onClick={onClose}>Cerrar</Button>}
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center p-4 bg-gradient-to-b from-accent/10 to-transparent rounded-2xl border border-accent/20 mb-2">
          <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-700 shadow-lg mb-3 overflow-hidden bg-accent/10">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-accent">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:!text-[#ffffff]">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="accent" className="bg-accent/10 border-accent/20 text-accent font-semibold">
              {ROLE_LABELS[user.role] || user.role}
            </Badge>
            <Badge variant={user.status}>
              {user.status === 'active' ? 'USUARIO ACTIVO' : 'USUARIO INACTIVO'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800/80 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Tipo Doc:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{user.docType}</span></div>
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Número:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{user.docNumber}</span></div>
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Teléfono:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{user.phone || 'N/A'}</span></div>
          <div className="min-w-0"><span className="text-gray-500 dark:text-slate-400 text-sm block">Correo:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff] block break-all">{user.email}</span></div>
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">F. Nacimiento:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{user.birthDate ? formatDate(user.birthDate) : 'N/A'}</span></div>
          <div><span className="text-gray-500 dark:text-slate-400 text-sm block">Rol:</span> <span className="font-semibold text-gray-900 dark:!text-[#ffffff]">{ROLE_LABELS[user.role] || user.role}</span></div>
        </div>

        <div>
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:!text-[#ffffff] flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" /> Historial de Ventas ({filteredSales.length})
              </h4>
              {filteredSales.length > 0 && (
                <span className="text-xs font-bold text-primary dark:text-teal-400 bg-primary/10 dark:bg-teal-950/40 px-2 py-1 rounded-lg">
                  Total Facturado: {formatCurrency(filteredSales.reduce((acc, s) => acc + s.total, 0))}
                </span>
              )}
            </div>
            
            {/* Filtros de Fecha */}
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg border border-gray-100 dark:border-slate-700">
              <div className="flex-1">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  fieldName="Desde"
                  popoverDirection="up"
                />
              </div>
              <div className="flex-1">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  fieldName="Hasta"
                  popoverDirection="up"
                />
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(""); setEndDate(""); }}
                  className="text-red-500 hover:text-red-600 p-2 rounded bg-red-50 hover:bg-red-100 transition-colors h-[34px] w-[34px] flex items-center justify-center shrink-0 border border-red-100 mt-5"
                  title="Limpiar fechas"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          
          {filteredSales.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="max-h-60 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-slate-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-slate-800 shadow-sm z-10">
                    <tr className="text-left text-xs text-gray-500 dark:text-slate-400 uppercase">
                      <th className="p-2 font-semibold">Fecha</th>
                      <th className="p-2 font-semibold">Valor</th>
                      <th className="p-2 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {paginatedSales.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                        <td className="p-2 text-gray-600 dark:text-slate-300">{formatDate(s.date)}</td>
                        <td className="p-2 font-semibold text-gray-900 dark:!text-[#ffffff]">{formatCurrency(s.total)}</td>
                        <td className="p-2"><Badge variant={s.status}>{s.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-2"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                    Pág {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-slate-400 text-sm italic text-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
              {userSales.length > 0 
                ? "No hay ventas en este rango de fechas." 
                : "No hay ventas registradas por este usuario."}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
