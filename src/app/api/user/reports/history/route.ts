import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth, requireRole } from "@/server/auth";
import { paginationSchema } from "@/server/validators/schemas";
import { getReportHistory } from "@/server/services/report.service";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    requireRole(user, "user");

    const { searchParams } = request.nextUrl;
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 10,
    });

    const result = await withDb(() => getReportHistory(user.userId, { page, limit }));

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleError(error);
  }
}
