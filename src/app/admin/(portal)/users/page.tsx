"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { UserListItem, PaginatedResponse } from "@/types";
import { Input } from "@/components/ui/Input";
import { PaginationControls } from "@/components/PaginationControls";
import { Card } from "@/components/ui/Card";
import { formatDate, debounce } from "@/lib/utils";
import { Search, Eye } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PaginatedResponse<UserListItem> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async (searchTerm: string, currentPage: number) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
      });
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      const response = await apiRequest<PaginatedResponse<UserListItem>>(
        `/admin/users?${params.toString()}`,
        { token }
      );
      setUsers(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setPage(1);
      fetchUsers(term, 1);
    }, 300),
    [fetchUsers]
  );

  useEffect(() => {
    fetchUsers(search, page);
  }, [page, fetchUsers]);

  function handleSearchChange(value: string) {
    setSearch(value);
    debouncedSearch(value);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patients</h1>
        <p className="mt-1 text-gray-600">Search and manage patient records.</p>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
          </div>
        ) : users && users.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Reports</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Latest Report</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Joined</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.map((user) => (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-gray-900">{user.name}</td>
                      <td className="py-3 px-2 text-gray-600">{user.email}</td>
                      <td className="py-3 px-2">{user.reportCount}</td>
                      <td className="py-3 px-2">
                        {user.latestReportDate
                          ? formatDate(user.latestReportDate)
                          : "—"}
                      </td>
                      <td className="py-3 px-2">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.pagination && (
              <PaginationControls
                pagination={users.pagination}
                onPageChange={setPage}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-12">No patients found.</p>
        )}
      </Card>
    </div>
  );
}
