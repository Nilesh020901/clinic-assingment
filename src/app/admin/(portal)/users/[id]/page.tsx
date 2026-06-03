"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { HealthReport, User } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HealthReportCard } from "@/components/HealthReportCard";
import { LineChart } from "@/components/ui/SvgCharts";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Briefcase,
  MapPin,
  Heart,
  Sparkles,
  TrendingUp,
  Printer,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

interface UserDetailsResponse {
  user: User & { _id: string; createdAt: string };
  reports: HealthReport[];
  reportCount: number;
}

type MetricKey = "blood_sugar" | "cholesterol" | "vitamin_d" | "hemoglobin" | "creatinine" | "bmi";

interface MetricConfig {
  label: string;
  unit: string;
  color: string;
  min: number;
  max: number;
}

const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  blood_sugar: { label: "Blood Sugar", unit: "mg/dL", color: "#ef4444", min: 70, max: 100 },
  cholesterol: { label: "Total Cholesterol", unit: "mg/dL", color: "#3b82f6", min: 100, max: 200 },
  vitamin_d: { label: "Vitamin D", unit: "ng/mL", color: "#f59e0b", min: 30, max: 100 },
  hemoglobin: { label: "Hemoglobin", unit: "g/dL", color: "#ec4899", min: 12.0, max: 17.5 },
  creatinine: { label: "Creatinine", unit: "mg/dL", color: "#8b5cf6", min: 0.5, max: 1.3 },
  bmi: { label: "BMI", unit: "", color: "#10b981", min: 18.5, max: 24.9 },
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [data, setData] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMetric, setActiveMetric] = useState<MetricKey>("blood_sugar");

  useEffect(() => {
    async function fetchUser() {
      const token = getToken();
      if (!token) return;

      try {
        const response = await apiRequest<{ success: boolean; data: UserDetailsResponse }>(
          `/admin/users/${userId}`,
          { token }
        );
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users" className="inline-flex items-center gap-1 text-brand-600 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to patients
        </Link>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error || "User not found"}
        </div>
      </div>
    );
  }

  const { user, reports, reportCount } = data;
  const latestReport = reports[0] ?? null;

  // Prepare trend data
  const trendData = reports.map((r) => ({
    date: r.report_date,
    value: r[activeMetric] as number,
  }));

  const activeConfig = METRIC_CONFIGS[activeMetric];

  // Generate Patient-Specific Clinical Recommendations
  const clinicalRecommendations = [];
  if (latestReport) {
    if (latestReport.blood_sugar >= 126) {
      clinicalRecommendations.push({
        title: "Glycemic Management (Diabetic Range)",
        severity: "critical",
        tip: `Patient's blood sugar is high (${latestReport.blood_sugar} mg/dL). Recommend low-glycemic nutrition, lifestyle consultation, and HbA1c screening.`,
      });
    } else if (latestReport.blood_sugar >= 100) {
      clinicalRecommendations.push({
        title: "Glycemic Management (Prediabetic)",
        severity: "warning",
        tip: `Blood sugar levels are elevated (${latestReport.blood_sugar} mg/dL). Suggest regular glucose monitoring, limiting simple carbohydrates, and weight management.`,
      });
    }

    if (latestReport.vitamin_d < 20) {
      clinicalRecommendations.push({
        title: "Vitamin D Supplementation Required",
        severity: "critical",
        tip: `Severe deficiency detected (${latestReport.vitamin_d} ng/mL). Recommend high-potency Vitamin D3 supplementation (e.g. 60k IU weekly under supervision) and calcium intake assessment.`,
      });
    } else if (latestReport.vitamin_d < 30) {
      clinicalRecommendations.push({
        title: "Vitamin D Optimization",
        severity: "warning",
        tip: `Vitamin D level is insufficient (${latestReport.vitamin_d} ng/mL). Recommend daily sun exposure (15-20 min) and Vitamin D rich dietary options.`,
      });
    }

    if (latestReport.cholesterol >= 240) {
      clinicalRecommendations.push({
        title: "Lipid Level Management",
        severity: "critical",
        tip: `Total cholesterol is high (${latestReport.cholesterol} mg/dL). Recommend heart-healthy diet, cutting saturated fats, cardiovascular exercise (150 min/week), and a full lipid panel.`,
      });
    } else if (latestReport.cholesterol >= 200) {
      clinicalRecommendations.push({
        title: "Cholesterol Monitoring",
        severity: "warning",
        tip: `Cholesterol is borderline elevated (${latestReport.cholesterol} mg/dL). Advise increasing dietary fiber (oats, legumes) and checking HDL/LDL ratios.`,
      });
    }

    if (latestReport.bmi >= 30) {
      clinicalRecommendations.push({
        title: "Weight & Obesity Counselling",
        severity: "critical",
        tip: `Patient's BMI is in the obese classification (${latestReport.bmi}). Suggest discussing personalized nutrition plans and progressive calorie-deficit training.`,
      });
    } else if (latestReport.bmi >= 25) {
      clinicalRecommendations.push({
        title: "Weight Management Tips",
        severity: "warning",
        tip: `Patient is currently overweight (BMI ${latestReport.bmi}). Recommend regular resistance/cardio training and portion control habits.`,
      });
    }

    if (latestReport.hemoglobin < 12.0) {
      clinicalRecommendations.push({
        title: "Iron Deficient Anemia Assessment",
        severity: "warning",
        tip: `Hemoglobin is low (${latestReport.hemoglobin} g/dL). Advise iron-rich dietary options (spinach, lean meats, beans) and evaluate serum ferritin levels.`,
      });
    }

    if (latestReport.creatinine > 1.2) {
      clinicalRecommendations.push({
        title: "Renal Function Review",
        severity: "critical",
        tip: `Creatinine is elevated (${latestReport.creatinine} mg/dL). Advise patient on optimal daily hydration and review use of nephrotoxic drugs (like NSAIDs).`,
      });
    }
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4 print:p-4">
      {/* Back navigation - hidden on print */}
      <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to patients
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-all active:scale-95 shadow-sm"
        >
          <Printer className="h-4 w-4" />
          Print Patient Report
        </button>
      </div>

      {/* Patient Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-4 print:pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              {user.name}
            </h1>
            <Badge className="bg-brand-50 text-brand-700 border-brand-200 font-mono text-xs">
              Client ID: {user.client_id}
            </Badge>
          </div>
          <p className="mt-1 text-gray-600 print:text-xs">
            Demographics, historical diagnostic records, and analytics overview.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        {/* Profile Card */}
        <Card title="Demographics Profile" className="lg:col-span-1 print:col-span-1 shadow-sm">
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email Address" value={user.email} />
            <InfoRow icon={Phone} label="Contact Mobile" value={user.phone || user.mobile || "—"} />

            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={UserIcon} label="Age" value={user.age ? `${user.age} yrs` : "—"} />
              <InfoRow icon={UserIcon} label="Gender" value={user.gender || "—"} />
            </div>

            <InfoRow icon={Briefcase} label="Occupation" value={user.occupation || "—"} />
            <InfoRow
              icon={MapPin}
              label="Location"
              value={user.city && user.state ? `${user.city}, ${user.state}` : "—"}
            />

            <div className="pt-3.5 border-t border-gray-100 space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="h-4 w-4 text-rose-500 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Health Condition</p>
                  <p className="text-sm font-bold text-gray-950">
                    {user.health_condition || "None listed"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Beauty Goal</p>
                  <p className="text-sm font-bold text-gray-950">
                    {user.beauty_goal || "None listed"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Reports</p>
                <p className="text-2xl font-black text-brand-600 mt-0.5">{reportCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Member Since</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* History Visualizations and Actionable Insights */}
        <div className="lg:col-span-2 print:col-span-2 space-y-6 print:space-y-4">
          {/* SVG Trend Line Chart Card */}
          {reports.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 space-y-5 print:shadow-none print:border">
              <div className="flex justify-between items-center flex-wrap gap-2 print:hidden">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                    <TrendingUp className="h-4.5 w-4.5 text-brand-600" />
                    Vitals History Trends
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select a vital metric to view historical trends against standard reference bands.
                  </p>
                </div>
              </div>

              {/* Metric Selector Buttons - Hidden on print */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50 rounded-xl print:hidden">
                {(Object.keys(METRIC_CONFIGS) as MetricKey[]).map((key) => {
                  const isActive = activeMetric === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveMetric(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-white text-gray-950 shadow-sm border border-gray-100"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {METRIC_CONFIGS[key].label}
                    </button>
                  );
                })}
              </div>

              <div className="hidden print:block mb-2">
                <h4 className="text-sm font-extrabold text-gray-900">
                  Historical Trend: {activeConfig.label} ({activeConfig.unit})
                </h4>
              </div>

              {/* SVG Chart Rendering */}
              <div className="pt-2">
                <LineChart
                  data={trendData}
                  referenceRange={{ min: activeConfig.min, max: activeConfig.max }}
                  unit={activeConfig.unit}
                  color={activeConfig.color}
                  label={activeConfig.label}
                />
              </div>
            </div>
          ) : (
            <Card>
              <p className="text-gray-500 text-center py-8">Not enough history for charts.</p>
            </Card>
          )}

          {/* Actionable Medical Insights */}
          {latestReport && clinicalRecommendations.length > 0 && (
            <div className="bg-gradient-to-br from-brand-50/40 to-brand-50/10 rounded-2xl border border-brand-100/60 p-5 space-y-4 print:shadow-none print:border">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                <Stethoscope className="h-4.5 w-4.5 text-brand-600" />
                Automated Clinical Summary & Insights
              </h3>
              <div className="space-y-3">
                {clinicalRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-xl border border-brand-100/40 shadow-sm flex items-start gap-3"
                  >
                    <div
                      className={`p-1.5 rounded-lg flex-shrink-0 ${
                        rec.severity === "critical"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{rec.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {latestReport ? (
            <HealthReportCard report={latestReport} />
          ) : (
            <Card>
              <p className="text-gray-500 text-center py-8">No reports for this patient.</p>
            </Card>
          )}
        </div>
      </div>

      {reports.length > 0 && (
        <Card
          title="Full Historical Checkups log"
          subtitle={`${reportCount} total records uploaded for this patient`}
          className="print:mt-6 shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Checkup Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Report ID</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Hemoglobin</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Vitamin D</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Blood Sugar</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Cholesterol</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Creatinine</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">BMI</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-2 font-bold text-gray-900">
                      {formatDate(report.report_date)}
                    </td>
                    <td className="py-3 px-2 text-gray-600 font-semibold font-mono text-xs">
                      {report.report_id}
                    </td>
                    <td className="py-3 px-2">{report.hemoglobin} g/dL</td>
                    <td className="py-3 px-2">{report.vitamin_d} ng/mL</td>
                    <td className="py-3 px-2 font-semibold text-gray-950">
                      {report.blood_sugar} mg/dL
                    </td>
                    <td className="py-3 px-2">{report.cholesterol} mg/dL</td>
                    <td className="py-3 px-2">{report.creatinine} mg/dL</td>
                    <td className="py-3 px-2 font-medium text-gray-800">{report.bmi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4.5 w-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{value}</p>
      </div>
    </div>
  );
}
