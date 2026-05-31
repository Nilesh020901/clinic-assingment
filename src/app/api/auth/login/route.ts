import { NextRequest, NextResponse } from "next/server";
import { handleError, withDb } from "@/server/api-handler";
import { loginSchema } from "@/server/validators/schemas";
import { loginUser } from "@/server/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const result = await withDb(() => loginUser(email, password, "user"));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleError(error);
  }
}
