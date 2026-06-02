import { parse } from "csv-parse/sync";
import { z } from "zod";
import * as xlsx from "xlsx";

// ─── ZOD SCHEMAS FOR VALIDATION ───

// Helper to normalize phone numbers (e.g. convert Excel scientific notation 9.18E+11 to standard digits)
function normalizePhoneNumber(phone: any): string {
  if (!phone) return "";
  const str = String(phone).trim();
  // Match scientific notation like 9.18E+11, 9.2e+11, etc.
  if (/^\d+(\.\d+)?[eE]\+?\d+$/.test(str)) {
    const num = Number(str);
    if (!isNaN(num)) {
      return String(Math.round(num));
    }
  }
  // Strip any Excel decimals (e.g. 91818124.0) if parsed as float
  if (/^\d+\.0$/.test(str)) {
    return str.split(".")[0];
  }
  return str;
}

export const clientCsvSchema = z.object({
  client_id: z.coerce.number().int().min(1, "Client ID must be a positive integer"),
  full_name: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  mobile: z.preprocess((val) => normalizePhoneNumber(val), z.string().min(1, "Mobile number is required")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  age: z.coerce.number().int().min(1, "Age must be a positive integer"),
  gender: z.string().min(1, "Gender is required"),
  occupation: z.string().min(1, "Occupation is required"),
  health_condition: z.string().optional().default(""),
  beauty_goal: z.string().optional().default(""),
  created_at: z.union([z.string(), z.date()]).optional(),
});

export const reportCsvSchema = z.object({
  report_id: z.string().min(1, "Report ID is required"),
  client_id: z.coerce.number().int().min(1, "Client ID must be a positive integer"),
  report_date: z.union([z.string().min(1, "Report date is required"), z.date()]),
  hemoglobin: z.coerce.number().min(0, "Hemoglobin must be positive"),
  vitamin_d: z.coerce.number().min(0, "Vitamin D must be positive"),
  cholesterol: z.coerce.number().min(0, "Cholesterol must be positive"),
  blood_sugar: z.coerce.number().min(0, "Blood sugar must be positive"),
  creatinine: z.coerce.number().min(0, "Creatinine must be positive"),
  urine_protein: z.string().min(1, "Urine protein value is required"),
  bmi: z.coerce.number().min(0, "BMI must be positive"),
  doctor_notes: z.string().optional().default(""),
});

export type ClientCsvRow = z.infer<typeof clientCsvSchema>;
export type ReportCsvRow = z.infer<typeof reportCsvSchema>;

export type ParsedResult =
  | {
    type: "clients";
    rows: ClientCsvRow[];
    errors: { row: number; message: string }[];
  }
  | {
    type: "reports";
    rows: ReportCsvRow[];
    errors: { row: number; message: string }[];
  };

// ─── CUSTOM DATE PARSER FOR DD-MM-YYYY ───

export function parseCustomDate(dateVal: any): Date {
  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) {
      throw new Error("Invalid Date object parsed");
    }
    return dateVal;
  }

  const dateStr = String(dateVal).trim();
  if (!dateStr) {
    throw new Error("Empty date string");
  }

  // Handle YYYY-MM-DD, DD-MM-YYYY or slashes
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
    let day = 0;
    let month = 0;
    let year = 0;

    // Check if the first part is a 4-digit year (YYYY-MM-DD)
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      // Otherwise assume DD-MM-YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }

    // Strict range check
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
      throw new Error(`Date values out of bounds: ${dateStr}`);
    }

    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Fallback to default Javascript parsing
  const fallbackDate = new Date(dateStr);
  if (isNaN(fallbackDate.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}. Expected DD-MM-YYYY or YYYY-MM-DD.`);
  }
  return fallbackDate;
}

// Helper to normalize keys of an object to lowercase and remove spaces/underscores
function normalizeKeys(obj: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const normKey = key.toLowerCase().trim().replace(/[\s_]/g, "");
    normalized[normKey] = obj[key];
  }
  return normalized;
}

// ─── DUAL FORMAT FILE PARSING (CSV & EXCEL) ───

export function parseUploadedFile(buffer: Buffer, filename: string): ParsedResult {
  const isExcel = filename.endsWith(".xlsx") || filename.endsWith(".xls");
  let rawRecords: Record<string, any>[] = [];

  if (isExcel) {
    // Read using xlsx library
    const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // sheet_to_json will return an array of objects
    rawRecords = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
  } else {
    // Parse using csv-parse
    rawRecords = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    }) as Record<string, any>[];
  }

  if (rawRecords.length === 0) {
    throw new Error("File is empty or contains no data rows");
  }

  // Normalize headers of the first row to determine type
  const firstRowNorm = normalizeKeys(rawRecords[0]);
  const headers = Object.keys(firstRowNorm);

  // Auto detect type
  // Clients fields: clientid, fullname, email, mobile, city, state, age, gender, occupation...
  // Reports fields: reportid, clientid, reportdate, hemoglobin, vitamind, cholesterol, bloodsugar, creatinine, urineprot/urineprotein, bmi...
  let type: "clients" | "reports" = "reports";
  if (headers.includes("fullname") || headers.includes("beautygoal") || headers.includes("occupation")) {
    type = "clients";
  }

  const errors: { row: number; message: string }[] = [];

  if (type === "clients") {
    const rows: ClientCsvRow[] = [];
    rawRecords.forEach((record, index) => {
      const norm = normalizeKeys(record);
      // Map aliases
      const mappedRecord = {
        client_id: norm["clientid"] ?? "",
        full_name: norm["fullname"] ?? norm["name"] ?? "",
        email: norm["email"] ?? "",
        mobile: norm["mobile"] ?? norm["phone"] ?? "",
        city: norm["city"] ?? "",
        state: norm["state"] ?? "",
        age: norm["age"] ?? "",
        gender: norm["gender"] ?? "",
        occupation: norm["occupation"] ?? "",
        health_condition: norm["healthcondition"] ?? norm["healthcon"] ?? "",
        beauty_goal: norm["beautygoal"] ?? norm["beautygo"] ?? "",
        created_at: norm["createdat"] ?? "",
      };

      const result = clientCsvSchema.safeParse(mappedRecord);
      if (result.success) {
        rows.push(result.data);
      } else {
        const message = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        errors.push({ row: index + 2, message });
      }
    });

    return { type: "clients", rows, errors };
  } else {
    const rows: ReportCsvRow[] = [];
    rawRecords.forEach((record, index) => {
      const norm = normalizeKeys(record);
      // Map aliases
      const mappedRecord = {
        report_id: norm["reportid"] ?? "",
        client_id: norm["clientid"] ?? "",
        report_date: norm["reportdate"] ?? norm["date"] ?? "",
        hemoglobin: norm["hemoglobin"] ?? norm["hemo"] ?? "",
        vitamin_d: norm["vitamind"] ?? norm["vitd"] ?? "",
        cholesterol: norm["cholesterol"] ?? norm["chol"] ?? "",
        blood_sugar: norm["bloodsugar"] ?? norm["bloodsug"] ?? norm["sugar"] ?? "",
        creatinine: norm["creatinine"] ?? norm["creat"] ?? "",
        urine_protein: norm["urineprotein"] ?? norm["urineprot"] ?? "",
        bmi: norm["bmi"] ?? "",
        doctor_notes: norm["doctornotes"] ?? norm["notes"] ?? "",
      };

      const result = reportCsvSchema.safeParse(mappedRecord);
      if (result.success) {
        // Double check date parsing safety
        try {
          parseCustomDate(result.data.report_date);
          rows.push(result.data);
        } catch (dateErr: any) {
          errors.push({ row: index + 2, message: `report_date: ${dateErr.message}` });
        }
      } else {
        const message = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        errors.push({ row: index + 2, message });
      }
    });

    return { type: "reports", rows, errors };
  }
}
