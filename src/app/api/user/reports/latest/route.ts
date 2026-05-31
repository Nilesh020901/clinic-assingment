import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth, requireRole } from "@/server/auth";
import { getLatestReport } from "@/server/services/report.service";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    requireRole(user, "user");

    const report = await withDb(() => getLatestReport(user.userId));

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return handleError(error);
  }
}
