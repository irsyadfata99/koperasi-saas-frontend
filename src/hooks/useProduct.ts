// ============================================
// src/hooks/useProduct.ts - FIXED
// ✅ Simplified response handling - apiClient already extracts data
// ============================================
import useSWR from "swr";
import { Product } from "@/types";
import { apiClient as api } from "@/lib/api";
import { arrayFetcher, itemFetcher, ensureArray } from "@/lib/swr-fetcher";
import { useState } from "react";
import { toast } from "sonner";
import type { ProductForm as ProductFormData } from "@/lib/validations";
import { extractApiError } from "@/lib/api";
// ✅ Pagination interface
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

// ✅ Custom fetcher for products with pagination
const productsFetcher = async (url: string): Promise<ProductsResponse> => {
  try {
    const response = await api.get<any>(url);

    // Case 1: Paginated response
    if (response && typeof response === "object" && !Array.isArray(response)) {
      if (response.data && Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: response.pagination || { page: 1, limit: 10, total: response.data.length, totalPages: 1 },
        };
      }
    }

    // Case 2: Direct array
    if (Array.isArray(response)) {
      return {
        data: response,
        pagination: { page: 1, limit: 10, total: response.length, totalPages: 1 },
      };
    }

    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  } catch (error) {
    console.error("❌ Products fetcher error:", error);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
};

export function useProducts(params?: Record<string, unknown>) {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    `/products?${queryString}`,
    productsFetcher,
    { revalidateOnFocus: false }
  );

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useProduct(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/products/${id}` : null,
    async (url: string) => {
      const result = await itemFetcher(url);
      return result as Product | undefined;
    },
    { revalidateOnFocus: false }
  );

  return {
    product: data,
    isLoading,
    isError: error,
    mutate,
  };
}

import { useAuth } from "@/hooks/useAuth";

export function useProductActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // ✅ Get user context

  const createProduct = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        clientId: user?.clientId, // ✅ Inject client_id
      };
      const product = await api.post<Product>("/products", payload);
      toast.success("Produk berhasil ditambahkan");
      return product;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, data: ProductFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        clientId: user?.clientId, // ✅ Inject client_id
        name: data.name,
        barcode: data.barcode || null,
        categoryId: data.categoryId,
        supplierId: data.supplierId || null,
        productType: data.productType,
        purchaseType: data.purchaseType,
        invoiceNo: data.invoiceNo || null,
        expiryDate: data.expiryDate || null,
        description: data.description || null,
        unit: data.unit,
        purchasePrice: data.purchasePrice,
        sellingPriceGeneral: data.sellingPriceGeneral,
        sellingPriceMember: data.sellingPriceMember,
        points: data.points || 0,
        stock: data.stock,
        minStock: data.minStock,
        maxStock: data.maxStock || 0,
      };

      console.log("Sending to API:", payload);
      const product = await api.put<Product>(`/products/${id}`, payload);
      toast.success("Produk berhasil diupdate");
      return product;
    } catch (error) {
      console.error("Update error:", error);
      const msg = extractApiError(error, "Gagal mengupdate produk");
      toast.error("Gagal mengupdate produk", { description: msg !== "Gagal mengupdate produk" ? msg : undefined });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Produk berhasil dihapus");
    } catch (error) {
      const msg = extractApiError(error, "Gagal menghapus produk");
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ CRITICAL FIX: searchByBarcode now returns clean Product data
  // apiClient.get already extracts response.data.data
  const searchByBarcode = async (barcode: string): Promise<Product> => {
    try {
      console.log("🔍 Searching barcode:", barcode);

      // apiClient.get already handles response extraction
      const product = await api.get<Product>(`/products/barcode/${barcode}`);

      console.log("✅ Product found:", {
        id: product.id,
        name: product.name,
        sellingPriceGeneral: product.sellingPriceGeneral,
        sellingPriceMember: product.sellingPriceMember,
      });

      // ✅ Validate critical fields
      if (!product || !product.id) {
        throw new Error("Data produk tidak valid");
      }

      if (!product.sellingPriceGeneral || !product.sellingPriceMember) {
        throw new Error(`Produk ${product.name} tidak memiliki data harga yang lengkap`);
      }

      return product;
    } catch (error) {
      console.error("❌ Error in searchByBarcode:", error);
      throw error;
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    searchByBarcode,
    isLoading,
  };
}
