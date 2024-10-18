import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

import { registerFonts } from "@/utils/register-fonts";
import { ProductReport } from ".";
import OrderReportHeader from "@/components/orderReportHeader";
import { formatCentsToReal } from "@/utils/money";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#E4E4E4",
    padding: 20,
    fontSize: 11,
    fontFamily: "Roboto",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    backgroundColor: "#f3f3f3",
    borderRightColor: "#bfbfbf",
    borderRightWidth: 1,
    borderBottomColor: "#bfbfbf",
    borderBottomWidth: 1,
    padding: 8,
    textAlign: "left",
    fontWeight: "bold",
  },
  tableCol: {
    borderRightColor: "#bfbfbf",
    borderRightWidth: 1,
    padding: 8,
    textAlign: "left",
  },
  tableRowOdd: {
    backgroundColor: "#f9f9f9",
  },
  tableRowEven: {
    backgroundColor: "#e9e9e9",
  },
  tableRowLast: {
    borderBottomColor: "#bfbfbf",
    borderBottomWidth: 1,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 10,
    right: 20,
    textAlign: "center",
    color: "grey",
  },
  footer: {
    marginTop: 5,
    height: 5,
  },
});

interface Props {
  data: ProductReport;
}

export function PDFReport({ data }: Props) {
  registerFonts();

  const { period, partner } = data;

  function calculateSummary({ data }: Props): {
    totalQuantitySold: number;
    totalSalesValue: number;
  } {
    return data.products.reduce(
      (acc, product) => {
        acc.totalQuantitySold += product.totalQuantitySold;
        acc.totalSalesValue += product.totalSalesValue;
        return acc;
      },
      { totalQuantitySold: 0, totalSalesValue: 0 }
    );
  }

  const { totalQuantitySold, totalSalesValue } = calculateSummary({ data });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <OrderReportHeader
          totals={[
            {
              label: "Produtos vendidos",
              value: String(totalQuantitySold),
            },
            {
              label: "Total vendido",
              value: formatCentsToReal(totalSalesValue),
            },
          ]}
          period={period}
          title="Relatório de Produtos"
        />

        {partner && (
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 15,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            Parceiro - {partner}
          </Text>
        )}

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "25%",
                  fontWeight: "bold",
                },
              ]}
            >
              Produto
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "25%",
                  fontWeight: "bold",
                },
              ]}
            >
              Categoria
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "20%",
                  fontWeight: "bold",
                },
              ]}
            >
              Valor Un.
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "10%",
                  fontWeight: "bold",
                },
              ]}
            >
              Qtd. vendas
            </Text>

            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "20%",
                  fontWeight: "bold",
                },
              ]}
            >
              Total vendido
            </Text>
          </View>

          {data.products.map((product, index) => {
            const isLastRow = index === data.products.length - 1;

            return (
              <React.Fragment key={product.id}>
                <View
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                    ...(isLastRow ? [styles.tableRowLast] : []),
                  ]}
                  break={isLastRow}
                >
                  <Text style={[styles.tableCol, { width: "25%" }]}>
                    {product.name}
                  </Text>
                  <Text style={[styles.tableCol, { width: "25%" }]}>
                    {product.category.name}
                  </Text>
                  <Text style={[styles.tableCol, { width: "20%" }]}>
                    {formatCentsToReal(product.priceCents)}
                  </Text>

                  <Text style={[styles.tableCol, { width: "10%" }]}>
                    {product.totalQuantitySold}
                  </Text>
                  <Text style={[styles.tableCol, { width: "20%" }]}>
                    {formatCentsToReal(product.totalSalesValue)}
                  </Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        <View style={[styles.footer]} fixed />

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
