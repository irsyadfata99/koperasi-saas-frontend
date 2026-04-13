"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { extractApiError } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Loader2, UserCircle, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { DataPagination } from "@/components/shared/data-pagination";

interface UserItem {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const LIMIT = 10;

export default function UsersSettingsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "KASIR",
    isActive: true,
  });

  const fetchUsers = useCallback(async (currentPage = page, searchQuery = search) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(LIMIT),
      });
      if (searchQuery) params.append("search", searchQuery);

      const res = await apiClient.get<any>(`/users?${params.toString()}`);
      // Handle paginated response
      if (res && res.data && Array.isArray(res.data)) {
        setUsers(res.data);
        if (res.pagination) setPagination(res.pagination);
      } else if (Array.isArray(res)) {
        setUsers(res);
        setPagination(null);
      } else {
        setUsers([]);
      }
    } catch {
      toast.error("Gagal memuat data pengguna");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers(page, search);
  }, [page, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleOpenDialog = (user?: UserItem) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        email: user.email || "",
        password: "",
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "KASIR",
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedUser) {
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        await apiClient.put(`/users/${selectedUser.id}`, updateData);
        toast.success("Pengguna berhasil diupdate");
      } else {
        if (!formData.password) {
          toast.error("Password wajib diisi untuk pengguna baru");
          return;
        }
        await apiClient.post("/users", {
          ...formData,
          clientId: currentUser?.clientId,
        });
        toast.success("Pengguna berhasil ditambahkan");
      }
      setIsDialogOpen(false);
      fetchUsers(page, search);
    } catch (error: any) {
      const msg = extractApiError(error, "Gagal menyimpan pengguna");
      toast.error("Gagal menyimpan", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (user: UserItem) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`/users/${selectedUser.id}`);
      toast.success("Pengguna berhasil dihapus");
      setIsDeleteDialogOpen(false);
      // Go back a page if we deleted the last item on a page
      const newPage = users.length === 1 && page > 1 ? page - 1 : page;
      setPage(newPage);
      fetchUsers(newPage, search);
    } catch (error: any) {
      const msg = extractApiError(error, "Gagal menghapus pengguna");
      toast.error("Gagal menghapus", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Kelola Akses Pengguna</h1>
          <p className="text-muted-foreground">
            Kelola akun staf dan kasir untuk toko Anda
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Daftar Pengguna
          </CardTitle>
          <CardDescription>
            Seluruh akun yang terdaftar pada toko ini
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau username..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-8"
                        >
                          {search
                            ? `Tidak ada pengguna dengan kata kunci "${search}"`
                            : "Belum ada data pengguna"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserCircle className="h-8 w-8 text-muted-foreground shrink-0" />
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  @{user.username}{" "}
                                  {user.email && `• ${user.email}`}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "ADMIN" ? "default" : "secondary"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.isActive ? "default" : "destructive"
                              }
                              className={
                                user.isActive
                                  ? "bg-green-600 hover:bg-green-600"
                                  : ""
                              }
                            >
                              {user.isActive ? "Aktif" : "Non-aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(user)}
                            >
                              Edit
                            </Button>
                            {user.id !== currentUser?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && (
                <DataPagination
                  page={page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={LIMIT}
                  onPageChange={handlePageChange}
                  itemLabel="pengguna"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
            <DialogDescription>
              Pastikan username unik dan mudah diingat oleh staf Anda
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username Log In</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="johndoe123"
                disabled={!!selectedUser}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  selectedUser
                    ? "Kosongkan jika tidak ingin mengubah password"
                    : "Password (minimal 6 karakter)"
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role / Jabatan</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KASIR">Kasir (Transaksi Saja)</SelectItem>
                  <SelectItem value="STAFF">
                    Staff (Transaksi & Inventory)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedUser && (
              <div className="grid gap-2">
                <Label htmlFor="status">Status Akun</Label>
                <Select
                  value={formData.isActive ? "true" : "false"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif (Bisa Log In)</SelectItem>
                    <SelectItem value="false">
                      Non-aktif (Akses Diblokir)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {selectedUser ? "Simpan Perubahan" : "Simpan Pengguna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus akun{" "}
              <strong>{selectedUser?.name}</strong>? Jika pengguna sudah
              memiliki riwayat transaksi, Anda tidak dapat menghapusnya — mohon
              ubah statusnya menjadi Non-aktif saja.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
