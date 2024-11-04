import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { formattedStatus } from "@/utils/status-enum";
import { formatDate } from "@/utils/format-iso-date";
import { OrderReport } from ".";

import OrderReportHeader from "@/components/orderReportHeader";
import { formatCentsToReal } from "@/utils/money";
import { registerFonts } from "@/utils/register-fonts";

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
    padding: 5,
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
  badge: {
    borderRadius: "100%",
    paddingVertical: 4,
    width: 60,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    left: 0.4,
  },
  badgeYellow: {
    backgroundColor: "#FBBF24",
    color: "#FFFFFF",
  },
  badgeGray: {
    backgroundColor: "#6B7280",
    color: "#FFFFFF",
  },
  badgeOrange: {
    backgroundColor: "#F97316",
    color: "#FFFFFF",
  },
  badgeGreen: {
    backgroundColor: "#10B981",
    color: "#FFFFFF",
  },
  badgeRed: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
  },
  badgeBlue: {
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
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
    height: 15,
  },
});

const statusStyles = {
  processing: styles.badgeYellow,
  "on-hold": styles.badgeGray,
  pending: styles.badgeOrange,
  completed: styles.badgeGreen,
  cancelled: styles.badgeRed,
  "em-transporte": styles.badgeBlue,
  "em-separacao": styles.badgeOrange,
};

interface Props {
  data: OrderReport;
}

export function PDFReport({ data }: Props) {
  registerFonts();
  const { period, total, orders, totalOrders } = data;

  return (
    <Document>
      <Page orientation="landscape" style={styles.page}>
        <OrderReportHeader
          totals={[
            { label: "Total de Pedidos", value: totalOrders },
            { label: "Total", value: total },
          ]}
          title="Relatório de Pedidos"
          period={period}
        />

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: 90,
                  fontWeight: "bold",
                  textAlign: "center",
                },
              ]}
            >
              Nº Pedido
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "26%",
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
                  width: "12%",
                  fontWeight: "bold",
                },
              ]}
            >
              Status
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "28%",
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
                  width: "12%",
                  fontWeight: "bold",
                  textAlign: "center",
                },
              ]}
            >
              Valor UN.
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                { width: "7%", fontWeight: "bold", textAlign: "center" },
              ]}
            >
              Qtd.
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                {
                  width: "12%",
                  fontWeight: "bold",
                },
              ]}
            >
              Valor Total
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
                  width: "12%",
                  fontWeight: "bold",
                },
              ]}
            >
              Parceiro
            </Text>
          </View>

          {data.orders.map((order, index) => {
            const isLastRow = index === orders.length - 1;
            return (
              <React.Fragment key={order.id}>
                <View
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                    ...(isLastRow ? [styles.tableRowLast] : []),
                  ]}
                >
                  <Text
                    style={[
                      styles.tableCol,
                      { width: 89.5, textAlign: "center" },
                    ]}
                  >
                    {order.externalId}
                  </Text>
                  <Text style={[styles.tableCol, { width: 207 }]}>
                    {order.customer.name}
                  </Text>
                  <View style={[styles.tableCol, { width: 95 }]}>
                    <Text style={[styles.badge, statusStyles[order.status]]}>
                      {formattedStatus[order.status]}
                    </Text>
                  </View>
                  <Text style={[styles.tableCol, { width: 223 }]}></Text>
                  <Text style={[styles.tableCol, { width: 95.5 }]}></Text>
                  <Text style={[styles.tableCol, { width: 56 }]}></Text>
                  <Text style={[styles.tableCol, { width: 95.5 }]}>
                    {formatCentsToReal(order.totalCents)}
                  </Text>
                  <Text
                    style={[
                      styles.tableCol,
                      { width: 111.5, textAlign: "center" },
                    ]}
                  >
                    {formatDate(order.createdAt, "dd/MM/yyyy HH:mm")}
                  </Text>
                  <Text
                    style={[
                      styles.tableCol,
                      { width: 95.5, textAlign: "center" },
                    ]}
                  >
                    {order.customer.partner}
                  </Text>
                </View>
                {order.items.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 0
                        ? styles.tableRowEven
                        : styles.tableRowOdd,
                      ...(isLastRow ? [styles.tableRowLast] : []),
                    ]}
                  >
                    <Text style={[styles.tableCol, { width: 89.5 }]}></Text>
                    <Text style={[styles.tableCol, { width: 207 }]}></Text>
                    <Text style={[styles.tableCol, { width: 95 }]}></Text>

                    <Text style={[styles.tableCol, { width: 223 }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.tableCol, { width: 95.5 }]}>
                      {formatCentsToReal(item.price)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCol,
                        { width: 56, textAlign: "center" },
                      ]}
                    >
                      {item.quantity}
                    </Text>
                    <Text style={[styles.tableCol, { width: 95.5 }]}></Text>
                    <Text style={[styles.tableCol, { width: 111.5 }]}></Text>
                    <Text style={[styles.tableCol, { width: 95.5 }]}></Text>
                  </View>
                ))}
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
