import mongoose, { Document, Schema, Types } from "mongoose";
import "./User";

export interface IHealthReport extends Document {
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const healthReportSchema = new Schema<IHealthReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportDate: {
      type: Date,
      required: [true, "Report date is required"],
      index: true,
    },
    bloodPressureSystolic: {
      type: Number,
      required: true,
      min: 50,
      max: 300,
    },
    bloodPressureDiastolic: {
      type: Number,
      required: true,
      min: 30,
      max: 200,
    },
    heartRate: {
      type: Number,
      required: true,
      min: 30,
      max: 250,
    },
    temperature: {
      type: Number,
      required: true,
      min: 90,
      max: 110,
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 500,
    },
    glucose: {
      type: Number,
      required: true,
      min: 20,
      max: 600,
    },
    cholesterol: {
      type: Number,
      required: true,
      min: 50,
      max: 500,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
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

healthReportSchema.index({ userId: 1, reportDate: -1 });

export const HealthReport =
  mongoose.models.HealthReport ||
  mongoose.model<IHealthReport>("HealthReport", healthReportSchema);
