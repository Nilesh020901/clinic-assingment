"use client";

import { HealthReport } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  formatDate,
  getHemoglobinStatus,
  getVitaminDStatus,
  getCholesterolStatus,
  getBloodSugarStatus,
  getCreatinineStatus,
  getUrineProteinStatus,
  getBmiStatus,
} from "@/lib/utils";
import {
  Droplet,
  Sun,
  Scale,
  FlaskConical,
  Activity,
  ClipboardList,
  FileText,
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
  range,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  range?: string;
  status?: { label: string; color: string };
}) {
  return (
    <div className="flex flex-col p-4 rounded-xl bg-gray-50 border border-gray-100 shadow-sm transition-all hover:bg-gray-100/50">
      <div className="flex items-center gap-3.5 mb-2.5">
        <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
          <Icon className="h-4.5 w-4.5 text-brand-600 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          {range && <p className="text-[10px] text-gray-400 font-medium mt-0.5">Ref: {range}</p>}
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-1 gap-2 flex-wrap">
        <span className="text-xl font-bold text-gray-900 leading-none">
          {value}
          {unit && <span className="text-xs text-gray-500 font-normal ml-0.5">{unit}</span>}
        </span>
        {status && (
          <Badge className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${status.color}`}>
            {status.label}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function HealthReportCard({ report, compact }: HealthReportCardProps) {
  const hemoStatus = getHemoglobinStatus(report.hemoglobin);
  const vitdStatus = getVitaminDStatus(report.vitamin_d);
  const cholStatus = getCholesterolStatus(report.cholesterol);
  const sugarStatus = getBloodSugarStatus(report.blood_sugar);
  const creatStatus = getCreatinineStatus(report.creatinine);
  const urineStatus = getUrineProteinStatus(report.urine_protein);
  const bmiStatus = getBmiStatus(report.bmi);

  return (
    <Card
      title={compact ? undefined : `Health Report: ${report.report_id}`}
      subtitle={compact ? undefined : `Checked on ${formatDate(report.report_date)}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricItem
          icon={Droplet}
          label="Hemoglobin"
          value={report.hemoglobin}
          unit=" g/dL"
          range="12.0 - 17.5"
          status={hemoStatus}
        />
        <MetricItem
          icon={Sun}
          label="Vitamin D"
          value={report.vitamin_d}
          unit=" ng/mL"
          range="30 - 100"
          status={vitdStatus}
        />
        <MetricItem
          icon={Activity}
          label="Cholesterol"
          value={report.cholesterol}
          unit=" mg/dL"
          range="< 200"
          status={cholStatus}
        />
        <MetricItem
          icon={FlaskConical}
          label="Blood Sugar"
          value={report.blood_sugar}
          unit=" mg/dL"
          range="< 100"
          status={sugarStatus}
        />
        <MetricItem
          icon={ClipboardList}
          label="Creatinine"
          value={report.creatinine}
          unit=" mg/dL"
          range="0.5 - 1.3"
          status={creatStatus}
        />
        <MetricItem
          icon={Droplet}
          label="Urine Protein"
          value={report.urine_protein}
          range="Negative"
          status={urineStatus}
        />
        <MetricItem
          icon={Scale}
          label="BMI"
          value={report.bmi}
          range="18.5 - 24.9"
          status={bmiStatus}
        />
      </div>

      {report.doctor_notes && (
        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 shadow-inner">
          <div className="p-1 rounded bg-blue-100 text-blue-700 h-fit">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Doctor's Notes</p>
            <p className="text-sm text-blue-900 leading-relaxed">{report.doctor_notes}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
