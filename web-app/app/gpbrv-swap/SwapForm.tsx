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
import { useEstimatedMin } from "@/app/gpbrv-swap/useEstimatedMin";
import { useSpendTokenApproval } from "@/app/gpbrv-swap/useSpendTokenApproval";
import { TxButton } from "@/components/TxButton";
import {
  GPBRV_ADDRESS,
  GPBRV_DECIMALS,
  USDM_ADDRESS,
  USDM_DECIMALS,
  ZERO_ADDRESS,
  getGpbrvSwapperAddress,
  gpbrvSwapperAbi,
} from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function SwapForm({ mode }: { mode: "withdraw" | "deposit" }) {
  const { t, locale } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [minOverride, setMinOverride] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    estimatedMin,
    estimatedOutput,
    exchangeRate,
    mentoQuoteBrlPerUsd,
    mentoQuoteUsdmPerBrl,
    isEstimating,
    spotFailed,
    quoteFailed,
  } = useEstimatedMin(mode, amount, locale);

  const swapper = getGpbrvSwapperAddress();

  const isWithdraw = mode === "withdraw";
  const spendToken = isWithdraw ? GPBRV_ADDRESS : USDM_ADDRESS;
  const spendDecimals = isWithdraw ? GPBRV_DECIMALS : USDM_DECIMALS;
  const outDecimals = isWithdraw ? USDM_DECIMALS : GPBRV_DECIMALS;
  const mappingFn = isWithdraw ? "userToMinipay" : "minipayToUser";
  const warningKey = isWithdraw
    ? "gpbrvSwap.notConfiguredWarningUser"
    : "gpbrvSwap.notConfiguredWarningMinipay";

  const { data: mappedRecipient } = useReadContract({
    address: swapper,
    abi: gpbrvSwapperAbi,
    functionName: mappingFn,
    args: address ? [address] : undefined,
    query: { enabled: !!swapper && !!address },
  });

  const { data: balance } = useReadContract({
    address: spendToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const parsedAmount = useMemo(() => {
    try {
      return amount ? parseUnits(amount, spendDecimals) : undefined;
    } catch {
      return undefined;
    }
  }, [amount, spendDecimals]);

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
    token: spendToken,
    spender: swapper,
    amount: parsedAmount,
    resetAllowanceBeforeApprove: isWithdraw,
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
    mappedRecipient && mappedRecipient !== ZERO_ADDRESS ? mappedRecipient : undefined;
  const configured = recipient !== undefined;

  const resolvedMin = minOverride ?? estimatedMin;

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
      minOut = resolvedMin ? parseUnits(resolvedMin, outDecimals) : BigInt(0);
    } catch {
      setFormError(t("gpbrvSwap.errorInvalidAmount"));
      return;
    }
    writeAction({
      address: swapper!,
      abi: gpbrvSwapperAbi,
      functionName: isWithdraw ? "withdrawWithMinipay" : "depositWithMinipay",
      args: [parsedAmount, minOut],
    });
  }

  return (
    <Panel title={isWithdraw ? t("gpbrvSwap.withdrawTitle") : t("gpbrvSwap.depositTitle")}>
      <p className="mb-4 text-sm text-gray-600">
        {isWithdraw
          ? t("gpbrvSwap.withdrawDescription")
          : t("gpbrvSwap.depositDescription")}
      </p>

      {!configured && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          {t(warningKey)}
        </p>
      )}

      {configured && (
        <p className="mb-4 text-sm text-gray-600">
          {isWithdraw
            ? t("gpbrvSwap.recipientMinipay")
            : t("gpbrvSwap.recipientUser")}
          : <span className="font-medium">{recipient}</span>
        </p>
      )}

      <p className="mb-4 text-sm text-gray-600">
        {isWithdraw ? t("gpbrvSwap.gpbrvBalance") : t("gpbrvSwap.usdmBalance")}:{" "}
        <span className="font-medium">
          {balance !== undefined
            ? formatUnits(balance, spendDecimals)
            : t("common.loading")}
        </span>
      </p>

      <label className="mb-2 block text-sm font-medium" htmlFor="swap-amount">
        {isWithdraw ? t("gpbrvSwap.amountGpbrv") : t("gpbrvSwap.amountUsdm")}
      </label>
      <input
        id="swap-amount"
        type="text"
        inputMode="decimal"
        value={amount}
        disabled={!configured}
        onChange={(e) => {
          setAmount(e.target.value);
          setMinOverride(null);
          setFormError(null);
        }}
        className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 disabled:bg-gray-50"
      />

      <QuoteSummary
        estimatedOutput={estimatedOutput}
        exchangeRate={exchangeRate}
        mentoQuoteBrlPerUsd={mentoQuoteBrlPerUsd}
        mentoQuoteUsdmPerBrl={mentoQuoteUsdmPerBrl}
        outputSymbol={isWithdraw ? "USDM" : "GPBRV"}
        isEstimating={isEstimating}
        spotFailed={spotFailed}
        quoteFailed={quoteFailed}
      />

      <label className="mb-2 block text-sm font-medium" htmlFor="swap-min">
        {t("gpbrvSwap.minReceived")}
      </label>
      <input
        id="swap-min"
        type="text"
        inputMode="decimal"
        value={resolvedMin}
        disabled={!configured}
        onChange={(e) => {
          setMinOverride(e.target.value);
          setFormError(null);
        }}
        className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 disabled:bg-gray-50"
      />
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
          label={isWithdraw ? t("gpbrvSwap.withdrawButton") : t("gpbrvSwap.depositButton")}
          pendingLabel={
            isWithdraw ? t("gpbrvSwap.withdrawPending") : t("gpbrvSwap.depositPending")
          }
          successLabel={
            isWithdraw ? t("gpbrvSwap.withdrawSuccess") : t("gpbrvSwap.depositSuccess")
          }
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
