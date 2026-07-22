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

/**
 * Mirror of `ConfigureSwap`: here the connected wallet is the MiniPay wallet and the
 * user types their *main* wallet address, so the link can be created from inside MiniPay.
 */
export function ConfigureFromMinipay() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [userInput, setUserInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const swapper = getGpbrvSwapperAddress();

  const { data: currentUser } = useReadContract({
    address: swapper,
    abi: gpbrvSwapperAbi,
    functionName: "minipayToUser",
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

  const linkedUser =
    currentUser && currentUser !== ZERO_ADDRESS ? currentUser : undefined;

  function handleConfigure() {
    setFormError(null);
    reset();
    if (!userInput || !isAddress(userInput)) {
      setFormError(t("gpbrvSwap.errorInvalidAddress"));
      return;
    }
    if (address && userInput.toLowerCase() === address.toLowerCase()) {
      setFormError(t("gpbrvSwap.errorSameAddress"));
      return;
    }
    writeContract({
      address: swapper!,
      abi: gpbrvSwapperAbi,
      functionName: "configureFromMinipay",
      args: [userInput],
    });
  }

  return (
    <Panel title={t("gpbrvSwap.configureFromMinipayTitle")}>
      <p className="mb-4 text-sm text-gray-600">
        {t("gpbrvSwap.configureFromMinipayDescription")}
      </p>

      <p className="mb-4 break-all text-sm text-gray-600">
        {t("gpbrvSwap.currentUser")}:{" "}
        <span className="font-medium">
          {linkedUser ?? t("gpbrvSwap.notConfiguredYetMinipay")}
        </span>
      </p>

      <label className="mb-2 block text-sm font-medium" htmlFor="user-address">
        {t("gpbrvSwap.userAddress")}
      </label>
      <input
        id="user-address"
        type="text"
        placeholder="0x…"
        value={userInput}
        onChange={(e) => {
          setUserInput(e.target.value);
          setFormError(null);
        }}
        className="mb-2 h-12 w-full rounded-lg border border-gray-300 px-3 text-base focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
      />
      {formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}

      <TxButton
        label={t("gpbrvSwap.saveButton")}
        pendingLabel={t("gpbrvSwap.savePending")}
        successLabel={t("gpbrvSwap.saveSuccess")}
        errorLabel={t("common.tryAgain")}
        onClick={handleConfigure}
        disabled={!userInput}
        isPending={isPending || isConfirming}
        isSuccess={isConfirmed}
        isError={isWriteError || isConfirmError}
      />
    </Panel>
  );
}
