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
import { attendanceAbi, type DistributorToken } from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/types";

type ClaimFormPrefix = "registerAttendance" | "resgatar";

function claimKey(prefix: ClaimFormPrefix, suffix: string): TranslationKey {
  return `${prefix}.${suffix}` as TranslationKey;
}

export function ClaimForm({
  distributor,
  translationPrefix,
}: {
  distributor: DistributorToken;
  translationPrefix: ClaimFormPrefix;
}) {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [inputError, setInputError] = useState<string | null>(null);

  const { data: distributionsCount } = useReadContract({
    address: distributor.contractAddress,
    abi: attendanceAbi,
    functionName: "distributionsCount",
  });

  const latestDistributionId =
    distributionsCount !== undefined && distributionsCount > BigInt(0)
      ? distributionsCount - BigInt(1)
      : undefined;

  const { data: isActive } = useReadContract({
    address: distributor.contractAddress,
    abi: attendanceAbi,
    functionName: "isActive",
    args: latestDistributionId !== undefined ? [latestDistributionId] : undefined,
    query: { enabled: latestDistributionId !== undefined },
  });

  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: distributor.contractAddress,
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
      setInputError(t(claimKey(translationPrefix, "errorNoDistribution")));
      return;
    }
    if (!isConnected) {
      setInputError(t(claimKey(translationPrefix, "errorConnectWallet")));
      return;
    }
    writeContract({
      address: distributor.contractAddress,
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
        <p className="mb-4 text-sm text-amber-700">
          {t(claimKey(translationPrefix, "errorNoDistribution"))}
        </p>
      ) : (
        <dl className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">
              {t(claimKey(translationPrefix, "latestDistribution"))}
            </dt>
            <dd className="font-medium">{String(latestDistributionId)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">
              {t(claimKey(translationPrefix, "activeNow"))}
            </dt>
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
              <dt className="text-gray-600">
                {t(claimKey(translationPrefix, "youClaimed"))}
              </dt>
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
          {t(claimKey(translationPrefix, "connectWalletNotice"))}
        </p>
      )}

      <TxButton
        label={t(claimKey(translationPrefix, "buttonLabel"))}
        pendingLabel={t(claimKey(translationPrefix, "buttonPending"))}
        successLabel={t(claimKey(translationPrefix, "buttonSuccess"))}
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
