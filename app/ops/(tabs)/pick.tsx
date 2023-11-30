import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, SectionList, StyleSheet, View } from "react-native";
import { Button, Chip, FAB, List, Menu, Text } from "react-native-paper";
import { useQuery } from "react-query";

import ProductQuantityDialog, {
  ProductItem,
} from "../../(aux)/picker/ProductQuantityDialog";
import { api, wenderApi } from "../../../api";
import {
  ProductItemType,
  VendingMachineItemType,
  WarehouseItemType,
} from "../../../atoms/app";
import MachinePickerModal from "../../../components/MachinePickerModal";
import {
  useCategoriesState,
  useProductsState,
  useWarehousesState,
} from "../../../hooks/appState";
import { useUser } from "../../../hooks/useUserInfo";
import { db, serverTimestamp } from "../../../utils/firebase";
import ProductPicker from "../../admin/(aux)/ProductPicker";

interface ProductItemProps {
  item: ProductItem;
  checked?: boolean;
  qty: number;
  onEditQuantityPress: () => void;
  onPress: () => void;
  onLongPress: () => void;
}

const ProductListItem = React.memo<ProductItemProps>(
  ({
    item,
    checked = false,
    qty,
    onEditQuantityPress,
    onPress,
    onLongPress,
  }) => {
    // const qty = getProductQuantity(item);
    // const isChecked = checkedProducts.includes(item.product_id);
    return (
      <List.Item
        style={{ opacity: qty > 0 ? 1 : 0.5 }}
        title={item.product_name}
        description={
          item.total_units == 0
            ? "New Item"
            : `Left: ${item.left_units} / Total: ${item.total_units}`
        }
        left={(props) => (
          <Icon
            {...props}
            name={
              checked
                ? "checkbox-marked-circle-outline"
                : "checkbox-blank-circle-outline"
            }
            color={checked ? "green" : props.color ?? "rgba(0, 0, 0, 0.54)"}
            size={24}
          />
        )}
        right={(props) => (
          <Button
            style={props.style}
            onPress={onEditQuantityPress}
            // icon="pencil-outline"
            compact
          >
            <Text
              variant="headlineSmall"
              style={{
                color: "#0bbf64",
              }}
            >
              {qty}
            </Text>
          </Button>
        )}
        // onPress={() => setSelectedProduct(item)}
        onLongPress={onLongPress}
        onPress={onPress}
      />
    );
  },
);

