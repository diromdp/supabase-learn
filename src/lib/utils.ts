import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string): string => {
  const nameParts = name.split(' ');
  const initials = nameParts.map((part) => part[0]?.toUpperCase()).join('');
  return initials.slice(0, 2); // Ensure only the first two initials
};