"use client";

import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient, extractApiError } from "@/lib/api";
import { arrayFetcher } from "@/lib/swr-fetcher";

export interface Client {
    id: string;
    code: string;
    businessName: string;
    ownerName?: string;
    email?: string; // Optional if not in schema, keeping for auth if distinct
    phone?: string;
    address?: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    subscriptionPlan: "FREE" | "BASIC" | "PREMIUM";
    subscriptionEnd?: string;
    createdAt: string;
}

export interface CreateClientPayload {
    code?: string; // Optional - backend will auto-generate if not provided
    businessName: string;
    ownerName?: string;
    phone?: string;
    address?: string;
    subscriptionPlan: "FREE" | "BASIC" | "PREMIUM";
    subscriptionEnd?: string;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    adminUser: {
        username: string;
        email: string;
        password: string;
        name?: string;
    };
    cashierUser?: {
        username: string;
        email: string;
        password: string;
        name?: string;
    };
}

export interface ClientsResponse {
    data: Client[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const clientsFetcher = async (url: string): Promise<ClientsResponse> => {
    const response = await apiClient.get<any>(url);
    if (response && typeof response === "object" && !Array.isArray(response)) {
        if (response.data && Array.isArray(response.data)) {
            return {
                data: response.data,
                pagination: response.pagination || { page: 1, limit: 10, total: response.data.length, totalPages: 1 },
            };
        }
    }
    const arr = Array.isArray(response) ? response : [];
    return { data: arr, pagination: { page: 1, limit: 10, total: arr.length, totalPages: 1 } };
};

export function useClients(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const queryString = new URLSearchParams(
        Object.entries(params || {}).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== "") acc[key] = String(value);
            return acc;
        }, {} as Record<string, string>)
    ).toString();

    const url = `/clients${queryString ? `?${queryString}` : ""}`;
    const { data, error, isLoading, mutate } = useSWR<ClientsResponse>(
        url,
        clientsFetcher,
        { revalidateOnFocus: false }
    );

    return {
        clients: data?.data || [],
        pagination: data?.pagination,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useClientActions() {
    const [isLoading, setIsLoading] = useState(false);

    const createClient = async (data: CreateClientPayload) => {
        setIsLoading(true);
        try {
            const client = await apiClient.post<Client>("/clients", data);
            toast.success("Client berhasil dibuat");
            return client;
        } catch (error: any) {
            const msg = extractApiError(error, "Gagal membuat client");
            toast.error("Gagal membuat client", {
                description: msg,
                duration: 5000,
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateClient = async (id: string, data: Partial<Client>) => {
        setIsLoading(true);
        try {
            const client = await apiClient.put<Client>(`/clients/${id}`, data);
            toast.success("Client berhasil diupdate");
            return client;
        } catch (error) {
            const msg = extractApiError(error, "Gagal mengupdate client");
            toast.error("Gagal mengupdate client", { description: msg });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteClient = async (id: string) => {
        setIsLoading(true);
        try {
            await apiClient.delete(`/clients/${id}`);
            toast.success("Client berhasil dihapus");
        } catch (error: any) {
            const msg = extractApiError(error, "Gagal menghapus client");
            toast.error("Gagal menghapus client", { description: msg });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { createClient, updateClient, deleteClient, isLoading };
}
