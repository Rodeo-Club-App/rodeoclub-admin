import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

import { formatDate } from "@/utils/format-iso-date";
import { registerFonts } from "@/utils/register-fonts";
import { LogReport } from ".";
import OrderReportHeader from "@/components/orderReportHeader";

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
  data: LogReport;
}

export function PDFReport({ data }: Props) {
  registerFonts();

  const { period, total, partner } = data;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <OrderReportHeader
          totals={[{ label: "Total de acessos", value: total }]}
          period={period}
          title="Relatório de Acessos"
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
                  width: "20%",
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
                  width: "27%",
                  fontWeight: "bold",
                },
              ]}
            >
              Atividade
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "14%",
                  fontWeight: "bold",
                },
              ]}
            >
              Data
            </Text>

            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "22%",
                  fontWeight: "bold",
                },
              ]}
            >
              Localização
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "17%",
                  fontWeight: "bold",
                },
              ]}
            >
              Parceiro
            </Text>
          </View>

          {data.logs.map((log, index) => {
            const isLastRow = index === data.logs.length - 1;

            return (
              <React.Fragment key={log.id}>
                <View
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                    ...(isLastRow ? [styles.tableRowLast] : []),
                  ]}
                  break={isLastRow}
                >
                  <Text style={[styles.tableCol, { width: "20%" }]}>
                    {log.customer.name}
                  </Text>
                  <Text style={[styles.tableCol, { width: "27%" }]}>
                    {log.activity}
                  </Text>

                  <Text style={[styles.tableCol, { width: "14%" }]}>
                    {formatDate(log.createdAt, "dd/MM/yyyy HH:mm")}
                  </Text>
                  <Text style={[styles.tableCol, { width: "22%" }]}>
                    {log.city}
                  </Text>

                  <Text style={[styles.tableCol, { width: "17%" }]}>
                    {log.customer.partner}
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
