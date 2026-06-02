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
} from "lucide-react";

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
          <ArrowLeft className="h-4 w-4" /> Back to patients
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

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.name}</h1>
            <Badge className="bg-brand-50 text-brand-700 border-brand-200 font-mono">
              ID: {user.client_id}
            </Badge>
          </div>
          <p className="mt-1 text-gray-600">Patient demographics, treatment focus, and health records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Patient Profile" className="lg:col-span-1">
          <div className="space-y-4">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow icon={Phone} label="Mobile" value={user.phone || user.mobile || "—"} />
            
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

            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="h-4 w-4 text-rose-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Health Condition</p>
                  <p className="text-sm font-semibold text-gray-950">{user.health_condition || "None listed"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Beauty Goal</p>
                  <p className="text-sm font-semibold text-gray-950">{user.beauty_goal || "None listed"}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Vitals Reports</p>
                <p className="text-2xl font-extrabold text-brand-600 mt-0.5">{reportCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm font-semibold text-gray-950 mt-1">{formatDate(user.createdAt)}</p>
              </div>
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
        <Card title="Vitals Report History" subtitle={`${reportCount} total reports`}>
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
                {reports.map((report) => (
                  <tr key={report._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{formatDate(report.report_date)}</td>
                    <td className="py-3 px-2 text-gray-600">{report.report_id}</td>
                    <td className="py-3 px-2">{report.hemoglobin} g/dL</td>
                    <td className="py-3 px-2">{report.vitamin_d} ng/mL</td>
                    <td className="py-3 px-2">{report.blood_sugar} mg/dL</td>
                    <td className="py-3 px-2">{report.cholesterol} mg/dL</td>
                    <td className="py-3 px-2">{report.creatinine} mg/dL</td>
                    <td className="py-3 px-2">{report.bmi}</td>
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
      <Icon className="h-4 w-4 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
