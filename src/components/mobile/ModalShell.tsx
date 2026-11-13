import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

export interface ModalShellProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  titleId?: string;
  description?: React.ReactNode;
  descriptionId?: string;
  ariaLabel?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  headerGradient?: string;
  children: React.ReactNode;
  maxWidth?: string; // e.g. 'max-w-xl', 'max-w-2xl', 'max-w-3xl'
  className?: string; // Additional classes for modal box
  overlayClassName?: string;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  hideHeader?: boolean;
  hideCloseButton?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen = true,
  onClose,
  title,
  titleId: customTitleId,
  description,
  descriptionId: customDescId,
  ariaLabel,
  badge,
  icon,
  headerGradient,
  children,
  maxWidth = 'max-w-xl',
  className = '',
  overlayClassName = '',
  closeOnEscape = true,
  closeOnBackdrop = true,
  hideHeader = false,
  hideCloseButton = false,
  initialFocusRef,
}) => {
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const autoTitleId = useId();
  const autoDescId = useId();
  const titleId = customTitleId || (title ? `modal-title-${autoTitleId}` : undefined);
  const descriptionId = customDescId || (description ? `modal-desc-${autoDescId}` : undefined);

  // Focus management: simpan active element sebelumnya, set initial focus, dan restore focus saat unmount
  useEffect(() => {
    if (!isOpen) return;

    if (typeof document !== 'undefined') {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }

    // Beri jeda microtask agar DOM ter-render
    const timer = window.setTimeout(() => {
      if (initialFocusRef && initialFocusRef.current) {
        initialFocusRef.current.focus();
        return;
      }

      if (modalBoxRef.current) {
        const focusable = modalBoxRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          modalBoxRef.current.focus();
        }
      }
    }, 40);

    return () => {
      window.clearTimeout(timer);
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        try {
          previousActiveElementRef.current.focus();
        } catch {
          // Abaikan jika elemen sudah tidak ada di DOM
        }
      }
    };
  }, [isOpen, initialFocusRef]);

  // Focus Trap & Global Escape Listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Penanganan Escape key
      if (closeOnEscape && (e.key === 'Escape' || e.key === 'Esc')) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      // 2. Focus trap untuk keyboard Tab
      if (e.key === 'Tab' && modalBoxRef.current) {
        const focusables = Array.from(
          modalBoxRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => {
          return el.offsetParent !== null && !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true';
        });

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const activeEl = document.activeElement;

        if (e.shiftKey) {
          // Tab mundur
          if (activeEl === firstEl || !modalBoxRef.current.contains(activeEl)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab maju
          if (activeEl === lastEl || !modalBoxRef.current.contains(activeEl)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200 ${overlayClassName}`}
    >
      <div
        ref={modalBoxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`bg-slate-900 border border-slate-800 rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden flex flex-col modal-viewport-bounded max-h-[calc(var(--viewport-height,100dvh)-1.5rem)] focus:outline-none ${className}`}
      >
        {/* Header Modal Terpadu */}
        {!hideHeader && (title || !hideCloseButton) && (
          <div
            className={`p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 ${
              headerGradient || 'bg-slate-950/80'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {title && (
                    <h2 id={titleId} className="text-base sm:text-lg font-bold text-white truncate">
                      {title}
                    </h2>
                  )}
                  {badge && <div>{badge}</div>}
                </div>
                {description && (
                  <p id={descriptionId} className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup Modal"
                className="touch-target-44 min-w-[44px] min-h-[44px] w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        {children}
      </div>
    </div>
  );
};
