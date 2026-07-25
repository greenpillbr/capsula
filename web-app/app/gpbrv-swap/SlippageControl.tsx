"use client";

import { useState } from "react";
import { HiOutlineCog6Tooth } from "react-icons/hi2";

import { BPS_DENOMINATOR } from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

const PERCENT = 100;

function bpsToPercent(bps: bigint): number {
  return Number(bps) / Number(BPS_DENOMINATOR) * PERCENT;
}

function formatPercent(bps: bigint): string {
  return parseFloat(bpsToPercent(bps).toFixed(2)).toString();
}

/**
 * Shows the current slippage (e.g. "Slippage: 5%") with a gear that reveals an inline
 * editable percent field. Controlled: the parent owns `slippageBps` and gets `onChange`.
 */
export function SlippageControl({
  slippageBps,
  onChange,
}: {
  slippageBps: bigint;
  onChange: (bps: bigint) => void;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(() => formatPercent(slippageBps));

  function commit(next: string) {
    setDraft(next);
    const pct = parseFloat(next);
    if (!Number.isNaN(pct) && pct >= 0 && pct < 100) {
      // bps = pct% of BPS_DENOMINATOR
      onChange(BigInt(Math.round((pct / PERCENT) * Number(BPS_DENOMINATOR))));
    }
  }

  return (
    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
      <span>{t("gpbrvSwap.slippage")}:</span>
      {editing ? (
        <span className="flex items-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            value={draft}
            onChange={(e) => commit(e.target.value)}
            onBlur={() => setEditing(false)}
            aria-label={t("gpbrvSwap.slippageEdit")}
            className="h-8 w-16 rounded-md border border-gray-300 px-2 text-right text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
          <span>%</span>
        </span>
      ) : (
        <span className="font-medium text-gray-900">{formatPercent(slippageBps)}%</span>
      )}
      <button
        type="button"
        onClick={() => setEditing((v) => !v)}
        aria-label={t("gpbrvSwap.slippageEdit")}
        className="rounded-md p-1 text-gray-500 transition-colors hover:text-green-600"
      >
        <HiOutlineCog6Tooth className="size-4" aria-hidden />
      </button>
    </div>
  );
}
