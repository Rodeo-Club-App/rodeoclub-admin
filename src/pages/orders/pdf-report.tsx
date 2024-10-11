import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { OrderReport } from ".";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#E4E4E4",
  },
  section: {},
});

interface Props {
  data: OrderReport;
}

export function PDFReport({ data }: Props) {
  const {
    period,
    // partner,
    // total,
    orders,
  } = data;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>{period}</Text>
        </View>
        {orders.map((i) => (
          <Text key={i.id}>{i.customer.name}</Text>
        ))}
      </Page>
    </Document>
  );
}
