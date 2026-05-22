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
import {
  ATTENDANCE_ADDRESS,
  GPBR_DECIMALS,
  attendanceAbi,
  isAdminAddress,
} from "@/lib/contracts";

export default function ConfigurePage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [amountInput, setAmountInput] = useState("");
  const [periodInput, setPeriodInput] = useState("");
  const [creatorAddress, setCreatorAddress] = useState("");
  const [configError, setConfigError] = useState<string | null>(null);
  const [allowlistError, setAllowlistError] = useState<string | null>(null);

  const staticAuthorized = isAdminAddress(address);

  const { data: contractOwner } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "owner",
  });

  const isOwner =
    address !== undefined &&
    contractOwner !== undefined &&
    address.toLowerCase() === contractOwner.toLowerCase();

  const authorized = staticAuthorized || isOwner;

  const { data: currentAmount } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "amount",
  });

  const { data: currentPeriod } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "period",
  });

  const lookupAddress =
    creatorAddress && isAddress(creatorAddress) ? creatorAddress : undefined;

  const { data: isCreatorLookup } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "isCreator",
    args: lookupAddress ? [lookupAddress] : undefined,
    query: { enabled: !!lookupAddress },
  });

  useEffect(() => {
    if (currentAmount !== undefined) {
      setAmountInput(formatUnits(currentAmount, GPBR_DECIMALS));
    }
  }, [currentAmount]);

  useEffect(() => {
    if (currentPeriod !== undefined) {
      setPeriodInput(String(currentPeriod));
    }
  }, [currentPeriod]);

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
    if (!amountInput || Number.isNaN(Number(amountInput))) {
      setConfigError("Enter a valid GPBR amount");
      return;
    }
    if (!periodInput || !/^\d+$/.test(periodInput)) {
      setConfigError("Enter a valid period in blocks");
      return;
    }
    try {
      const amountUnits = parseUnits(amountInput, GPBR_DECIMALS);
      const periodBlocks = BigInt(periodInput);
      if (amountUnits <= BigInt(0) || periodBlocks <= BigInt(0)) {
        setConfigError("Amount and period must be greater than zero");
        return;
      }
      writeConfig({
        address: ATTENDANCE_ADDRESS,
        abi: attendanceAbi,
        functionName: "setConfig",
        args: [amountUnits, periodBlocks],
      });
    } catch {
      setConfigError("Invalid amount or period");
    }
  }

  function handleAllowlist(action: "add" | "remove") {
    setAllowlistError(null);
    resetAllowlist();
    if (!creatorAddress || !isAddress(creatorAddress)) {
      setAllowlistError("Enter a valid address");
      return;
    }
    writeAllowlist({
      address: ATTENDANCE_ADDRESS,
      abi: attendanceAbi,
      functionName: action === "add" ? "addCreator" : "removeCreator",
      args: [creatorAddress],
    });
  }

  if (!isConnected) {
    return (
      <Panel title="Configure">
        <p className="text-gray-600">Connect your wallet to access this page.</p>
      </Panel>
    );
  }

  if (!authorized) {
    return (
      <Panel title="Configure">
        <p className="text-gray-600">
          Your wallet is not authorized to configure this contract.
        </p>
        <p className="mt-2 break-all text-xs text-gray-400">{address}</p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">Configure</h1>

      <Panel title="Contract config">
        <p className="mb-4 text-sm text-gray-600">
          Set the default reward amount and claim window length (in blocks) for
          new distributions. Only the contract owner can submit this on-chain.
        </p>
        {!isOwner && (
          <p className="mb-4 text-sm text-amber-700">
            Your wallet is not the contract owner. Config updates will fail
            on-chain.
          </p>
        )}
        <label className="mb-2 block text-sm font-medium" htmlFor="cfg-amount">
          Amount (GPBR)
        </label>
        <input
          id="cfg-amount"
          type="text"
          inputMode="decimal"
          value={amountInput}
          onChange={(e) => {
            setAmountInput(e.target.value);
            setConfigError(null);
          }}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
        <label className="mb-2 block text-sm font-medium" htmlFor="cfg-period">
          Period (blocks)
        </label>
        <input
          id="cfg-period"
          type="text"
          inputMode="numeric"
          value={periodInput}
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
          label="Save config"
          pendingLabel="Saving…"
          successLabel="Config saved"
          onClick={handleSetConfig}
          disabled={!isOwner}
          isPending={configPending}
          isSuccess={configSuccess}
          isError={configTxError}
        />
      </Panel>

      <Panel title="Creator allowlist">
        <p className="mb-4 text-sm text-gray-600">
          Manage which addresses can create and cancel distributions. Only the
          contract owner can modify the allowlist on-chain.
        </p>
        {!isOwner && (
          <p className="mb-4 text-sm text-amber-700">
            Your wallet is not the contract owner. Allowlist changes will fail
            on-chain.
          </p>
        )}
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="creator-address"
        >
          Address
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
            isCreator:{" "}
            <span className="font-medium">
              {isCreatorLookup === undefined
                ? "…"
                : isCreatorLookup
                  ? "Yes"
                  : "No"}
            </span>
          </p>
        )}
        {allowlistError && (
          <p className="mb-2 text-sm text-red-600">{allowlistError}</p>
        )}
        <div className="flex gap-3">
          <TxButton
            label="Add creator"
            pendingLabel="Adding…"
            successLabel="Creator added"
            onClick={() => handleAllowlist("add")}
            disabled={!isOwner || !creatorAddress}
            isPending={allowlistPending}
            isSuccess={allowlistSuccess}
            isError={allowlistTxError}
            className="flex-1"
          />
          <TxButton
            label="Remove creator"
            pendingLabel="Removing…"
            successLabel="Creator removed"
            onClick={() => handleAllowlist("remove")}
            disabled={!isOwner || !creatorAddress}
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
