import { FilterQuery, Types } from "mongoose";
import { User, IUser } from "../models/User";
import { HealthReport } from "../models/HealthReport";
import { CsvRow, parseReportDate } from "../utils/csvParser";
import { NotFoundError } from "../utils/errors";
import { PaginatedResult, PaginationOptions } from "./report.service";

export interface UserSearchFilters {
  search?: string;
  role?: "user" | "admin";
}

export interface UserListItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  dateOfBirth?: Date;
  reportCount: number;
  latestReportDate?: Date;
  createdAt: Date;
}

export async function searchUsers(
  filters: UserSearchFilters,
  options: PaginationOptions
): Promise<PaginatedResult<UserListItem>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const query: FilterQuery<IUser> = {};

  if (filters.role) {
    query.role = filters.role;
  } else {
    query.role = "user";
  }

  if (filters.search?.trim()) {
    const searchRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  const userIds = users.map((u) => u._id);

  const reportStats = await HealthReport.aggregate([
    { $match: { userId: { $in: userIds } } },
    {
      $group: {
        _id: "$userId",
        reportCount: { $sum: 1 },
        latestReportDate: { $max: "$reportDate" },
      },
    },
  ]);

  const statsMap = new Map(
    reportStats.map((s) => [
      s._id.toString(),
      { reportCount: s.reportCount, latestReportDate: s.latestReportDate },
    ])
  );

  const data: UserListItem[] = users.map((user) => {
    const id = String(user._id);
    const stats = statsMap.get(id);
    return {
      _id: id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      reportCount: stats?.reportCount ?? 0,
      latestReportDate: stats?.latestReportDate,
      createdAt: user.createdAt,
    };
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function getUserDetails(userId: string) {
  const userDoc = await User.findById(userId).lean();
  if (!userDoc) {
    throw new NotFoundError("User not found");
  }

  const user = userDoc as unknown as {
    _id: { toString(): string };
    name: string;
    email: string;
    role: string;
    phone?: string;
    dateOfBirth?: Date;
    createdAt: Date;
  };

  const [reports, reportCount] = await Promise.all([
    HealthReport.find({ userId })
      .sort({ reportDate: -1 })
      .limit(10)
      .populate("uploadedBy", "name email")
      .lean(),
    HealthReport.countDocuments({ userId }),
  ]);

  return {
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      createdAt: user.createdAt,
    },
    reports,
    reportCount,
  };
}

export interface CsvUploadResult {
  successCount: number;
  failedCount: number;
  errors: { row: number; email: string; message: string }[];
}

export async function importHealthReportsFromCsv(
  rows: CsvRow[],
  adminId: string
): Promise<CsvUploadResult> {
  const result: CsvUploadResult = {
    successCount: 0,
    failedCount: 0,
    errors: [],
  };

  const emails = [...new Set(rows.map((r) => r.email.toLowerCase()))];
  const users = await User.find({ email: { $in: emails }, role: "user" });
  const userMap = new Map(users.map((u) => [u.email, u]));

  const reportsToInsert: {
    userId: Types.ObjectId;
    reportDate: Date;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    heartRate: number;
    temperature: number;
    weight: number;
    glucose: number;
    cholesterol: number;
    notes?: string;
    uploadedBy: Types.ObjectId;
  }[] = [];

  const adminObjectId = new Types.ObjectId(adminId);

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const user = userMap.get(row.email.toLowerCase());

    if (!user) {
      result.failedCount++;
      result.errors.push({
        row: rowNumber,
        email: row.email,
        message: "User not found with this email",
      });
      return;
    }

    try {
      const reportDate = parseReportDate(row.reportDate);
      reportsToInsert.push({
        userId: user._id,
        reportDate,
        bloodPressureSystolic: row.bloodPressureSystolic,
        bloodPressureDiastolic: row.bloodPressureDiastolic,
        heartRate: row.heartRate,
        temperature: row.temperature,
        weight: row.weight,
        glucose: row.glucose,
        cholesterol: row.cholesterol,
        notes: row.notes || undefined,
        uploadedBy: adminObjectId,
      });
    } catch (err) {
      result.failedCount++;
      result.errors.push({
        row: rowNumber,
        email: row.email,
        message: err instanceof Error ? err.message : "Invalid row data",
      });
    }
  });

  if (reportsToInsert.length > 0) {
    await HealthReport.insertMany(reportsToInsert);
    result.successCount = reportsToInsert.length;
  }

  return result;
}

export async function getDashboardStats() {
  const [totalUsers, totalReports, recentReports] = await Promise.all([
    User.countDocuments({ role: "user" }),
    HealthReport.countDocuments(),
    HealthReport.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .lean(),
  ]);

  return { totalUsers, totalReports, recentReports };
}
