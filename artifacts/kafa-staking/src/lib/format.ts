import { formatUnits } from "viem";

export function formatTokenAmount(
  value: bigint | undefined | null,
  tokenDecimals = 18,
  maxDecimals = 6
): string {
  if (value === undefined || value === null) return "0";

  let formatted: string;
  try {
    formatted = formatUnits(value, tokenDecimals);
  } catch {
    return "0";
  }

  const [whole, frac = ""] = formatted.split(".");
  if (!frac) return whole;

  const trimmedFrac = frac.slice(0, maxDecimals).replace(/0+$/, "");
  return trimmedFrac ? `${whole}.${trimmedFrac}` : whole;
}
