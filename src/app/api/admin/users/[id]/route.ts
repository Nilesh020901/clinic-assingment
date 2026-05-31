import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth, requireRole } from "@/server/auth";
import { userIdParamSchema } from "@/server/validators/schemas";
import { getUserDetails } from "@/server/services/admin.service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request);
    requireRole(user, "admin");

    const { id } = userIdParamSchema.parse(await context.params);
    const result = await withDb(() => getUserDetails(id));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleError(error);
  }
}
