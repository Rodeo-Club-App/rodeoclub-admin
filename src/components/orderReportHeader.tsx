import { View, Image, Text } from "@react-pdf/renderer";
import logo from "@/assets/logo-pvt-top.png";

interface OrderReportHeaderProps {
  totals?: { label: string; value: string }[];
  period: string | null;
  title: string;
}

export function OrderReportHeader({
  totals,
  period,
  title,
}: OrderReportHeaderProps) {
  return (
    <View>
      <Image
        style={{
          width: 180,
          marginTop: 5,
        }}
        src={logo}
      />

      <Text
        style={{
          fontWeight: "bold",
          fontSize: 15,
          marginTop: 30,
          marginBottom: 10,
        }}
      >
        {title} {period ? ` - Período: ${period}` : ""}
      </Text>

      {totals && (
        <View
          style={{
            flexDirection: "column",
            backgroundColor: "white",
            borderRadius: 10,
            width: 150,
            padding: 5,
            position: "absolute",
            right: 0,
            top: 15,
          }}
        >
          {totals?.map((totalItem, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 5,
                paddingHorizontal: 5,
              }}
            >
              <Text>{totalItem.label}: </Text>
              <Text style={{ fontWeight: "bold" }}>{totalItem.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default OrderReportHeader;
