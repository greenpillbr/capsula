"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { erc20Abi, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Panel } from "@/app/gpbrv-swap/Panel";
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

// Pre-fills the minimum-received field with a 1% slippage haircut applied to a naive
// 1:1 value estimate. The field is editable; users should tune it for live mainnet swaps.
function defaultMinReceived(amount: string): string {
  const value = Number(amount);
  if (!amount || Number.isNaN(value) || value <= 0) return "";
  return parseFloat((value * 0.99).toFixed(6)).toString();
}

export function SwapForm({ mode }: { mode: "withdraw" | "deposit" }) {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [minOverride, setMinOverride] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  const { data: allowance } = useReadContract({
    address: spendToken,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && swapper ? [address, swapper] : undefined,
    query: { enabled: !!address && !!swapper },
  });

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    isError: isApproveWriteError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    isError: isApproveConfirmError,
  } = useWaitForTransactionReceipt({ hash: approveHash });

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
    if (isApproveConfirmed || isActionConfirmed) {
      void queryClient.invalidateQueries();
    }
  }, [isApproveConfirmed, isActionConfirmed, queryClient]);

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

  const resolvedMin = minOverride ?? defaultMinReceived(amount);

  let parsedAmount: bigint | undefined;
  try {
    parsedAmount = amount ? parseUnits(amount, spendDecimals) : undefined;
  } catch {
    parsedAmount = undefined;
  }

  const needsApproval =
    parsedAmount !== undefined &&
    parsedAmount > BigInt(0) &&
    (allowance === undefined || allowance < parsedAmount);

  function handleApprove() {
    setFormError(null);
    resetApprove();
    if (parsedAmount === undefined || parsedAmount <= BigInt(0)) {
      setFormError(t("gpbrvSwap.errorInvalidAmount"));
      return;
    }
    writeApprove({
      address: spendToken,
      abi: erc20Abi,
      functionName: "approve",
      args: [swapper!, parsedAmount],
    });
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
      functionName: isWithdraw ? "withdraw" : "deposit",
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
          label={t("gpbrvSwap.approveButton")}
          pendingLabel={t("gpbrvSwap.approvePending")}
          successLabel={t("gpbrvSwap.approveSuccess")}
          errorLabel={t("common.tryAgain")}
          onClick={handleApprove}
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
