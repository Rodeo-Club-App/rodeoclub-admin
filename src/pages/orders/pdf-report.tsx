import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { formattedStatus } from "@/utils/status-enum";
import { formatDate } from "@/utils/format-iso-date";
import { OrderReport } from ".";
import RobotoRegular from "@/assets/fonts/Roboto-Regular.ttf";
import RobotoBold from "@/assets/fonts/Roboto-Bold.ttf";
import logo from "@/assets/logo-pvt-top.png";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: RobotoRegular,
    },
    {
      src: RobotoBold,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#E4E4E4",
    padding: 20,
    fontSize: 11,
    fontFamily: "Roboto",
  },
  header: {
    fontSize: 14,
    margintop: 5,
    textAlign: "center",
    alignSelf: "center",
    marginLeft: 10,
    fontWeight: "bold",
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
  badge: {
    borderRadius: "100%",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
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
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

const statusStyles = {
  processing: styles.badgeYellow,
  "on-hold": styles.badgeGray,
  pending: styles.badgeOrange,
  completed: styles.badgeGreen,
  canceled: styles.badgeRed,
};

interface Props {
  data: OrderReport;
}

export function PDFReport({ data }: Props) {
  const { period, total, orders } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 20,
          }}
        >
          <Image
            style={{
              width: 160,
            }}
            src={logo}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
            Relatório de Pedidos - Período: {period}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.tableColHeader,
                { width: "15%", fontWeight: "bold" },
              ]}
            >
              Nº Pedido
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                { width: "25%", fontWeight: "bold" },
              ]}
            >
              Cliente
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                { width: "15%", fontWeight: "bold" },
              ]}
            >
              Status
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                { width: "15%", fontWeight: "bold" },
              ]}
            >
              Data
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                { width: "15%", fontWeight: "bold" },
              ]}
            >
              Valor
            </Text>
            <Text
              style={[
                styles.tableColHeader,
                { width: "15%", fontWeight: "bold" },
              ]}
            >
              Parceiro
            </Text>
          </View>

          {orders.map((order, index) => {
            const isLastRow = index === orders.length - 1;
            return (
              <View
                key={order.id}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  ...(isLastRow ? [styles.tableRowLast] : []),
                ]}
              >
                <Text style={[styles.tableCol, { width: "15%" }]}>
                  {order.externalId}
                </Text>
                <Text style={[styles.tableCol, { width: "25%" }]}>
                  {order.customer.name}
                </Text>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text style={[styles.badge, statusStyles[order.status]]}>
                    {formattedStatus[order.status]}
                  </Text>
                </View>
                <Text style={[styles.tableCol, { width: "15%" }]}>
                  {formatDate(order.createdAt)}
                </Text>
                <Text style={[styles.tableCol, { width: "15%" }]}>
                  {order.total}
                </Text>
                <Text style={[styles.tableCol, { width: "15%" }]}>
                  {order.customer.partner}
                </Text>
              </View>
            );
          })}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignContent: "center",
            }}
          >
            <Text>Total: </Text>
            <Text style={{ fontWeight: "bold" }}>{total}</Text>
          </View>
        </View>

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