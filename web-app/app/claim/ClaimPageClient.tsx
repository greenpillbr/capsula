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
  const [inputError, setInputError] = useState<string | null>(null);

  const { data: distributionsCount } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "distributionsCount",
  });

  const latestDistributionId =
    distributionsCount !== undefined && distributionsCount > BigInt(0)
      ? distributionsCount - BigInt(1)
      : undefined;

  const { data: isActive } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "isActive",
    args: latestDistributionId !== undefined ? [latestDistributionId] : undefined,
    query: { enabled: latestDistributionId !== undefined },
  });

  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: ATTENDANCE_ADDRESS,
    abi: attendanceAbi,
    functionName: "hasClaimed",
    args:
      latestDistributionId !== undefined && address
        ? [latestDistributionId, address]
        : undefined,
    query: { enabled: latestDistributionId !== undefined && !!address },
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

  const youClaimed =
    hasClaimed === true || isClaimConfirmed
      ? true
      : hasClaimed === false
        ? false
        : undefined;

  useEffect(() => {
    resetClaim();
  }, [address, latestDistributionId, resetClaim]);

  useEffect(() => {
    if (!isClaimConfirmed) return;
    void (async () => {
      await refetchClaimed();
      await queryClient.invalidateQueries({ queryKey: ["readContract"] });
    })();
  }, [isClaimConfirmed, refetchClaimed, queryClient]);

  function handleClaim() {
    setInputError(null);
    resetClaim();
    if (latestDistributionId === undefined) {
      setInputError(t("claim.errorNoDistribution"));
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
      args: [latestDistributionId],
    });
  }

  return (
    <>
      {distributionsCount === undefined ? (
        <p className="mb-4 text-sm text-gray-600">{t("common.loading")}</p>
      ) : latestDistributionId === undefined ? (
        <p className="mb-4 text-sm text-amber-700">{t("claim.errorNoDistribution")}</p>
      ) : (
        <dl className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">{t("claim.latestDistribution")}</dt>
            <dd className="font-medium">{String(latestDistributionId)}</dd>
          </div>
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
                {youClaimed === undefined
                  ? t("common.loading")
                  : youClaimed
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
        disabled={latestDistributionId === undefined || !isConnected}
        isPending={claimPending}
        isSuccess={claimSuccess}
        isError={claimTxError}
      />
    </>
  );
}
