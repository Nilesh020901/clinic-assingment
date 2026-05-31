import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth, requireRole } from "@/server/auth";
import { userSearchSchema } from "@/server/validators/schemas";
import { searchUsers } from "@/server/services/admin.service";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    requireRole(user, "admin");

    const { searchParams } = request.nextUrl;
    const { page, limit, search, role } = userSearchSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 10,
      search: searchParams.get("search") ?? undefined,
      role: searchParams.get("role") ?? undefined,
    });

    const result = await withDb(() => searchUsers({ search, role }, { page, limit }));

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleError(error);
  }
}
