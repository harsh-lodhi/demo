import { ProductItemType, WarehouseItemType } from "atoms/app";
import { useProductsState, useWarehousesState } from "hooks/appState";
import { useUser } from "hooks/useUserInfo";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Button, List, Menu, Text } from "react-native-paper";
import { useQuery } from "react-query";
import { listToDocsObj } from "utils/common";
import { DEFAULT_PRODUCT_IMAGE } from "utils/constants";
import { formatPrice } from "utils/currency";
import { db, serverTimestamp, updateProductQuantity } from "utils/firebase";

const MyBag = () => {
  const [user] = useUser();
  const [products] = useProductsState();
  const [showMachineSelectMenu, setShowMachineSelectMenu] = useState(false);
  const [wareHouses] = useWarehousesState();
  const [selectedWareHouse, setSelectedWareHouse] =
    useState<WarehouseItemType>();
  const [submitting, setSubmitting] = useState(false);

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: "my-bat-products",
    queryFn: async () => {
      const snapshot = await db
        .collection(`RefillerStorage/${user!.uid}/products`)
        // .where("quantity", "!=", 0)
        .get();
      return snapshot.docs.map((doc) => doc.data());
    },
    enabled: !!user?.uid,
  });

  const productsObj = useMemo(() => {
    return listToDocsObj(products);
  }, [products]);

  const handleConfirmSubmit = useCallback(async () => {
    const products: Record<string, number> = {};

    data.forEach((item) => {
      if (products[item.product_ref.id]) {
        products[item.product_ref.id] += item.quantity;
      } else {
        products[item.product_ref.id] = item.quantity;
      }
    });

    const batch = db.batch();
    const rldoc = db.collection("returnlog").doc();
    batch.set(rldoc, {
      products,
      warehouse: selectedWareHouse?._docID,
      created_by: user?.uid,
      created_at: serverTimestamp(),
    });

    const WarehouseProductsCol = db.collection(
      `WarehouseStorage/${selectedWareHouse?._docID || "[__5xx__]"}/products`,
    );
    const RefillerStorageCol = db.collection(
      `RefillerStorage/${user?.uid || "[__5xx__]"}/products`,
    );

    try {
      setSubmitting(true);
      await Promise.allSettled([
        updateProductQuantity({
          col: WarehouseProductsCol,
          products,
          increment: true,
          batch,
        }),
        updateProductQuantity({
          col: RefillerStorageCol,
          products,
          increment: false,
          batch,
        }),
      ]);

      await batch.commit();
      refetch();
      setSelectedWareHouse(undefined);
    } catch (error: any) {
      Alert.alert("Error", error.toString() || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [data, selectedWareHouse?._docID, user?.uid, refetch]);

  const handleSubmit = useCallback(() => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to return these products?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Return",
          onPress: handleConfirmSubmit,
        },
      ],
      { cancelable: true },
    );
  }, [handleConfirmSubmit]);

  return (
    <>
      <FlatList
        data={data}
        renderItem={({ item }) => {
          const p = productsObj[item.product_ref?.id] as ProductItemType;
          if (!p) return <Text>{JSON.stringify(item)}</Text>;
          return (
            <List.Item
              title={p.product_name}
              description={formatPrice(p.product_price)}
              left={(props) => (
                <List.Image
                  {...props}
                  source={{ uri: p.image_mini || DEFAULT_PRODUCT_IMAGE }}
                />
              )}
              right={(props) => <Text {...props}>{item.quantity}</Text>}
            />
          );
        }}
        keyExtractor={(item) => item.product_ref?.id}
        ListEmptyComponent={() => (
          <Text
            variant="labelLarge"
            style={{ padding: 16, textAlign: "center" }}
          >
            Your bag is empty
          </Text>
        )}
        refreshing={isLoading}
        onRefresh={refetch}
      />

      <View style={styles.actionBar}>
        <Menu
          visible={showMachineSelectMenu}
          anchor={
            <Button
              onPress={() => setShowMachineSelectMenu(true)}
              icon="warehouse"
              compact
            >
              {selectedWareHouse?.name ?? "Select warehouse"}
            </Button>
          }
          onDismiss={() => setShowMachineSelectMenu(false)}
        >
          {wareHouses.map((item) => (
            <Menu.Item
              key={item._docID}
              title={item.name}
              onPress={() => {
                setSelectedWareHouse(item);
                setShowMachineSelectMenu(false);
              }}
            />
          ))}
        </Menu>

        <Button
          mode="contained"
          icon="check"
          onPress={handleSubmit}
          disabled={!selectedWareHouse || submitting || !data.length}
          loading={submitting}
        >
          Return
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,

    // Top border
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
});

export default MyBag;
