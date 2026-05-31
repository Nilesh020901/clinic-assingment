"use client";

import { HealthReport } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  formatDate,
  getBloodPressureStatus,
  getGlucoseStatus,
} from "@/lib/utils";
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  Droplets,
  FlaskConical,
} from "lucide-react";

interface HealthReportCardProps {
  report: HealthReport;
  compact?: boolean;
}

function MetricItem({
  icon: Icon,
  label,
  value,
  unit,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  status?: { label: string; color: string };
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
      <div className="p-2 rounded-lg bg-white shadow-sm">
        <Icon className="h-4 w-4 text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">
          {value}
          {unit && <span className="text-gray-500 font-normal ml-1">{unit}</span>}
        </p>
        {status && (
          <Badge className={`mt-1 ${status.color}`}>{status.label}</Badge>
        )}
      </div>
    </div>
  );
}

export function HealthReportCard({ report, compact }: HealthReportCardProps) {
  const bpStatus = getBloodPressureStatus(
    report.bloodPressureSystolic,
    report.bloodPressureDiastolic
  );
  const glucoseStatus = getGlucoseStatus(report.glucose);

  return (
    <Card
      title={compact ? undefined : "Health Report"}
      subtitle={compact ? undefined : formatDate(report.reportDate)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricItem
          icon={Activity}
          label="Blood Pressure"
          value={`${report.bloodPressureSystolic}/${report.bloodPressureDiastolic}`}
          unit="mmHg"
          status={bpStatus}
        />
        <MetricItem
          icon={Heart}
          label="Heart Rate"
          value={report.heartRate}
          unit="bpm"
        />
        <MetricItem
          icon={Thermometer}
          label="Temperature"
          value={report.temperature}
          unit="°F"
        />
        <MetricItem
          icon={Scale}
          label="Weight"
          value={report.weight}
          unit="lbs"
        />
        <MetricItem
          icon={Droplets}
          label="Glucose"
          value={report.glucose}
          unit="mg/dL"
          status={glucoseStatus}
        />
        <MetricItem
          icon={FlaskConical}
          label="Cholesterol"
          value={report.cholesterol}
          unit="mg/dL"
        />
      </div>
      {report.notes && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs font-medium text-blue-700 mb-1">Notes</p>
          <p className="text-sm text-blue-900">{report.notes}</p>
        </div>
      )}
    </Card>
  );
}
