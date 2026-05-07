"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Ban, CheckCircle, Search, Trash2, Users, X } from "lucide-react";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<UserItem | null>(null);

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

  async function deleteUser() {
    if (!deleteCandidate) return;

    setDeletingId(deleteCandidate.id);
    try {
      const res = await api.delete(`/admin/users/${deleteCandidate.id}`);
      toast.success(res.data.message || "User deleted");
      setDeleteCandidate(null);
      if (users.length === 1 && page > 1) {
        setPage((value) => value - 1);
      } else {
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
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
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">Actions</th>
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
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleBlock(user.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          user.blocked ? "bg-success/10 text-success hover:bg-success/20" : "bg-danger/10 text-danger hover:bg-danger/20"
                        }`}
                      >
                        {user.blocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        onClick={() => setDeleteCandidate(user)}
                        disabled={deletingId === user.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
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

      {deleteCandidate && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-danger/30 bg-card p-6 shadow-[0_24px_90px_rgba(0,0,0,0.5)]">
            <button
              type="button"
              onClick={() => setDeleteCandidate(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-light hover:text-text-bright"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 className="mb-3 pr-8 text-xl font-black text-text-bright">Delete user account?</h2>
            <p className="mb-5 text-sm leading-relaxed text-text-muted">
              This will permanently remove the account for <span className="font-bold text-text-bright">{deleteCandidate.name}</span>, including subscription access and watch progress. Feedback messages from this user will stay in admin records but will no longer be linked to the deleted account.
            </p>
            <div className="mb-6 rounded-xl border border-border bg-surface/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Email</p>
              <p className="mt-1 break-words text-sm font-semibold text-text-bright">{deleteCandidate.email}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={deleteUser}
                disabled={deletingId === deleteCandidate.id}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deletingId === deleteCandidate.id ? "Deleting..." : "Delete User"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 rounded-xl border-2 border-accent px-5 py-3 text-sm font-bold text-accent transition-colors hover:bg-accent/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
