import { ProductItemType } from "atoms/app";
import { Stack, useLocalSearchParams } from "expo-router";
import { useProductsState, useWarehousesState } from "hooks/appState";
import { useMemo } from "react";
import { FlatList, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { useQuery } from "react-query";
import { DEFAULT_PRODUCT_IMAGE } from "utils/constants";
import { db } from "utils/firebase";

const ScreenOptions = () => {
  return (
    <Stack.Screen
      options={{
        title: "Log Details",
      }}
    />
  );
};

const LogDetails = () => {
  const searchParams = useLocalSearchParams();
  const [allWarehouses] = useWarehousesState();
  const [allPProducts] = useProductsState();

  const productsKV = useMemo(() => {
    const _ps: Record<string, ProductItemType> = {};

    allPProducts.forEach((p) => {
      _ps[p._docID] = p;
    });

    return _ps;
  }, [allPProducts]);

  const warehousesKV = useMemo(() => {
    const _ws: Record<string, string> = {};

    allWarehouses.forEach((w) => {
      _ws[w._docID] = w.name;
    });

    return _ws;
  }, [allWarehouses]);

  const d = useQuery({
    queryKey: ["logs", searchParams.col, searchParams.id],
    queryFn: async () => {
      const collectionName = searchParams.col;
      if (!collectionName || typeof collectionName != "string") return;
      if (!searchParams.id || typeof searchParams.id != "string") return;

      const log = await db
        .collection(collectionName)
        .doc(searchParams.id)
        .get()
        .then((doc) => {
          return {
            _id: doc.id,
            ...(doc.data() as {
              products: Record<string, number>;
              warehouse: string;
              createdBy: string;
            }),
          };
        });

      const products: ({ quantity: number } & ProductItemType)[] = [];

      for (const _id in log.products) {
        products.push({
          quantity: log.products[_id],
          ...productsKV[_id],
        });
      }

      return {
        products,
        warehouse: log.warehouse,
      };
    },
  });

  return (
    <>
      <ScreenOptions />
      <FlatList
        data={d.data?.products}
        refreshing={d.isLoading}
        onRefresh={() => d.refetch()}
        ListHeaderComponent={
          <>
            <View
              style={{
                padding: 16,
                backgroundColor: "white",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Warehouse</Text>
              <Text>
                {d.data?.warehouse ? warehousesKV[d.data?.warehouse] : ""}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.product_name}
            description={`Quantity: ${item.quantity}`}
            left={(props) => (
              <List.Image
                {...props}
                source={{ uri: item.image_mini || DEFAULT_PRODUCT_IMAGE }}
              />
            )}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        keyExtractor={(item) => item._docID}
      />
    </>
  );
};

export default LogDetails;
