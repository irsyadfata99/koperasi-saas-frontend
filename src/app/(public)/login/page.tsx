// src/app/(public)/login/page.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm as LoginFormType } from "@/lib/validations";
import { handleApiError } from "@/lib/api";
import { KeyRound } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LoginFormType) => {
    setIsLoading(true);

    try {
      await login(data);
      toast.success("Login berhasil!", {
        description: "Selamat datang di Koperasi POS",
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error("Login gagal", {
        description: errorMessage || "Periksa username dan password Anda.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Login Dashboard</h1>
            <p className="text-muted-foreground">Akses sistem Point of Sale</p>
          </div>

          {/* Login Form */}
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
