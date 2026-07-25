"use client";

import Image from "next/image";
import { HiChevronDown } from "react-icons/hi2";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SWAP_STABLES, type SwapStable } from "@/lib/contracts";
import { cn } from "@/lib/utils";

/**
 * Picks the stablecoin side of a swap (USDM / USDC / USDT). Controlled: the parent owns the
 * selected `SwapStable` and passes `onChange`. Logos come from `public/tokens/`.
 */
export function TokenSelector({
  value,
  onChange,
  label,
  disabled,
}: {
  value: SwapStable;
  onChange: (stable: SwapStable) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      {label && (
        <span className="mb-2 block text-sm font-medium">{label}</span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <Button
              type="button"
              variant="outline"
              className="h-12 justify-between gap-2 px-3 text-base"
            />
          }
        >
          <span className="flex items-center gap-2">
            <Image
              src={value.image}
              alt={value.symbol}
              width={24}
              height={24}
              className="size-6 rounded-full"
            />
            <span className="font-medium">{value.symbol}</span>
          </span>
          <HiChevronDown className="size-4 text-gray-500" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[8rem]">
          <DropdownMenuGroup>
            {SWAP_STABLES.map((stable) => (
              <DropdownMenuItem
                key={stable.address}
                onClick={() => onChange(stable)}
                className={cn(
                  "gap-2",
                  stable.address === value.address && "text-green-600",
                )}
              >
                <Image
                  src={stable.image}
                  alt={stable.symbol}
                  width={24}
                  height={24}
                  className="size-6 rounded-full"
                />
                <span className="font-medium">{stable.symbol}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
