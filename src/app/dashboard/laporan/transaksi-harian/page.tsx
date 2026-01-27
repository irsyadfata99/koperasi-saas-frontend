// src/app/(dashboard)/laporan/transaksi-harian/page.tsx
"use client";

import { useState } from "react";
import { ReportLayout } from "@/components/laporan/report-layout";
import { ReportHeader } from "@/components/laporan/report-header";
import { ReportFilters } from "@/components/laporan/report-filters";
import { ReportTable, ReportColumn } from "@/components/laporan/report-table";
import { ReportExportButton } from "@/components/laporan/report-export-button";
import { useReport } from "@/hooks/useReport";
import { useReportExport } from "@/hooks/useReportExport";
import { Calendar } from "lucide-react";
import { DailyTransactionReport } from "@/types/report";

export default function TransaksiHarianPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  const { data, isLoading } = useReport<DailyTransactionReport>({
    endpoint: "/reports/daily-transactions",
    ...filters,
  });

  const { exportReport, isExporting } = useReportExport({
    endpoint: "/reports/daily-transactions",
    filename: "Laporan_Transaksi_Harian",
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
    });
  };

  const handleExport = () => {
    exportReport(filters);
  };

  const columns: ReportColumn<DailyTransactionReport>[] = [
    {
      key: "date",
      header: "Tanggal",
      width: "120px",
    },
    {
      key: "dayName",
      header: "Hari",
      width: "100px",
    },
    {
      key: "totalTransactions",
      header: "Transaksi",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "totalRevenue",
      header: "Total Pendapatan",
      format: "currency",
      align: "right",
      width: "160px",
      render: (value) => (
        <div className="font-semibold text-green-600">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(Number(value))}
        </div>
      ),
    },
    {
      key: "tunaiCount",
      header: "Tunai (Qty)",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "tunaiRevenue",
      header: "Tunai (Rp)",
      format: "currency",
      align: "right",
      width: "150px",
    },
    {
      key: "kreditCount",
      header: "Kredit (Qty)",
      format: "number",
      align: "center",
      width: "100px",
    },
    {
      key: "kreditRevenue",
      header: "Kredit (Rp)",
      format: "currency",
      align: "right",
      width: "150px",
    },
    {
      key: "avgPerTransaction",
      header: "Avg/Transaksi",
      format: "currency",
      align: "right",
      width: "140px",
    },
  ];

  return (
    <ReportLayout>
      <div className="flex items-start justify-between">
        <ReportHeader
          title="Laporan Transaksi Harian"
          description="Ringkasan transaksi penjualan per hari"
          icon={<Calendar className="h-6 w-6 text-primary" />}
        />
        <ReportExportButton
          onExport={handleExport}
          isExporting={isExporting}
          disabled={isLoading || data.length === 0}
        />
      </div>

      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        showSearch={false}
      />

      <ReportTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Tidak ada transaksi ditemukan pada periode ini"
      />
    </ReportLayout>
  );
}
