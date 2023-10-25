import { FlatList } from "react-native";
import {
  Dialog,
  Divider,
  FAB,
  Portal,
  SegmentedButtons,
  Text,
} from "react-native-paper";
import { useProductsState } from "../../../hooks/appState";
import ProductItem from "../(aux)/ProductItem";
import { useMemo, useState } from "react";
import useProductsQuantity from "../../../hooks/useProductsQuantity";
import { Storage } from "../../../types/common";

const getTotalQty = (data: {
  [storageType: string]: {
    [storageId: string]: number;
  };
}) => {
  let totalQty = 0;

  for (let storageType in data) {
    for (let storageId in data[storageType]) {
      totalQty += data[storageType][storageId];
    }
  }

  return {
    totalQty,
    storageQty: data,
  };
};

const StockScreen = () => {
  const [products] = useProductsState();
  const productsQty = useProductsQuantity();
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);

  const [lowOrNoStock, setLowOrNoStock] = useState<
    "all" | "outOfStock" | "lowStock"
  >("all");

  const [sort, setSort] = useState<{
    by: "name" | "qty" | "price";
    order: "asc" | "desc";
  }>({
    by: "name",
    order: "asc",
  });

  const productsQtyByStorage = useMemo(() => {
    const result: {
      [productId: string]: {
        [storageType: string]: {
          [storageId: string]: number;
        };
      };
    } = {};

    for (let storageType in productsQty.data) {
      for (let storageId in productsQty.data[storageType as Storage]) {
        for (let productId in productsQty.data[storageType as Storage][
          storageId
        ]) {
          if (!result[productId]) {
            result[productId] = {};
          }

          if (!result[productId][storageType]) {
            result[productId][storageType] = {};
          }

          result[productId][storageType][storageId] =
            productsQty.data[storageType as Storage][storageId][productId];
        }
      }
    }

    return result;
  }, [productsQty]);

  const productsWithQty = useMemo(() => {
    return products.map((product) => ({
      ...product,
      ...getTotalQty(productsQtyByStorage[product.product_id]),
    }));
  }, [productsQtyByStorage]);

  const filteredProducts = useMemo(() => {
    // return all if no filter is applied
    if (lowOrNoStock === "all") {
      return productsWithQty;
    }

    return productsWithQty.filter((product) => {
      if (lowOrNoStock === "outOfStock") {
        return product.totalQty === 0;
      }

      if (lowOrNoStock === "lowStock") {
        return product.totalQty > 0 && product.totalQty < 10;
      }

      return true;
    });
  }, [productsWithQty, lowOrNoStock]);

  return (
    <>
      {/* <Text>{JSON.stringify(filteredProducts, null, 2)}</Text> */}

      <FlatList
        refreshing={productsQty.isLoading}
        onRefresh={productsQty.refetch}
        data={filteredProducts}
        removeClippedSubviews={true}
        windowSize={10}
        renderItem={({ item }) => <ProductItem item={item} />}
        keyExtractor={(item) => item.product_id}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", paddingVertical: 16 }}>
            No products found
          </Text>
        )}
        ListFooterComponent={() => (
          <Text
            style={{
              textAlign: "center",
              paddingVertical: 32,
              marginBottom: 32,
            }}
          >
            {filteredProducts.length} products
          </Text>
        )}
      />

      <FAB
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        icon="filter"
        onPress={() => setFilterDialogVisible(true)}
      />

      <Portal>
        <Dialog
          visible={filterDialogVisible}
          onDismiss={() => setFilterDialogVisible(false)}
        >
          <Dialog.Title>Filter</Dialog.Title>
          <Dialog.Content>
            <SegmentedButtons
              density="small"
              buttons={[
                {
                  label: "All",
                  value: "all",
                },
                {
                  label: "No stock",
                  value: "outOfStock",
                },
                {
                  label: "Low stock",
                  value: "lowStock",
                },
              ]}
              value={lowOrNoStock}
              onValueChange={(value) => {
                setLowOrNoStock(value as any);
              }}
            />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </>
  );
};

export default StockScreen;
