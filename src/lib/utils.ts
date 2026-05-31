import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getBloodPressureStatus(systolic: number, diastolic: number): {
  label: string;
  color: string;
} {
  if (systolic < 120 && diastolic < 80) {
    return { label: "Normal", color: "text-green-600 bg-green-50" };
  }
  if (systolic < 130 && diastolic < 80) {
    return { label: "Elevated", color: "text-yellow-600 bg-yellow-50" };
  }
  if (systolic < 140 || diastolic < 90) {
    return { label: "Stage 1", color: "text-orange-600 bg-orange-50" };
  }
  return { label: "Stage 2", color: "text-red-600 bg-red-50" };
}

export function getGlucoseStatus(glucose: number): { label: string; color: string } {
  if (glucose < 100) return { label: "Normal", color: "text-green-600 bg-green-50" };
  if (glucose < 126) return { label: "Prediabetes", color: "text-yellow-600 bg-yellow-50" };
  return { label: "High", color: "text-red-600 bg-red-50" };
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
