"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SuperAdminSidebar } from "@/components/layout/superadmin-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        // Responsive sidebar init
        if (typeof window !== "undefined") {
            setIsSidebarOpen(window.innerWidth >= 1024);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login?redirect=/superadmin");
            } else if (user.role !== "SUPER_ADMIN") {
                router.push("/dashboard");
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !isAuthorized || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <SuperAdminSidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AppHeader
                    user={user}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
