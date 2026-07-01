"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { erc20Abi } from "viem";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

type UseSpendTokenApprovalOptions = {
  owner: `0x${string}` | undefined;
  token: `0x${string}`;
  spender: `0x${string}` | undefined;
  amount: bigint | undefined;
  /** GPBRV requires resetting allowance to 0 before a new approval. */
  resetAllowanceBeforeApprove?: boolean;
};

export function useSpendTokenApproval({
  owner,
  token,
  spender,
  amount,
  resetAllowanceBeforeApprove = false,
}: UseSpendTokenApprovalOptions) {
  const queryClient = useQueryClient();
  const [approvePhase, setApprovePhase] = useState<"idle" | "reset" | "approve">("idle");
  const [approvedAmount, setApprovedAmount] = useState<bigint | undefined>(undefined);
  const pendingAmountRef = useRef<bigint | undefined>(undefined);

  const { data: allowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    query: { enabled: !!owner && !!spender },
  });

  const hasSufficientAllowance =
    amount !== undefined &&
    amount > BigInt(0) &&
    ((allowance !== undefined && allowance >= amount) ||
      (approvedAmount !== undefined && approvedAmount >= amount));

  const needsApproval =
    amount !== undefined && amount > BigInt(0) && !hasSufficientAllowance;

  const needsAllowanceReset =
    resetAllowanceBeforeApprove &&
    needsApproval &&
    allowance !== undefined &&
    allowance > BigInt(0);

  const isResetStep = needsAllowanceReset && approvePhase !== "approve";

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    isError: isApproveWriteError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    isError: isApproveConfirmError,
  } = useWaitForTransactionReceipt({ hash: approveHash });

  useEffect(() => {
    setApprovePhase("idle");
    pendingAmountRef.current = undefined;
    setApprovedAmount(undefined);
  }, [amount, token, spender]);

  useEffect(() => {
    if (isApproveWriteError || isApproveConfirmError) {
      setApprovePhase("idle");
      pendingAmountRef.current = undefined;
      setApprovedAmount(undefined);
    }
  }, [isApproveWriteError, isApproveConfirmError]);

  useEffect(() => {
    if (!isApproveConfirmed) return;

    void queryClient.invalidateQueries();

    if (approvePhase === "reset" && pendingAmountRef.current !== undefined && spender) {
      setApprovePhase("approve");
      resetApprove();
      writeApprove({
        address: token,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, pendingAmountRef.current],
      });
      return;
    }

    if (pendingAmountRef.current !== undefined) {
      setApprovedAmount(pendingAmountRef.current);
    }

    setApprovePhase("idle");
    pendingAmountRef.current = undefined;
    resetApprove();
  }, [
    isApproveConfirmed,
    approvePhase,
    queryClient,
    resetApprove,
    spender,
    token,
    writeApprove,
  ]);

  function handleApprove(targetAmount: bigint) {
    resetApprove();
    pendingAmountRef.current = targetAmount;

    if (
      resetAllowanceBeforeApprove &&
      allowance !== undefined &&
      allowance > BigInt(0)
    ) {
      setApprovePhase("reset");
      writeApprove({
        address: token,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender!, BigInt(0)],
      });
      return;
    }

    setApprovePhase("approve");
    writeApprove({
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender!, targetAmount],
    });
  }

  return {
    allowance,
    needsApproval,
    needsAllowanceReset,
    isResetStep,
    handleApprove,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    isApproveWriteError,
    isApproveConfirmError,
  };
}
