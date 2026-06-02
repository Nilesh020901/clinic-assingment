"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { DashboardStats } from "@/types";
import { Card } from "@/components/ui/Card";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Users, FileText, Upload, ArrowRight } from "lucide-react";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Overview of clinic data and recent activity.</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Patients"
          value={stats?.totalUsers ?? 0}
          href="/admin/users"
        />
        <StatCard
          icon={FileText}
          label="Total Reports"
          value={stats?.totalReports ?? 0}
        />
        <StatCard
          icon={Upload}
          label="Upload Reports"
          value="CSV Import"
          href="/admin/upload"
          isAction
        />
      </div>

      <Card title="Recent Reports" subtitle="Latest uploaded health reports">
        {stats?.recentReports && stats.recentReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Patient</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Report Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Report ID</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Blood Sugar</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentReports.map((report) => (
                  <tr key={report._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-900">
                        {typeof report.userId === "object" && report.userId
                          ? report.userId.name
                          : "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof report.userId === "object" && report.userId
                          ? report.userId.email
                          : ""}
                      </p>
                    </td>
                    <td className="py-3 px-2">{formatDate(report.report_date)}</td>
                    <td className="py-3 px-2 font-mono text-xs text-gray-600">{report.report_id}</td>
                    <td className="py-3 px-2">{report.blood_sugar} mg/dL</td>
                    <td className="py-3 px-2">{formatDateTime(report.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reports yet.</p>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  isAction,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  href?: string;
  isAction?: boolean;
}) {
  const content = (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 p-5 hover:shadow-elevated transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50">
            <Icon className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`font-semibold text-gray-900 ${isAction ? "text-brand-600" : "text-lg"}`}>
              {value}
            </p>
          </div>
        </div>
        {href && <ArrowRight className="h-4 w-4 text-gray-400" />}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
