"use client";

import { useEffect, useState } from "react";
import { getToken, getStoredUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { HealthReport, PaginatedResponse } from "@/types";
import { HealthReportCard } from "@/components/HealthReportCard";
import { PaginationControls } from "@/components/PaginationControls";
import { LineChart } from "@/components/ui/SvgCharts";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import {
  Activity,
  Calendar,
  FileText,
  Droplet,
  Heart,
  TrendingUp,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

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

export default function UserDashboardPage() {
  const user = getStoredUser();
  const [latestReport, setLatestReport] = useState<HealthReport | null>(null);
  const [history, setHistory] = useState<PaginatedResponse<HealthReport> | null>(null);
  const [allHistory, setAllHistory] = useState<HealthReport[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMetric, setActiveMetric] = useState<MetricKey>("blood_sugar");

  useEffect(() => {
    async function fetchData() {
      const token = getToken();
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const [latestRes, historyRes, allHistoryRes] = await Promise.all([
          apiRequest<{ success: boolean; data: HealthReport | null }>(
            "/user/reports/latest",
            { token }
          ),
          apiRequest<PaginatedResponse<HealthReport>>(
            `/user/reports/history?page=${page}&limit=5`,
            { token }
          ),
          apiRequest<PaginatedResponse<HealthReport>>(
            `/user/reports/history?page=1&limit=50`,
            { token }
          ),
        ]);

        setLatestReport(latestRes.data);
        setHistory(historyRes);
        setAllHistory(allHistoryRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page]);

  if (loading && !history) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Active config details
  const activeConfig = METRIC_CONFIGS[activeMetric];

  // Map historical trend points
  const trendPoints = allHistory.map((h) => ({
    date: h.report_date,
    value: h[activeMetric] as number,
  }));

  // Generate patient-friendly tips based on their latest readings
  const wellnessTips = [];
  if (latestReport) {
    if (latestReport.blood_sugar >= 126) {
      wellnessTips.push({
        title: "High Blood Sugar Alert",
        tip: "Your fasting blood sugar is high. We recommend speaking to your doctor, minimizing sugary snacks, and adding complex fibers (oats, whole grains) to your meals.",
      });
    } else if (latestReport.blood_sugar >= 100) {
      wellnessTips.push({
        title: "Slightly Elevated Sugar Level",
        tip: "Your blood sugar is in the prediabetic range. Focus on regular daily walks after meals, and cut back on sweetened beverages.",
      });
    }

    if (latestReport.vitamin_d < 20) {
      wellnessTips.push({
        title: "Low Vitamin D Level",
        tip: "Your Vitamin D is deficient. Try to get 15-20 minutes of midday sunlight exposure and speak with your physician about D3 supplementation.",
      });
    } else if (latestReport.vitamin_d < 30) {
      wellnessTips.push({
        title: "Vitamin D is Insufficient",
        tip: "Optimize your Vitamin D levels by including egg yolks, fatty fish, or fortified cereals in your breakfast.",
      });
    }

    if (latestReport.cholesterol >= 200) {
      wellnessTips.push({
        title: "Cholesterol Monitoring",
        tip: "Your total cholesterol is slightly elevated. Try replacing saturated cooking oils with olive oil, eating a handful of almonds daily, and doing light cardio.",
      });
    }

    if (latestReport.bmi >= 25.0) {
      wellnessTips.push({
        title: "Active Weight Management",
        tip: "Your BMI indicates you are above the normal weight range. Combining portion control with 30 minutes of aerobic exercise daily will help improve your metabolic fitness.",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-gray-600">Your health overview, visual trends, and checkup logs.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          label="Total Reports"
          value={history?.pagination.total ?? 0}
        />
        <StatCard
          icon={Calendar}
          label="Latest Checkup Date"
          value={latestReport ? formatDate(latestReport.report_date) : "N/A"}
        />
        <StatCard
          icon={Droplet}
          label="Latest Blood Sugar"
          value={latestReport ? `${latestReport.blood_sugar} mg/dL` : "N/A"}
          className={
            latestReport && latestReport.blood_sugar >= 126
              ? "border-l-4 border-l-rose-500"
              : latestReport && latestReport.blood_sugar >= 100
              ? "border-l-4 border-l-amber-500"
              : "border-l-4 border-l-emerald-500"
          }
        />
      </div>

      {/* Interactive Trend Chart */}
      {allHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-brand-600" />
              Your Health Metrics Over Time
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Track how your vitals change across checkups. The shaded gray band shows normal ranges.
            </p>
          </div>

          {/* Metric selector buttons */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50 rounded-xl">
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

          {/* Render the Svg Line Chart */}
          <div className="pt-2">
            <LineChart
              data={trendPoints}
              referenceRange={{ min: activeConfig.min, max: activeConfig.max }}
              unit={activeConfig.unit}
              color={activeConfig.color}
              label={activeConfig.label}
            />
          </div>
        </div>
      )}

      {/* Wellness & Personalized Recommendations */}
      {latestReport && wellnessTips.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50/40 to-indigo-50/10 rounded-2xl border border-indigo-100/60 p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
            <Stethoscope className="h-4.5 w-4.5 text-indigo-600" />
            Personalized Wellness Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wellnessTips.map((tip, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded-xl border border-indigo-100/40 shadow-sm flex items-start gap-3"
              >
                <div className="p-1.5 rounded-lg flex-shrink-0 bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{tip.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{tip.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Health Report Detail */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-1.5">
          <Heart className="h-5 w-5 text-rose-500" />
          Latest Detailed Report
        </h2>
        {latestReport ? (
          <HealthReportCard report={latestReport} />
        ) : (
          <Card>
            <p className="text-gray-500 text-center py-8">
              No health reports available yet. Contact your clinic administrator.
            </p>
          </Card>
        )}
      </section>

      {/* Report History Logs */}
      <section>
        <Card title="All Past Checkups History" subtitle="List of your previous diagnostic files.">
          {history && history.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
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
                    {history.data.map((report) => (
                      <tr key={report._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2 font-bold text-gray-900">{formatDate(report.report_date)}</td>
                        <td className="py-3 px-2 text-gray-600 font-semibold font-mono text-xs">{report.report_id}</td>
                        <td className="py-3 px-2">{report.hemoglobin} g/dL</td>
                        <td className="py-3 px-2">{report.vitamin_d} ng/mL</td>
                        <td className="py-3 px-2 font-semibold text-gray-950">{report.blood_sugar} mg/dL</td>
                        <td className="py-3 px-2">{report.cholesterol} mg/dL</td>
                        <td className="py-3 px-2">{report.creatinine} mg/dL</td>
                        <td className="py-3 px-2">{report.bmi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {history.pagination && (
                <PaginationControls
                  pagination={history.pagination}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No report history found.</p>
          )}
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-gray-100 p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
          <p className="text-lg font-black text-gray-950 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}
