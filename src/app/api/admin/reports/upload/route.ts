import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth, requireRole } from "@/server/auth";
import { parseUploadedFile } from "@/server/utils/csvParser";
import {
  importClientsFromCsv,
  importHealthReportsFromCsv,
} from "@/server/services/admin.service";
import { ValidationError } from "@/server/utils/errors";
import { CsvUploadResult } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    requireRole(user, "admin");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new ValidationError("CSV or Excel file is required");
    }

    const filenameLower = file.name.toLowerCase();
    const isCsv = filenameLower.endsWith(".csv");
    const isExcel = filenameLower.endsWith(".xlsx") || filenameLower.endsWith(".xls");

    if (!isCsv && !isExcel) {
      throw new ValidationError("Only CSV and Excel (.xlsx, .xls) files are allowed");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = parseUploadedFile(buffer, file.name);

    if (parsed.errors.length > 0 && parsed.rows.length === 0) {
      throw new ValidationError("File validation failed", {
        file: parsed.errors.map((e) => `Row ${e.row}: ${e.message}`),
      });
    }

    let result: CsvUploadResult;
    let message = "";

    if (parsed.type === "clients") {
      result = await withDb(() => importClientsFromCsv(parsed.rows));
      parsed.errors.forEach((e) => {
        result.failedCount++;
        result.errors.push({ row: e.row, email: "", message: e.message });
      });
      message = `Imported ${result.successCount} clients. ${result.failedCount} failed.`;
    } else {
      result = await withDb(() =>
        importHealthReportsFromCsv(parsed.rows, user.userId)
      );
      parsed.errors.forEach((e) => {
        result.failedCount++;
        result.errors.push({ row: e.row, email: "", message: e.message });
      });
      message = `Imported ${result.successCount} reports. ${result.failedCount} failed.`;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message,
    });
  } catch (error) {
    return handleError(error);
  }
}
