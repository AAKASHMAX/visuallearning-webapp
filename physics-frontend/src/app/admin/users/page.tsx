"use client";

import { useEffect, useState } from "react";
import { Users, Search, Ban, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface UserItem {
  id: string;
  name: string;
  email: string;
  blocked: boolean;
  createdAt: string;
  subscription: { plan: string; status: string; expiryDate: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=20&search=${search}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch { toast.error("Failed to load users"); }
    setLoading(false);
  }

  async function toggleBlock(id: string) {
    try {
      const res = await api.patch(`/admin/users/${id}/block`);
      toast.success(res.data.message);
      fetchUsers();
    } catch { toast.error("Failed to update user"); }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Users</h1>
          <p className="text-text-muted text-sm mt-1">{total} total students</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-11"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-light/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Plan</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Joined</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-surface-light rounded animate-pulse" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-surface-light/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-text-bright font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-text-muted">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      user.subscription?.plan === "ADVANCE" ? "bg-secondary/10 text-secondary-light" :
                      user.subscription?.plan === "BASIC" ? "bg-accent/10 text-accent" :
                      "bg-surface-light text-text-muted"
                    }`}>
                      {user.subscription?.plan || "Free"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {user.blocked ? (
                      <span className="text-xs text-danger flex items-center gap-1"><Ban className="w-3 h-3" />Blocked</span>
                    ) : (
                      <span className="text-xs text-success flex items-center gap-1"><CheckCircle className="w-3 h-3" />Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleBlock(user.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        user.blocked ? "bg-success/10 text-success hover:bg-success/20" : "bg-danger/10 text-danger hover:bg-danger/20"
                      }`}
                    >
                      {user.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === i + 1 ? "bg-accent text-primary" : "bg-surface-light text-text-muted hover:text-text-bright"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
