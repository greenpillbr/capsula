"use client";

type TxButtonProps = {
  label: string;
  pendingLabel?: string;
  successLabel?: string;
  onClick: () => void;
  disabled?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  className?: string;
};

export function TxButton({
  label,
  pendingLabel = "Confirm in wallet…",
  successLabel = "Success",
  onClick,
  disabled,
  isPending,
  isSuccess,
  isError,
  className = "",
}: TxButtonProps) {
  let text = label;
  if (isPending) text = pendingLabel;
  else if (isSuccess) text = successLabel;
  else if (isError) text = "Try again";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPending}
      className={`w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {text}
    </button>
  );
}
