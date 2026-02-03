"use client";

import useSWR from "swr";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
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

export function useClients() {
    const { data, error, isLoading, mutate } = useSWR<Client[]>(
        "/clients", // Adjust endpoint if needed, e.g. /admin/clients
        arrayFetcher,
        { revalidateOnFocus: false }
    );

    return {
        clients: data || [],
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
            console.error("Failed to create client:", error);

            // Extract error message
            let message = error.response?.data?.message || error.message || "Gagal membuat client";

            // Clean up Sequelize validation errors if present
            if (typeof message === 'string' && message.includes("Validation error:")) {
                message = message.split("Validation error:").join("").trim();
            }

            toast.error("Gagal membuat client", {
                description: message,
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
            toast.error(error.response?.data?.message || "Gagal menghapus client");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { createClient, updateClient, deleteClient, isLoading };
}
