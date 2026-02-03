"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin, Phone, Globe, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface SettingsData {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_website: string;
}

export default function StoreSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    company_name: "",
    company_address: "",
    company_phone: "",
    company_website: "",
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get("/settings?group=COMPANY");
        // apiClient returns { success, data, message } directly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = response as any;
        const rawSettings = res?.data?.raw || res?.raw || [];

        // Parse settings from raw format
        const parsed: Partial<SettingsData> = {};
        if (Array.isArray(rawSettings)) {
          rawSettings.forEach((item: { key: string; value: string }) => {
            if (item.key === "company_name") parsed.company_name = item.value || "";
            if (item.key === "company_address") parsed.company_address = item.value || "";
            if (item.key === "company_phone") parsed.company_phone = item.value || "";
            if (item.key === "company_website") parsed.company_website = item.value || "";
          });
        }

        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast.error("Gagal memuat pengaturan toko");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.put("/settings/bulk", {
        settings: [
          { key: "company_name", value: settings.company_name, group: "COMPANY" },
          { key: "company_address", value: settings.company_address, group: "COMPANY" },
          { key: "company_phone", value: settings.company_phone, group: "COMPANY" },
          { key: "company_website", value: settings.company_website, group: "COMPANY" },
        ],
      });
      toast.success("Pengaturan toko berhasil disimpan!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Toko</h1>
        <p className="text-muted-foreground">
          Kelola informasi toko yang akan tampil di invoice dan struk
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Informasi Toko
          </CardTitle>
          <CardDescription>
            Data ini akan ditampilkan pada struk dan invoice penjualan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Nama Toko
              </Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => setSettings((prev) => ({ ...prev, company_name: e.target.value }))}
                placeholder="Nama toko Anda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telepon
              </Label>
              <Input
                id="company_phone"
                value={settings.company_phone}
                onChange={(e) => setSettings((prev) => ({ ...prev, company_phone: e.target.value }))}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Alamat
            </Label>
            <Textarea
              id="company_address"
              value={settings.company_address}
              onChange={(e) => setSettings((prev) => ({ ...prev, company_address: e.target.value }))}
              placeholder="Alamat lengkap toko"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website (Opsional)
            </Label>
            <Input
              id="company_website"
              value={settings.company_website}
              onChange={(e) => setSettings((prev) => ({ ...prev, company_website: e.target.value }))}
              placeholder="https://www.example.com"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
              {isSaving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Pengaturan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
