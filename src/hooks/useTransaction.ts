// ============================================
// FILE 2: src/hooks/useTransaction.ts
// ============================================
import useSWR from "swr";
import { Transaction } from "@/types";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

// ✅ Pagination interface
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TransactionsResponse {
  data: Transaction[];
  pagination: Pagination;
}

// ✅ FIXED FETCHER with pagination support
const transactionsFetcher = async (url: string): Promise<TransactionsResponse> => {
  try {
    const response = await apiClient.get<any>(url);

    console.log("🔍 Transactions Fetcher:", { url, response });

    // Case 1: Paginated response
    if (response && typeof response === "object" && !Array.isArray(response)) {
      if (response.data && Array.isArray(response.data)) {
        console.log("✅ Paginated response:", response.data.length, "transactions");
        return {
          data: response.data,
          pagination: response.pagination || { page: 1, limit: 10, total: response.data.length, totalPages: 1 },
        };
      }
    }

    // Case 2: Direct array
    if (Array.isArray(response)) {
      console.log("✅ Direct array:", response.length, "transactions");
      return {
        data: response,
        pagination: { page: 1, limit: 10, total: response.length, totalPages: 1 },
      };
    }

    console.warn("⚠️ Unexpected response structure:", response);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  } catch (error) {
    console.error("❌ Transactions fetcher error:", error);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
};

const transactionFetcher = async (url: string): Promise<Transaction | null> => {
  try {
    const response = await apiClient.get<Transaction>(url);
    return response;
  } catch (error) {
    console.error("❌ Transaction fetcher error:", error);
    return null;
  }
};

export function useTransactions(params?: any) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR<TransactionsResponse>(
    `/sales?${queryString}`,
    transactionsFetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (data) =>
        console.log("✅ useTransactions loaded:", data?.data?.length, "transactions"),
    }
  );

  return {
    transactions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTransaction(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Transaction | null>(
    id ? `/sales/${id}` : null,
    transactionFetcher,
    { revalidateOnFocus: false }
  );

  return {
    transaction: data,
    isLoading,
    isError: error,
    mutate,
  };
}

import { useAuth } from "@/hooks/useAuth";

export function useTransactionActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // ✅ Get user context

  // ✅ Helper to get clientId reliably (fallback to localStorage)
  const getClientId = (): string | null => {
    if (user?.clientId) return user.clientId;
    try {
      const storedUser = localStorage.getItem("user_data");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed.clientId || null;
      }
    } catch (e) {
      console.error("Failed to parse user_data from localStorage", e);
    }
    return null;
  };

  const createSale = async (data: any) => {
    setIsLoading(true);
    try {
      // ✅ Inject clientId if not already present
      const clientId = data.clientId || getClientId();

      if (!clientId) {
        throw new Error("Client ID tidak ditemukan. Silakan login ulang.");
      }

      const payload = {
        ...data,
        clientId,
        items: data.items?.map((item: any) => ({
          ...item,
          clientId,
        })),
      };
      const sale = await apiClient.post<Transaction>("/sales", payload);
      toast.success("Transaksi berhasil dibuat");
      return sale;
    } finally {
      setIsLoading(false);
    }
  };

  const printInvoice = (id: string) => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales/${id}/print/invoice`,
      "_blank"
    );
  };

  const printThermal = (id: string) => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sales/${id}/print/thermal`,
      "_blank"
    );
  };

  return { createSale, printInvoice, printThermal, isLoading };
}
