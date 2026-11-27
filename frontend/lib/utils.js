import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes safely without style conflicts.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
