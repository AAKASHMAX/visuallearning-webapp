"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface UserRow {
  id: string; name: string; email: string; blocked: boolean; createdAt: string;
  subscription: { plan: string; expiryDate: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = () => {
    setLoading(true);
    api.get(`/admin/users?page=${page}&search=${search}`).then(({ data }) => {
      setUsers(data.data.users);
      setTotalPages(data.data.totalPages);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [page, search]);

  const toggleBlock = async (id: string) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}/block`);
      toast.success(data.message);
      load();
    } catch { toast.error("Failed to update user"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="mb-4 max-w-md">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      {loading ? <PageLoader /> : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left bg-gray-50">
                <th className="p-4">User ID</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Subscription</th><th className="p-4">Status</th><th className="p-4">Actions</th>
              </tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="p-4">
                      <button
                        className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        title="Click to copy"
                        onClick={() => { navigator.clipboard.writeText(u.id); toast.success("User ID copied!"); }}
                      >
                        {u.id.slice(0, 8)}...
                      </button>
                    </td>
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-gray-500">{u.email}</td>
                    <td className="p-4">{u.subscription ? <Badge variant="success">{u.subscription.plan}</Badge> : <Badge variant="default">None</Badge>}</td>
                    <td className="p-4">{u.blocked ? <Badge variant="danger">Blocked</Badge> : <Badge variant="success">Active</Badge>}</td>
                    <td className="p-4">
                      <Button variant={u.blocked ? "default" : "destructive"} size="sm" onClick={() => toggleBlock(u.id)}>
                        {u.blocked ? "Unblock" : "Block"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      <div className="flex gap-2 mt-4 justify-center">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
