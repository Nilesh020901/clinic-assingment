import mongoose from "mongoose";
import { User } from "../models/User";
import { HealthReport } from "../models/HealthReport";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

async function inspect() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB.");

    const testUserId = "6a1e8d40e77d9984e96cc3ea";

    const reportStr = await HealthReport.findOne({ userId: testUserId })
      .sort({ report_date: -1 })
      .lean();
    console.log("\n--- TEST QUERY BY STRING userId ---");
    console.log("Result Str:", reportStr);

    const reportObj = await HealthReport.findOne({ userId: new mongoose.Types.ObjectId(testUserId) })
      .sort({ report_date: -1 })
      .lean();
    console.log("\n--- TEST QUERY BY OBJECTID userId ---");
    console.log("Result Obj:", reportObj);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Inspect failed:", err);
    process.exit(1);
  }
}

inspect();
