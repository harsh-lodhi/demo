import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Button, Chip, FAB, List, Menu, Text } from "react-native-paper";
import {
  ProductItemType,
  VendingMachineItemType,
  WarehouseItemType,
} from "../../../atoms/app";
import { useCallback, useMemo, useState } from "react";
import MachinePickerModal from "../../../components/MachinePickerModal";
import { useQuery } from "react-query";
import { wenderApi } from "../../../api";
import { useWarehousesState } from "../../../hooks/appState";
import ProductQuantityDialog, {
  ProductItem,
} from "../../(aux)/picker/ProductQuantityDialog";
import { db, serverTimestamp } from "../../../utils/firebase";
import * as Device from "expo-device";
import ProductPicker from "../../admin/(aux)/ProductPicker";
import { useUser } from "../../../hooks/useUserInfo";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

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

  const [checkedProducts, setCheckedProducts] = useState<number[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const [newProducts, setNewProducts] = useState<ProductItem[]>([]);
  const [productPickerVisible, setProductPickerVisible] = useState(false);

  const machineIds = useMemo(() => {
    return selectedMachines.map((item) => ({ _docID: item.machine_id }));
  }, [selectedMachines]);

  const {
    isLoading: isLoadingTrayProducts,
    data: dataTrayProducts,
    refetch: refetchTrayProducts,
  } = useQuery({
    queryKey: ["PickTrayProducts", ...machineIds],
    queryFn: async () => {
      const res = await Promise.all(
        machineIds.map(({ _docID }) =>
          wenderApi.get(`/liveStatusRefill/machineInventory/${_docID}`)
        )
      );
      const products = res.flatMap(({ data }) => {
        return data.data[0].rows_details;
      }) as ProductItem[];

      // return products;

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

  const selectedProductIds = useMemo(() => {
    return (
      [...(dataTrayProducts || []), ...newProducts].map(
        (item) => `${item.product_id}`
      ) ?? []
    );
  }, [dataTrayProducts, newProducts]);

  const filteredProducts = useMemo(() => {
    return (
      [...(dataTrayProducts || []), ...newProducts].sort((a, b) => {
        return a.product_name.localeCompare(b.product_name);
      }) ?? []
    );
  }, [dataTrayProducts, newProducts]);

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
    [productsQuantity]
  );

  const handleDialogDismiss = useCallback(() => {
    setSelectedProduct(undefined);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    const result: Record<string, number> = {};

    dataTrayProducts?.forEach((item) => {
      result[item.product_id] = getProductQuantity(item);
    });

    setSubmitting(true);
    db.collection("picklog")
      .add({
        products: result,
        warehouse: selectedWareHouse?._docID,
        createdByDevice: {
          deviceName: Device.deviceName,
          deviceYearClass: Device.deviceYearClass,
          isDevice: Device.isDevice,
          modelName: Device.modelName,
          brand: Device.brand,
          manufacturer: Device.manufacturer,
          osName: Device.osName,
          osVersion: Device.osVersion,
          platformApiLevel: Device.platformApiLevel,
          supportedCpuArchitectures: Device.supportedCpuArchitectures,
          totalMemory: Device.totalMemory,
        },
        createdAt: serverTimestamp(),
        createdBy: user?.uid,
      })
      .then(() => {
        console.log("Document successfully written!");
        setSelectedMachines([]);
        setSelectedWareHouse(undefined);
        setProductsQuantity({});
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      })
      .finally(() => setSubmitting(false));
  }, [dataTrayProducts, getProductQuantity, selectedWareHouse?._docID]);

  const handleSubmit = useCallback(() => {
    const uncheckedProducts = dataTrayProducts?.filter(
      (item) => !checkedProducts.includes(item.product_id)
    );

    const uncheckedProductsQuantity = uncheckedProducts
      ?.map((item) => getProductQuantity(item))
      .filter((item) => item > 0);

    if (uncheckedProductsQuantity?.length) {
      return Alert.alert(
        "Unchecked products",
        `You have ${uncheckedProductsQuantity.length} unchecked products.`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
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
          onPress: handleConfirmSubmit,
        },
      ],
      { cancelable: false }
    );
  }, [
    checkedProducts,
    dataTrayProducts,
    handleConfirmSubmit,
    productsQuantity,
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
        ]
      );
    },
    [setProductsQuantity]
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
    [setNewProducts]
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

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => `${item.product_id}`}
        renderItem={({ item }) => {
          const qty = getProductQuantity(item);
          const isChecked = checkedProducts.includes(item.product_id);
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
                    isChecked
                      ? "checkbox-marked-circle-outline"
                      : "checkbox-blank-circle-outline"
                  }
                  color={
                    isChecked ? "green" : props.color ?? "rgba(0, 0, 0, 0.54)"
                  }
                  size={24}
                />
              )}
              right={(props) => (
                <Button
                  style={props.style}
                  onPress={() => setSelectedProduct(item)}
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
              onLongPress={() => emptyProduct(item)}
              onPress={() => handleToggleCheckedProduct(item.product_id)}
            />
          );
        }}
        refreshing={isLoadingTrayProducts}
        ListFooterComponent={() => <View style={{ height: 80 }} />}
        onRefresh={() => {
          // refetch();
          refetchTrayProducts();
        }}
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
          disabled={!selectedWareHouse || !filteredProducts.length}
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
          selectedProduct ?? ({} as ProductItem)
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
        disabled={!selectedMachines.length}
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
