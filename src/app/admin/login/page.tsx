"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";
import { setAuth, AuthResponse } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiRequest<{ success: boolean; data: AuthResponse }>(
        "/auth/admin/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );
      setAuth(response.data.token, response.data.user);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <Shield className="h-12 w-12 mb-6 text-brand-400" />
          <h1 className="text-3xl font-bold mb-4">Admin Portal</h1>
          <p className="text-gray-400">
            Manage patients, upload health reports, and monitor clinic data.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900">Admin Sign in</h2>
          <p className="mt-2 text-gray-600">Authorized personnel only.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@clinic.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              Sign in as Admin
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
