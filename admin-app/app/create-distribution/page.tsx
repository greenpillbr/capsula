"use client";

import { useQueryClient } from "@tanstack/react-query";
import { erc20Abi, formatUnits, parseUnits } from "viem";
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
  GPBR_ADDRESS,
  GPBR_DECIMALS,
  attendanceAbi,
  isAdminAddress,
} from "@/lib/contracts";

export default function CreateDistributionPage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [fundAmount, setFundAmount] = useState("");
  const [maxClaimers, setMaxClaimers] = useState("0");
  const [fundError, setFundError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const staticAuthorized = isAdminAddress(address);

  const { data: isCreator } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "isCreator",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const authorized = staticAuthorized || isCreator === true;

  const { data: poolBalance, refetch: refetchPool } = useReadContract({
    address: GPBR_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [ATTENDANCE_ADDRESS],
  });

  const { data: distributionsCount, refetch: refetchCount } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "distributionsCount",
  });

  const {
    writeContract: writeFund,
    data: fundHash,
    isPending: isFundPending,
    isError: isFundWriteError,
    reset: resetFund,
  } = useWriteContract();

  const {
    isLoading: isFundConfirming,
    isSuccess: isFundConfirmed,
    isError: isFundConfirmError,
  } = useWaitForTransactionReceipt({ hash: fundHash });

  const {
    writeContract: writeCreate,
    data: createHash,
    isPending: isCreatePending,
    isError: isCreateWriteError,
    reset: resetCreate,
  } = useWriteContract();

  const {
    isLoading: isCreateConfirming,
    isSuccess: isCreateConfirmed,
    isError: isCreateConfirmError,
  } = useWaitForTransactionReceipt({ hash: createHash });

  const fundPending = isFundPending || isFundConfirming;
  const fundSuccess = isFundConfirmed;
  const fundTxError = isFundWriteError || isFundConfirmError;

  const createPending = isCreatePending || isCreateConfirming;
  const createSuccess = isCreateConfirmed;
  const createTxError = isCreateWriteError || isCreateConfirmError;

  useEffect(() => {
    if (isFundConfirmed || isCreateConfirmed) {
      void refetchPool();
      void refetchCount();
      void queryClient.invalidateQueries();
    }
  }, [isFundConfirmed, isCreateConfirmed, refetchPool, refetchCount, queryClient]);

  function handleFund() {
    setFundError(null);
    resetFund();
    if (!fundAmount || Number.isNaN(Number(fundAmount))) {
      setFundError("Enter a valid GPBR amount");
      return;
    }
    try {
      const units = parseUnits(fundAmount, GPBR_DECIMALS);
      if (units <= BigInt(0)) {
        setFundError("Amount must be greater than zero");
        return;
      }
      writeFund({
        address: GPBR_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [ATTENDANCE_ADDRESS, units],
      });
    } catch {
      setFundError("Invalid amount");
    }
  }

  function handleCreate() {
    setCreateError(null);
    resetCreate();
    if (!/^\d+$/.test(maxClaimers)) {
      setCreateError("Enter a valid non-negative integer (0 = unlimited)");
      return;
    }
    writeCreate({
      address: ATTENDANCE_ADDRESS,
      abi: attendanceAbi,
      functionName: "createDistribution",
      args: [BigInt(maxClaimers)],
    });
  }

  if (!isConnected) {
    return (
      <Panel title="Create Distribution">
        <p className="text-gray-600">
          Connect your wallet to access this page.
        </p>
      </Panel>
    );
  }

  if (!authorized) {
    return (
      <Panel title="Create Distribution">
        <p className="text-gray-600">
          Your wallet is not on the contract creator allowlist.
        </p>
        <p className="mt-2 break-all text-xs text-gray-400">{address}</p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">
        Create Distribution
      </h1>

      <Panel title="Contract pool">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">GPBR in contract</dt>
            <dd className="font-medium">
              {poolBalance !== undefined
                ? `${formatUnits(poolBalance, GPBR_DECIMALS)} GPBR`
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Distributions created</dt>
            <dd className="font-medium">
              {distributionsCount !== undefined
                ? String(distributionsCount)
                : "—"}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Fund contract">
        <p className="mb-4 text-sm text-gray-600">
          Transfer GPBR tokens to the Attendance contract. Amount uses 6
          decimals (e.g. 1 = 1 GPBR).
        </p>
        <label className="mb-2 block text-sm font-medium" htmlFor="fund-amount">
          Amount (GPBR)
        </label>
        <input
          id="fund-amount"
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={fundAmount}
          onChange={(e) => {
            setFundAmount(e.target.value);
            setFundError(null);
          }}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
        {fundError && (
          <p className="mb-2 text-sm text-red-600">{fundError}</p>
        )}
        <TxButton
          label="Fund contract"
          pendingLabel="Funding…"
          successLabel="Funded"
          onClick={handleFund}
          disabled={!fundAmount}
          isPending={fundPending}
          isSuccess={fundSuccess}
          isError={fundTxError}
        />
      </Panel>

      <Panel title="Create distribution">
        <p className="mb-4 text-sm text-gray-600">
          Opens a new claim window using the contract&apos;s configured reward
          amount and period. Only allowlisted creators can succeed on-chain.
        </p>
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="max-claimers"
        >
          Max claimers (0 = unlimited)
        </label>
        <input
          id="max-claimers"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={maxClaimers}
          onChange={(e) => {
            setMaxClaimers(e.target.value);
            setCreateError(null);
          }}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />
        {createError && (
          <p className="mb-2 text-sm text-red-600">{createError}</p>
        )}
        <TxButton
          label="Create distribution"
          pendingLabel="Creating…"
          successLabel="Distribution created"
          onClick={handleCreate}
          isPending={createPending}
          isSuccess={createSuccess}
          isError={createTxError}
        />
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
