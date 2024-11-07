import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { registerFonts } from "@/utils/register-fonts";
import { ClientReport } from ".";
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
  data: ClientReport;
}

export function PDFReport({ data }: Props) {
  registerFonts();

  const { period, total, partner, clients } = data;

  const resume = clients.reduce(
    (p, c) => {
      return {
        totalOrder: p.totalOrder + c.totalOrders,
        totalValue: p.totalValue + c.totalSpent,
      };
    },
    { totalOrder: 0, totalValue: 0 }
  );

  const cols = {
    col1: "20%",
    col2: "10%",
    col3: "20%",
    col4: "20%",
    col5: "15%",
    col6: "15%",
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <OrderReportHeader
          totals={[
            {
              label: "Total de clientes",
              value: total,
            },
            {
              label: "Total de compras",
              value: String(resume.totalOrder),
            },
            {
              label: "Valor total",
              value: formatCentsToReal(resume.totalValue),
            },
          ]}
          period={period}
          title="Relatório de Clientes"
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
            Parceiro(s) - {partner}
          </Text>
        )}

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: cols.col1,
                  fontWeight: "bold",
                },
              ]}
            >
              Cliente
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: cols.col2,
                  fontWeight: "bold",
                },
              ]}
            >
              Nascimento
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: cols.col3,
                  fontWeight: "bold",
                },
              ]}
            >
              Parceiro
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: cols.col4,
                  fontWeight: "bold",
                },
              ]}
            >
              Marca
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: cols.col5,
                  fontWeight: "bold",
                },
              ]}
            >
              Qtd. compras
            </Text>

            <Text
              style={[
                styles.tableColHeader,
                {
                  width: cols.col6,
                  fontWeight: "bold",
                },
              ]}
            >
              Total de compras
            </Text>
          </View>

          {data.clients.map((client, index) => {
            const isLastRow = index === data.clients.length - 1;

            return (
              <React.Fragment key={client.id}>
                <View
                  key={client.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                    ...(isLastRow ? [styles.tableRowLast] : []),
                  ]}
                  break={isLastRow}
                >
                  <Text style={[styles.tableCol, { width: cols.col1 }]}>
                    {client.user.name}
                  </Text>
                  <Text style={[styles.tableCol, { width: cols.col2 }]}>
                    {client.user.birthdate}
                  </Text>
                  <Text style={[styles.tableCol, { width: cols.col3 }]}>
                    {client.partner?.name ?? ""}
                  </Text>
                  <Text style={[styles.tableCol, { width: cols.col4 }]}></Text>

                  <Text style={[styles.tableCol, { width: cols.col5 }]}>
                    {client.totalOrders}
                  </Text>
                  <Text style={[styles.tableCol, { width: cols.col6 }]}>
                    {client.totalSpentsFormatted}
                  </Text>
                </View>

                {client.topBrands.map((brand, index) => {
                  return (
                    <View
                      key={brand.id}
                      style={[
                        styles.tableRow,
                        index % 2 === 0
                          ? styles.tableRowEven
                          : styles.tableRowOdd,
                        ...(isLastRow ? [styles.tableRowLast] : []),
                      ]}
                    >
                      <Text style={[styles.tableCol, { width: cols.col1 }]}>
                        {client.user.name}
                      </Text>
                      <Text style={[styles.tableCol, { width: cols.col2 }]}>
                        {" "}
                      </Text>
                      <Text style={[styles.tableCol, { width: cols.col3 }]}>
                        {" "}
                      </Text>

                      {/* Preenchendo a coluna de Marca, Qtd. compras e Total de compras */}
                      <Text style={[styles.tableCol, { width: cols.col4 }]}>
                        {brand.brand}
                      </Text>
                      <Text style={[styles.tableCol, { width: cols.col5 }]}>
                        {brand.quantity}
                      </Text>
                      <Text style={[styles.tableCol, { width: cols.col6 }]}>
                        {brand.totalSpentFormatted}
                      </Text>
                    </View>
                  );
                })}
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
