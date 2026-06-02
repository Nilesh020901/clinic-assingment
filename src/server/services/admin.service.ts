import { FilterQuery, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User";
import { HealthReport } from "../models/HealthReport";
import { ClientCsvRow, ReportCsvRow, parseCustomDate } from "../utils/csvParser";
import { NotFoundError } from "../utils/errors";
import { PaginatedResult, PaginationOptions } from "./report.service";

export interface UserSearchFilters {
  search?: string;
  role?: "user" | "admin";
}

export interface UserListItem {
  _id: string;
  client_id?: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  state?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  health_condition?: string;
  beauty_goal?: string;
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
    const searchTrimmed = filters.search.trim();
    // Support numeric search for client_id or text search for name/email
    const numericSearch = Number(searchTrimmed);
    if (!isNaN(numericSearch)) {
      query.$or = [{ client_id: numericSearch }];
    } else {
      const searchRegex = new RegExp(searchTrimmed, "i");
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { city: searchRegex }];
    }
  }

  const [users, total] = await Promise.all([
    User.find(query).sort({ client_id: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);

  const userIds = users.map((u) => u._id);

  const reportStats = await HealthReport.aggregate([
    { $match: { userId: { $in: userIds } } },
    {
      $group: {
        _id: "$userId",
        reportCount: { $sum: 1 },
        latestReportDate: { $max: "$report_date" },
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
      client_id: user.client_id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || user.mobile,
      city: user.city,
      state: user.state,
      age: user.age,
      gender: user.gender,
      occupation: user.occupation,
      health_condition: user.health_condition,
      beauty_goal: user.beauty_goal,
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

  const user = userDoc as unknown as IUser;

  const [reports, reportCount] = await Promise.all([
    HealthReport.find({ userId })
      .sort({ report_date: -1 })
      .limit(20) // Show up to 20 recent reports in details
      .populate("uploadedBy", "name email")
      .lean(),
    HealthReport.countDocuments({ userId }),
  ]);

  return {
    user: {
      _id: String(user._id),
      client_id: user.client_id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || user.mobile,
      mobile: user.mobile,
      city: user.city,
      state: user.state,
      age: user.age,
      gender: user.gender,
      occupation: user.occupation,
      health_condition: user.health_condition,
      beauty_goal: user.beauty_goal,
      createdAt: user.createdAt,
    },
    reports,
    reportCount,
  };
}

export interface CsvUploadResult {
  successCount: number;
  failedCount: number;
  alreadyExistsCount?: number;
  clientIdConflictCount?: number;
  errors: { row: number; email: string; message: string; type?: string; client_id?: number }[];
}

export async function importClientsFromCsv(
  rows: ClientCsvRow[]
): Promise<CsvUploadResult> {
  const result: CsvUploadResult = {
    successCount: 0,
    failedCount: 0,
    alreadyExistsCount: 0,
    clientIdConflictCount: 0,
    errors: [],
  };

  const emails = [...new Set(rows.map((r) => r.email.toLowerCase()))];
  const clientIds = [...new Set(rows.map((r) => r.client_id))];

  // Fetch both existing emails and clientIds in one database roundtrip
  const [existingUsersEmail, existingUsersClientId] = await Promise.all([
    User.find({ email: { $in: emails } }).select("email mobile phone client_id").lean(),
    User.find({ client_id: { $in: clientIds } }).select("email mobile phone client_id").lean(),
  ]);

  // Maps for database users
  const userByEmail = new Map<string, any>(existingUsersEmail.map(u => [u.email.toLowerCase(), u]));
  const userByClientId = new Map<number, any>(existingUsersClientId.map(u => [u.client_id, u]));

  // Build mobile map (strip country codes / spaces for cleaner matching)
  const normalizeMobile = (m: string) => String(m).replace(/[\s+-]/g, "").slice(-10);
  const userByMobile = new Map<string, any>();
  [...existingUsersEmail, ...existingUsersClientId].forEach(u => {
    const mob = u.mobile || u.phone;
    if (mob) {
      userByMobile.set(normalizeMobile(mob), u);
    }
  });

  // Track what we have processed in this specific file to handle in-file duplicates
  const processedEmails = new Set<string>();
  const processedClientIds = new Set<number>();

  const clientsToInsert: any[] = [];
  const defaultPasswordHash = await bcrypt.hash("Client@12345", 12);

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const emailLower = row.email.toLowerCase();
    const rowMobileNorm = normalizeMobile(row.mobile);

    // ─── LOCAL / IN-FILE DUPLICATES CHECK ───
    if (processedEmails.has(emailLower) && processedClientIds.has(row.client_id)) {
      result.alreadyExistsCount!++;
      return;
    }
    if (processedClientIds.has(row.client_id)) {
      result.clientIdConflictCount!++;
      result.errors.push({
        row: rowNumber,
        email: row.email,
        message: "Client ID already used for another user",
        type: "conflict",
        client_id: row.client_id,
      });
      return;
    }
    if (processedEmails.has(emailLower)) {
      result.clientIdConflictCount!++;
      result.errors.push({
        row: rowNumber,
        email: row.email,
        message: "Email already used for another user",
        type: "conflict",
        client_id: row.client_id,
      });
      return;
    }

    // ─── DATABASE CHECKS ───
    const dbUserByClientId = userByClientId.get(row.client_id);
    const dbUserByEmail = userByEmail.get(emailLower);
    const dbUserByMobile = rowMobileNorm ? userByMobile.get(rowMobileNorm) : null;

    // Case 1: Client Already Exists (Same data + Same client_id) -> Skip, NO error
    const isSameClientByClientId = dbUserByClientId && (dbUserByClientId.email === emailLower || (dbUserByClientId.mobile && normalizeMobile(dbUserByClientId.mobile) === rowMobileNorm));
    const isSameClientByEmail = dbUserByEmail && dbUserByEmail.client_id === row.client_id;
    const isSameClientByMobile = dbUserByMobile && dbUserByMobile.client_id === row.client_id;

    if (isSameClientByClientId || isSameClientByEmail || isSameClientByMobile) {
      result.alreadyExistsCount!++;
      processedEmails.add(emailLower);
      processedClientIds.add(row.client_id);
      return;
    }

    // Case 2: Client ID Conflict (Client ID assigned to a different user) -> Skip, report error
    if (dbUserByClientId) {
      result.clientIdConflictCount!++;
      result.errors.push({
        row: rowNumber,
        email: row.email,
        message: "Client ID already used for another user",
        type: "conflict",
        client_id: row.client_id,
      });
      processedEmails.add(emailLower);
      processedClientIds.add(row.client_id);
      return;
    }

    // Email Conflict
    if (dbUserByEmail) {
      result.clientIdConflictCount!++;
      result.errors.push({
        row: rowNumber,
        email: row.email,
        message: "Email already used for another user",
        type: "conflict",
        client_id: row.client_id,
      });
      processedEmails.add(emailLower);
      processedClientIds.add(row.client_id);
      return;
    }

    // Mobile Conflict
    if (dbUserByMobile) {
      result.clientIdConflictCount!++;
      result.errors.push({
        row: rowNumber,
        email: row.email,
        message: "Mobile number already used for another user",
        type: "conflict",
        client_id: row.client_id,
      });
      processedEmails.add(emailLower);
      processedClientIds.add(row.client_id);
      return;
    }

    // Add to seen sets for local duplicates
    processedEmails.add(emailLower);
    processedClientIds.add(row.client_id);

    // Case 3: Success -> Prepare for database write
    let parsedCreatedDate: Date | undefined;
    if (row.created_at) {
      try {
        parsedCreatedDate = parseCustomDate(row.created_at);
      } catch {
        parsedCreatedDate = new Date();
      }
    }

    clientsToInsert.push({
      client_id: row.client_id,
      name: row.full_name,
      email: emailLower,
      password: defaultPasswordHash,
      mobile: row.mobile,
      phone: row.mobile,
      city: row.city,
      state: row.state,
      age: row.age,
      gender: row.gender,
      occupation: row.occupation,
      health_condition: row.health_condition || undefined,
      beauty_goal: row.beauty_goal || undefined,
      isRegistered: false,
      role: "user",
      createdAt: parsedCreatedDate || new Date(),
    });
  });

  if (clientsToInsert.length > 0) {
    // Bulk insert in chunks of 2,000
    const chunkSize = 2000;
    for (let i = 0; i < clientsToInsert.length; i += chunkSize) {
      const chunk = clientsToInsert.slice(i, i + chunkSize);
      try {
        await User.insertMany(chunk, { ordered: false });
        result.successCount += chunk.length;
      } catch (bulkErr: any) {
        console.error("Bulk write error details for clients:", {
          name: bulkErr.name,
          code: bulkErr.code,
          message: bulkErr.message,
          writeErrorsCount: bulkErr.writeErrors?.length,
        });

        const isBulkError =
          bulkErr.name === "MongoBulkWriteError" ||
          bulkErr.name === "BulkWriteError" ||
          bulkErr.name === "MongoServerError" ||
          bulkErr.code === 11000 ||
          Array.isArray(bulkErr.writeErrors) ||
          bulkErr.message.includes("duplicate key") ||
          bulkErr.message.includes("E11000");

        if (isBulkError) {
          const writeErrors = bulkErr.writeErrors || [];
          const failedIndices = new Set<number>(writeErrors.map((we: any) => we.index));

          result.successCount += (chunk.length - failedIndices.size);
          result.clientIdConflictCount! += failedIndices.size;

          writeErrors.forEach((we: any) => {
            const failedDoc = we.op;
            let errMsg = "Client ID already used for another user";
            if (we.errmsg && we.errmsg.includes("email_1")) {
              errMsg = "Email already used for another user";
            } else if (we.errmsg && we.errmsg.includes("mobile_1")) {
              errMsg = "Mobile number already used for another user";
            }

            const matchedRowIndex = rows.findIndex(
              (r) => r.email.toLowerCase() === failedDoc?.email?.toLowerCase() || r.client_id === failedDoc?.client_id
            );
            const rowNum = matchedRowIndex !== -1 ? matchedRowIndex + 2 : 0;

            result.errors.push({
              row: rowNum,
              email: failedDoc?.email || "",
              message: errMsg,
              type: "conflict",
              client_id: failedDoc?.client_id,
            });
          });
        } else {
          throw bulkErr;
        }
      }
    }
  }

  result.failedCount = result.clientIdConflictCount!;
  return result;
}

export async function importHealthReportsFromCsv(
  rows: ReportCsvRow[],
  adminId: string
): Promise<CsvUploadResult> {
  const result: CsvUploadResult = {
    successCount: 0,
    failedCount: 0,
    alreadyExistsCount: 0,
    clientIdConflictCount: 0,
    errors: [],
  };

  const clientIds = [...new Set(rows.map((r) => r.client_id))];
  const users = await User.find({ client_id: { $in: clientIds }, role: "user" })
    .select("_id client_id")
    .lean();

  const userMap = new Map<number, any>(users.map((u) => [u.client_id, u]));

  // Check if any report_ids are already registered in the DB
  const reportIds = [...new Set(rows.map((r) => r.report_id))];
  const existingReports = await HealthReport.find({ report_id: { $in: reportIds } })
    .select("report_id client_id")
    .lean();
  const existingReportMap = new Map<string, number>(existingReports.map((r) => [r.report_id, r.client_id]));

  // Sets to track duplicates within the uploaded file itself
  const processedReportIds = new Map<string, number>();

  const reportsToInsert: any[] = [];
  const adminObjectId = new Types.ObjectId(adminId);

  rows.forEach((row, index) => {
    const rowNumber = index + 2;

    // Check for local duplicates in the file
    if (processedReportIds.has(row.report_id)) {
      const firstRowClientId = processedReportIds.get(row.report_id);
      if (firstRowClientId === row.client_id) {
        result.alreadyExistsCount!++;
      } else {
        result.clientIdConflictCount!++;
        result.errors.push({
          row: rowNumber,
          email: "",
          message: "Report ID already used for another client",
          type: "conflict",
          client_id: row.client_id,
        });
      }
      return;
    }
    processedReportIds.set(row.report_id, row.client_id);

    const user = userMap.get(row.client_id);

    if (!user) {
      result.clientIdConflictCount!++;
      result.errors.push({
        row: rowNumber,
        email: "",
        message: `Client not found with Client ID ${row.client_id}`,
        type: "error",
        client_id: row.client_id,
      });
      return;
    }

    const existingReportClientId = existingReportMap.get(row.report_id);
    if (existingReportClientId !== undefined) {
      if (existingReportClientId === row.client_id) {
        // Case 1: Already exists
        result.alreadyExistsCount!++;
      } else {
        // Case 2: Conflict
        result.clientIdConflictCount!++;
        result.errors.push({
          row: rowNumber,
          email: "",
          message: "Report ID already used for another client",
          type: "conflict",
          client_id: row.client_id,
        });
      }
      return;
    }

    try {
      const reportDate = parseCustomDate(row.report_date);
      reportsToInsert.push({
        report_id: row.report_id,
        client_id: row.client_id,
        userId: user._id,
        report_date: reportDate,
        hemoglobin: row.hemoglobin,
        vitamin_d: row.vitamin_d,
        cholesterol: row.cholesterol,
        blood_sugar: row.blood_sugar,
        creatinine: row.creatinine,
        urine_protein: row.urine_protein,
        bmi: row.bmi,
        doctor_notes: row.doctor_notes || undefined,
        uploadedBy: adminObjectId,
      });
    } catch (err) {
      result.clientIdConflictCount!++;
      result.errors.push({
        row: rowNumber,
        email: "",
        message: err instanceof Error ? err.message : "Invalid row data",
        type: "error",
        client_id: row.client_id,
      });
    }
  });

  if (reportsToInsert.length > 0) {
    // Bulk insert in chunks of 2,000
    const chunkSize = 2000;
    for (let i = 0; i < reportsToInsert.length; i += chunkSize) {
      const chunk = reportsToInsert.slice(i, i + chunkSize);
      try {
        await HealthReport.insertMany(chunk, { ordered: false });
        result.successCount += chunk.length;
      } catch (bulkErr: any) {
        console.error("Bulk write error details for health reports:", {
          name: bulkErr.name,
          code: bulkErr.code,
          message: bulkErr.message,
          writeErrorsCount: bulkErr.writeErrors?.length,
        });

        const isBulkError =
          bulkErr.name === "MongoBulkWriteError" ||
          bulkErr.name === "BulkWriteError" ||
          bulkErr.name === "MongoServerError" ||
          bulkErr.code === 11000 ||
          Array.isArray(bulkErr.writeErrors) ||
          bulkErr.message.includes("duplicate key") ||
          bulkErr.message.includes("E11000");

        if (isBulkError) {
          const writeErrors = bulkErr.writeErrors || [];
          const failedIndices = new Set<number>(writeErrors.map((we: any) => we.index));

          result.successCount += (chunk.length - failedIndices.size);
          result.clientIdConflictCount! += failedIndices.size;

          writeErrors.forEach((we: any) => {
            const failedDoc = we.op;
            const matchedRowIndex = rows.findIndex((r) => r.report_id === failedDoc?.report_id);
            const rowNum = matchedRowIndex !== -1 ? matchedRowIndex + 2 : 0;

            result.errors.push({
              row: rowNum,
              email: "",
              message: "Report ID already used for another client",
              type: "conflict",
              client_id: failedDoc?.client_id,
            });
          });
        } else {
          throw bulkErr;
        }
      }
    }
  }

  result.failedCount = result.clientIdConflictCount! + result.errors.filter(e => e.type === "error").length;
  return result;
}

export async function getDashboardStats() {
  const [totalUsers, totalReports, recentReports] = await Promise.all([
    User.countDocuments({ role: "user" }),
    HealthReport.countDocuments(),
    HealthReport.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email client_id")
      .lean(),
  ]);

  return { totalUsers, totalReports, recentReports };
}
