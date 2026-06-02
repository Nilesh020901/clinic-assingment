import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface HealthStatus {
  label: string;
  color: string;
}

export function getHemoglobinStatus(val: number): HealthStatus {
  if (val < 12.0) {
    return { label: "Low (Anemic)", color: "text-rose-700 bg-rose-50 border border-rose-200" };
  }
  if (val > 17.5) {
    return { label: "High", color: "text-amber-700 bg-amber-50 border border-amber-200" };
  }
  return { label: "Normal", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
}

export function getVitaminDStatus(val: number): HealthStatus {
  if (val < 20) {
    return { label: "Deficient", color: "text-rose-700 bg-rose-50 border border-rose-200" };
  }
  if (val < 30) {
    return { label: "Insufficient", color: "text-amber-700 bg-amber-50 border border-amber-200" };
  }
  return { label: "Sufficient (Normal)", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
}

export function getCholesterolStatus(val: number): HealthStatus {
  if (val < 200) {
    return { label: "Desirable (Normal)", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
  }
  if (val < 240) {
    return { label: "Borderline High", color: "text-amber-700 bg-amber-50 border border-amber-200" };
  }
  return { label: "High", color: "text-rose-700 bg-rose-50 border border-rose-200" };
}

export function getBloodSugarStatus(val: number): HealthStatus {
  if (val < 100) {
    return { label: "Normal", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
  }
  if (val < 126) {
    return { label: "Elevated (Prediabetic)", color: "text-amber-700 bg-amber-50 border border-amber-200" };
  }
  return { label: "High (Diabetic Range)", color: "text-rose-700 bg-rose-50 border border-rose-200" };
}

export function getCreatinineStatus(val: number): HealthStatus {
  if (val < 0.5) {
    return { label: "Low", color: "text-amber-700 bg-amber-50 border border-amber-200" };
  }
  if (val > 1.3) {
    return { label: "High", color: "text-rose-700 bg-rose-50 border border-rose-200" };
  }
  return { label: "Normal", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
}

export function getUrineProteinStatus(val: string): HealthStatus {
  const norm = String(val).trim().toLowerCase();
  if (norm.includes("neg")) {
    return { label: "Negative (Normal)", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
  }
  if (norm.includes("trac")) {
    return { label: "Trace (Elevated)", color: "text-amber-700 bg-amber-50 border border-amber-200" };
  }
  return { label: "Positive (High)", color: "text-rose-700 bg-rose-50 border border-rose-200" };
}

export function getBmiStatus(val: number): HealthStatus {
  if (val < 18.5) {
    return { label: "Underweight", color: "text-blue-700 bg-blue-50 border border-blue-200" };
  }
  if (val < 25.0) {
    return { label: "Normal weight", color: "text-emerald-700 bg-emerald-50 border border-emerald-200" };
  }
  if (val < 30.0) {
    return { label: "Overweight", color: "text-amber-700 bg-amber-50 border border-amber-200" };
  }
  return { label: "Obese", color: "text-rose-700 bg-rose-50 border border-rose-200" };
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
