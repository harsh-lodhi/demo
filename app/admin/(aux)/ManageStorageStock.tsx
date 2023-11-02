import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Storage } from "../../../types/common";
import { Alert, FlatList, ToastAndroid, View } from "react-native";
import {
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { ProductItemType } from "../../../atoms/app";
import { db, increment } from "../../../utils/firebase";
import { useProductsState } from "../../../hooks/appState";
import { formatPrice } from "../../../utils/currency";
import { listToDocsObj } from "../../../utils/common";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { DEFAULT_PRODUCT_IMAGE } from "../../../constants";
import { Tabs } from "expo-router";
import ProductPicker from "./ProductPicker";

interface _ProductType {
  product_ref: FirebaseFirestoreTypes.DocumentReference;
  quantity: number;
}

interface StorageProductsFormProps {
  id: string;
  storageName: Storage;
  storageLabel?: string;
  ops?: boolean;
}

const ManageStorageStock: FC<StorageProductsFormProps> = ({
  id,
  storageName,
  storageLabel,
  ops = false,
}) => {
  const [allProducts] = useProductsState();
  const [products, setProducts] = useState<_ProductType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    quantity: string;
  }>();

  const [savingProduct, setSavingProduct] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [newQuantityChange, setNewQuantityChange] = useState("");

  useEffect(() => {
    const unsubs = db
      .collection(`${storageName}/${id}/products`)
      .onSnapshot((snapshot) => {
        const products: _ProductType[] = [];
        snapshot.forEach((doc) => {
          products.push(doc.data() as _ProductType);
        });
        setProducts(products.sort((a, b) => b.quantity - a.quantity));
      });

    return () => {
      unsubs();
    };
  }, [storageName]);

  const allProductsObj: {
    [key: string]: ProductItemType;
  } = useMemo(() => {
    return listToDocsObj(allProducts);
  }, [allProducts]);

  const productsObj = useMemo(() => {
    return listToDocsObj(products);
  }, [products]);

  const selectedProductObj: ProductItemType | undefined = useMemo(() => {
    if (!selectedProduct) return undefined;
    return allProductsObj[selectedProduct.id];
  }, [allProductsObj, selectedProduct]);

  const totalValue = useMemo(() => {
    return products.reduce((acc, cur) => {
      return (
        acc + cur.quantity * allProductsObj[cur.product_ref.id].product_price
      );
    }, 0);
  }, [products, allProductsObj]);

  const filteredProducts = useMemo(() => {
    if (!searchText || !isSearching) return products;
    return products.filter((p) => {
      const _p = allProductsObj[p.product_ref.id];
      return _p.product_name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [products, allProductsObj, searchText, isSearching]);

  const handleSelectProduct = useCallback((product_id: string) => {
    setSelectedProduct({
      id: product_id,
      quantity: `${productsObj[product_id]?.quantity || ""}`,
    });
    setModalVisible(false);
  }, []);

  // const handleAddProduct = useCallback(async () => {
  //   if (!selectedProduct) return;
  //   setSavingProduct(true);
  //   await db
  //     .collection(`${storageName}/${id}/products`)
  //     .doc(selectedProduct.id)
  //     .set({
  //       product_ref: db.doc(`Products/${selectedProduct.id}`),
  //       quantity: parseInt(selectedProduct.quantity),
  //     });
  //   setSelectedProduct(undefined);
  //   setSavingProduct(false);
  // }, [selectedProduct, storageName]);

  const handleSetProduct = useCallback(
    async (inc: boolean) => {
      const v = parseInt(newQuantityChange);
      if (isNaN(v)) {
        Alert.alert("Invalid quantity");
        return;
      }

      if (!selectedProduct) return;
      setSavingProduct(true);
      try {
        await db
          .collection(`${storageName}/${id}/products`)
          .doc(selectedProduct.id)
          .set(
            {
              product_ref: db.doc(`Products/${selectedProduct.id}`),
              quantity: increment(inc ? v : v * -1),
            },
            { merge: true }
          );
        setSelectedProduct(undefined);
        setNewQuantityChange("");
        ToastAndroid.show("Product updated", ToastAndroid.SHORT);
      } catch (error: any) {
        Alert.alert(error.message);
      } finally {
        setSavingProduct(false);
      }
    },
    [selectedProduct, newQuantityChange]
  );

  return (
    <>
      <Tabs.Screen
        options={{
          title: storageLabel,
          headerRight: () => (
            <>
              <IconButton
                icon="magnify"
                onPress={() => {
                  setIsSearching((v) => !v);
                }}
              />
              <IconButton
                icon="plus"
                onPress={() => {
                  setModalVisible(true);
                }}
              />
            </>
          ),
        }}
      />

      {isSearching ? (
        <TextInput
          placeholder="Search"
          right={
            <TextInput.Icon
              icon="close"
              onPress={() => {
                setIsSearching(false);
              }}
            />
          }
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
      ) : null}

      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => {
          const _p = allProductsObj[item.product_ref.id];
          return (
            <List.Item
              title={_p.product_name}
              description={formatPrice(_p.product_price)}
              left={() => {
                return (
                  <List.Image
                    style={{ marginLeft: 16, backgroundColor: "#f9f9f9" }}
                    source={{ uri: _p.image_mini || DEFAULT_PRODUCT_IMAGE }}
                  />
                );
              }}
              right={() => {
                return (
                  <View
                    style={{
                      gap: 8,
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <Chip compact>{item.quantity}</Chip>
                    {!ops && (
                      <Text>
                        {formatPrice(item.quantity * _p.product_price)}
                      </Text>
                    )}
                  </View>
                );
              }}
              onPress={
                ops
                  ? undefined
                  : () => {
                      setSelectedProduct({
                        id: item.product_ref.id,
                        quantity: `${item.quantity}`,
                      });
                    }
              }
            />
          );
        }}
        ListHeaderComponent={() => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: 16,
            }}
          >
            <List.Subheader>{storageName}</List.Subheader>
            {!ops && (
              <Text variant="labelLarge">Total: {formatPrice(totalValue)}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", marginTop: 16 }}>
            <Text>No products</Text>
          </View>
        }
        ItemSeparatorComponent={() => {
          return <Divider />;
        }}
        ListFooterComponent={() => (
          <View style={{ flex: 1, alignItems: "center", marginVertical: 16 }}>
            <Text variant="labelLarge">{products.length} items</Text>
          </View>
        )}
      />

      {/* {!ops && (
        <FAB
          style={styles.fab}
          onPress={() => {
            setModalVisible(true);
          }}
          icon="plus"
        />
      )} */}

      <ProductPicker
        visible={modalVisible}
        onDismiss={() => {
          setModalVisible(false);
        }}
        onSelectProduct={(p) => handleSelectProduct(p.product_id)}
        disabledItems={products.map((p) => p.product_ref.id)}
      />

      {/* <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <Appbar.Header style={{ elevation: 4 }}>
          <IconButton
            icon="close"
            onPress={() => {
              setModalVisible(false);
            }}
          />
          <Appbar.Content title="Select product" />
        </Appbar.Header>

        <FlatList
          data={allProducts}
          renderItem={({ item }) => {
            return (
              <List.Item
                title={item.product_name}
                description={formatPrice(item.product_price)}
                left={() => {
                  return (
                    <List.Image
                      style={{ marginLeft: 16, backgroundColor: "#f9f9f9" }}
                      source={{ uri: item.image_mini || DEFAULT_PRODUCT_IMAGE }}
                    />
                  );
                }}
                onPress={() => {
                  handleSelectProduct(item.product_id);
                }}
              />
            );
          }}
          ItemSeparatorComponent={() => {
            return <Divider />;
          }}
        />
      </Modal> */}

      <Portal>
        <Dialog
          visible={!!selectedProduct}
          onDismiss={() => setSelectedProduct(undefined)}
          dismissable={false}
        >
          <Dialog.Title>
            {selectedProductObj?.product_name} [{selectedProduct?.quantity}]
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Quantity"
              placeholder="Enter quantity"
              keyboardType="number-pad"
              value={newQuantityChange}
              autoFocus
              onChangeText={setNewQuantityChange}
              disabled={savingProduct}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setSelectedProduct(undefined);
                setNewQuantityChange("");
              }}
              disabled={savingProduct}
              loading={savingProduct}
            >
              Cancel
            </Button>

            <View style={{ flex: 1 }} />

            <Button
              icon="plus"
              textColor="green"
              onPress={() => {
                handleSetProduct(true);
              }}
              disabled={savingProduct}
              loading={savingProduct}
            >
              Add
            </Button>
            <Button
              icon="minus"
              textColor="red"
              onPress={() => {
                handleSetProduct(false);
              }}
              disabled={savingProduct}
              loading={savingProduct}
            >
              Remove
            </Button>

            {/* <Button
              onPress={handleAddProduct}
              loading={savingProduct}
              disabled={savingProduct}
            >
              Save
            </Button>

            <Button
              onPress={() => {
                setSelectedProduct(undefined);
              }}
              disabled={savingProduct}
            >
              Cancel
            </Button> */}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

// const styles = StyleSheet.create({
//   fab: {
//     position: "absolute",
//     margin: 16,
//     right: 0,
//     bottom: 0,
//   },
// });

export default ManageStorageStock;
