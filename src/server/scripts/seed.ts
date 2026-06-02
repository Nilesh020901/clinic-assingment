import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { HealthReport } from "../models/HealthReport";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in your .env.local file");
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@clinic.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123456";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI!, { bufferCommands: false });
    console.log("Connected successfully.");

    // 1. Create/Update Admin Account
    console.log("Seeding Admin account...");
    const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.findOneAndUpdate(
      { email: ADMIN_EMAIL.toLowerCase() },
      {
        name: process.env.ADMIN_NAME || "System Admin",
        email: ADMIN_EMAIL.toLowerCase(),
        password: hashedAdminPassword,
        role: "admin",
        isRegistered: true,
      },
      { upsert: true, new: true }
    );
    console.log(`Admin account seeded: ${ADMIN_EMAIL}`);

    const adminUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() }).lean();
    const adminId = (adminUser as any)._id;

    // 2. Clear old test data (Clients and Reports)
    console.log("Clearing old test patients and health reports...");
    await User.deleteMany({ role: "user" });
    await HealthReport.deleteMany({});
    console.log("Database cleared for users and reports.");

    // 3. Seed Clients matching screenshot
    console.log("Seeding clients...");
    const clientHashedPassword = await bcrypt.hash("Client@12345", 12);

    const clientsData = [
      {
        client_id: 1,
        name: "Riya Hans",
        email: "user1@example.com",
        password: clientHashedPassword,
        mobile: "+91818124",
        phone: "+91818124",
        city: "Indore",
        state: "Madhya Pradesh",
        age: 25,
        gender: "Male",
        occupation: "Teacher",
        health_condition: "Vitamin D",
        beauty_goal: "Skin Glow",
        isRegistered: true,
        role: "user",
        createdAt: new Date("2026-01-10"),
      },
      {
        client_id: 2,
        name: "Lagan Dug",
        email: "user2@example.com",
        password: clientHashedPassword,
        mobile: "+91987838",
        phone: "+91987838",
        city: "Pune",
        state: "Maharashtra",
        age: 40,
        gender: "Male",
        occupation: "Doctor",
        health_condition: "Hypertension",
        beauty_goal: "Fitness",
        isRegistered: true,
        role: "user",
        createdAt: new Date("2026-02-15"),
      },
      {
        client_id: 3,
        name: "Parinaaz V",
        email: "user3@example.com",
        password: clientHashedPassword,
        mobile: "+91767928",
        phone: "+91767928",
        city: "Delhi",
        state: "Delhi",
        age: 36,
        gender: "Female",
        occupation: "Business",
        health_condition: "Diabetes",
        beauty_goal: "Stress Management",
        isRegistered: true,
        role: "user",
        createdAt: new Date("2026-03-20"),
      },
    ];

    const seededUsers = await User.insertMany(clientsData);
    console.log(`Seeded ${seededUsers.length} clients.`);

    const userMap = new Map(seededUsers.map((u) => [u.client_id, u._id]));

    // 4. Seed Health Reports matching screenshot
    console.log("Seeding health reports...");
    const baseDate = new Date("2026-05-01");

    const reportsData = [
      // Client 1 Reports
      { report_id: "RPT10", client_id: 1, hemoglobin: 9.8, vitamin_d: 77, cholesterol: 142, blood_sugar: 178, creatinine: 0.56, urine_protein: "Negative", bmi: 22.4, doctor_notes: "Increase hydration", dateOffset: 0 },
      { report_id: "RPT11", client_id: 1, hemoglobin: 13.8, vitamin_d: 79, cholesterol: 170, blood_sugar: 209, creatinine: 1.34, urine_protein: "Trace", bmi: 29.8, doctor_notes: "Needs lifestyle change", dateOffset: 1 },
      { report_id: "RPT12", client_id: 1, hemoglobin: 15.1, vitamin_d: 28, cholesterol: 298, blood_sugar: 178, creatinine: 1.18, urine_protein: "Negative", bmi: 22.3, doctor_notes: "Follow-up required", dateOffset: 2 },
      { report_id: "RPT13", client_id: 1, hemoglobin: 9.8, vitamin_d: 56, cholesterol: 144, blood_sugar: 161, creatinine: 2.19, urine_protein: "Positive", bmi: 23.3, doctor_notes: "Needs lifestyle change", dateOffset: 3 },
      { report_id: "RPT14", client_id: 1, hemoglobin: 14.8, vitamin_d: 76, cholesterol: 151, blood_sugar: 166, creatinine: 0.66, urine_protein: "Trace", bmi: 34.6, doctor_notes: "Increase hydration", dateOffset: 4 },
      { report_id: "RPT15", client_id: 1, hemoglobin: 16.1, vitamin_d: 54, cholesterol: 267, blood_sugar: 119, creatinine: 1.91, urine_protein: "Negative", bmi: 31.2, doctor_notes: "Follow-up required", dateOffset: 5 },
      { report_id: "RPT16", client_id: 1, hemoglobin: 16.9, vitamin_d: 37, cholesterol: 145, blood_sugar: 167, creatinine: 1.06, urine_protein: "Positive", bmi: 34.7, doctor_notes: "Normal findings", dateOffset: 6 },

      // Client 2 Reports
      { report_id: "RPT20", client_id: 2, hemoglobin: 10.4, vitamin_d: 39, cholesterol: 161, blood_sugar: 188, creatinine: 1.26, urine_protein: "Positive", bmi: 31.8, doctor_notes: "Normal findings", dateOffset: 0 },
      { report_id: "RPT21", client_id: 2, hemoglobin: 14.5, vitamin_d: 15, cholesterol: 178, blood_sugar: 78, creatinine: 2.11, urine_protein: "Trace", bmi: 23.4, doctor_notes: "Normal findings", dateOffset: 1 },
      { report_id: "RPT22", client_id: 2, hemoglobin: 16.3, vitamin_d: 80, cholesterol: 200, blood_sugar: 124, creatinine: 1.81, urine_protein: "Trace", bmi: 35.7, doctor_notes: "Monitor sugar levels", dateOffset: 2 },
      { report_id: "RPT23", client_id: 2, hemoglobin: 10.1, vitamin_d: 25, cholesterol: 183, blood_sugar: 213, creatinine: 1.58, urine_protein: "Positive", bmi: 29.7, doctor_notes: "Increase hydration", dateOffset: 3 },
      { report_id: "RPT24", client_id: 2, hemoglobin: 12.2, vitamin_d: 36, cholesterol: 155, blood_sugar: 200, creatinine: 1.49, urine_protein: "Negative", bmi: 35.2, doctor_notes: "Normal findings", dateOffset: 4 },
      { report_id: "RPT25", client_id: 2, hemoglobin: 14, vitamin_d: 62, cholesterol: 272, blood_sugar: 86, creatinine: 1.27, urine_protein: "Positive", bmi: 37.9, doctor_notes: "Increase hydration", dateOffset: 5 },
      { report_id: "RPT26", client_id: 2, hemoglobin: 11, vitamin_d: 78, cholesterol: 122, blood_sugar: 99, creatinine: 1.86, urine_protein: "Positive", bmi: 33, doctor_notes: "Follow-up required", dateOffset: 6 },

      // Client 3 Reports
      { report_id: "RPT30", client_id: 3, hemoglobin: 11.1, vitamin_d: 72, cholesterol: 165, blood_sugar: 199, creatinine: 2.33, urine_protein: "Positive", bmi: 24, doctor_notes: "Increase hydration", dateOffset: 0 },
      { report_id: "RPT31", client_id: 3, hemoglobin: 13.9, vitamin_d: 27, cholesterol: 215, blood_sugar: 111, creatinine: 1.58, urine_protein: "Positive", bmi: 36.4, doctor_notes: "Increase hydration", dateOffset: 1 },
      { report_id: "RPT32", client_id: 3, hemoglobin: 11.6, vitamin_d: 10, cholesterol: 148, blood_sugar: 162, creatinine: 2.26, urine_protein: "Trace", bmi: 22.8, doctor_notes: "Normal findings", dateOffset: 2 },
      { report_id: "RPT33", client_id: 3, hemoglobin: 16, vitamin_d: 18, cholesterol: 141, blood_sugar: 194, creatinine: 2.13, urine_protein: "Positive", bmi: 33.3, doctor_notes: "Normal findings", dateOffset: 3 },
      { report_id: "RPT34", client_id: 3, hemoglobin: 14.3, vitamin_d: 78, cholesterol: 162, blood_sugar: 137, creatinine: 1.56, urine_protein: "Positive", bmi: 26.5, doctor_notes: "Normal findings", dateOffset: 4 },
      { report_id: "RPT35", client_id: 3, hemoglobin: 16.4, vitamin_d: 33, cholesterol: 199, blood_sugar: 172, creatinine: 2.49, urine_protein: "Positive", bmi: 25.5, doctor_notes: "Increase hydration", dateOffset: 5 },
      { report_id: "RPT36", client_id: 3, hemoglobin: 12.6, vitamin_d: 39, cholesterol: 177, blood_sugar: 86, creatinine: 1.18, urine_protein: "Positive", bmi: 29.1, doctor_notes: "Increase hydration", dateOffset: 6 },
    ];

    const reportsToInsert = reportsData.map((rep) => {
      // Generate different dates (e.g. daily interval)
      const reportDate = new Date(baseDate.getTime() + rep.dateOffset * 24 * 60 * 60 * 1000);
      const userId = userMap.get(rep.client_id);
      if (!userId) {
        throw new Error(`Mapping failed for client ${rep.client_id}`);
      }

      return {
        report_id: rep.report_id,
        client_id: rep.client_id,
        userId: userId,
        report_date: reportDate,
        hemoglobin: rep.hemoglobin,
        vitamin_d: rep.vitamin_d,
        cholesterol: rep.cholesterol,
        blood_sugar: rep.blood_sugar,
        creatinine: rep.creatinine,
        urine_protein: rep.urine_protein,
        bmi: rep.bmi,
        doctor_notes: rep.doctor_notes,
        uploadedBy: adminId,
      };
    });

    await HealthReport.insertMany(reportsToInsert);
    console.log(`Seeded ${reportsToInsert.length} health reports successfully.`);

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
