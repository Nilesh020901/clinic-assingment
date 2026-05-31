import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "./utils/errors";

export function handleError(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, message: error.message, errors: error.errors },
      { status: error.statusCode }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.errors.forEach((e) => {
      const key = e.path.join(".") || "body";
      if (!errors[key]) errors[key] = [];
      errors[key].push(e.message);
    });
    return NextResponse.json(
      { success: false, message: "Validation failed", errors },
      { status: 422 }
    );
  }

  console.error("Unhandled error:", error);
  return NextResponse.json(
    { success: false, message: "Internal server error" },
    { status: 500 }
  );
}

export async function withDb<T>(handler: () => Promise<T>): Promise<T> {
  const { connectDatabase } = await import("./config/database");
  await connectDatabase();
  return handler();
}
