// src/hooks/useMember.ts - COMPLETE REPLACEMENT
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Member } from "@/types";
import { toast } from "sonner";

// ✅ Define pagination interface
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ✅ Define proper interface for member stats
interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  totalPoints: number;
  totalTransactions: number;
}

interface UseMembersParams {
  search?: string;
  regionCode?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface MembersResponse {
  data: Member[];
  pagination: Pagination;
}

// ✅ FIXED FETCHER - Handle berbagai struktur response + return pagination
const membersFetcher = async (url: string): Promise<MembersResponse> => {
  try {
    const response = await apiClient.get<any>(url);

    console.log("🔍 Members Fetcher - Response:", { url, response });

    // ✅ Case 1: Response punya data dan pagination (paginated response)
    if (response && typeof response === "object" && !Array.isArray(response)) {
      if (response.data && Array.isArray(response.data)) {
        console.log("✅ Paginated response:", response.data.length, "members");
        return {
          data: response.data,
          pagination: response.pagination || { page: 1, limit: 10, total: response.data.length, totalPages: 1 },
        };
      }
    }

    // ✅ Case 2: Response adalah array langsung
    if (Array.isArray(response)) {
      console.log("✅ Direct array response:", response.length, "members");
      return {
        data: response,
        pagination: { page: 1, limit: 10, total: response.length, totalPages: 1 },
      };
    }

    console.warn("⚠️ Unexpected members response structure:", response);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  } catch (error) {
    console.error("❌ Members fetcher error:", error);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
};

// ✅ FIXED STATS FETCHER
const statsFetcher = async (url: string): Promise<MemberStats> => {
  try {
    console.log("🔍 Stats Fetcher - URL:", url);

    const response = await apiClient.get<any>(url);

    console.log("🔍 Stats Fetcher - Raw Response:", response);

    // ✅ Handle berbagai struktur response dari backend
    let stats: MemberStats;

    // Case 1: response sudah dalam format yang benar
    if (response && response.totalMembers !== undefined) {
      stats = {
        totalMembers: response.totalMembers || 0,
        activeMembers: response.activeMembers || 0,
        totalPoints: response.totalPoints || 0,
        totalTransactions: response.totalTransactions || 0,
      };
    }
    // Case 2: data ada di response.data
    else if (response && response.data) {
      stats = {
        totalMembers: response.data.totalMembers || 0,
        activeMembers: response.data.activeMembers || 0,
        totalPoints: response.data.totalPoints || 0,
        totalTransactions: response.data.totalTransactions || 0,
      };
    }
    // Case 3: default values jika struktur tidak dikenali
    else {
      console.warn("⚠️ Unexpected stats structure, using defaults");
      stats = {
        totalMembers: 0,
        activeMembers: 0,
        totalPoints: 0,
        totalTransactions: 0,
      };
    }

    console.log("✅ Processed stats:", stats);
    return stats;
  } catch (err) {
    console.error("❌ Error fetching member stats:", err);

    // Return default values on error
    return {
      totalMembers: 0,
      activeMembers: 0,
      totalPoints: 0,
      totalTransactions: 0,
    };
  }
};

export function useMembers(params?: UseMembersParams) {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append("search", params.search);
  if (params?.regionCode) queryParams.append("regionCode", params.regionCode);
  if (params?.isActive !== undefined)
    queryParams.append("isActive", String(params.isActive));
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const queryString = queryParams.toString();
  const endpoint = `/members${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<MembersResponse>(
    endpoint,
    membersFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onSuccess: (data) => {
        console.log("✅ useMembers - Data loaded:", data?.data?.length, "members");
      },
      onError: (error) => {
        console.error("❌ useMembers - Error:", error);
      },
    }
  );

  return {
    members: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

// ✅ Fixed useMemberStats
export function useMemberStats() {
  const { data, error, isLoading, mutate } = useSWR<MemberStats>(
    "/members/stats",
    statsFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
      onError: (err) => {
        console.error("❌ useMemberStats - SWR Error:", err);
      },
      onSuccess: (data) => {
        console.log("✅ useMemberStats - Data loaded:", data);
      },
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    mutate,
  };
}

import { useAuth } from "@/hooks/useAuth";

export function useMemberActions() {
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

  const updateMember = async (id: string, data: Partial<Member>) => {
    try {
      const clientId = getClientId();
      if (!clientId) {
        throw new Error("Client ID tidak ditemukan. Silakan login ulang.");
      }
      const payload = {
        ...data,
        clientId, // ✅ Inject client_id
      };
      const response = await apiClient.put<Member>(`/members/${id}`, payload);
      toast.success("Data member berhasil diperbarui");
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui member";
      toast.error(message);
      throw error;
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const response = await apiClient.patch<Member>(
        `/members/${id}/toggle-active`,
        {}
      );
      toast.success("Status member berhasil diubah");
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengubah status";
      toast.error(message);
      throw error;
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await apiClient.delete(`/members/${id}`);
      toast.success("Member berhasil dihapus");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus member";
      toast.error(message);
      throw error;
    }
  };

  const createMember = async (data: any) => {
    try {
      const clientId = getClientId();
      if (!clientId) {
        throw new Error("Client ID tidak ditemukan. Silakan login ulang.");
      }

      const payload = {
        ...data,
        clientId, // ✅ Inject client_id
      };

      console.log("Creating member with payload:", payload);

      const response = await apiClient.post<Member>("/members/register", payload);
      toast.success("Member berhasil ditambahkan");
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menambahkan member";
      toast.error(message);
      throw error;
    }
  };

  return {
    updateMember,
    toggleActive,
    deleteMember,
    createMember,
    isLoading: false, // This seems to be static, maybe should be derived from request state if needed
  };
}
