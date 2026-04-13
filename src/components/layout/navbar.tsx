// src/components/layout/navbar.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/login" className="flex items-center space-x-2">
            <div className="text-xl font-bold text-primary">Koperasi POS</div>
          </Link>

          {/* Navigation */}
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
