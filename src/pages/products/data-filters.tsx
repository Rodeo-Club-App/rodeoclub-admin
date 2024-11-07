import { listPartners } from "@/api/partners/list-partners";
import { DatePickerWithRange } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDateRange } from "@/utils/formatters";
import { formatCentsToReal } from "@/utils/money";
import ReactPDF from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowDownWideNarrow, File, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { IProduct } from ".";
import { DataFilterPartners } from "../orders/data-filter-partners";
import { DataFilterCategory } from "./data-filter-category";
import { PDFReport } from "./pdf-report";

interface Props {
  products: IProduct[];
}

export function DataFilters({ products }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  const startAt = searchParams.get("startAt") || "";
  const endAt = searchParams.get("endAt") || "";
  const partners = searchParams.get("partners") || "";
  const searchName = searchParams.get("searchName") || "";
  const orderType = searchParams.get("orderBy") || "totalSales";

  const parseDate = (param: string | null) =>
    param ? parseISO(param) : undefined;
  const [isExporting, setIsExporting] = useState(false);

  const { data: partnersList } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
    staleTime: 15 * 60 * 1000,
  });

  const from = parseDate(startAt);
  const to = parseDate(endAt);

  const handleRangeChange = (range: DateRange | undefined) => {
    if (range?.from)
      searchParams.set("startAt", format(range.from, "yyyy-MM-dd"));
    else searchParams.delete("startAt");

    if (range?.to) searchParams.set("endAt", format(range.to, "yyyy-MM-dd"));
    else searchParams.delete("endAt");

    setSearchParams(searchParams);
  };

  const clearDate = () => {
    setSearchParams((p) => {
      p.delete("startAt");
      p.delete("endAt");

      return p;
    });
  };

  const handleChangeOrderType = (
    type: "totalSales" | "totalOrders" | "name"
  ) => {
    setSearchParams((p) => {
      p.set("orderBy", type);

      return p;
    });
  };

  async function handleExportReport(type: "pdf" | "excel") {
    setIsExporting(true);
    const data = {
      period: formatDateRange(startAt, endAt),
      partner: partners
        ? partners
            .split(",") // Divide a string em um array de IDs
            .map((id) => partnersList?.find((i) => i.id === Number(id))?.name) // Busca o nome correspondente
            .filter((name) => name) // Remove valores undefined
            .join(", ")
        : null,

      total: products.length.toString(),
      products: products,
    };

    if (type === "pdf") {
      const pdf = <PDFReport data={data} />;

      const blob = await ReactPDF.pdf(pdf).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }

    if (type === "excel") {
      const rows = [];

      rows.push([
        "Produto",
        "Categoria",
        "Valor Un.",
        "Qtd. vendas",
        "Total vendido",
      ]);

      data.products.forEach((product) => {
        const row = [
          product.name,
          product.category.name,
          formatCentsToReal(product.priceCents),
          product.totalQuantitySold,
          formatCentsToReal(product.totalSalesValue),
        ];

        rows.push(row);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");

      const excelFilename = `relatorio_de_produtos.xlsx`;

      XLSX.writeFile(workbook, excelFilename);
    }

    setIsExporting(false);
  }
  
  return (
    <div className="flex flex-col md:flex-row lg:items-center gap-2 md:gap-0">
      <div className="relative lg:mr-2 md:grow-0 w-full sm:w-auto">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por nome..."
          className="pl-8 pr-4 h-8 py-2 w-full md:w-auto lg:w-[336px]  rounded-lg bg-background"
          value={searchName}
          onChange={(event) =>
            setSearchParams((p) => {
              p.set("searchName", event.target.value);
              return p;
            })
          }
        />
      </div>

      <div className="md:ml-auto gap-2 flex flex-wrap sm:flex-row md:gap-0">
        <div className="flex items-center w-full xs:w-auto md:mr-1">
          <DatePickerWithRange
            to={to}
            from={from}
            onChange={handleRangeChange}
          />

          {(from || to) && (
            <Button
              size="icon"
              variant="ghost"
              onClick={clearDate}
              className="w-8 h-8 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <DataFilterPartners />

        {/* <div className="flex items-center flex-row sm:flex-initial sm:max-w-32 mr-1">
          <Select
            value={partnerId || ""}
            onValueChange={(e) => onSelectPartner(e)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Parceiro" />
            </SelectTrigger>
            <SelectContent>
              {!isLoadingPartners &&
                partnersList?.map((partner) => (
                  <SelectItem
                    key={partner.id}
                    value={String(partner.id)}
                    className="cursor-pointer"
                  >
                    {partner.name}
                  </SelectItem>
                ))}
            </SelectContent>
            {partnerId && (
              <Button
                size="icon"
                variant="ghost"
                onClick={clearPartner}
                className="w-8 h-8 hover:text-red-500 mx-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </Select>
        </div> */}

        <div className="ml-1">
          <DataFilterCategory />
        </div>

        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-1 h-8">
                <ArrowDownWideNarrow className="h-4 w-4" />
                <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Ordenar por
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={orderType === "totalOrders"}
                onClick={() => handleChangeOrderType("totalOrders")}
              >
                Qtd. vendas
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={orderType === "totalSales"}
                onClick={() => handleChangeOrderType("totalSales")}
              >
                Total vendido
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={orderType === "name"}
                onClick={() => handleChangeOrderType("name")}
              >
                Nome
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-1 flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-sm"
                disabled={isExporting}
              >
                <File className="h-3.5 w-3.5" />
                <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Exportar
                </span>

                {isExporting && <Loader2 className="animate-spin w-4 h-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Exportar em</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleExportReport("pdf")}
              >
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleExportReport("excel")}
              >
                Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
