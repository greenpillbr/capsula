"use client";

import { useTranslation } from "@/lib/i18n/LanguageProvider";

type QuoteSummaryProps = {
  estimatedOutput: string;
  exchangeRate: string;
  mentoQuoteBrlPerUsd: string;
  mentoQuoteUsdmPerBrl: string;
  outputSymbol: string;
  isEstimating: boolean;
  spotFailed: boolean;
  quoteFailed: boolean;
};

export function QuoteSummary({
  estimatedOutput,
  exchangeRate,
  mentoQuoteBrlPerUsd,
  mentoQuoteUsdmPerBrl,
  outputSymbol,
  isEstimating,
  spotFailed,
  quoteFailed,
}: QuoteSummaryProps) {
  const { t } = useTranslation();

  const hasMentoQuote = mentoQuoteBrlPerUsd !== "" && mentoQuoteUsdmPerBrl !== "";
  const hasAmountQuote = estimatedOutput !== "";

  if (isEstimating && !hasMentoQuote) {
    return (
      <p className="mb-4 text-sm text-gray-500">{t("gpbrvSwap.estimating")}</p>
    );
  }

  if (spotFailed && !hasAmountQuote) {
    return (
      <p className="mb-4 text-sm text-amber-700">{t("gpbrvSwap.quoteFailed")}</p>
    );
  }

  if (!hasMentoQuote && !hasAmountQuote) return null;

  return (
    <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm">
      {hasMentoQuote && (
        <p className="text-gray-600">
          {t("gpbrvSwap.mentoQuote")}:{" "}
          <span className="font-medium text-gray-900">
            {mentoQuoteBrlPerUsd} (1 BRL = {mentoQuoteUsdmPerBrl} USDM)
          </span>
        </p>
      )}

      {hasAmountQuote && (
        <>
          <p className={hasMentoQuote ? "mt-2 text-gray-600" : "text-gray-600"}>
            {t("gpbrvSwap.estimatedOutput")}:{" "}
            <span className="font-medium text-gray-900">
              {estimatedOutput} {outputSymbol}
            </span>
          </p>
          {exchangeRate && (
            <p className="mt-1 text-gray-500">
              {t("gpbrvSwap.exchangeRate")}: {exchangeRate}
            </p>
          )}
        </>
      )}

      {quoteFailed && !hasAmountQuote && (
        <p className="mt-2 text-amber-700">{t("gpbrvSwap.quoteFailed")}</p>
      )}

      <p className="mt-1 text-xs text-gray-400">{t("gpbrvSwap.quoteNote")}</p>
    </div>
  );
}
