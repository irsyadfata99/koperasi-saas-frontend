// ============================================
// FILE 1: src/hooks/useSupplier.ts
// ============================================
import useSWR from "swr";
import { Supplier } from "@/types";
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

interface SuppliersResponse {
  data: Supplier[];
  pagination: Pagination;
}

// ✅ FIXED FETCHER with pagination support
const suppliersFetcher = async (url: string): Promise<SuppliersResponse> => {
  try {
    const response = await apiClient.get<any>(url);

    console.log("🔍 Suppliers Fetcher:", { url, response });

    // Case 1: Paginated response
    if (response && typeof response === "object" && !Array.isArray(response)) {
      if (response.data && Array.isArray(response.data)) {
        console.log("✅ Paginated response:", response.data.length, "suppliers");
        return {
          data: response.data,
          pagination: response.pagination || { page: 1, limit: 10, total: response.data.length, totalPages: 1 },
        };
      }
    }

    // Case 2: Direct array
    if (Array.isArray(response)) {
      console.log("✅ Direct array:", response.length, "suppliers");
      return {
        data: response,
        pagination: { page: 1, limit: 10, total: response.length, totalPages: 1 },
      };
    }

    console.warn("⚠️ Unexpected response structure:", response);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  } catch (error) {
    console.error("❌ Suppliers fetcher error:", error);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
};

const supplierFetcher = async (url: string): Promise<Supplier | null> => {
  try {
    const response = await apiClient.get<Supplier>(url);
    return response;
  } catch (error) {
    console.error("❌ Supplier fetcher error:", error);
    return null;
  }
};

export function useSuppliers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR<SuppliersResponse>(
    `/suppliers?${queryString}`,
    suppliersFetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (data) =>
        console.log("✅ useSuppliers loaded:", data?.data?.length, "suppliers"),
    }
  );

  return {
    suppliers: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSupplier(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Supplier | null>(
    id ? `/suppliers/${id}` : null,
    supplierFetcher,
    { revalidateOnFocus: false }
  );

  return {
    supplier: data,
    isLoading,
    isError: error,
    mutate,
  };
}

import { useAuth } from "@/hooks/useAuth";

export function useSupplierActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // ✅ Get user context

  const createSupplier = async (data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        clientId: user?.clientId, // ✅ Inject client_id
      };
      const supplier = await apiClient.post<Supplier>("/suppliers", payload);
      toast.success("Supplier berhasil ditambahkan");
      return supplier;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupplier = async (id: string, data: any) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        clientId: user?.clientId, // ✅ Inject client_id
      };
      const supplier = await apiClient.put<Supplier>(`/suppliers/${id}`, payload);
      toast.success("Supplier berhasil diupdate");
      return supplier;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    setIsLoading(true);
    try {
      await apiClient.delete(`/suppliers/${id}`);
      toast.success("Supplier berhasil dihapus");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string) => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/suppliers/${id}/toggle`, {});
      toast.success("Status supplier berhasil diubah");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleActive,
    isLoading,
  };
}
