"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { TxButton } from "@/components/TxButton";
import { ATTENDANCE_ADDRESS, attendanceAbi } from "@/lib/contracts";

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [distributionId, setDistributionId] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const parsedId =
    distributionId !== "" && /^\d+$/.test(distributionId)
      ? BigInt(distributionId)
      : undefined;

  const { data: isActive } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "isActive",
    args: parsedId !== undefined ? [parsedId] : undefined,
    query: { enabled: parsedId !== undefined },
  });

  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "hasClaimed",
    args:
      parsedId !== undefined && address
        ? [parsedId, address]
        : undefined,
    query: { enabled: parsedId !== undefined && !!address },
  });

  const {
    writeContract,
    data: claimHash,
    isPending: isClaimPending,
    isError: isClaimWriteError,
    reset: resetClaim,
  } = useWriteContract();

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimConfirmed,
    isError: isClaimConfirmError,
  } = useWaitForTransactionReceipt({ hash: claimHash });

  const claimPending = isClaimPending || isClaimConfirming;
  const claimSuccess = isClaimConfirmed;
  const claimTxError = isClaimWriteError || isClaimConfirmError;

  useEffect(() => {
    if (isClaimConfirmed) {
      void refetchClaimed();
      void queryClient.invalidateQueries();
    }
  }, [isClaimConfirmed, refetchClaimed, queryClient]);

  function handleClaim() {
    setInputError(null);
    resetClaim();
    if (parsedId === undefined) {
      setInputError("Enter a valid distribution ID (non-negative integer)");
      return;
    }
    if (!isConnected) {
      setInputError("Connect your wallet to claim");
      return;
    }
    writeContract({
      address: ATTENDANCE_ADDRESS,
      abi: attendanceAbi,
      functionName: "claim",
      args: [parsedId],
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#00122E]">Claim</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-gray-600">
          Enter a distribution ID to claim your GPBR reward during the active
          window.
        </p>

        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="distribution-id"
        >
          Distribution ID
        </label>
        <input
          id="distribution-id"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={distributionId}
          onChange={(e) => {
            setDistributionId(e.target.value);
            setInputError(null);
          }}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
        />

        {parsedId !== undefined && (
          <dl className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Active now</dt>
              <dd className="font-medium">
                {isActive === undefined
                  ? "…"
                  : isActive
                    ? "Yes"
                    : "No"}
              </dd>
            </div>
            {isConnected && (
              <div className="flex justify-between">
                <dt className="text-gray-600">You claimed</dt>
                <dd className="font-medium">
                  {hasClaimed === undefined
                    ? "…"
                    : hasClaimed
                      ? "Yes"
                      : "No"}
                </dd>
              </div>
            )}
          </dl>
        )}

        {inputError && (
          <p className="mb-2 text-sm text-red-600">{inputError}</p>
        )}

        {!isConnected && (
          <p className="mb-4 text-sm text-amber-700">
            Connect your wallet to submit a claim.
          </p>
        )}

        <TxButton
          label="Claim distribution"
          pendingLabel="Claiming…"
          successLabel="Claimed"
          onClick={handleClaim}
          disabled={!distributionId || !isConnected}
          isPending={claimPending}
          isSuccess={claimSuccess}
          isError={claimTxError}
        />
      </section>
    </div>
  );
}
