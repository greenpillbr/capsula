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
  USDM_ADDRESS,
  mentoRouterAbi,
  type SwapStable,
} from "@/lib/contracts";

type Route = { from: `0x${string}`; to: `0x${string}`; factory: `0x${string}` };

const ONE_BRLM = parseUnits("1", BRLM_DECIMALS);

/** Mento route BRLM -> stable. One hop for USDM, two hops (via USDM) otherwise. */
function routesFromBrlm(stable: SwapStable): Route[] {
  if (stable.address === USDM_ADDRESS) {
    return [{ from: BRLM_ADDRESS, to: USDM_ADDRESS, factory: MENTO_FACTORY_ADDRESS }];
  }
  return [
    { from: BRLM_ADDRESS, to: USDM_ADDRESS, factory: MENTO_FACTORY_ADDRESS },
    { from: USDM_ADDRESS, to: stable.address, factory: stable.cusdFactory! },
  ];
}

/** Mento route stable -> BRLM. Reverse of `routesFromBrlm`. */
function routesToBrlm(stable: SwapStable): Route[] {
  if (stable.address === USDM_ADDRESS) {
    return [{ from: USDM_ADDRESS, to: BRLM_ADDRESS, factory: MENTO_FACTORY_ADDRESS }];
  }
  return [
    { from: stable.address, to: USDM_ADDRESS, factory: stable.cusdFactory! },
    { from: USDM_ADDRESS, to: BRLM_ADDRESS, factory: MENTO_FACTORY_ADDRESS },
  ];
}

function applySarafuFee(value: bigint): bigint {
  return (value * (BPS_DENOMINATOR - SARAFU_FEE_BPS)) / BPS_DENOMINATOR;
}

function applySlippage(value: bigint, slippageBps: bigint): bigint {
  return (value * (BPS_DENOMINATOR - slippageBps)) / BPS_DENOMINATOR;
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
  stable: SwapStable,
  slippageBps: bigint,
) {
  const isWithdraw = mode === "withdraw";
  const oneStable = parseUnits("1", stable.decimals);

  let mentoAmountIn: bigint | undefined;
  try {
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      mentoAmountIn = undefined;
    } else if (isWithdraw) {
      // GPBRV -> BRLM is 1:1 value (BRLM has 18 decimals). Sarafu fee is taken on that leg
      // before the Mento swap.
      mentoAmountIn = applySarafuFee(parseUnits(amount, BRLM_DECIMALS));
    } else {
      mentoAmountIn = parseUnits(amount, stable.decimals);
    }
  } catch {
    mentoAmountIn = undefined;
  }

  const fromBrlm = routesFromBrlm(stable);
  const toBrlm = routesToBrlm(stable);
  const routes = isWithdraw ? fromBrlm : toBrlm;

  // Spot rates for the selected stable (informational): 1 BRL = X stable, and 1 stable = Y BRL.
  const {
    data: spotStablePerBrl,
    isLoading: isSpotBrlLoading,
    isFetching: isSpotBrlFetching,
    isError: isSpotBrlError,
  } = useReadContract({
    address: MENTO_ROUTER_ADDRESS,
    abi: mentoRouterAbi,
    functionName: "getAmountsOut",
    args: [ONE_BRLM, fromBrlm],
  });

  const {
    data: spotBrlPerStable,
    isLoading: isSpotUsdLoading,
    isFetching: isSpotUsdFetching,
    isError: isSpotUsdError,
  } = useReadContract({
    address: MENTO_ROUTER_ADDRESS,
    abi: mentoRouterAbi,
    functionName: "getAmountsOut",
    args: [oneStable, toBrlm],
  });

  const { data: amounts, isLoading, isFetching, isError } = useReadContract({
    address: MENTO_ROUTER_ADDRESS,
    abi: mentoRouterAbi,
    functionName: "getAmountsOut",
    args: mentoAmountIn !== undefined ? [mentoAmountIn, routes] : undefined,
    query: { enabled: mentoAmountIn !== undefined && mentoAmountIn > BigInt(0) },
  });

  let mentoQuoteBrlPerStable = "";
  let mentoQuoteStablePerBrl = "";
  if (spotStablePerBrl && spotStablePerBrl.length > 1) {
    mentoQuoteStablePerBrl = formatQuoteNumber(
      formatAmount(spotStablePerBrl[spotStablePerBrl.length - 1]!, stable.decimals),
      locale,
    );
  }
  if (spotBrlPerStable && spotBrlPerStable.length > 1) {
    mentoQuoteBrlPerStable = formatQuoteNumber(
      formatAmount(spotBrlPerStable[spotBrlPerStable.length - 1]!, BRLM_DECIMALS),
      locale,
    );
  }

  let estimatedMin = "";
  let estimatedOutput = "";
  let exchangeRate = "";
  if (amounts && amounts.length > 1) {
    const mentoQuoteOut = amounts[amounts.length - 1]!;

    if (isWithdraw) {
      estimatedOutput = formatAmount(mentoQuoteOut, stable.decimals);
      estimatedMin = formatAmount(applySlippage(mentoQuoteOut, slippageBps), stable.decimals);
      exchangeRate = formatExchangeRate(
        amount,
        mentoQuoteOut,
        stable.decimals,
        "GPBRV",
        stable.symbol,
      );
    } else {
      const gpbrvScale = BigInt(10) ** BigInt(BRLM_DECIMALS - GPBRV_DECIMALS);
      const afterSarafuFee = applySarafuFee(mentoQuoteOut);
      const gpbrvOut = afterSarafuFee / gpbrvScale;
      const gpbrvMin = applySlippage(afterSarafuFee, slippageBps) / gpbrvScale;
      estimatedOutput = formatAmount(gpbrvOut, GPBRV_DECIMALS);
      estimatedMin = formatAmount(gpbrvMin, GPBRV_DECIMALS);
      exchangeRate = formatExchangeRate(
        amount,
        gpbrvOut,
        GPBRV_DECIMALS,
        stable.symbol,
        "GPBRV",
      );
    }
  }

  return {
    estimatedMin,
    estimatedOutput,
    exchangeRate,
    mentoQuoteBrlPerStable,
    mentoQuoteStablePerBrl,
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
