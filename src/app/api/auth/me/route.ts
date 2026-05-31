import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { requireAuth } from "@/server/auth";
import { getUserProfile } from "@/server/services/auth.service";
import { UnauthorizedError } from "@/server/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);

    const profile = await withDb(() => getUserProfile(authUser.userId));
    if (!profile) {
      throw new UnauthorizedError("User not found");
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile._id.toString(),
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
