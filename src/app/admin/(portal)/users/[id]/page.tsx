"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { HealthReport, User } from "@/types";
import { Card } from "@/components/ui/Card";
import { HealthReportCard } from "@/components/HealthReportCard";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";

interface UserDetailsResponse {
  user: User & { _id: string; createdAt: string };
  reports: HealthReport[];
  reportCount: number;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [data, setData] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error || "User not found"}
        </div>
      </div>
    );
  }

  const { user, reports, reportCount } = data;
  const latestReport = reports[0] ?? null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Back to patients
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
        <p className="mt-1 text-gray-600">Patient details and health reports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Patient Info" className="lg:col-span-1">
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            {user.phone && <InfoRow icon={Phone} label="Phone" value={user.phone} />}
            {user.dateOfBirth && (
              <InfoRow
                icon={Calendar}
                label="Date of Birth"
                value={formatDate(user.dateOfBirth)}
              />
            )}
            <InfoRow icon={Calendar} label="Member Since" value={formatDate(user.createdAt)} />
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-brand-600">{reportCount}</p>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
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
        <Card title="Report History" subtitle={`${reportCount} total reports`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">BP</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Heart Rate</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Glucose</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Cholesterol</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">{formatDate(report.reportDate)}</td>
                    <td className="py-3 px-2">
                      {report.bloodPressureSystolic}/{report.bloodPressureDiastolic}
                    </td>
                    <td className="py-3 px-2">{report.heartRate} bpm</td>
                    <td className="py-3 px-2">{report.glucose} mg/dL</td>
                    <td className="py-3 px-2">{report.cholesterol} mg/dL</td>
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
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
