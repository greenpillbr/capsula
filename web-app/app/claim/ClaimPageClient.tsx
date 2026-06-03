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
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export function ClaimPageClient() {
  const { t } = useTranslation();
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
      setInputError(t("claim.errorInvalidId"));
      return;
    }
    if (!isConnected) {
      setInputError(t("claim.errorConnectWallet"));
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
    <>
      <label
        className="mb-2 block text-sm font-medium"
        htmlFor="distribution-id"
      >
        {t("claim.distributionId")}
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
            <dt className="text-gray-600">{t("claim.activeNow")}</dt>
            <dd className="font-medium">
              {isActive === undefined
                ? t("common.loading")
                : isActive
                  ? t("common.yes")
                  : t("common.no")}
            </dd>
          </div>
          {isConnected && (
            <div className="flex justify-between">
              <dt className="text-gray-600">{t("claim.youClaimed")}</dt>
              <dd className="font-medium">
                {hasClaimed === undefined
                  ? t("common.loading")
                  : hasClaimed
                    ? t("common.yes")
                    : t("common.no")}
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
          {t("claim.connectWalletNotice")}
        </p>
      )}

      <TxButton
        label={t("claim.buttonLabel")}
        pendingLabel={t("claim.buttonPending")}
        successLabel={t("claim.buttonSuccess")}
        errorLabel={t("common.tryAgain")}
        onClick={handleClaim}
        disabled={!distributionId || !isConnected}
        isPending={claimPending}
        isSuccess={claimSuccess}
        isError={claimTxError}
      />
    </>
  );
}
