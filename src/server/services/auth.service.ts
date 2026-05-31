import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User";
import { signToken } from "../utils/jwt";
import { UnauthorizedError, ValidationError } from "../utils/errors";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function loginUser(
  email: string,
  password: string,
  expectedRole?: "user" | "admin"
): Promise<AuthResponse> {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (expectedRole && user.role !== expectedRole) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
}): Promise<AuthResponse> {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new ValidationError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    role: "user",
    phone: data.phone,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
  });

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getUserProfile(userId: string): Promise<IUser | null> {
  return User.findById(userId);
}
