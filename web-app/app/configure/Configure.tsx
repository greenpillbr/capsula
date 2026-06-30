"use client";

import { useQueryClient } from "@tanstack/react-query";
import { formatUnits, isAddress, parseUnits } from "viem";
import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { TxButton } from "@/components/TxButton";
import { attendanceAbi, isAdminAddress, type DistributorToken } from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function Configure({ distributor }: { distributor: DistributorToken }) {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [amountInput, setAmountInput] = useState<string | null>(null);
  const [periodInput, setPeriodInput] = useState<string | null>(null);
  const [creatorAddress, setCreatorAddress] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const [allowlistError, setAllowlistError] = useState<string | null>(null);

  const staticAuthorized = isAdminAddress(address);

  const { data: contractOwner } = useReadContract({
    address: distributor.contractAddress,
    abi: attendanceAbi,
    functionName: "owner",
  });

  const isOwner =
    address !== undefined &&
    contractOwner !== undefined &&
    address.toLowerCase() === contractOwner.toLowerCase();

  const authorized = staticAuthorized || isOwner;

  const { data: currentAmount } = useReadContract({
    address: distributor.contractAddress,
    abi: attendanceAbi,
    functionName: "amount",
  });

  const { data: currentPeriod } = useReadContract({
    address: distributor.contractAddress,
    abi: attendanceAbi,
    functionName: "period",
  });

  const resolvedAmountInput =
    amountInput ??
    (currentAmount !== undefined
      ? formatUnits(currentAmount, distributor.decimals)
      : "");

  const resolvedPeriodInput =
    periodInput ??
    (currentPeriod !== undefined ? String(currentPeriod) : "");

  const lookupAddress =
    creatorAddress && isAddress(creatorAddress) ? creatorAddress : undefined;

  const { data: isCreatorLookup } = useReadContract({
    address: distributor.contractAddress,
    abi: attendanceAbi,
    functionName: "isCreator",
    args: lookupAddress ? [lookupAddress] : undefined,
    query: { enabled: !!lookupAddress },
  });

  const {
    writeContract: writeConfig,
    data: configHash,
    isPending: isConfigPending,
    isError: isConfigWriteError,
    reset: resetConfig,
  } = useWriteContract();

  const {
    isLoading: isConfigConfirming,
    isSuccess: isConfigConfirmed,
    isError: isConfigConfirmError,
  } = useWaitForTransactionReceipt({ hash: configHash });

  const {
    writeContract: writeAllowlist,
    data: allowlistHash,
    isPending: isAllowlistPending,
    isError: isAllowlistWriteError,
    reset: resetAllowlist,
  } = useWriteContract();

  const {
    isLoading: isAllowlistConfirming,
    isSuccess: isAllowlistConfirmed,
    isError: isAllowlistConfirmError,
  } = useWaitForTransactionReceipt({ hash: allowlistHash });

  const configPending = isConfigPending || isConfigConfirming;
  const configSuccess = isConfigConfirmed;
  const configTxError = isConfigWriteError || isConfigConfirmError;

  const allowlistPending = isAllowlistPending || isAllowlistConfirming;
  const allowlistSuccess = isAllowlistConfirmed;
  const allowlistTxError = isAllowlistWriteError || isAllowlistConfirmError;

  useEffect(() => {
    if (isConfigConfirmed || isAllowlistConfirmed) {
      void queryClient.invalidateQueries();
    }
  }, [isConfigConfirmed, isAllowlistConfirmed, queryClient]);

  function handleSetConfig() {
    setConfigError(null);
    resetConfig();
    if (!resolvedAmountInput || Number.isNaN(Number(resolvedAmountInput))) {
      setConfigError(t("configure.errorInvalidAmount"));
      return;
    }
    if (!resolvedPeriodInput || !/^\d+$/.test(resolvedPeriodInput)) {
      setConfigError(t("configure.errorInvalidPeriod"));
      return;
    }
    try {
      const amountUnits = parseUnits(resolvedAmountInput, distributor.decimals);
      const periodBlocks = BigInt(resolvedPeriodInput);
      if (amountUnits <= BigInt(0) || periodBlocks <= BigInt(0)) {
        setConfigError(t("configure.errorAmountPeriodZero"));
        return;
      }
      writeConfig({
        address: distributor.contractAddress,
        abi: attendanceAbi,
        functionName: "setConfig",
        args: [amountUnits, periodBlocks],
      });
    } catch {
      setConfigError(t("configure.errorInvalidAmountOrPeriod"));
    }
  }

  function handleAllowlist(action: "add" | "remove") {
    setAllowlistError(null);
    resetAllowlist();
    if (!creatorAddress || !isAddress(creatorAddress)) {
      setAllowlistError(t("configure.errorInvalidAddress"));
      return;
    }
    writeAllowlist({
      address: distributor.contractAddress,
      abi: attendanceAbi,
      functionName: action === "add" ? "addCreator" : "removeCreator",
      args: [creatorAddress],
    });
  }

  if (!isConnected) {
    return (
      <MessagePanel>
        <p className="text-gray-600">{t("configure.connectWallet")}</p>
      </MessagePanel>
    );
  }

  const notAuthorizedTooltip = !authorized
    ? t("configure.notAuthorized")
    : undefined;

  return (
    <div className="space-y-6">
      <Panel title={t("configure.contractConfig")}>
        <p className="mb-4 text-sm text-gray-600">
          {t("configure.configDescription")}
        </p>
        {authorized && !isOwner && (
          <p className="mb-4 text-sm text-amber-700">
            {t("configure.notOwnerConfig")}
          </p>
        )}
        <label className="mb-2 block text-sm font-medium" htmlFor="cfg-amount">
          {t("configure.amountToken")} ({distributor.symbol})
        </label>
        <input
          id="cfg-amount"
          type="text"
          inputMode="decimal"
          value={resolvedAmountInput}
          onChange={(e) => {
            setAmountInput(e.target.value);
            setConfigError(null);
          }}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
        <label className="mb-2 block text-sm font-medium" htmlFor="cfg-period">
          {t("configure.periodBlocks")}
        </label>
        <input
          id="cfg-period"
          type="text"
          inputMode="numeric"
          value={resolvedPeriodInput}
          onChange={(e) => {
            setPeriodInput(e.target.value);
            setConfigError(null);
          }}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
        {configError && (
          <p className="mb-2 text-sm text-red-600">{configError}</p>
        )}
        <TxButton
          label={t("configure.saveConfig")}
          pendingLabel={t("configure.saveConfigPending")}
          successLabel={t("configure.saveConfigSuccess")}
          errorLabel={t("common.tryAgain")}
          onClick={handleSetConfig}
          disabled={!authorized || !isOwner}
          disabledTooltip={notAuthorizedTooltip}
          isPending={configPending}
          isSuccess={configSuccess}
          isError={configTxError}
        />
      </Panel>

      <Panel title={t("configure.creatorAllowlist")}>
        <p className="mb-4 text-sm text-gray-600">
          {t("configure.allowlistDescription")}
        </p>
        {authorized && !isOwner && (
          <p className="mb-4 text-sm text-amber-700">
            {t("configure.notOwnerAllowlist")}
          </p>
        )}
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="creator-address"
        >
          {t("configure.address")}
        </label>
        <input
          id="creator-address"
          type="text"
          placeholder="0x…"
          value={creatorAddress}
          onChange={(e) => {
            setCreatorAddress(e.target.value);
            setAllowlistError(null);
          }}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
        {lookupAddress && (
          <p className="mb-4 text-sm text-gray-600">
            {t("configure.isCreator")}{" "}
            <span className="font-medium">
              {isCreatorLookup === undefined
                ? t("common.loading")
                : isCreatorLookup
                  ? t("common.yes")
                  : t("common.no")}
            </span>
          </p>
        )}
        {allowlistError && (
          <p className="mb-2 text-sm text-red-600">{allowlistError}</p>
        )}
        <div className="flex gap-3">
          <TxButton
            label={t("configure.addCreator")}
            pendingLabel={t("configure.addCreatorPending")}
            successLabel={t("configure.addCreatorSuccess")}
            errorLabel={t("common.tryAgain")}
            onClick={() => handleAllowlist("add")}
            disabled={!authorized || !isOwner || !creatorAddress}
            disabledTooltip={notAuthorizedTooltip}
            isPending={allowlistPending}
            isSuccess={allowlistSuccess}
            isError={allowlistTxError}
            className="flex-1"
          />
          <TxButton
            label={t("configure.removeCreator")}
            pendingLabel={t("configure.removeCreatorPending")}
            successLabel={t("configure.removeCreatorSuccess")}
            errorLabel={t("common.tryAgain")}
            onClick={() => handleAllowlist("remove")}
            disabled={!authorized || !isOwner || !creatorAddress}
            disabledTooltip={notAuthorizedTooltip}
            isPending={allowlistPending}
            isSuccess={allowlistSuccess}
            isError={allowlistTxError}
            className="flex-1"
          />
        </div>
      </Panel>
    </div>
  );
}

function MessagePanel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {children}
    </section>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-medium text-[#00122E]">{title}</h2>
      {children}
    </section>
  );
}
