import { useEffect, useRef } from 'react';

export interface UseKeyboardAwareFocusOptions {
  /**
   * Posisi alignment scrollIntoView: 'center' | 'nearest' | 'start' | 'end'
   * Default: 'center'
   */
  block?: ScrollLogicalPosition;
  /**
   * Tipe animasi scroll
   * Default: 'smooth'
   */
  behavior?: ScrollBehavior;
  /**
   * Jeda milidetik menunggu animasi keyboard selesai
   * Default: 120ms
   */
  delayMs?: number;
}

/**
 * Custom Hook: useKeyboardAwareFocus (TASK-098 / UX-01 / ERG-001)
 * Mendengarkan resize visualViewport saat virtual keyboard Android muncul/berubah,
 * lalu secara otomatis memanggil scrollIntoView({ block: 'center', behavior: 'smooth' })
 * pada field textarea/input yang sedang aktif agar tidak tertutup keyboard atau tombol aksi sticky.
 */
export function useKeyboardAwareFocus(
  elementRef?: React.RefObject<HTMLElement | null>,
  options: UseKeyboardAwareFocusOptions = {}
) {
  const { block = 'center', behavior = 'smooth', delayMs = 120 } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleViewportResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const activeEl = document.activeElement as HTMLElement | null;
        if (!activeEl) return;

        // Jika ref diberikan, pastikan target adalah elemen itu sendiri atau turunannya
        if (elementRef && elementRef.current) {
          if (activeEl === elementRef.current || elementRef.current.contains(activeEl)) {
            if (typeof activeEl.scrollIntoView === 'function') {
              activeEl.scrollIntoView({ block, behavior });
            }
          }
          return;
        }

        // Jika tidak ada ref spesifik, cek apakah elemen aktif merupakan textarea atau input teks
        const tagName = activeEl.tagName?.toLowerCase();
        const inputType = activeEl.getAttribute('type')?.toLowerCase() || 'text';
        const isTextInput =
          tagName === 'textarea' ||
          (tagName === 'input' && !['button', 'submit', 'checkbox', 'radio', 'hidden', 'file'].includes(inputType)) ||
          activeEl.isContentEditable;

        if (isTextInput && typeof activeEl.scrollIntoView === 'function') {
          activeEl.scrollIntoView({ block, behavior });
        }
      }, delayMs);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }
    window.addEventListener('resize', handleViewportResize);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
      window.removeEventListener('resize', handleViewportResize);
    };
  }, [elementRef, block, behavior, delayMs]);
}

/**
 * Utilitas pembantu untuk menghitung offset dynamic sticky footer
 */
export function calculateKeyboardStickyOffset(keyboardHeight: number, safeBottom: number = 0): number {
  return Math.max(0, keyboardHeight) + Math.max(0, safeBottom);
}
