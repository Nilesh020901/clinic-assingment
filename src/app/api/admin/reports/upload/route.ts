import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth, requireRole } from "@/server/auth";
import { parseHealthReportCsv } from "@/server/utils/csvParser";
import { importHealthReportsFromCsv } from "@/server/services/admin.service";
import { ValidationError } from "@/server/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request);
    requireRole(user, "admin");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new ValidationError("CSV file is required");
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      throw new ValidationError("Only CSV files are allowed");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = parseHealthReportCsv(buffer);

    if (parsed.errors.length > 0 && parsed.rows.length === 0) {
      throw new ValidationError("CSV validation failed", {
        csv: parsed.errors.map((e) => `Row ${e.row}: ${e.message}`),
      });
    }

    const result = await withDb(() =>
      importHealthReportsFromCsv(parsed.rows, user.userId)
    );

    parsed.errors.forEach((e) => {
      result.failedCount++;
      result.errors.push({ row: e.row, email: "", message: e.message });
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Imported ${result.successCount} reports. ${result.failedCount} failed.`,
    });
  } catch (error) {
    return handleError(error);
  }
}
