"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { getToken } from "@/lib/auth";
import { apiUpload } from "@/lib/api";
import { CsvUploadResult } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CsvUploadResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(selected: File) {
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file");
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

  function downloadSampleCsv() {
    const headers =
      "email,reportDate,bloodPressureSystolic,bloodPressureDiastolic,heartRate,temperature,weight,glucose,cholesterol,notes";
    const sample =
      "john.smith@email.com,2025-06-01,120,80,72,98.6,175,95,180,Regular checkup";
    const blob = new Blob([`${headers}\n${sample}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_health_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upload Health Reports</h1>
        <p className="mt-1 text-gray-600">
          Import patient health data from a CSV file. Users must already exist in the system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="CSV Format" className="lg:col-span-1">
          <div className="space-y-3 text-sm text-gray-600">
            <p>Required columns:</p>
            <ul className="list-disc list-inside space-y-1 text-xs font-mono bg-gray-50 p-3 rounded-lg">
              <li>email</li>
              <li>reportDate</li>
              <li>bloodPressureSystolic</li>
              <li>bloodPressureDiastolic</li>
              <li>heartRate</li>
              <li>temperature</li>
              <li>weight</li>
              <li>glucose</li>
              <li>cholesterol</li>
              <li>notes (optional)</li>
            </ul>
            <Button variant="secondary" size="sm" onClick={downloadSampleCsv} className="w-full">
              <Download className="h-4 w-4" />
              Download Sample CSV
            </Button>
          </div>
        </Card>

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
              accept=".csv"
              onChange={handleInputChange}
              className="hidden"
            />
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                <span className="font-medium text-gray-900">{file.name}</span>
                <span className="text-sm text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ) : (
              <>
                <p className="text-gray-700 font-medium">
                  Drag and drop your CSV file here
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse</p>
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
            <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="h-5 w-5" />
                {message}
              </div>
              {result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                  <ul className="text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto">
                    {result.errors.map((e, i) => (
                      <li key={i}>
                        Row {e.row}: {e.message}
                        {e.email && ` (${e.email})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleUpload} disabled={!file} loading={uploading}>
              Upload Reports
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
