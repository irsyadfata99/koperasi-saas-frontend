"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Activity, AlertTriangle } from "lucide-react";
import { useClients } from "@/hooks/useClient";
import { useAllUsers } from "@/hooks/useAllUsers";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function SuperAdminDashboard() {
    const { clients, isLoading: clientsLoading } = useClients();
    const { users, isLoading: usersLoading } = useAllUsers();

    const isLoading = clientsLoading || usersLoading;

    // Calculate stats
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "ACTIVE").length;
    const totalUsers = users.length;
    const expiringSoon = clients.filter(c => {
        if (!c.subscriptionEnd) return false;
        const endDate = new Date(c.subscriptionEnd);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                    Ringkasan status semua client dan user sistem
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalClients}</div>
                        <p className="text-xs text-muted-foreground">Toko terdaftar</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeClients}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0}% dari total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">Admin & Kasir semua toko</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{expiringSoon}</div>
                        <p className="text-xs text-muted-foreground">Subscription ends dalam 30 hari</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats Table */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active</span>
                                <span className="font-medium text-green-600">
                                    {clients.filter(c => c.status === "ACTIVE").length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Inactive</span>
                                <span className="font-medium text-gray-500">
                                    {clients.filter(c => c.status === "INACTIVE").length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Suspended</span>
                                <span className="font-medium text-red-500">
                                    {clients.filter(c => c.status === "SUSPENDED").length}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Subscription Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Free</span>
                                <span className="font-medium">
                                    {clients.filter(c => c.subscriptionPlan === "FREE").length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Basic</span>
                                <span className="font-medium text-blue-600">
                                    {clients.filter(c => c.subscriptionPlan === "BASIC").length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Premium</span>
                                <span className="font-medium text-purple-600">
                                    {clients.filter(c => c.subscriptionPlan === "PREMIUM").length}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
