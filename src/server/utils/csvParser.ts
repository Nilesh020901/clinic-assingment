import { parse } from "csv-parse/sync";
import { z } from "zod";

export const csvRowSchema = z.object({
  email: z.string().email("Invalid email in CSV row"),
  reportDate: z.string().min(1, "Report date is required"),
  bloodPressureSystolic: z.coerce.number().min(50).max(300),
  bloodPressureDiastolic: z.coerce.number().min(30).max(200),
  heartRate: z.coerce.number().min(30).max(250),
  temperature: z.coerce.number().min(90).max(110),
  weight: z.coerce.number().min(1).max(500),
  glucose: z.coerce.number().min(20).max(600),
  cholesterol: z.coerce.number().min(50).max(500),
  notes: z.string().optional().default(""),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

export interface ParsedCsvResult {
  rows: CsvRow[];
  errors: { row: number; message: string }[];
}

const REQUIRED_HEADERS = [
  "email",
  "reportDate",
  "bloodPressureSystolic",
  "bloodPressureDiastolic",
  "heartRate",
  "temperature",
  "weight",
  "glucose",
  "cholesterol",
];

export function parseHealthReportCsv(buffer: Buffer): ParsedCsvResult {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    throw new Error("CSV file is empty or contains no data rows");
  }

  const headers = Object.keys(records[0]);
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV columns: ${missingHeaders.join(", ")}`);
  }

  const rows: CsvRow[] = [];
  const errors: { row: number; message: string }[] = [];

  records.forEach((record, index) => {
    const result = csvRowSchema.safeParse(record);
    if (result.success) {
      rows.push(result.data);
    } else {
      const message = result.error.errors.map((e) => e.message).join("; ");
      errors.push({ row: index + 2, message });
    }
  });

  return { rows, errors };
}

export function parseReportDate(dateStr: string): Date {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return parsed;
}
