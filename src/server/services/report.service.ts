import { Types } from "mongoose";
import { HealthReport, IHealthReport } from "../models/HealthReport";
import { NotFoundError } from "../utils/errors";

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getLatestReport(userId: string): Promise<IHealthReport | null> {
  const userObjectId = new Types.ObjectId(userId);
  return HealthReport.findOne({ userId: userObjectId })
    .sort({ report_date: -1 })
    .populate("uploadedBy", "name email");
}

export async function getReportHistory(
  userId: string,
  options: PaginationOptions
): Promise<PaginatedResult<IHealthReport>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;
  const userObjectId = new Types.ObjectId(userId);

  const [data, total] = await Promise.all([
    HealthReport.find({ userId: userObjectId })
      .sort({ report_date: -1 })
      .skip(skip)
      .limit(limit)
      .populate("uploadedBy", "name email"),
    HealthReport.countDocuments({ userId: userObjectId }),
  ]);

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

export async function getUserReports(
  userId: string,
  options: PaginationOptions
): Promise<PaginatedResult<IHealthReport>> {
  const { page, limit } = options;
  const skip = (page - 1) * limit;
  const userObjectId = new Types.ObjectId(userId);

  const [data, total] = await Promise.all([
    HealthReport.find({ userId: userObjectId }).sort({ report_date: -1 }).skip(skip).limit(limit),
    HealthReport.countDocuments({ userId: userObjectId }),
  ]);

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

export async function getReportById(reportId: string): Promise<IHealthReport> {
  const report = await HealthReport.findById(reportId).populate("userId", "name email client_id");
  if (!report) {
    throw new NotFoundError("Health report not found");
  }
  return report;
}
