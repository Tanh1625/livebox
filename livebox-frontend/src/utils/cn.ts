import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge tailwind classes
 * Resolves the "Tailwind Anti-Pattern" as defined in the frontend conventions.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
