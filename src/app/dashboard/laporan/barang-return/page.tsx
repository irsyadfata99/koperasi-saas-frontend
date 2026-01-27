// src/app/(dashboard)/laporan/barang-return/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportFilters } from "@/components/laporan/report-filters";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { RotateCcw } from "lucide-react";
import { ReturnReport } from "@/types/report";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function BarangReturnPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    type: "",
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const { data, pagination, isLoading, mutate } = useReport<ReturnReport>({
    endpoint: "/reports/returns",
    ...filters,
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/returns",
    filename: "Laporan_Barang_Return",
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 50,
      type: "",
      status: "",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleExport = () => {
    const exportFilters = { ...filters };
    delete (exportFilters as any).page;
    delete (exportFilters as any).limit;
    exportReport(exportFilters);
  };

  const columns: ReportColumn<ReturnReport>[] = [
    {
      key: "type",
      header: "Tipe",
      width: "140px",
      render: (value) => (
        <span
          className={`inline-block px-2 py-1 text-xs rounded ${
            value === "Purchase Return"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "returnNumber",
      header: "No. Retur",
      width: "150px",
    },
    {
      key: "returnDate",
      header: "Tanggal",
      width: "110px",
    },
    {
      key: "referenceNumber",
      header: "No. Referensi",
      width: "150px",
    },
    {
      key: "supplierName",
      header: "Supplier/Member",
      width: "200px",
      render: (value, row) => row.supplierName || row.memberName || "-",
    },
    {
      key: "totalAmount",
      header: "Total",
      format: "currency",
      align: "right",
      width: "140px",
    },
    {
      key: "status",
      header: "Status",
      format: "badge",
      width: "110px",
    },
    {
      key: "itemCount",
      header: "Item",
      format: "number",
      align: "center",
      width: "80px",
    },
    {
      key: "reason",
      header: "Alasan",
      width: "250px",
    },
  ];

  return (
    <ReportLayout>
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Laporan Barang Return"
          description="Daftar semua barang yang diretur (pembelian & penjualan)"
          icon={<RotateCcw className="h-6 w-6 text-primary" />}
        />
        <ReportExportButton
          onExport={handleExport}
          isExporting={isExporting}
          disabled={isLoading || data.length === 0}
        />
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Tipe Return</Label>
            <Select
              value={filters.type}
              onValueChange={(value) =>
                handleFilterChange({ type: value === "all" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="purchase">Purchase Return</SelectItem>
                <SelectItem value="sales">Sales Return</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                handleFilterChange({ status: value === "all" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      <ReportTable
        data={data}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        emptyMessage="Tidak ada data return ditemukan"
      />
    </ReportLayout>
  );
}