const IndexScreen = () => {
  const [user] = useUser();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedMachines, setSelectedMachines] = useState<
    VendingMachineItemType[]
  >([]);
  const [showMachineSelectMenu, setShowMachineSelectMenu] = useState(false);
  const [wareHouses] = useWarehousesState();
  const [selectedWareHouse, setSelectedWareHouse] =
    useState<WarehouseItemType>();

  const [selectedProduct, setSelectedProduct] = useState<ProductItem>();
  const [productsQuantity, setProductsQuantity] = useState<
    Record<string, number>
  >({});

  const [categories] = useCategoriesState();
  const [_products] = useProductsState();

  const [checkedProducts, setCheckedProducts] = useState<number[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const [newProducts, setNewProducts] = useState<ProductItem[]>([]);
  const [productPickerVisible, setProductPickerVisible] = useState(false);

  const machineIds = useMemo(() => {
    return selectedMachines.map((item) => ({ _docID: item.machine_id }));
  }, [selectedMachines]);

  const {
    isLoading: isLoadingTrayProducts,
    data: dataTrayProducts = [],
    refetch: refetchTrayProducts,
  } = useQuery({
    queryKey: ["PickTrayProducts", ...machineIds],
    queryFn: async () => {
      const res = await Promise.all(
        machineIds.map(({ _docID }) =>
          wenderApi.get(`/liveStatusRefill/machineInventory/${_docID}`),
        ),
      );
      const products = res.flatMap(({ data }) => {
        return data.data[0].rows_details;
      }) as ProductItem[];

      const o: { [key: string]: ProductItem } = {};
      products.forEach((item) => {
        if (o[item.product_id]) {
          o[item.product_id].left_units += item.left_units;
          o[item.product_id].total_units += item.total_units;
        } else {
          o[item.product_id] = item;
        }
      });

      return Object.values(o);
    },
    onSuccess(data) {
      // console.log("data", data);
    },
  });

  const allProducts = useMemo(() => {
    return (
      [...dataTrayProducts, ...newProducts].sort((a, b) => {
        return a.product_name.localeCompare(b.product_name);
      }) ?? []
    );
  }, [dataTrayProducts, newProducts]);

  const selectedProductIds = useMemo(() => {
    return allProducts.map((item) => `${item.product_id}`) ?? [];
  }, [allProducts]);

  const groupedProducts = useMemo(() => {
    const result: {
      title: string; // category name
      data: ProductItem[];
    }[] = [];

    const productsMap = _products.reduce(
      (acc, item) => {
        acc[item.product_id] = item;
        return acc;
      },
      {} as Record<string, ProductItemType>,
    );

    const productCategoryMap = allProducts.reduce(
      (acc, item) => {
        const _p = productsMap[item.product_id];
        if (!_p) return acc;

        const categoryName =
          categories[_p.category_id]?.category_name ?? "Uncategorized";

        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }

        acc[categoryName].push(item);
        return acc;
      },
      {} as Record<string, ProductItem[]>,
    );

    Object.entries(productCategoryMap).forEach(([key, value]) => {
      result.push({
        title: key,
        data: value,
      });
    });

    return result.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
  }, [_products, allProducts, categories]);

  const handlePickerDismiss = useCallback(() => {
    setPickerVisible(false);
  }, []);

  const handlePickerSubmit = useCallback((items: VendingMachineItemType[]) => {
    setSelectedMachines(items);
    setPickerVisible(false);
    setNewProducts([]);
  }, []);

  const getProductQuantity = useCallback(
    (product: ProductItem) => {
      if (!product.product_id) return 0;

      return (
        productsQuantity[product.product_id] ??
        product.total_units - product.left_units
      );
    },
    [productsQuantity],
  );

  const handleDialogDismiss = useCallback(() => {
    setSelectedProduct(undefined);
  }, []);

  const handleConfirmSubmit = useCallback(async () => {
    const idToken = user?.idTokenResult?.token;
    const products: Record<string, number> = {};

    if (!idToken) {
      return Alert.alert(
        "Error",
        "idToken not found, please reload the app, and try again.",
      );
    }

    allProducts.forEach((item) => {
      const qty = getProductQuantity(item);
      if (qty !== 0) {
        products[item.product_id] = qty;
      }
    });

    const batch = db.batch();
    const pickLogRef = db.collection("picklog").doc();

    batch.set(pickLogRef, {
      products,
      warehouse: selectedWareHouse?._docID,
      createdAt: serverTimestamp(),
      createdBy: user?.uid,
    });

    const WarehouseProductsCol = db.collection(
      `WarehouseStorage/${selectedWareHouse?._docID || "[__5xx__]"}/products`,
    );
    const RefillerStorageCol = db.collection(
      `RefillerStorage/${user?.uid || "[__5xx__]"}/products`,
    );

    try {
      await api.post(
        "/updateProductQuantity",
        [
          {
            collectionPath: WarehouseProductsCol.path,
            products,
            increment: false,
          },
          {
            collectionPath: RefillerStorageCol.path,
            products,
            increment: true,
          },
        ],
        { headers: { Authorization: `Bearer ${idToken}` } },
      );

      await batch.commit();
      return batch;
    } catch (error: any) {
      Alert.alert("Error", error.toString() || "Something went wrong");
      throw error;
    }
  }, [
    allProducts,
    getProductQuantity,
    selectedWareHouse?._docID,
    user?.idTokenResult?.token,
    user?.uid,
  ]);

  const handleSubmit = useCallback(() => {
    const uncheckedProducts = allProducts.filter(
      (item) => !checkedProducts.includes(item.product_id),
    );

    const uncheckedProductsQuantity = uncheckedProducts
      ?.map((item) => getProductQuantity(item))
      .filter((item) => item > 0);

    if (uncheckedProductsQuantity?.length) {
      return Alert.alert(
        "Unchecked products",
        `You have ${uncheckedProductsQuantity.length} unchecked products.`,
        [{ text: "Cancel", style: "cancel" }],
      );
    }

    Alert.alert(
      "Submit",
      "Are you sure you want to submit?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: async () => {
            try {
              setSubmitting(true);
              await handleConfirmSubmit();
            } catch (error: any) {
              console.error(error);
              Alert.alert("Error", error.toString() || "Something went wrong");
            } finally {
              setSelectedWareHouse(undefined);
              setSelectedMachines([]);
              setProductsQuantity({});
              setCheckedProducts([]);
              setNewProducts([]);
              setSubmitting(false);
            }
          },
        },
      ],
      { cancelable: false },
    );
  }, [
    allProducts,
    checkedProducts,
    getProductQuantity,
    handleConfirmSubmit,
    setSubmitting,
    setSelectedWareHouse,
    setSelectedMachines,
    setProductsQuantity,
    setCheckedProducts,
    setNewProducts,
  ]);

  const handleToggleCheckedProduct = useCallback((productId: number) => {
    setCheckedProducts((prevState) => {
      if (prevState.includes(productId)) {
        return prevState.filter((item) => item !== productId);
      } else {
        return [...prevState, productId];
      }
    });
  }, []);

  const emptyProduct = useCallback(
    (product: ProductItem) => {
      Alert.alert(
        "Empty product",
        `Are you sure you want to empty ${product.product_name}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Empty",
            onPress: () => {
              setProductsQuantity((prevState) => ({
                ...prevState,
                [product.product_id]: 0,
              }));
            },
          },
        ],
      );
    },
    [setProductsQuantity],
  );

  const handleAddNewProduct = useCallback(
    (product: ProductItemType) => {
      const newProduct: ProductItem = {
        product_id: Number(product.product_id),
        product_name: product.product_name,
        product_price: product.product_price,
        machine_price: product.product_price,
        left_units: 0,
        total_units: 0,
        percent: 0,
        pos: "",
        show_column: false,
        show_pos: "",
        enabled: true,
      };

      setNewProducts((prevState) => [...prevState, newProduct]);
      setProductPickerVisible(false);
      setSelectedProduct(newProduct);
    },
    [setNewProducts],
  );

  return (
    <>
      <View
        style={{
          marginVertical: 16,
          flexDirection: "row",
          paddingRight: 16,
        }}
      >
        <FlatList
          style={{ flexGrow: 1 }}
          horizontal
          data={selectedMachines}
          keyExtractor={(item) => item.machine_id}
          renderItem={({ item }) => (
            <Chip key={item.machine_id} mode="outlined" compact>
              {item.machine_id}
            </Chip>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={{ color: "gray", alignSelf: "center" }}>
              No machines selected
            </Text>
          )}
        />
        <Chip
          icon="fridge-outline"
          onPress={() => setPickerVisible(true)}
          disabled={checkedProducts.length > 0}
          compact
        >
          Select Machine
        </Chip>
      </View>

      <SectionList
        sections={groupedProducts}
        keyExtractor={(item) => `${item.product_id}`}
        stickySectionHeadersEnabled
        renderItem={({ item }) => {
          const qty = getProductQuantity(item);
          const isChecked = checkedProducts.includes(item.product_id);

          return (
            <ProductListItem
              item={item}
              checked={isChecked}
              qty={qty}
              onEditQuantityPress={() => setSelectedProduct(item)}
              onPress={() => handleToggleCheckedProduct(item.product_id)}
              onLongPress={() => emptyProduct(item)}
            />
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <List.Subheader style={{ backgroundColor: "#fff", elevation: 1 }}>
            {title}
          </List.Subheader>
        )}
        refreshing={isLoadingTrayProducts}
        ListFooterComponent={() => <View style={{ height: 80 }} />}
        onRefresh={refetchTrayProducts}
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
          disabled={submitting || !selectedWareHouse || !allProducts.length}
          onPress={handleSubmit}
          loading={submitting}
        >
          Submit
        </Button>
      </View>

      <MachinePickerModal
        visible={pickerVisible}
        onDismiss={handlePickerDismiss}
        selectedMachines={selectedMachines}
        onSelectedMachinesChange={handlePickerSubmit}
      />

      <ProductQuantityDialog
        selectedProduct={selectedProduct}
        value={getProductQuantity(
          selectedProduct ?? ({} as ProductItem),
        ).toString()}
        onDismiss={handleDialogDismiss}
        onSubmit={(quantity) => {
          setProductsQuantity((prevState) => ({
            ...prevState,
            [selectedProduct?.product_id ?? ""]: quantity,
          }));
          handleDialogDismiss();
        }}
      />

      <ProductPicker
        visible={productPickerVisible}
        onDismiss={() => setProductPickerVisible(false)}
        onSelectProduct={handleAddNewProduct}
        disabledItems={selectedProductIds}
      />

      <FAB
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 60,
        }}
        icon="plus"
        onPress={() => setProductPickerVisible(true)}
        // disabled={!selectedMachines.length}
      />
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

export default IndexScreen;
