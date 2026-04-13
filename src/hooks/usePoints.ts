// src/hooks/usePoints.ts
"use client";

import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { extractApiError } from "@/lib/api";
import {
  getPointSettings,
  updatePointSettings,
  getPointTransactions,
  exportPointTransactions,
  getMemberPointSummary,
  getMemberPointHistory,
  redeemPoints,
  adjustPoints,
  expirePoints,
  previewPointCalculation,
  validatePointRedemption,
} from "@/services/pointService";
import {
  PointTransaction,
  PointSummary,
  PointSettings,
  UpdatePointSettingsRequest,
  RedeemPointsRequest,
  AdjustPointsRequest,
  PointPreviewItem,
  ValidateRedemptionRequest,
  PointTransactionFilters,
  PointExportFilters,
  MemberPointHistory,
} from "@/types/point";
import { PaginatedResponse } from "@/types";

// ============================================
// POINT SETTINGS
// ============================================
export function usePointSettings() {
  const { data, error, isLoading, mutate } = useSWR<PointSettings>(
    "/points/settings",
    () => getPointSettings(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    settings: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// POINT TRANSACTIONS (ADMIN)
// ============================================
export function usePointTransactions(filters?: PointTransactionFilters) {
  const queryKey = `/points/transactions?${JSON.stringify(filters || {})}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<PointTransaction>
  >(queryKey, () => getPointTransactions(filters), {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    transactions: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

// ============================================
// MEMBER POINT SUMMARY
// ============================================
export function useMemberPointSummary(memberId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PointSummary>(
    memberId ? `/points/member/${memberId}` : null,
    memberId ? () => getMemberPointSummary(memberId) : null,
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

// ============================================
// MEMBER POINT HISTORY
// ============================================
export function useMemberPointHistory(
  memberId: string | null,
  filters?: { page?: number; limit?: number; type?: string }
) {
  const queryKey = `/points/member/${memberId}/history?${JSON.stringify(
    filters || {}
  )}`;

  const { data, error, isLoading, mutate } = useSWR<MemberPointHistory>(
    memberId ? queryKey : null,
    memberId ? () => getMemberPointHistory(memberId, filters) : null,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    history: data,
    isLoading,
    isError: error,
    mutate,
  };
}

import { useAuth } from "@/hooks/useAuth";

// ============================================
// POINT ACTIONS
// ============================================
export function usePointActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // ✅ Get user context

  /**
   * Update point settings (ADMIN only)
   */
  const updateSettings = async (data: UpdatePointSettingsRequest) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        clientId: user?.clientId,
      };
      const settings = await updatePointSettings(payload);
      toast.success("Pengaturan point berhasil diupdate");
      return settings;
    } catch (error) {
      toast.error("Update gagal", {
        description: extractApiError(error, "Gagal update pengaturan"),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Redeem member points
   */
  const redeem = async (data: RedeemPointsRequest) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        clientId: user?.clientId,
      };
      const result = await redeemPoints(payload);
      toast.success("Point berhasil ditukar", {
        description: `${data.points
          } point = Rp ${result.pointValue.toLocaleString("id-ID")}`,
      });
      return result;
    } catch (error) {
      toast.error("Penukaran gagal", {
        description: extractApiError(error, "Gagal tukar point"),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adjust points manually (ADMIN only)
   */
  const adjust = async (data: AdjustPointsRequest) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        clientId: user?.clientId,
      };
      const transaction = await adjustPoints(payload);
      toast.success("Penyesuaian point berhasil", {
        description: `${data.points > 0 ? "+" : ""}${data.points} point - ${data.description
          }`,
      });
      return transaction;
    } catch (error) {
      toast.error("Penyesuaian gagal", {
        description: extractApiError(error, "Gagal melakukan penyesuaian"),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Expire old points (ADMIN only)
   */
  const expire = async () => {
    setIsLoading(true);
    try {
      const payload = {
        clientId: user?.clientId || undefined,
      };
      const result = await expirePoints(payload);
      toast.success("Proses expire point selesai", {
        description: `${result.totalExpired} transaksi point kadaluarsa`,
      });
      return result;
    } catch (error) {
      toast.error("Proses gagal", {
        description: extractApiError(error, "Gagal expire point"),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Preview point calculation
   */
  const preview = async (items: PointPreviewItem[]) => {
    setIsLoading(true);
    try {
      const result = await previewPointCalculation(items);
      return result;
    } catch (error) {
      toast.error("Kalkulasi gagal", {
        description: extractApiError(error, "Gagal menghitung point"),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Validate point redemption
   */
  const validate = async (data: ValidateRedemptionRequest) => {
    setIsLoading(true);
    try {
      const result = await validatePointRedemption(data);
      return result;
    } catch (error) {
      toast.error("Validasi gagal", {
        description: extractApiError(error, "Gagal validasi point"),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Export point transactions to Excel (ADMIN only)
   */
  const exportToExcel = async (filters?: PointExportFilters) => {
    setIsLoading(true);
    try {
      const blob = await exportPointTransactions(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Transaksi-Point-${new Date().toISOString().split("T")[0]
        }.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Export berhasil", {
        description: "File Excel berhasil diunduh",
      });
    } catch (error) {
      toast.error("Export gagal", {
        description: extractApiError(error, "Gagal export data"),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateSettings,
    redeem,
    adjust,
    expire,
    preview,
    validate,
    exportToExcel,
    isLoading,
  };
}
