"use client";

import useSWR from "swr";
import { User } from "@/types";
import { arrayFetcher } from "@/lib/swr-fetcher";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

// Extended User type if needed, or just allow Partial
export interface SystemUser extends User {
    clientCode?: string; // Optional: To show which store they belong to if backend sends it
    clientName?: string;
    status?: "ACTIVE" | "INACTIVE";
}

export function useAllUsers() {
    const { data, error, isLoading, mutate } = useSWR<SystemUser[]>(
        "/users", // Endpoint to fetch all users (SuperAdmin only)
        arrayFetcher,
        { revalidateOnFocus: false }
    );

    return {
        users: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}

export function useUserActions() {
    const [isLoading, setIsLoading] = useState(false);

    const createUser = async (data: any) => {
        setIsLoading(true);
        try {
            await apiClient.post("/users", data);
            toast.success("User created successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create user");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (userId: string, newPassword: string) => {
        setIsLoading(true);
        try {
            await apiClient.post(`/users/${userId}/reset-password`, { password: newPassword });
            toast.success("Password reset successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (userId: string, status: "ACTIVE" | "INACTIVE") => {
        setIsLoading(true);
        try {
            await apiClient.patch(`/users/${userId}/status`, { status });
            toast.success("User status updated");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update status");
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    const deleteUser = async (userId: string) => {
        setIsLoading(true);
        try {
            await apiClient.delete(`/users/${userId}`);
            toast.success("User deleted successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete user");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { createUser, resetPassword, toggleStatus, deleteUser, isLoading };
}
