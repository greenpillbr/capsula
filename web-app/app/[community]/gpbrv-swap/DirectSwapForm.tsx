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

import { Panel } from "@/components/Panel";
import { QuoteSummary } from "@/app/[community]/gpbrv-swap/QuoteSummary";
import { SlippageControl } from "@/app/[community]/gpbrv-swap/SlippageControl";
import { TokenSelector } from "@/app/[community]/gpbrv-swap/TokenSelector";
import { useEstimatedMin } from "@/app/[community]/gpbrv-swap/useEstimatedMin";
import { useSpendTokenApproval } from "@/app/[community]/gpbrv-swap/useSpendTokenApproval";
import { TxButton } from "@/components/TxButton";
import {
  DEFAULT_SWAP_STABLE,
  GPBRV_ADDRESS,
  GPBRV_DECIMALS,
  SLIPPAGE_BPS,
  ZERO_ADDRESS,
  gpbrvSwapperAbi,
  type SwapStable,
} from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function DirectSwapForm({
  mode,
  swapper,
}: {
  mode: "withdraw" | "deposit";
  swapper: `0x${string}` | undefined;
}) {
  const { t, locale } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [selectedStable, setSelectedStable] = useState<SwapStable>(DEFAULT_SWAP_STABLE);
  const [slippageBps, setSlippageBps] = useState<bigint>(SLIPPAGE_BPS);
  const [formError, setFormError] = useState<string | null>(null);
  const [sendToMinipay, setSendToMinipay] = useState(false);

  const isWithdraw = mode === "withdraw";

  const {
    estimatedMin,
    estimatedOutput,
    exchangeRate,
    mentoQuoteBrlPerStable,
    mentoQuoteStablePerBrl,
    isEstimating,
    spotFailed,
    quoteFailed,
  } = useEstimatedMin(mode, amount, locale, selectedStable, slippageBps);

  const spendToken = isWithdraw ? GPBRV_ADDRESS : selectedStable.address;
  const spendDecimals = isWithdraw ? GPBRV_DECIMALS : selectedStable.decimals;
  const outDecimals = isWithdraw ? selectedStable.decimals : GPBRV_DECIMALS;
  const spendSymbol = isWithdraw ? "GPBRV" : selectedStable.symbol;
  const outputSymbol = isWithdraw ? selectedStable.symbol : "GPBRV";

  const { data: balance } = useReadContract({
    address: spendToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Withdraw only: a linked MiniPay wallet unlocks `withdrawWithMinipay`, which sends the
  // USDM there instead of back to the caller.
  const { data: linkedMinipay } = useReadContract({
    address: swapper,
    abi: gpbrvSwapperAbi,
    functionName: "userToMinipay",
    args: address ? [address] : undefined,
    query: { enabled: !!swapper && !!address && isWithdraw },
  });

  const minipayRecipient =
    linkedMinipay && linkedMinipay !== ZERO_ADDRESS ? linkedMinipay : undefined;

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
      minOut = resolvedMin ? parseUnits(resolvedMin, outDecimals) : BigInt(0);
    } catch {
      setFormError(t("gpbrvSwap.errorInvalidAmount"));
      return;
    }
    const useMinipay = isWithdraw && sendToMinipay && !!minipayRecipient;
    writeAction({
      address: swapper!,
      abi: gpbrvSwapperAbi,
      functionName: isWithdraw
        ? useMinipay
          ? "withdrawWithMinipay"
          : "withdraw"
        : "deposit",
      args: [parsedAmount, minOut, selectedStable.address],
    });
  }

  return (
    <Panel
      title={
        isWithdraw
          ? t("gpbrvSwap.swapWithdrawTitle")
          : t("gpbrvSwap.swapDepositTitle")
      }
    >
      <p className="mb-4 text-sm text-gray-600">
        {isWithdraw
          ? t("gpbrvSwap.swapWithdrawDescription")
          : t("gpbrvSwap.swapDepositDescription")}
      </p>

      <p className="mb-4 text-sm text-gray-600">
        {t("gpbrvSwap.balanceOf")} {spendSymbol}:{" "}
        <span className="font-medium">
          {balance !== undefined
            ? formatUnits(balance, spendDecimals)
            : t("common.loading")}
        </span>
      </p>

      {isWithdraw && (
        <div className="mb-4 rounded-lg border border-gray-200 p-3">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={sendToMinipay}
              disabled={!minipayRecipient}
              onChange={(e) => setSendToMinipay(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-green-600 disabled:opacity-50"
            />
            <span className={minipayRecipient ? "text-gray-700" : "text-gray-400"}>
              {t("gpbrvSwap.sendToMinipayLabel")}
            </span>
          </label>
          {sendToMinipay && minipayRecipient && (
            <p className="mt-2 break-all text-xs text-gray-600">
              {t("gpbrvSwap.recipientMinipay")}:{" "}
              <span className="font-medium">{minipayRecipient}</span>
            </p>
          )}
          {!minipayRecipient && (
            <p className="mt-2 text-xs text-gray-500">
              {t("gpbrvSwap.sendToMinipayNotLinked")}
            </p>
          )}
        </div>
      )}

      <div className="mb-4">
        <TokenSelector
          value={selectedStable}
          onChange={setSelectedStable}
          label={isWithdraw ? t("gpbrvSwap.youReceive") : t("gpbrvSwap.payWith")}
        />
      </div>

      <label className="mb-2 block text-sm font-medium" htmlFor="swap-amount">
        {t("gpbrvSwap.amountLabel")} ({spendSymbol})
      </label>
      <input
        id="swap-amount"
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          setFormError(null);
        }}
        className="mb-4 h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
      />

      <QuoteSummary
        estimatedOutput={estimatedOutput}
        exchangeRate={exchangeRate}
        mentoQuoteBrlPerStable={mentoQuoteBrlPerStable}
        mentoQuoteStablePerBrl={mentoQuoteStablePerBrl}
        stableSymbol={selectedStable.symbol}
        outputSymbol={isWithdraw ? selectedStable.symbol : "GPBRV"}
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
        {resolvedMin && (
          <span className="ml-1 text-gray-500">{outputSymbol}</span>
        )}
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
          disabled={!amount}
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
          disabled={!amount}
          isPending={isActionPending || isActionConfirming}
          isSuccess={isActionConfirmed}
          isError={isActionWriteError || isActionConfirmError}
        />
      )}
    </Panel>
  );
}
