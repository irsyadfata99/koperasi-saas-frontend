"use client";

import { useAllUsers, useUserActions, SystemUser } from "@/hooks/useAllUsers";
import { useClients } from "@/hooks/useClient";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon, MoreHorizontal, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ResetPasswordDialog } from "@/components/superadmin/reset-password-dialog";
import { CreateUserDialog } from "@/components/superadmin/create-user-dialog";
import { Plus } from "lucide-react";

export default function UsersPage() {
    const { users, isLoading: usersLoading, mutate, isError } = useAllUsers();
    const { clients, isLoading: clientsLoading } = useClients(); // Fetch clients for lookup
    const { deleteUser } = useUserActions();

    const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const getClientInfo = (clientId?: string) => {
        if (!clientId) return null;
        return clients.find(c => c.id === clientId);
    };

    const handleDelete = async (user: SystemUser) => {
        if (confirm(`Are you sure you want to delete user ${user.username}?\nThis cannot be undone.`)) {
            try {
                await deleteUser(user.id);
                mutate(); // Refresh list
            } catch (e) {
                console.error(e);
            }
        }
    }

    const isLoading = usersLoading || clientsLoading;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-64 items-center justify-center text-destructive">
                Error loading users
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Users</h2>
                    <p className="text-muted-foreground">
                        View all registered Admins and Cashiers across all stores.
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Tenant/Client</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <UserIcon className="mb-2 h-8 w-8" />
                                        No users found
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => {
                                const client = getClientInfo(user.clientId || undefined);
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {client ? (
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-semibold">{client.code}</span>
                                                    <span className="text-xs text-muted-foreground">{client.businessName}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">
                                                    {user.role === 'SUPER_ADMIN' ? 'Platform Admin' : 'Unlinked'}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? "default" : "secondary"}>
                                                {user.isActive ? "ACTIVE" : "INACTIVE"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsResetOpen(true);
                                                    }}>
                                                        <KeyRound className="mr-2 h-4 w-4" />
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(user)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <ResetPasswordDialog
                open={isResetOpen}
                onOpenChange={setIsResetOpen}
                user={selectedUser}
            />

            <CreateUserDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => mutate()}
            />
        </div>
    );
}
