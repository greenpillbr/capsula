"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: { isMiniPay?: boolean };
  }
}

/**
 * Detects whether the page is running inside the MiniPay in-app browser.
 *
 * Returns `undefined` until the effect has run, so server render and first paint
 * agree and callers can avoid flashing a "not in MiniPay" fallback.
 */
export function useIsMiniPay(): boolean | undefined {
  const [isMiniPay, setIsMiniPay] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setIsMiniPay(Boolean(window.ethereum?.isMiniPay));
  }, []);

  return isMiniPay;
}
