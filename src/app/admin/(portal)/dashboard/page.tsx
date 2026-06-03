"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { DashboardStats } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DonutChart, BarChart } from "@/components/ui/SvgCharts";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Users,
  FileText,
  Upload,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Activity,
  Heart,
  Droplet,
  Sun,
  ShieldAlert,
  Search,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      const token = getToken();
      if (!token) return;

      try {
        const response = await apiRequest<{ success: boolean; data: DashboardStats }>(
          "/admin/stats",
          { token }
        );
        setStats(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const cohort = stats?.cohortStats;

  // Generate automated clinical insights based on calculations
  const insights = [];
  if (cohort) {
    const bs = cohort.bloodSugarBreakdown;
    const vd = cohort.vitaminDBreakdown;
    const ch = cohort.cholesterolBreakdown;
    const cr = cohort.creatinineBreakdown;
    const hb = cohort.hemoglobinBreakdown;

    if (bs.diabetes > 0) {
      insights.push({
        type: "critical",
        title: "High Blood Sugar Alert",
        message: `${bs.diabetes} patient(s) exhibit blood sugar in the diabetic range (>=126 mg/dL).`,
        action: "Schedule HbA1c confirmation screenings.",
        searchQuery: "Diabetes",
      });
    }
    if (vd.deficient > 0) {
      insights.push({
        type: "warning",
        title: "Vitamin D Deficiency Trend",
        message: `${vd.deficient} patient(s) are Vitamin D deficient (<20 ng/mL).`,
        action: "Consider recommending cholecalciferol supplementation.",
        searchQuery: "Vitamin D",
      });
    }
    if (ch.high > 0) {
      insights.push({
        type: "warning",
        title: "Cardiovascular Risk warning",
        message: `${ch.high} patient(s) have high cholesterol levels (>=240 mg/dL).`,
        action: "Recommend lipid profile reviews and diet plans.",
        searchQuery: "Hypertension",
      });
    }
    if (cr.high > 0) {
      insights.push({
        type: "critical",
        title: "Elevated Renal Risk",
        message: `${cr.high} patient(s) show high creatinine levels (>1.2 mg/dL).`,
        action: "Requires follow-up review for kidney stress.",
        searchQuery: "",
      });
    }
    if (hb.low > 0) {
      insights.push({
        type: "warning",
        title: "Anemia Risk Identified",
        message: `${hb.low} patient(s) have low hemoglobin levels (<12.0 g/dL).`,
        action: "Coordinate iron panel screenings.",
        searchQuery: "",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Clinic Operations Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Cohort analytics, visual risk distribution, and automated patient insights.
          </p>
        </div>
        <Link
          href="/admin/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95"
        >
          <Upload className="h-4 w-4" />
          Upload Health Report
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={Users}
          label="Total Patients Registered"
          value={stats?.totalUsers ?? 0}
          subtitle="Unique active health files"
          href="/admin/users"
        />
        <StatCard
          icon={FileText}
          label="Total Clinical Reports"
          value={stats?.totalReports ?? 0}
          subtitle="Uploaded diagnostics history"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Cohort BMI"
          value={cohort ? `${cohort.averages.bmi}` : "—"}
          subtitle={
            cohort
              ? cohort.averages.bmi >= 30
                ? "Obese range (Cohort level)"
                : cohort.averages.bmi >= 25
                ? "Overweight range (Cohort level)"
                : "Normal range (Cohort level)"
              : ""
          }
          className={
            cohort
              ? cohort.averages.bmi >= 25
                ? "border-l-4 border-l-amber-500"
                : "border-l-4 border-l-emerald-500"
              : ""
          }
        />
      </div>

      {/* Cohort Averages Cards */}
      {cohort && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cohort Vitals Averages</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Clinic-wide average levels calculated from patients' latest records.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <AverageVitalCard
              label="Blood Sugar"
              value={cohort.averages.blood_sugar}
              unit="mg/dL"
              refRange="< 100"
              status={cohort.averages.blood_sugar >= 126 ? "high" : cohort.averages.blood_sugar >= 100 ? "warn" : "good"}
            />
            <AverageVitalCard
              label="Cholesterol"
              value={cohort.averages.cholesterol}
              unit="mg/dL"
              refRange="< 200"
              status={cohort.averages.cholesterol >= 240 ? "high" : cohort.averages.cholesterol >= 200 ? "warn" : "good"}
            />
            <AverageVitalCard
              label="Vitamin D"
              value={cohort.averages.vitamin_d}
              unit="ng/mL"
              refRange="30 - 100"
              status={cohort.averages.vitamin_d < 20 ? "high" : cohort.averages.vitamin_d < 30 ? "warn" : "good"}
            />
            <AverageVitalCard
              label="Hemoglobin"
              value={cohort.averages.hemoglobin}
              unit="g/dL"
              refRange="12 - 17.5"
              status={cohort.averages.hemoglobin < 12 ? "high" : "good"}
            />
            <AverageVitalCard
              label="Creatinine"
              value={cohort.averages.creatinine}
              unit="mg/dL"
              refRange="0.5 - 1.3"
              status={cohort.averages.creatinine > 1.2 ? "high" : "good"}
            />
          </div>
        </div>
      )}

      {/* Visual Analytics Section */}
      {cohort && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart (Blood Sugar Risk Breakdown) */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 lg:col-span-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Blood Sugar Risk</h3>
              <p className="text-xs text-gray-500 mt-0.5">Patient distribution based on fasting glucose ranges.</p>
            </div>
            <div className="my-2">
              <DonutChart
                data={[
                  { label: "Normal (<100)", value: cohort.bloodSugarBreakdown.normal, color: "#10b981" },
                  { label: "Prediabetic (100-125)", value: cohort.bloodSugarBreakdown.prediabetes, color: "#f59e0b" },
                  { label: "Diabetic (>=126)", value: cohort.bloodSugarBreakdown.diabetes, color: "#ef4444" },
                ]}
              />
            </div>
          </div>

          {/* Bar Charts (Vitamin D & Cholesterol & BMI Breakdowns) */}
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 lg:col-span-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Cohort Metric Stratification</h3>
              <p className="text-xs text-gray-500 mt-0.5">Risk profiling based on reference thresholds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <BarChart
                title="Vitamin D Deficiencies"
                data={[
                  { label: "Sufficient (>=30)", value: cohort.vitaminDBreakdown.normal, color: "#10b981" },
                  { label: "Insufficient (20-29)", value: cohort.vitaminDBreakdown.insufficient, color: "#f59e0b" },
                  { label: "Deficient (<20)", value: cohort.vitaminDBreakdown.deficient, color: "#ef4444" },
                ]}
              />
              <div className="pt-4 md:pt-0 md:pl-4">
                <BarChart
                  title="Cholesterol Risk"
                  data={[
                    { label: "Normal (<200)", value: cohort.cholesterolBreakdown.desirable, color: "#10b981" },
                    { label: "Borderline (200-239)", value: cohort.cholesterolBreakdown.borderline, color: "#f59e0b" },
                    { label: "High (>=240)", value: cohort.cholesterolBreakdown.high, color: "#ef4444" },
                  ]}
                />
              </div>
              <div className="pt-4 md:pt-0 md:pl-4">
                <BarChart
                  title="BMI Classification"
                  data={[
                    { label: "Normal (18.5-24.9)", value: cohort.bmiBreakdown.normal, color: "#10b981" },
                    { label: "Overweight (25-29.9)", value: cohort.bmiBreakdown.overweight, color: "#f59e0b" },
                    { label: "Obese (>=30)", value: cohort.bmiBreakdown.obese, color: "#ef4444" },
                    { label: "Underweight (<18.5)", value: cohort.bmiBreakdown.underweight, color: "#3b82f6" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Insights Panel */}
      {cohort && insights.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-extrabold text-gray-900">
              System Actionable Insights & Diagnostics Alerts
            </h3>
            <Badge className="ml-2 bg-brand-100 text-brand-800 font-bold border-brand-200">
              {insights.length} Attention Items
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-start gap-3.5 hover:shadow-card transition-shadow"
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    insight.type === "critical" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900">{insight.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{insight.message}</p>
                  <p className="text-xs font-bold text-brand-700 mt-1.5 flex items-center gap-1 bg-brand-50/50 py-1 px-2 rounded-lg w-fit">
                    Recommended action: {insight.action}
                  </p>
                  {insight.searchQuery && (
                    <Link
                      href={`/admin/users?search=${encodeURIComponent(insight.searchQuery)}`}
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 tracking-wide uppercase"
                    >
                      <Search className="h-3 w-3" />
                      Filter matching patients
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent uploaded reports table */}
      <Card title="Recent Reports Uploaded" subtitle="Latest clinical files added to patient profiles.">
        {stats?.recentReports && stats.recentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Patient Details</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Report ID</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Checkup Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Blood Sugar</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Cholesterol</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">BMI Status</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentReports.map((report) => {
                  const patient =
                    typeof report.userId === "object" && report.userId ? report.userId : null;
                  const isCriticalSugar = report.blood_sugar >= 126;
                  const isHighChol = report.cholesterol >= 240;

                  return (
                    <tr key={report._id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-bold text-gray-900">{patient?.name || "Unknown Patient"}</p>
                        <p className="text-xs text-gray-500">{patient?.email || ""}</p>
                      </td>
                      <td className="py-3 px-2 font-mono text-xs text-gray-600 font-semibold">
                        {report.report_id}
                      </td>
                      <td className="py-3 px-2 text-gray-600 font-medium">
                        {formatDate(report.report_date)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`font-semibold ${
                            isCriticalSugar ? "text-rose-600 font-bold" : "text-gray-900"
                          }`}
                        >
                          {report.blood_sugar} mg/dL
                        </span>
                        {isCriticalSugar && (
                          <span className="ml-1.5 px-1 py-0.5 rounded text-[8px] font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide">
                            Critical
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`font-semibold ${
                            isHighChol ? "text-rose-600 font-bold" : "text-gray-900"
                          }`}
                        >
                          {report.cholesterol} mg/dL
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-medium text-gray-900">{report.bmi}</span>
                        {report.bmi >= 30 && (
                          <span className="ml-1.5 px-1 py-0.5 rounded text-[8px] font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wide">
                            Obese
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {patient && (
                          <Link
                            href={`/admin/users/${patient._id}`}
                            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold text-xs"
                          >
                            Analyze
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No medical reports found.</p>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  href,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  className?: string;
}) {
  const content = (
    <div
      className={`bg-white rounded-2xl shadow-card border border-gray-100 p-5 hover:shadow-elevated transition-all flex flex-col justify-between h-full ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-gray-950 tracking-tight">{value}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 flex-shrink-0">
          <Icon className="h-5.5 w-5.5" />
        </div>
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-4 font-medium">{subtitle}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full active:scale-98 transition-transform">
        {content}
      </Link>
    );
  }

  return content;
}

function AverageVitalCard({
  label,
  value,
  unit,
  refRange,
  status,
}: {
  label: string;
  value: number;
  unit: string;
  refRange: string;
  status: "good" | "warn" | "high";
}) {
  const colors = {
    good: { text: "text-emerald-700", bg: "bg-emerald-50", fill: "bg-emerald-500", border: "border-emerald-100" },
    warn: { text: "text-amber-700", bg: "bg-amber-50", fill: "bg-amber-500", border: "border-amber-100" },
    high: { text: "text-rose-700", bg: "bg-rose-50", fill: "bg-rose-500", border: "border-rose-100" },
  };

  const scheme = colors[status];

  return (
    <div className={`p-4 rounded-xl border ${scheme.border} ${scheme.bg} flex flex-col justify-between`}>
      <div>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-lg font-black text-gray-900 mt-1 leading-none">
          {value}
          <span className="text-[10px] font-normal text-gray-500 ml-0.5">{unit}</span>
        </p>
      </div>
      <div className="mt-3.5 space-y-1">
        <div className="h-1.5 w-full bg-gray-200/60 rounded-full overflow-hidden">
          <div className={`h-full ${scheme.fill} rounded-full`} style={{ width: "65%" }} />
        </div>
        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">Ref: {refRange}</p>
      </div>
    </div>
  );
}
