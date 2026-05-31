"use client";

import { useEffect, useState } from "react";
import { getToken, getStoredUser } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { HealthReport, PaginatedResponse } from "@/types";
import { HealthReportCard } from "@/components/HealthReportCard";
import { PaginationControls } from "@/components/PaginationControls";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { Activity, Calendar, FileText } from "lucide-react";

export default function UserDashboardPage() {
  const user = getStoredUser();
  const [latestReport, setLatestReport] = useState<HealthReport | null>(null);
  const [history, setHistory] = useState<PaginatedResponse<HealthReport> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const token = getToken();
      if (!token) return;

      setLoading(true);
      setError("");

      try {
        const [latestRes, historyRes] = await Promise.all([
          apiRequest<{ success: boolean; data: HealthReport | null }>(
            "/user/reports/latest",
            { token }
          ),
          apiRequest<PaginatedResponse<HealthReport>>(
            `/user/reports/history?page=${page}&limit=5`,
            { token }
          ),
        ]);

        setLatestReport(latestRes.data);
        setHistory(historyRes);
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-gray-600">Your health overview and report history.</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          label="Total Reports"
          value={history?.pagination.total ?? 0}
        />
        <StatCard
          icon={Calendar}
          label="Latest Checkup"
          value={latestReport ? formatDate(latestReport.reportDate) : "N/A"}
        />
        <StatCard
          icon={Activity}
          label="Heart Rate"
          value={latestReport ? `${latestReport.heartRate} bpm` : "N/A"}
        />
      </div>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Health Report</h2>
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

      <section>
        <Card title="Report History" subtitle="Your past health checkups">
          {history && history.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">BP</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Heart Rate</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Glucose</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-500">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.data.map((report) => (
                      <tr key={report._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2">{formatDate(report.reportDate)}</td>
                        <td className="py-3 px-2">
                          {report.bloodPressureSystolic}/{report.bloodPressureDiastolic}
                        </td>
                        <td className="py-3 px-2">{report.heartRate} bpm</td>
                        <td className="py-3 px-2">{report.glucose} mg/dL</td>
                        <td className="py-3 px-2">{report.weight} lbs</td>
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
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
