import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { functionApi } from "api";
import { ProductItemType } from "atoms/app";
import { UserType } from "atoms/auth";
import { Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import { useProductsState } from "hooks/appState";
import { useCallback, useMemo, useState } from "react";
import { FlatList, ToastAndroid, View } from "react-native";
import { Button, IconButton, List, Text } from "react-native-paper";
import { useQuery } from "react-query";
import { convertToCSV, writeToFile } from "utils/common";
import { formatPrice } from "utils/currency";
import { db } from "utils/firebase";

interface ProductMissmatchItem {
  _id: string;
  actualQuantity: number;
  createdAt: string;
  createdBy: string;
  difference: number;
  product: string;
  productName: string;
  systemQuantity: number;
  tray: string;
  vendingMachine: string;
}

interface filterType {
  start?: Date;
  end?: Date;
}

const ProductMissmatch = () => {
  const [showDatePicker, setShowDatePicker] = useState<"Start" | "End">();
  const [filter, setFilter] = useState<filterType>({});
  const [products] = useProductsState();

  const {
    data: users = [],
    isLoading: usersLoading,
    refetch: usersRefetch,
  } = useQuery({
    queryKey: "firebase-users",
    queryFn: async () => {
      const res = await functionApi.get<{ users: UserType[] }>("/getAllUsers");
      return res.data?.users;
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["product-missmatch", filter],
    queryFn: async () => {
      const col = db.collection("machine-inventory-mismatch-report");

      let query: FirebaseFirestoreTypes.Query = col;
      if (filter.start && filter.end) {
        query = query.where("createdAt", ">=", filter.start);
        query = query.where("createdAt", "<=", filter.end);
      } else if (filter.start) {
        query = query.where("createdAt", ">=", filter.start);
      } else if (filter.end) {
        query = query.where("createdAt", "<=", filter.end);
      }

      const res = await query
        .orderBy("createdAt", "desc")
        .get()
        .then((snapshot) => {
          const data: ProductMissmatchItem[] = [];
          snapshot.forEach((doc) => {
            const d = doc.data() as Omit<ProductMissmatchItem, "_id">;
            data.push({
              _id: doc.id,
              ...d,
              createdAt: (d.createdAt as any).toDate()?.toLocaleString("en-IN"),
            });
          });
          return data;
        });

      return res;
    },
  });

  const productsObj = useMemo(() => {
    const obj: Record<string, ProductItemType> = {};
    products.forEach((product) => {
      obj[product.product_id] = product;
    });
    return obj;
  }, [products]);

  const userObj = useMemo(() => {
    const obj: Record<string, UserType> = {};
    users.forEach((user) => {
      obj[user.uid] = user;
    });
    return obj;
  }, [users]);

  const totalDifference = useMemo(() => {
    return data?.reduce(
      (acc, item) => {
        if (item.difference > 0) {
          acc.extra += item.difference;
        }
        if (item.difference < 0) {
          acc.missed += item.difference;
        }
        return acc;
      },
      {
        missed: 0,
        extra: 0,
      },
    );
  }, [data]);

  const totalLossNRefund = useMemo(() => {
    return data?.reduce(
      (acc, item) => {
        if (item.difference > 0) {
          acc.refund +=
            productsObj[item.product].product_price * item.difference;
        }
        if (item.difference < 0) {
          acc.loss +=
            productsObj[item.product].product_price * item.difference * -1;
        }
        return acc;
      },
      {
        loss: 0,
        refund: 0,
      },
    );
  }, [data, productsObj]);

  const onChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowDatePicker(undefined);

      if (event.type === "neutralButtonPressed") {
        setFilter((prev) => ({
          ...prev,
          [showDatePicker === "Start" ? "start" : "end"]: undefined,
        }));
      }

      if (event.type === "set") {
        setFilter((prev) => ({
          ...prev,
          [showDatePicker === "Start" ? "start" : "end"]: selectedDate,
        }));
      }
    },
    [showDatePicker],
  );

  const handleDownload = useCallback(async () => {
    if (!data) {
      ToastAndroid.show("No data to download", ToastAndroid.SHORT);
      return;
    }

    const csv = convertToCSV(data);

    const fileName = "export.csv";

    const fileUri = await writeToFile(csv, fileName);
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(fileUri);
    } else {
      ToastAndroid.show("Sharing not available", ToastAndroid.SHORT);
    }
  }, [data]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Product Missmatch",
          headerRight: () => (
            <IconButton icon="download" onPress={handleDownload} />
          ),
        }}
      />
      {showDatePicker && (
        <DateTimePicker
          value={
            (showDatePicker === "Start" ? filter.start : filter.end) ||
            new Date()
          }
          onChange={onChange}
          neutralButton={{ label: "Clear" }}
        />
      )}
      <View
        style={{
          flexDirection: "row",
          padding: 8,
          gap: 16,
          elevation: 2,
          backgroundColor: "#fff",
        }}
      >
        <Button style={{ flex: 1 }} onPress={() => setShowDatePicker("Start")}>
          {filter.start?.toLocaleDateString("en-IN") || "Start Date"}
        </Button>
        <Button style={{ flex: 1 }} onPress={() => setShowDatePicker("End")}>
          {filter.end?.toLocaleDateString("en-IN") || "End Date"}
        </Button>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const p = productsObj[item.product];
          return (
            <List.Item
              title={item.productName}
              description={() => (
                <View>
                  <Text>
                    By: {userObj[item.createdBy]?.displayName || item.createdBy}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      marginTop: 6,
                    }}
                  >
                    {item.createdAt}
                  </Text>
                </View>
              )}
              left={(props) => (
                <View
                  style={[
                    props.style,
                    {
                      backgroundColor: "#ddd",
                      paddingVertical: 8,
                      width: 50,
                      borderRadius: 4,
                    },
                  ]}
                >
                  <Text style={{ textAlign: "center" }}>
                    {item.vendingMachine}
                  </Text>
                </View>
              )}
              right={() => (
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <View
                    style={{
                      alignItems: "flex-end",
                      flexDirection: "row",
                      gap: 4,
                    }}
                  >
                    <Text style={{ color: "#ccc" }}>
                      {item.actualQuantity} - {item.systemQuantity} =
                    </Text>
                    <Text variant="labelLarge">{item.difference}</Text>
                  </View>
                  <Text>
                    {formatPrice(p.product_price * item.difference * -1)}
                  </Text>
                </View>
              )}
            />
          );
        }}
        refreshing={isLoading || usersLoading}
        onRefresh={() => {
          refetch();
          usersRefetch();
        }}
      />
      <View style={{ alignItems: "center", paddingVertical: 16 }}>
        <Text variant="labelSmall">{data?.length} items</Text>
        <Text>
          {totalDifference?.missed} missed, {totalDifference?.extra} extra
        </Text>
        <Text>
          {formatPrice(totalLossNRefund?.loss || 0)} loss, &{" "}
          {formatPrice(totalLossNRefund?.refund || 0)} refund
        </Text>
      </View>
    </>
  );
};

export default ProductMissmatch;
