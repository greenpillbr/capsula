"use client";

import { formatUnits, parseUnits } from "viem";
import { useReadContract } from "wagmi";

import {
  BPS_DENOMINATOR,
  BRLM_ADDRESS,
  BRLM_DECIMALS,
  GPBRV_DECIMALS,
  MENTO_FACTORY_ADDRESS,
  MENTO_ROUTER_ADDRESS,
  SARAFU_FEE_BPS,
  SLIPPAGE_BPS,
  USDM_ADDRESS,
  USDM_DECIMALS,
  mentoRouterAbi,
} from "@/lib/contracts";

const GPBRV_TO_BRLM_SCALE = BigInt(10) ** BigInt(BRLM_DECIMALS - GPBRV_DECIMALS);
const ONE_BRLM = parseUnits("1", BRLM_DECIMALS);
const ONE_USDM = parseUnits("1", USDM_DECIMALS);

const BRL_TO_USDM_ROUTE = [
  { from: BRLM_ADDRESS, to: USDM_ADDRESS, factory: MENTO_FACTORY_ADDRESS },
] as const;

const USDM_TO_BRL_ROUTE = [
  { from: USDM_ADDRESS, to: BRLM_ADDRESS, factory: MENTO_FACTORY_ADDRESS },
] as const;

function applySarafuFee(value: bigint): bigint {
  return (value * (BPS_DENOMINATOR - SARAFU_FEE_BPS)) / BPS_DENOMINATOR;
}

function applySlippage(value: bigint): bigint {
  return (value * (BPS_DENOMINATOR - SLIPPAGE_BPS)) / BPS_DENOMINATOR;
}

function formatAmount(value: bigint, decimals: number): string {
  const formatted = formatUnits(value, decimals);
  const parsed = parseFloat(formatted);
  if (Number.isNaN(parsed) || parsed <= 0) return "";
  return parseFloat(parsed.toFixed(6)).toString();
}

function formatExchangeRate(
  amountIn: string,
  outputValue: bigint,
  outputDecimals: number,
  inSymbol: string,
  outSymbol: string,
): string {
  const inNum = Number(amountIn);
  if (!amountIn || Number.isNaN(inNum) || inNum <= 0) return "";
  const outNum = Number(formatUnits(outputValue, outputDecimals));
  if (Number.isNaN(outNum) || outNum <= 0) return "";
  const perUnit = outNum / inNum;
  return `1 ${inSymbol} ≈ ${parseFloat(perUnit.toFixed(6))} ${outSymbol}`;
}

function formatQuoteNumber(value: string, locale: string): string {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString(locale, { maximumFractionDigits: 4 });
}

export function useEstimatedMin(
  mode: "withdraw" | "deposit",
  amount: string,
  locale: string,
) {
  const isWithdraw = mode === "withdraw";

  let mentoAmountIn: bigint | undefined;
  try {
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      mentoAmountIn = undefined;
    } else if (isWithdraw) {
      // Sarafu fee is taken on GPBRV -> BRLM before the Mento leg.
      mentoAmountIn = applySarafuFee(parseUnits(amount, BRLM_DECIMALS));
    } else {
      mentoAmountIn = parseUnits(amount, USDM_DECIMALS);
    }
  } catch {
    mentoAmountIn = undefined;
  }

  const routes = isWithdraw ? BRL_TO_USDM_ROUTE : USDM_TO_BRL_ROUTE;

  const {
    data: spotBrlToUsd,
    isLoading: isSpotBrlLoading,
    isFetching: isSpotBrlFetching,
    isError: isSpotBrlError,
  } = useReadContract({
    address: MENTO_ROUTER_ADDRESS,
    abi: mentoRouterAbi,
    functionName: "getAmountsOut",
    args: [ONE_BRLM, BRL_TO_USDM_ROUTE],
  });

  const {
    data: spotUsdToBrl,
    isLoading: isSpotUsdLoading,
    isFetching: isSpotUsdFetching,
    isError: isSpotUsdError,
  } = useReadContract({
    address: MENTO_ROUTER_ADDRESS,
    abi: mentoRouterAbi,
    functionName: "getAmountsOut",
    args: [ONE_USDM, USDM_TO_BRL_ROUTE],
  });

  const { data: amounts, isLoading, isFetching, isError } = useReadContract({
    address: MENTO_ROUTER_ADDRESS,
    abi: mentoRouterAbi,
    functionName: "getAmountsOut",
    args: mentoAmountIn !== undefined ? [mentoAmountIn, routes] : undefined,
    query: { enabled: mentoAmountIn !== undefined && mentoAmountIn > BigInt(0) },
  });

  let mentoQuoteBrlPerUsd = "";
  let mentoQuoteUsdmPerBrl = "";
  if (spotBrlToUsd && spotBrlToUsd.length > 1) {
    mentoQuoteUsdmPerBrl = formatQuoteNumber(
      formatAmount(spotBrlToUsd[spotBrlToUsd.length - 1]!, USDM_DECIMALS),
      locale,
    );
  }
  if (spotUsdToBrl && spotUsdToBrl.length > 1) {
    mentoQuoteBrlPerUsd = formatQuoteNumber(
      formatAmount(spotUsdToBrl[spotUsdToBrl.length - 1]!, BRLM_DECIMALS),
      locale,
    );
  }

  let estimatedMin = "";
  let estimatedOutput = "";
  let exchangeRate = "";
  if (amounts && amounts.length > 1) {
    const mentoQuoteOut = amounts[amounts.length - 1]!;

    if (isWithdraw) {
      estimatedOutput = formatAmount(mentoQuoteOut, USDM_DECIMALS);
      estimatedMin = formatAmount(applySlippage(mentoQuoteOut), USDM_DECIMALS);
      exchangeRate = formatExchangeRate(
        amount,
        mentoQuoteOut,
        USDM_DECIMALS,
        "GPBRV",
        "USDM",
      );
    } else {
      const afterSarafuFee = applySarafuFee(mentoQuoteOut);
      const gpbrvOut = afterSarafuFee / GPBRV_TO_BRLM_SCALE;
      const gpbrvMin = applySlippage(afterSarafuFee) / GPBRV_TO_BRLM_SCALE;
      estimatedOutput = formatAmount(gpbrvOut, GPBRV_DECIMALS);
      estimatedMin = formatAmount(gpbrvMin, GPBRV_DECIMALS);
      exchangeRate = formatExchangeRate(
        amount,
        gpbrvOut,
        GPBRV_DECIMALS,
        "USDM",
        "GPBRV",
      );
    }
  }

  return {
    estimatedMin,
    estimatedOutput,
    exchangeRate,
    mentoQuoteBrlPerUsd,
    mentoQuoteUsdmPerBrl,
    isEstimating:
      isSpotBrlLoading ||
      isSpotBrlFetching ||
      isSpotUsdLoading ||
      isSpotUsdFetching ||
      ((isLoading || isFetching) && mentoAmountIn !== undefined),
    spotFailed: isSpotBrlError || isSpotUsdError,
    quoteFailed: isError,
  };
}
