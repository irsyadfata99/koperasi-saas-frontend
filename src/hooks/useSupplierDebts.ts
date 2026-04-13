// ============================================
// FILE 3: src/hooks/useSupplierDebts.ts
// ============================================
import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api";
import {
  getSupplierDebts,
  getSupplierDebtDetail,
  getSupplierDebtsBySupplier,
  paySupplierDebt,
  exportSupplierDebts,
} from "@/services/debtService";
import {
  SupplierDebt,
  SupplierDebtSummary,
  PaySupplierDebtRequest,
  DebtFilters,
  DebtExportFilters,
} from "@/types/debt";
import { PaginatedResponse } from "@/types";

// ✅ FIXED FETCHER for paginated debts
const supplierDebtsFetcher = async (
  filters?: DebtFilters
): Promise<PaginatedResponse<SupplierDebt>> => {
  try {
    const response = await getSupplierDebts(filters);

    console.log("🔍 Supplier Debts Fetcher:", { filters, response });

    // getSupplierDebts already returns PaginatedResponse from apiClient
    if (response && response.data && response.pagination) {
      console.log("✅ Paginated response:", response.data.length, "debts");
      return response;
    }

    // Fallback: if response is just data array
    if (Array.isArray(response)) {
      console.log(
        "✅ Direct array (creating pagination):",
        response.length,
        "debts"
      );
      return {
        success: true,
        message: "Data retrieved successfully",
        data: response,
        pagination: {
          page: 1,
          limit: response.length,
          total: response.length,
          totalPages: 1,
        },
      };
    }

    console.warn("⚠️ Unexpected debt response structure:", response);
    return {
      success: false,
      message: "Unexpected response structure",
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error) {
    console.error("❌ Supplier debts fetcher error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch debts",
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
};

export function useSupplierDebts(filters?: DebtFilters) {
  const queryKey = `/payments/supplier-debts?${JSON.stringify(filters || {})}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<SupplierDebt>
  >(queryKey, () => supplierDebtsFetcher(filters), {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    onSuccess: (data) => {
      console.log(
        "✅ useSupplierDebts loaded:",
        data?.data?.length || 0,
        "debts"
      );
    },
  });

  return {
    debts: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSupplierDebt(debtId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<SupplierDebt>(
    debtId ? `/payments/supplier-debts/${debtId}` : null,
    debtId ? () => getSupplierDebtDetail(debtId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    debt: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSupplierDebtsBySupplier(supplierId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<SupplierDebtSummary>(
    supplierId ? `/payments/supplier-debts/supplier/${supplierId}/list` : null,
    supplierId ? () => getSupplierDebtsBySupplier(supplierId) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    summary: data,
    isLoading,
    isError: error,
    mutate,
  };
}

import { useAuth } from "@/hooks/useAuth";

export function useSupplierDebtActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // ✅ Get user context

  const payDebt = async (debtId: string, data: PaySupplierDebtRequest) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        clientId: user?.clientId,
      };
      const result = await paySupplierDebt(debtId, payload);
      toast.success("Pembayaran berhasil diproses", {
        description: `Sisa hutang: Rp ${result.debt.remainingAmount.toLocaleString(
          "id-ID"
        )}`,
      });
      return result;
    } catch (error) {
      const msg = extractApiError(error, "Gagal memproses pembayaran");
      toast.error("Pembayaran gagal", { description: msg });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async (filters?: DebtExportFilters) => {
    setIsLoading(true);
    try {
      const blob = await exportSupplierDebts(filters);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Hutang-Supplier-${new Date().toISOString().split("T")[0]
        }.xlsx`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export berhasil", {
        description: "File Excel berhasil diunduh",
      });
    } catch (error) {
      const msg = extractApiError(error, "Gagal export data");
      toast.error("Export gagal", { description: msg });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payDebt,
    exportToExcel,
    isLoading,
  };
}
