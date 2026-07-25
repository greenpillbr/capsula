"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Panel } from "@/app/gpbrv-swap/Panel";
import { QuoteSummary } from "@/app/gpbrv-swap/QuoteSummary";
import { SlippageControl } from "@/app/gpbrv-swap/SlippageControl";
import { TokenSelector } from "@/app/gpbrv-swap/TokenSelector";
import { useEstimatedMin } from "@/app/gpbrv-swap/useEstimatedMin";
import { useSpendTokenApproval } from "@/app/gpbrv-swap/useSpendTokenApproval";
import { TxButton } from "@/components/TxButton";
import {
  DEFAULT_SWAP_STABLE,
  GPBRV_DECIMALS,
  SLIPPAGE_BPS,
  ZERO_ADDRESS,
  getGpbrvSwapperAddress,
  gpbrvSwapperAbi,
  type SwapStable,
} from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

/**
 * `depositWithMinipay`: the connected MiniPay wallet spends USDM and the linked main
 * wallet receives GPBRV. Only usable from inside MiniPay, so the layout gates it.
 */
export function MinipayDepositForm() {
  const { t, locale } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [selectedStable, setSelectedStable] = useState<SwapStable>(DEFAULT_SWAP_STABLE);
  const [slippageBps, setSlippageBps] = useState<bigint>(SLIPPAGE_BPS);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    estimatedMin,
    estimatedOutput,
    exchangeRate,
    mentoQuoteBrlPerStable,
    mentoQuoteStablePerBrl,
    isEstimating,
    spotFailed,
    quoteFailed,
  } = useEstimatedMin("deposit", amount, locale, selectedStable, slippageBps);

  const swapper = getGpbrvSwapperAddress();

  const { data: mappedUser } = useReadContract({
    address: swapper,
    abi: gpbrvSwapperAbi,
    functionName: "minipayToUser",
    args: address ? [address] : undefined,
    query: { enabled: !!swapper && !!address },
  });

  const { data: balance } = useReadContract({
    address: selectedStable.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const parsedAmount = useMemo(() => {
    try {
      return amount ? parseUnits(amount, selectedStable.decimals) : undefined;
    } catch {
      return undefined;
    }
  }, [amount, selectedStable.decimals]);

  const {
    needsApproval,
    isResetStep,
    handleApprove,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    isApproveWriteError,
    isApproveConfirmError,
  } = useSpendTokenApproval({
    owner: address,
    token: selectedStable.address,
    spender: swapper,
    amount: parsedAmount,
  });

  const {
    writeContract: writeAction,
    data: actionHash,
    isPending: isActionPending,
    isError: isActionWriteError,
    reset: resetAction,
  } = useWriteContract();

  const {
    isLoading: isActionConfirming,
    isSuccess: isActionConfirmed,
    isError: isActionConfirmError,
  } = useWaitForTransactionReceipt({ hash: actionHash });

  useEffect(() => {
    if (isActionConfirmed) {
      void queryClient.invalidateQueries();
    }
  }, [isActionConfirmed, queryClient]);

  if (!isConnected) {
    return (
      <Panel>
        <p className="text-gray-600">{t("gpbrvSwap.connectWallet")}</p>
      </Panel>
    );
  }

  if (!swapper) {
    return (
      <Panel>
        <p className="text-amber-700">{t("gpbrvSwap.notDeployed")}</p>
      </Panel>
    );
  }

  const recipient =
    mappedUser && mappedUser !== ZERO_ADDRESS ? mappedUser : undefined;
  const configured = recipient !== undefined;

  const resolvedMin = estimatedMin;

  function onApprove() {
    setFormError(null);
    if (parsedAmount === undefined || parsedAmount <= BigInt(0)) {
      setFormError(t("gpbrvSwap.errorInvalidAmount"));
      return;
    }
    handleApprove(parsedAmount);
  }

  function handleAction() {
    setFormError(null);
    resetAction();
    if (parsedAmount === undefined || parsedAmount <= BigInt(0)) {
      setFormError(t("gpbrvSwap.errorInvalidAmount"));
      return;
    }
    let minOut: bigint;
    try {
      minOut = resolvedMin ? parseUnits(resolvedMin, GPBRV_DECIMALS) : BigInt(0);
    } catch {
      setFormError(t("gpbrvSwap.errorInvalidAmount"));
      return;
    }
    writeAction({
      address: swapper!,
      abi: gpbrvSwapperAbi,
      functionName: "depositWithMinipay",
      args: [parsedAmount, minOut, selectedStable.address],
    });
  }

  return (
    <Panel title={t("gpbrvSwap.depositTitle")}>
      <p className="mb-4 text-sm text-gray-600">
        {t("gpbrvSwap.depositDescription")}
      </p>

      {!configured && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          {t("gpbrvSwap.notConfiguredWarningMinipay")}
        </p>
      )}

      {configured && (
        <p className="mb-4 break-all text-sm text-gray-600">
          {t("gpbrvSwap.recipientUser")}:{" "}
          <span className="font-medium">{recipient}</span>
        </p>
      )}

      <p className="mb-4 text-sm text-gray-600">
        {t("gpbrvSwap.balanceOf")} {selectedStable.symbol}:{" "}
        <span className="font-medium">
          {balance !== undefined
            ? formatUnits(balance, selectedStable.decimals)
            : t("common.loading")}
        </span>
      </p>

      <div className="mb-4">
        <TokenSelector
          value={selectedStable}
          onChange={setSelectedStable}
          label={t("gpbrvSwap.payWith")}
          disabled={!configured}
        />
      </div>

      <label className="mb-2 block text-sm font-medium" htmlFor="swap-amount">
        {t("gpbrvSwap.amountLabel")} ({selectedStable.symbol})
      </label>
      <input
        id="swap-amount"
        type="text"
        inputMode="decimal"
        value={amount}
        disabled={!configured}
        onChange={(e) => {
          setAmount(e.target.value);
          setFormError(null);
        }}
        className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 disabled:bg-gray-50"
      />

      <QuoteSummary
        estimatedOutput={estimatedOutput}
        exchangeRate={exchangeRate}
        mentoQuoteBrlPerStable={mentoQuoteBrlPerStable}
        mentoQuoteStablePerBrl={mentoQuoteStablePerBrl}
        stableSymbol={selectedStable.symbol}
        outputSymbol="GPBRV"
        isEstimating={isEstimating}
        spotFailed={spotFailed}
        quoteFailed={quoteFailed}
      />

      <SlippageControl slippageBps={slippageBps} onChange={setSlippageBps} />

      <label className="mb-2 block text-sm font-medium" htmlFor="swap-min">
        {t("gpbrvSwap.minReceived")}
      </label>
      <div
        id="swap-min"
        className="mb-1 flex h-12 w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-base text-gray-900"
      >
        <span className="font-medium">{resolvedMin || "—"}</span>
        {resolvedMin && <span className="ml-1 text-gray-500">GPBRV</span>}
      </div>
      <p className="mb-4 text-xs text-gray-500">{t("gpbrvSwap.slippageNote")}</p>

      {formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}

      {needsApproval ? (
        <TxButton
          label={
            isResetStep ? t("gpbrvSwap.resetApproveButton") : t("gpbrvSwap.approveButton")
          }
          pendingLabel={
            isResetStep ? t("gpbrvSwap.resetApprovePending") : t("gpbrvSwap.approvePending")
          }
          successLabel={
            isResetStep ? t("gpbrvSwap.resetApproveSuccess") : t("gpbrvSwap.approveSuccess")
          }
          errorLabel={t("common.tryAgain")}
          onClick={onApprove}
          disabled={!configured || !amount}
          isPending={isApprovePending || isApproveConfirming}
          isSuccess={isApproveConfirmed}
          isError={isApproveWriteError || isApproveConfirmError}
        />
      ) : (
        <TxButton
          label={t("gpbrvSwap.depositButton")}
          pendingLabel={t("gpbrvSwap.depositPending")}
          successLabel={t("gpbrvSwap.depositSuccess")}
          errorLabel={t("common.tryAgain")}
          onClick={handleAction}
          disabled={!configured || !amount}
          isPending={isActionPending || isActionConfirming}
          isSuccess={isActionConfirmed}
          isError={isActionWriteError || isActionConfirmError}
        />
      )}
    </Panel>
  );
}
