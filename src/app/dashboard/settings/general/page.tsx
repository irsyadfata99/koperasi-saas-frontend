"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Save,
  Building,
  CreditCard,
  Loader2,
} from "lucide-react";

interface SettingItem {
  key: string;
  value: string;
  group: string;
  description: string;
}

export default function StoreSettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [company, setCompany] = useState({
    company_name: "",
    company_address: "",
    company_phone: "",
    company_website: "",
    company_city: "",
  });

  const [bank, setBank] = useState({
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await apiClient.get("/settings") as any;
        const raw: SettingItem[] = res?.data?.raw || res?.raw || [];

        const companyData: Record<string, string> = {};
        const bankData: Record<string, string> = {};

        raw.forEach((item) => {
          if (item.group === "COMPANY") companyData[item.key] = item.value || "";
          if (item.group === "BANK") bankData[item.key] = item.value || "";
        });

        setCompany((prev) => ({ ...prev, ...companyData }));
        setBank((prev) => ({ ...prev, ...bankData }));
      } catch {
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
      const settings = [
        { key: "company_name", value: company.company_name, group: "COMPANY" },
        { key: "company_address", value: company.company_address, group: "COMPANY" },
        { key: "company_phone", value: company.company_phone, group: "COMPANY" },
        { key: "company_website", value: company.company_website, group: "COMPANY" },
        { key: "company_city", value: company.company_city, group: "COMPANY" },
        { key: "bank_name", value: bank.bank_name, group: "BANK" },
        { key: "bank_account_number", value: bank.bank_account_number, group: "BANK" },
        { key: "bank_account_name", value: bank.bank_account_name, group: "BANK" },
      ];

      await apiClient.put("/settings/bulk", { settings });
      toast.success("Pengaturan toko berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Toko</h1>
        <p className="text-muted-foreground">
          Kelola informasi toko yang tampil di invoice dan struk cetak
        </p>
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Informasi Toko
          </CardTitle>
          <CardDescription>
            Data ini tampil di header struk dan invoice penjualan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="flex items-center gap-2">
                <Store className="h-4 w-4" /> Nama Toko *
              </Label>
              <Input
                id="company_name"
                value={company.company_name}
                onChange={(e) => setCompany((p) => ({ ...p, company_name: e.target.value }))}
                placeholder="Nama toko / koperasi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_city" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Kota
              </Label>
              <Input
                id="company_city"
                value={company.company_city}
                onChange={(e) => setCompany((p) => ({ ...p, company_city: e.target.value }))}
                placeholder="Contoh: Bandung"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Alamat Lengkap
            </Label>
            <Textarea
              id="company_address"
              value={company.company_address}
              onChange={(e) => setCompany((p) => ({ ...p, company_address: e.target.value }))}
              placeholder="Alamat lengkap toko Anda"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Nomor Telepon
              </Label>
              <Input
                id="company_phone"
                value={company.company_phone}
                onChange={(e) => setCompany((p) => ({ ...p, company_phone: e.target.value }))}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Website (Opsional)
              </Label>
              <Input
                id="company_website"
                value={company.company_website}
                onChange={(e) => setCompany((p) => ({ ...p, company_website: e.target.value }))}
                placeholder="www.example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Informasi Rekening Bank
          </CardTitle>
          <CardDescription>
            Tampil di invoice untuk transaksi KREDIT / transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Nama Bank</Label>
              <Input
                id="bank_name"
                value={bank.bank_name}
                onChange={(e) => setBank((p) => ({ ...p, bank_name: e.target.value }))}
                placeholder="Contoh: MANDIRI"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_number">Nomor Rekening</Label>
              <Input
                id="bank_account_number"
                value={bank.bank_account_number}
                onChange={(e) => setBank((p) => ({ ...p, bank_account_number: e.target.value }))}
                placeholder="0000-00-0000000-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account_name">Atas Nama</Label>
              <Input
                id="bank_account_name"
                value={bank.bank_account_name}
                onChange={(e) => setBank((p) => ({ ...p, bank_account_name: e.target.value }))}
                placeholder="Nama pemilik rekening"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Simpan Pengaturan
        </Button>
      </div>

      {user?.role !== "SUPER_ADMIN" && (
        <p className="text-center text-xs text-muted-foreground">
          * Pengaturan subscription dan sistem lainnya hanya dapat diubah oleh Super Admin
        </p>
      )}
    </div>
  );
}
