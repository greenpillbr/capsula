"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { Panel } from "@/app/gpbrv-swap/Panel";
import { TxButton } from "@/components/TxButton";
import {
  ZERO_ADDRESS,
  getGpbrvSwapperAddress,
  gpbrvSwapperAbi,
} from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function ConfigureSwap() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [minipayInput, setMinipayInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const swapper = getGpbrvSwapperAddress();

  const { data: currentMinipay } = useReadContract({
    address: swapper,
    abi: gpbrvSwapperAbi,
    functionName: "userToMinipay",
    args: address ? [address] : undefined,
    query: { enabled: !!swapper && !!address },
  });

  const {
    writeContract,
    data: hash,
    isPending,
    isError: isWriteError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) void queryClient.invalidateQueries();
  }, [isConfirmed, queryClient]);

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

  const linkedMinipay =
    currentMinipay && currentMinipay !== ZERO_ADDRESS ? currentMinipay : undefined;

  function handleConfigure() {
    setFormError(null);
    reset();
    if (!minipayInput || !isAddress(minipayInput)) {
      setFormError(t("gpbrvSwap.errorInvalidAddress"));
      return;
    }
    writeContract({
      address: swapper!,
      abi: gpbrvSwapperAbi,
      functionName: "configure",
      args: [minipayInput],
    });
  }

  return (
    <Panel title={t("gpbrvSwap.configureTitle")}>
      <p className="mb-4 text-sm text-gray-600">
        {t("gpbrvSwap.configureDescription")}
      </p>

      <p className="mb-4 text-sm text-gray-600">
        {t("gpbrvSwap.currentMinipay")}:{" "}
        <span className="font-medium">
          {linkedMinipay ?? t("gpbrvSwap.notConfiguredYet")}
        </span>
      </p>

      <label className="mb-2 block text-sm font-medium" htmlFor="minipay-address">
        {t("gpbrvSwap.minipayAddress")}
      </label>
      <input
        id="minipay-address"
        type="text"
        placeholder="0x…"
        value={minipayInput}
        onChange={(e) => {
          setMinipayInput(e.target.value);
          setFormError(null);
        }}
        className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
      />
      {formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}

      <TxButton
        label={t("gpbrvSwap.saveButton")}
        pendingLabel={t("gpbrvSwap.savePending")}
        successLabel={t("gpbrvSwap.saveSuccess")}
        errorLabel={t("common.tryAgain")}
        onClick={handleConfigure}
        disabled={!minipayInput}
        isPending={isPending || isConfirming}
        isSuccess={isConfirmed}
        isError={isWriteError || isConfirmError}
      />
    </Panel>
  );
}
