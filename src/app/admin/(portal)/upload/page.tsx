"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { getToken } from "@/lib/auth";
import { apiUpload } from "@/lib/api";
import { CsvUploadResult } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, CheckCircle, AlertCircle, Download, FileSpreadsheet, Info, AlertTriangle } from "lucide-react";

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CsvUploadResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(selected: File) {
    const nameLower = selected.name.toLowerCase();
    const isCsv = nameLower.endsWith(".csv");
    const isExcel = nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls");

    if (!isCsv && !isExcel) {
      setError("Please select a CSV or Excel (.xlsx, .xls) file");
      return;
    }
    setFile(selected);
    setError("");
    setResult(null);
    setMessage("");
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  async function handleUpload() {
    if (!file) return;

    const token = getToken();
    if (!token) return;

    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiUpload<{
        success: boolean;
        data: CsvUploadResult;
        message: string;
      }>("/admin/reports/upload", formData, token);

      setResult(response.data);
      setMessage(response.message);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function downloadSampleClients() {
    const headers =
      "client_id,full_name,email,mobile,city,state,age,gender,occupation,health_condition,beauty_goal,created_at";
    const sample =
      "4,Karan Singh,karan@example.com,+9199887766,Mumbai,Maharashtra,31,Male,Engineer,Vitamin D,Fitness,02-06-2026";
    const blob = new Blob([`${headers}\n${sample}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_clients.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadSampleReports() {
    const headers =
      "report_id,client_id,report_date,hemoglobin,vitamin_d,cholesterol,blood_sugar,creatinine,urine_protein,bmi,doctor_notes";
    const sample =
      "RPT40,1,02-06-2026,14.2,45,185,98,0.9,Negative,24.1,Vitals normal. Maintain hydration.";
    const blob = new Blob([`${headers}\n${sample}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_health_reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upload CSV / Excel</h1>
        <p className="mt-1 text-gray-600">
          Bulk import patient directories or clinical reports using CSV or Excel (.xlsx, .xls) files. The system automatically detects the content type.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="1. Clients CSV/Excel">
            <div className="space-y-3 text-sm text-gray-600">
              <p className="text-xs">Creates new patient accounts. Fields:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] font-mono bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                <li>client_id (number)</li>
                <li>full_name (string)</li>
                <li>email (string)</li>
                <li>mobile (string)</li>
                <li>city (string)</li>
                <li>state (string)</li>
                <li>age (number)</li>
                <li>gender (string)</li>
                <li>occupation (string)</li>
                <li>health_condition (optional)</li>
                <li>beauty_goal (optional)</li>
                <li>created_at (DD-MM-YYYY)</li>
              </ul>
              <Button variant="secondary" size="sm" onClick={downloadSampleClients} className="w-full text-xs py-1.5 h-auto">
                <Download className="h-3.5 w-3.5" />
                Download Clients Template
              </Button>
            </div>
          </Card>

          <Card title="2. Reports CSV/Excel">
            <div className="space-y-3 text-sm text-gray-600">
              <p className="text-xs">Adds medical reports to existing clients. Fields:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] font-mono bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                <li>report_id (unique string)</li>
                <li>client_id (matches patient id)</li>
                <li>report_date (DD-MM-YYYY)</li>
                <li>hemoglobin (number)</li>
                <li>vitamin_d (number)</li>
                <li>cholesterol (number)</li>
                <li>blood_sugar (number)</li>
                <li>creatinine (number)</li>
                <li>urine_protein (string)</li>
                <li>bmi (number)</li>
                <li>doctor_notes (optional)</li>
              </ul>
              <Button variant="secondary" size="sm" onClick={downloadSampleReports} className="w-full text-xs py-1.5 h-auto">
                <Download className="h-3.5 w-3.5" />
                Download Reports Template
              </Button>
            </div>
          </Card>
        </div>

        <Card title="Upload File" className="lg:col-span-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-brand-500 bg-brand-50"
                : "border-gray-300 hover:border-brand-400 hover:bg-gray-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleInputChange}
              className="hidden"
            />
            {file && (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")) ? (
              <FileSpreadsheet className="h-10 w-10 text-emerald-500 mx-auto mb-4 animate-bounce" />
            ) : (
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            )}
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                <span className="font-semibold text-gray-900">{file.name}</span>
                <span className="text-sm text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ) : (
              <>
                <p className="text-gray-700 font-medium">
                  Drag and drop your CSV or Excel file here
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse (.csv, .xlsx, .xls)</p>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {message && result && (
            <div className="mt-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Success Card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Success</span>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-emerald-950">{result.successCount}</span>
                    <p className="text-xs text-emerald-700 mt-1">Successfully imported records</p>
                  </div>
                </div>

                {/* Already Exists Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Already Exists</span>
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-blue-950">{result.alreadyExistsCount ?? 0}</span>
                    <p className="text-xs text-blue-700 mt-1">Skipped without error</p>
                  </div>
                </div>

                {/* Conflicts Card */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-800 uppercase tracking-wider">Conflicts</span>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-red-955">{result.clientIdConflictCount ?? result.failedCount ?? 0}</span>
                    <p className="text-xs text-red-700 mt-1">Skipped due to conflicts</p>
                  </div>
                </div>
              </div>

              {/* Status Alert Banner */}
              {(() => {
                const conflicts = result.clientIdConflictCount ?? result.failedCount ?? 0;
                const successes = result.successCount;
                const alreadyExists = result.alreadyExistsCount ?? 0;

                let bannerBg = "bg-blue-50 border-blue-200 text-blue-800";
                let titleColor = "text-blue-900";
                let title = "Import Completed";
                let Icon = Info;

                if (conflicts > 0) {
                  bannerBg = "bg-red-55 border-red-200 text-red-800";
                  titleColor = "text-red-900";
                  title = "Import completed with warnings/conflicts";
                  Icon = AlertCircle;
                } else if (successes > 0) {
                  bannerBg = "bg-emerald-55 border-emerald-200 text-emerald-800";
                  titleColor = "text-emerald-900";
                  title = "Import completed successfully!";
                  Icon = CheckCircle;
                } else {
                  bannerBg = "bg-blue-55 border-blue-200 text-blue-800";
                  titleColor = "text-blue-900";
                  title = "All records processed (No new inserts)";
                  Icon = Info;
                }

                return (
                  <div className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${bannerBg}`}>
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-current" />
                      <div>
                        <span className={`font-bold block text-sm ${titleColor}`}>{title}</span>
                        <div className="mt-3 space-y-1.5 text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                            <span className="text-emerald-800">"Success" = {successes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm"></span>
                            <span className="text-blue-800 font-bold">"Already exists" = {alreadyExists}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm"></span>
                            <span className="text-red-800">"Client ID already used for another user" = {conflicts}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Conflicts List */}
              {result.errors.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                      Detailed Import Warnings & Conflicts
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {result.errors.length} item(s) skipped or failed
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                      <thead className="bg-gray-50 sticky top-0 font-medium text-gray-500">
                        <tr>
                          <th className="px-4 py-2 bg-gray-100">Row</th>
                          <th className="px-4 py-2 bg-gray-100">Client ID</th>
                          <th className="px-4 py-2 bg-gray-100">Email</th>
                          <th className="px-4 py-2 bg-gray-100">Problem / Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                        {result.errors.map((e, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 font-semibold text-gray-500">#{e.row}</td>
                            <td className="px-4 py-2.5">
                              {e.client_id !== undefined ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800 font-mono">
                                  ID: {e.client_id}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-gray-600">
                              {e.email || <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                e.type === "conflict" || e.message.toLowerCase().includes("conflict") || e.message.toLowerCase().includes("already used")
                                  ? "bg-rose-50 text-rose-700 border border-rose-100"
                                  : "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}>
                                {e.message}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleUpload} disabled={!file} loading={uploading}>
              Import File
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
