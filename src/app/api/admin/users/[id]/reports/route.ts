import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth, requireRole } from "@/server/auth";
import { paginationSchema, userIdParamSchema } from "@/server/validators/schemas";
import { getUserReports } from "@/server/services/report.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    requireRole(user, "admin");

    const { id } = userIdParamSchema.parse(await context.params);
    const { searchParams } = request.nextUrl;
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 10,
    });

    const result = await withDb(() => getUserReports(id, { page, limit }));

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleError(error);
  }
}
