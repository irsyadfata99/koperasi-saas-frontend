"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Lock, Shield, Building2, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      await apiClient.put(`/users/${user.id}`, { name, email });
      toast.success("Profil berhasil diperbarui");
      refreshUser?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui profil";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Validation
    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.put(`/users/${user.id}`, { password: newPassword });
      toast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengubah password";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profil Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola informasi akun dan keamanan
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Akun
            </CardTitle>
            <CardDescription>
              Detail akun Anda saat ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Client ID</p>
                <p className="font-medium font-mono text-xs">{user.clientId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Edit Profil
            </CardTitle>
            <CardDescription>
              Perbarui nama dan email Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                />
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Ubah Password
            </CardTitle>
            <CardDescription>
              Perbarui password untuk keamanan akun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru (min 6 karakter)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                />
              </div>

              <Button type="submit" variant="destructive" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Ubah Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
