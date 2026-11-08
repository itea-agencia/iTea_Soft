import { useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Datepicker from "react-tailwindcss-datepicker";
import dayjs from "dayjs";
import { Calendar, X } from "lucide-react";
import { isValidCalendarDate } from "./dateValidation";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  triggerError?: (message: string) => void;
  fieldName: string;
  className?: string;
  popoverDirection?: "up" | "down";
}

const toDisplay = (value: string) => value ? value.split("T")[0].split("-").reverse().join("/") : "";

export function DatePicker({ value, onChange, min, max, triggerError, fieldName, className = "", popoverDirection }: DatePickerProps) {
  const id = useId();
  // Texto a medio escribir; null = se muestra el valor del formulario. Asi el texto se deriva
  // en el render y no hace falta un useEffect que copie value a estado.
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? toDisplay(value);
  const minDay = min?.slice(0, 10);
  const maxDay = max?.slice(0, 10);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, maxHeight: 0 });
  const anchor = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) button.current?.focus();
  };

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = anchor.current!.getBoundingClientRect();
      const width = popup.current!.getBoundingClientRect().width;
      const height = popup.current!.scrollHeight;
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 16;
      const up = popoverDirection === "up" ? above >= height || above > below : below < height && above > below;
      const maxHeight = Math.max(0, Math.min(window.innerHeight - 16, up ? above : below));
      setPosition({
        top: Math.max(8, up ? rect.top - Math.min(height, maxHeight) - 8 : rect.bottom + 8),
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        maxHeight,
      });
    };
    const outside = (event: PointerEvent) => {
      if (!popup.current?.contains(event.target as Node) && !anchor.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.stopPropagation(); close(true); }
    };
    update();
    popup.current?.focus();
    window.addEventListener("resize", update);
    document.addEventListener("scroll", update, true);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape, true);
    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", update, true);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape, true);
    };
  }, [open, popoverDirection]);

  // min y max son dias YYYY-MM-DD; compararlos como texto es compararlos como fecha. Antes el
  // selector los recibia y no los usaba: Pasaporte decia "max hoy" y aceptaba un nacimiento futuro.
  const problemOf = (iso: string) =>
    !isValidCalendarDate(iso) ? `${fieldName}: ingrese una fecha válida (DD/MM/AAAA).`
    : minDay && iso < minDay ? `${fieldName}: no puede ser anterior al ${toDisplay(minDay)}.`
    : maxDay && iso > maxDay ? `${fieldName}: no puede ser posterior al ${toDisplay(maxDay)}.`
    : "";

  const commit = (text: string, notify = false) => {
    const iso = text.split("/").reverse().join("-");
    const problem = text ? problemOf(iso) : "";
    if (!problem) {
      setError("");
      setDraft(null);
      onChange(iso);
      return;
    }
    setError(problem);
    // Se conserva el ultimo valor valido: una fecha imposible o fuera de rango nunca llega a la venta.
    if (notify) {
      setDraft(null);
      triggerError?.(problem);
    }
  };

  return (
    <div className={className}>
      <div ref={anchor} className="relative flex items-center">
        <input
          aria-label={fieldName}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          type="text"
          inputMode="numeric"
          value={shown}
          placeholder="DD/MM/AAAA"
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
            const text = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join("/");
            setDraft(text);
            setError("");
            if (!text || text.length === 10) commit(text);
          }}
          onBlur={() => { if (draft !== null) commit(draft, true); }}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00828a]/50 text-xs bg-white text-gray-700 ${error ? "border-rose-500" : "border-gray-border"}`}
        />
        <button ref={button} type="button" aria-label={`Abrir calendario: ${fieldName}`} aria-expanded={open} aria-controls={open ? id : undefined}
          onClick={() => setOpen(!open)} className="absolute right-1 p-2 text-gray-500 hover:text-primary rounded-lg focus-visible:ring-2 focus-visible:ring-primary">
          <Calendar size={16} />
        </button>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}
      {open && createPortal(
        <div ref={popup} id={id} role="dialog" aria-label={`Calendario: ${fieldName}`} tabIndex={-1}
          style={{ ...position, maxHeight: position.maxHeight || undefined }}
          className="fixed z-[300] w-80 max-w-[calc(100vw-16px)] overflow-auto rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:bg-slate-800 dark:border-slate-600"
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(); }}>
          <div className="flex items-center justify-between px-2 text-sm font-medium text-gray-700 dark:text-white">
            <span>{fieldName}</span>
            <button type="button" aria-label="Cerrar calendario" onClick={() => close(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><X size={16} /></button>
          </div>
          <Datepicker
            asSingle useRange={false} i18n="es" primaryColor="teal"
            minDate={minDay ? dayjs(minDay).toDate() : undefined}
            maxDate={maxDay ? dayjs(maxDay).toDate() : undefined}
            value={{ startDate: value ? dayjs(value.split("T")[0]).toDate() : null, endDate: value ? dayjs(value.split("T")[0]).toDate() : null }}
            onChange={(next) => {
              if (!next?.startDate) return;
              const iso = dayjs(next.startDate).format("YYYY-MM-DD");
              if (!problemOf(iso)) { setError(""); setDraft(null); onChange(iso); close(true); }
            }}
            inputClassName="hidden" toggleClassName="hidden"
            containerClassName="relative w-full"
            popupClassName="relative text-sm [&>div:first-child]:hidden [&>div:last-child]:mt-0 [&>div:last-child]:border-0 [&>div:last-child]:shadow-none [&>div:last-child]:px-0"
          />
        </div>, document.body
      )}
    </div>
  );
}
