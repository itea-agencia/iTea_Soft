import { ReactNode, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";
import { createModalStack } from "../../utils/modalStack";

const modalStack = createModalStack();

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function keepTabInside(e: KeyboardEvent, panel: HTMLElement | null) {
  if (!panel) return;
  const active = document.activeElement;
  // El calendario se abre en un portal, fuera de la ventana: ahi manda el.
  if (active && active !== document.body && !panel.contains(active)) return;
  const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
  if (items.length === 0) {
    e.preventDefault();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && (active === first || active === panel || active === document.body)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (active === last || active === document.body)) {
    e.preventDefault();
    first.focus();
  }
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  contentClassName?: string;
  // false: solo se cierra con un boton propio, para un aviso que no se puede perder de un clic.
  closable?: boolean;
  // true: tiene un formulario. Ni Escape ni el clic afuera lo cierran, para no perder lo escrito.
  hasForm?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  contentClassName = "",
  closable = true,
  hasForm = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const dismissible = closable && !hasForm;
  // En un ref: onClose cambia en cada render, y reinstalar el efecto moveria el foco.
  const latest = useRef({ onClose, dismissible });
  latest.current = { onClose, dismissible };

  useEffect(() => {
    if (!isOpen) return;
    const entry = modalStack.push();
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    if (!panelRef.current?.contains(document.activeElement)) panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (!entry.isTop()) return;
      if (e.key === "Escape" && latest.current.dismissible) latest.current.onClose();
      if (e.key === "Tab") keepTabInside(e, panelRef.current);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (entry.remove()) document.body.style.overflow = "unset";
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidth = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
  }[size];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div
        className="fixed inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={dismissible ? onClose : undefined}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative z-[101] w-full ${maxWidth} bg-white rounded-xl shadow-2xl animate-scale-in flex flex-col max-h-[95vh] sm:max-h-[90vh] outline-none`}
      >
        {/* Header con color primary */}
        <div className="bg-primary px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0 rounded-t-xl">
          <h2 id={titleId} className="text-base sm:text-lg font-heading font-semibold text-white truncate">
            {title}
          </h2>
          {closable && (
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className={`p-4 sm:p-6 bg-gray-light flex-1 ${contentClassName ? "" : "overflow-y-auto"} ${footer ? "" : "rounded-b-xl"} ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-border flex justify-end gap-2 sm:gap-3 flex-shrink-0 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
