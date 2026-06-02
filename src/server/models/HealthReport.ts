import mongoose, { Document, Schema, Types } from "mongoose";
import "./User";

export interface IHealthReport extends Document {
  _id: Types.ObjectId;
  report_id: string;
  client_id: number;
  userId: Types.ObjectId;
  report_date: Date;
  hemoglobin: number;
  vitamin_d: number;
  cholesterol: number;
  blood_sugar: number;
  creatinine: number;
  urine_protein: string;
  bmi: number;
  doctor_notes?: string;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const healthReportSchema = new Schema<IHealthReport>(
  {
    report_id: {
      type: String,
      required: [true, "Report ID is required"],
      unique: true,
      index: true,
    },
    client_id: {
      type: Number,
      required: [true, "Client ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    report_date: {
      type: Date,
      required: [true, "Report date is required"],
      index: true,
    },
    hemoglobin: {
      type: Number,
      required: true,
    },
    vitamin_d: {
      type: Number,
      required: true,
    },
    cholesterol: {
      type: Number,
      required: true,
    },
    blood_sugar: {
      type: Number,
      required: true,
    },
    creatinine: {
      type: Number,
      required: true,
    },
    urine_protein: {
      type: String,
      required: true,
      trim: true,
    },
    bmi: {
      type: Number,
      required: true,
    },
    doctor_notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

healthReportSchema.index({ userId: 1, report_date: -1 });
healthReportSchema.index({ client_id: 1, report_date: -1 });

export const HealthReport =
  mongoose.models.HealthReport ||
  mongoose.model<IHealthReport>("HealthReport", healthReportSchema);
