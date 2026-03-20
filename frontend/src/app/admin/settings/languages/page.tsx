"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Globe, Save, Plus, Trash2, X } from "lucide-react";

interface LangItem {
  key: string;
  label: string;
}

export default function LanguageSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [languages, setLanguages] = useState<LangItem[]>([]);
  const [showAddLang, setShowAddLang] = useState(false);
  const [newLangKey, setNewLangKey] = useState("");
  const [newLangLabel, setNewLangLabel] = useState("");

  useEffect(() => {
    api.get("/admin/settings").then(({ data }) => {
      const rawLangs = data.data.enabledLanguages;
      const normalized: LangItem[] = rawLangs.map((l: any) =>
        typeof l === "string" ? { key: l, label: l.charAt(0) + l.slice(1).toLowerCase() } : l
      );
      setLanguages(normalized);
    }).finally(() => setLoading(false));
  }, []);

  const addLanguage = () => {
    const key = newLangKey.toUpperCase().replace(/[^A-Z_]/g, "");
    if (!key || !newLangLabel.trim()) {
      toast.error("Both key and label are required");
      return;
    }
    if (languages.some((l) => l.key === key)) {
      toast.error("Language key already exists");
      return;
    }
    setLanguages([...languages, { key, label: newLangLabel.trim() }]);
    setNewLangKey("");
    setNewLangLabel("");
    setShowAddLang(false);
  };

  const removeLanguage = (key: string) => {
    if (key === "ENGLISH") return;
    setLanguages(languages.filter((l) => l.key !== key));
  };

  const saveLanguages = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/languages", { enabledLanguages: languages });
      toast.success("Language settings saved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Language Settings</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Languages</h2>
            </div>
            <Button size="sm" onClick={() => setShowAddLang(!showAddLang)}>
              {showAddLang ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Add Language</>}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Manage languages available on the platform. English cannot be removed (it&apos;s the fallback).
          </p>

          {showAddLang && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Add New Language</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input
                  label="Key (e.g. KANNADA)"
                  value={newLangKey}
                  onChange={(e) => setNewLangKey(e.target.value.toUpperCase().replace(/[^A-Z_]/g, ""))}
                  placeholder="KANNADA"
                />
                <Input
                  label="Display Label"
                  value={newLangLabel}
                  onChange={(e) => setNewLangLabel(e.target.value)}
                  placeholder="Kannada"
                />
              </div>
              <Button size="sm" onClick={addLanguage}>Add Language</Button>
            </div>
          )}

          <div className="space-y-2 mb-6">
            {languages.map((lang) => (
              <div key={lang.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{lang.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{lang.key}</span>
                  {lang.key === "ENGLISH" && <Badge variant="info">Required</Badge>}
                </div>
                {lang.key !== "ENGLISH" && (
                  <button onClick={() => removeLanguage(lang.key)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button onClick={saveLanguages} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save Language Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
