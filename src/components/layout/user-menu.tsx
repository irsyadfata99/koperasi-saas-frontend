// src/components/layout/user-menu.tsx

"use client";

import { useCurrentUser } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, User, Home, Store } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const user = useCurrentUser();
  const pathname = usePathname();

  if (!user) return null;

  // Detect if we're in superadmin section
  const isSuperadminSection = pathname?.startsWith("/superadmin");
  const homeLink = isSuperadminSection ? "/superadmin" : "/dashboard";
  const profileLink = isSuperadminSection ? "/superadmin" : "/dashboard/settings/profile";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Role: {user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={homeLink} className="cursor-pointer">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </DropdownMenuItem>
        {!isSuperadminSection && (
          <DropdownMenuItem asChild>
            <Link href={profileLink} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        )}
        {!isSuperadminSection && user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/general" className="cursor-pointer">
              <Store className="mr-2 h-4 w-4" />
              Pengaturan Toko
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/logout" className="cursor-pointer text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
