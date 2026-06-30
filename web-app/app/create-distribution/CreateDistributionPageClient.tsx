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
import { attendanceAbi, isAdminAddress, type DistributorToken } from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/types";

export function CreateDistributionPageClient({
  distributor,
  fundDescriptionKey,
}: {
  distributor: DistributorToken;
  fundDescriptionKey: TranslationKey;
}) {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const [fundAmount, setFundAmount] = useState("");
  const [maxClaimers, setMaxClaimers] = useState("0");
  const [fundError, setFundError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const staticAuthorized = isAdminAddress(address);

  const { data: isCreator } = useReadContract({
    address: distributor.contractAddress,
    abi: attendanceAbi,
    functionName: "isCreator",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const authorized = staticAuthorized || isCreator === true;

  const { data: poolBalance, refetch: refetchPool } = useReadContract({
    address: distributor.tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [distributor.contractAddress],
  });

  const { data: distributionsCount, refetch: refetchCount } = useReadContract({
    address: distributor.contractAddress,
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
      setFundError(t("createDistribution.errorInvalidAmount"));
      return;
    }
    try {
      const units = parseUnits(fundAmount, distributor.decimals);
      if (units <= BigInt(0)) {
        setFundError(t("createDistribution.errorAmountZero"));
        return;
      }
      writeFund({
        address: distributor.tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [distributor.contractAddress, units],
      });
    } catch {
      setFundError(t("createDistribution.errorInvalidAmountGeneric"));
    }
  }

  function handleCreate() {
    setCreateError(null);
    resetCreate();
    if (!/^\d+$/.test(maxClaimers)) {
      setCreateError(t("createDistribution.errorInvalidMaxClaimers"));
      return;
    }
    writeCreate({
      address: distributor.contractAddress,
      abi: attendanceAbi,
      functionName: "createDistribution",
      args: [BigInt(maxClaimers)],
    });
  }

  if (!isConnected) {
    return (
      <MessagePanel>
        <p className="text-gray-600">{t("createDistribution.connectWallet")}</p>
      </MessagePanel>
    );
  }

  return (
    <div className="space-y-6">
      <Panel title={t("createDistribution.contractPool")}>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">
              {distributor.symbol} {t("createDistribution.tokenInContract")}
            </dt>
            <dd className="font-medium">
              {poolBalance !== undefined
                ? `${formatUnits(poolBalance, distributor.decimals)} ${distributor.symbol}`
                : t("common.dash")}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">
              {t("createDistribution.distributionsCreated")}
            </dt>
            <dd className="font-medium">
              {distributionsCount !== undefined
                ? String(distributionsCount)
                : t("common.dash")}
            </dd>
          </div>
        </dl>
      </Panel>

      <Panel title={t("createDistribution.fundContract")}>
        <p className="mb-4 text-sm text-gray-600">{t(fundDescriptionKey)}</p>
        <label className="mb-2 block text-sm font-medium" htmlFor="fund-amount">
          {t("createDistribution.amountToken")} ({distributor.symbol})
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
          label={t("createDistribution.fundButton")}
          pendingLabel={t("createDistribution.fundButtonPending")}
          successLabel={t("createDistribution.fundButtonSuccess")}
          errorLabel={t("common.tryAgain")}
          onClick={handleFund}
          disabled={!fundAmount}
          isPending={fundPending}
          isSuccess={fundSuccess}
          isError={fundTxError}
        />
      </Panel>

      <Panel title={t("createDistribution.createDistribution")}>
        <p className="mb-4 text-sm text-gray-600">
          {t("createDistribution.createDescription")}
        </p>
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="max-claimers"
        >
          {t("createDistribution.maxClaimers")}
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
          label={t("createDistribution.createButton")}
          pendingLabel={t("createDistribution.createButtonPending")}
          successLabel={t("createDistribution.createButtonSuccess")}
          errorLabel={t("common.tryAgain")}
          onClick={handleCreate}
          disabled={!authorized}
          disabledTooltip={
            !authorized ? t("createDistribution.notAllowlisted") : undefined
          }
          isPending={createPending}
          isSuccess={createSuccess}
          isError={createTxError}
        />
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
