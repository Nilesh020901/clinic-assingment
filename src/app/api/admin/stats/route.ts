import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth, requireRole } from "@/server/auth";
import { getDashboardStats } from "@/server/services/admin.service";

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request);
    requireRole(user, "admin");

    const stats = await withDb(() => getDashboardStats());

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return handleError(error);
  }
}
