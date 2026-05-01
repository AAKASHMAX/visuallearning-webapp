"use client";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Users, Trash2, UserPlus, X, Search, ArrowLeft, Edit2, Check } from "lucide-react";

interface StudentGroup {
  id: string;
  name: string;
  createdAt: string;
  _count: { members: number };
}

interface GroupMember {
  id: string;
  user: { id: string; name: string; email: string };
}

interface SearchResult {
  id: string;
  name: string;
  email: string;
}

export default function StudentsPage() {
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  // Selected group state
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // Edit group name
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadGroups = useCallback(async () => {
    try {
      const { data } = await api.get("/student-groups");
      setGroups(data.data);
    } catch {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const loadMembers = useCallback(async (groupId: string) => {
    setMembersLoading(true);
    setSearchResults([]);
    setSearchQuery("");
    try {
      const { data } = await api.get(`/student-groups/${groupId}/members`);
      setMembers(data.data.members);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return toast.error("Group name is required");
    setCreating(true);
    try {
      await api.post("/student-groups", { name: newGroupName.trim() });
      toast.success("Group created!");
      setNewGroupName("");
      loadGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Delete this group? All members will be removed.")) return;
    try {
      await api.delete(`/student-groups/${id}`);
      toast.success("Group deleted");
      if (selectedGroup === id) { setSelectedGroup(null); setMembers([]); }
      loadGroups();
    } catch {
      toast.error("Failed to delete group");
    }
  };

  const handleUpdateGroupName = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await api.put(`/student-groups/${id}`, { name: editName.trim() });
      toast.success("Group renamed");
      setEditingId(null);
      loadGroups();
    } catch {
      toast.error("Failed to rename group");
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const { data } = await api.get(`/live-classes/search-users?q=${encodeURIComponent(searchQuery)}`);
      // Filter out users already in the group
      const memberIds = new Set(members.map((m) => m.user.id));
      setSearchResults(data.data.filter((u: SearchResult) => !memberIds.has(u.id)));
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return;
    try {
      await api.post(`/student-groups/${selectedGroup}/members`, { userIds: [userId] });
      toast.success("Member added");
      setSearchResults(searchResults.filter((u) => u.id !== userId));
      loadMembers(selectedGroup);
      loadGroups(); // Update count
    } catch {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;
    try {
      await api.delete(`/student-groups/${selectedGroup}/members/${userId}`);
      toast.success("Member removed");
      setMembers(members.filter((m) => m.user.id !== userId));
      loadGroups(); // Update count
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const selectGroup = (id: string) => {
    setSelectedGroup(id);
    loadMembers(id);
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Groups</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Group list */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wide">Groups</h2>

              {/* Create new group */}
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="New group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                  className="text-sm"
                />
                <Button size="sm" onClick={handleCreateGroup} disabled={creating}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {groups.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No groups yet. Create one above.</p>
              ) : (
                <div className="space-y-1">
                  {groups.map((g) => (
                    <div
                      key={g.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedGroup === g.id ? "bg-primary/10 border border-primary/30" : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0" onClick={() => selectGroup(g.id)}>
                        {editingId === g.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleUpdateGroupName(g.id)}
                              className="text-sm h-7"
                              autoFocus
                            />
                            <button onClick={() => handleUpdateGroupName(g.id)} className="text-green-600 hover:text-green-700">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-medium truncate">{g.name}</p>
                            <p className="text-xs text-gray-400">{g._count.members} members</p>
                          </>
                        )}
                      </div>
                      {editingId !== g.id && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingId(g.id); setEditName(g.name); }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Group members */}
        <div className="lg:col-span-2">
          {!selectedGroup ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-1">Select a Group</p>
                <p className="text-sm">Choose a group from the left to manage its members.</p>
              </CardContent>
            </Card>
          ) : membersLoading ? (
            <PageLoader />
          ) : (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Manage Members — {groups.find((g) => g.id === selectedGroup)?.name}
                </h2>

                {/* Search users */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Search students by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searching} variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg mb-4 max-h-48 overflow-y-auto">
                    {searchResults.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAddMember(u.id)}>
                          <UserPlus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Current members */}
                <h3 className="text-sm font-medium mb-2">Members ({members.length})</h3>
                {members.length === 0 ? (
                  <p className="text-sm text-gray-400">No members yet. Search and add students above.</p>
                ) : (
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 border-b last:border-0">
                        <div>
                          <p className="text-sm font-medium">{m.user.name}</p>
                          <p className="text-xs text-gray-400">{m.user.email}</p>
                        </div>
                        <button onClick={() => handleRemoveMember(m.user.id)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
