// ============================================
// src/hooks/usePurchase.ts
// ============================================
"use client";
import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import { Purchase, PurchaseStats, CreatePurchaseRequest } from "@/types";

export function usePurchases(params?: any) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();

  const { data, error, isLoading, mutate } = useSWR<Purchase[]>(
    `/purchases?${queryString}`,
    (url) => arrayFetcher<Purchase>(url),
    { revalidateOnFocus: false, dedupingInterval: 5000 },
  );

  return {
    purchases: ensureArray(data),
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePurchase(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Purchase | null>(
    id ? `/purchases/${id}` : null,
    (url) => itemFetcher<Purchase>(url),
    { revalidateOnFocus: false },
  );

  return {
    purchase: data,
    isLoading,
    isError: error,
    mutate,
  };
}

import { useAuth } from "@/hooks/useAuth";

export function usePurchaseActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // ✅ Get user context

  // ✅ Helper to get clientId reliably (fallback to localStorage)
  const getClientId = (): string | null => {
    console.log("🔍 getClientId - user from hook:", user);
    console.log("🔍 getClientId - user.clientId from hook:", user?.clientId);
    if (user?.clientId) return user.clientId;
    try {
      const storedUser = localStorage.getItem("user_data");
      console.log("🔍 getClientId - storedUser from localStorage:", storedUser);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        console.log("🔍 getClientId - parsed.clientId:", parsed?.clientId);
        return parsed.clientId || null;
      }
    } catch (e) {
      console.error("Failed to parse user_data from localStorage", e);
    }
    return null;
  };

  const createPurchase = async (data: CreatePurchaseRequest) => {
    setIsLoading(true);
    try {
      const clientId = getClientId();
      if (!clientId) {
        throw new Error("Client ID tidak ditemukan. Silakan login ulang.");
      }

      const payload = {
        ...data,
        clientId, // ✅ Inject client_id
        items: data.items.map((item) => ({
          ...item,
          clientId,
        })),
      };
      const purchase = await apiClient.post<Purchase>("/purchases", payload);
      toast.success("Pembelian berhasil dibuat", {
        description: `Invoice: ${purchase.invoiceNumber}`,
      });
      return purchase;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayment = async (
    purchaseId: string,
    data: { amount: number; notes?: string },
  ) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        clientId: user?.clientId, // ✅ Inject client_id
      };
      const purchase = await apiClient.patch<Purchase>(
        `/purchases/${purchaseId}/pay`,
        payload,
      );
      toast.success("Pembayaran berhasil diupdate");
      return purchase;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPurchase, updatePayment, isLoading };
}
