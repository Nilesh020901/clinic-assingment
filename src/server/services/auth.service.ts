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
    client_id?: number;
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

  // If user was imported but hasn't registered (set password) yet
  if (user.role === "user" && !user.isRegistered) {
    throw new UnauthorizedError("Your account has not been activated yet. Please click Register to claim your account.");
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
      client_id: user.client_id,
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
  const emailLower = data.email.toLowerCase();
  const existing = await User.findOne({ email: emailLower });

  const hashedPassword = await bcrypt.hash(data.password, 12);

  let user: IUser;

  if (existing) {
    // Account Claiming Flow
    if (existing.isRegistered) {
      throw new ValidationError("Email already registered. Please log in.");
    }

    // Activate the imported account
    existing.password = hashedPassword;
    existing.isRegistered = true;
    if (data.phone) {
      existing.phone = data.phone;
      existing.mobile = data.phone;
    }
    if (data.dateOfBirth) {
      existing.dateOfBirth = new Date(data.dateOfBirth);
    }
    // Update name if they typed something different
    if (data.name) {
      existing.name = data.name;
    }

    await existing.save();
    user = existing;
  } else {
    // New User Signup Flow: Auto-generate a client_id
    const maxUser = await User.findOne({ client_id: { $ne: null } })
      .sort({ client_id: -1 })
      .select("client_id")
      .lean();

    const nextClientId = maxUser && (maxUser as any).client_id ? (maxUser as any).client_id + 1 : 10000;

    user = await User.create({
      client_id: nextClientId,
      name: data.name,
      email: emailLower,
      password: hashedPassword,
      role: "user",
      phone: data.phone,
      mobile: data.phone,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      isRegistered: true,
    });
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
      client_id: user.client_id,
    },
  };
}

export async function getUserProfile(userId: string): Promise<IUser | null> {
  return User.findById(userId);
}
