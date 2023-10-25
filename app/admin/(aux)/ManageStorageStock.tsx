import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Storage } from "../../../types/common";
import { FlatList, Modal, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  Dialog,
  Divider,
  FAB,
  IconButton,
  List,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { ProductItemType } from "../../../atoms/app";
import { db } from "../../../utils/firebase";
import { useProductsState } from "../../../hooks/appState";
import { formatPrice } from "../../../utils/currency";
import { SearchBar } from "react-native-screens";
import { listToDocsObj } from "../../../utils/common";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { DEFAULT_PRODUCT_IMAGE } from "../../../constants";

interface _ProductType {
  product_ref: FirebaseFirestoreTypes.DocumentReference;
  quantity: number;
}

interface StorageProductsFormProps {
  id: string;
  storageName: Storage;
}

const ManageStorageStock: React.FC<StorageProductsFormProps> = ({
  id,
  storageName,
}) => {
  const [allProducts] = useProductsState();
  const [products, setProducts] = useState<_ProductType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    | {
        id: string;
        quantity: string;
      }
    | undefined
  >();

  useEffect(() => {
    const unsubs = db
      .collection(`${storageName}/${id}/products`)
      .onSnapshot((snapshot) => {
        const products: _ProductType[] = [];
        snapshot.forEach((doc) => {
          products.push(doc.data() as _ProductType);
        });
        setProducts(products);
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

  const handleSelectProduct = useCallback((product_id: string) => {
    setSelectedProduct({
      id: product_id,
      quantity: `${productsObj[product_id]?.quantity || ""}`,
    });
    setModalVisible(false);
  }, []);

  const handleAddProduct = useCallback(async () => {
    if (!selectedProduct) return;
    await db
      .collection(`${storageName}/${id}/products`)
      .doc(selectedProduct.id)
      .set({
        product_ref: db.doc(`Products/${selectedProduct.id}`),
        quantity: parseInt(selectedProduct.quantity),
      });
    setSelectedProduct(undefined);
  }, [selectedProduct, storageName]);

  return (
    <>
      <List.Subheader>{storageName}</List.Subheader>
      <FlatList
        data={products}
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
                  <View>
                    <Chip compact>{item.quantity}</Chip>
                  </View>
                );
              }}
              onPress={() => {
                setSelectedProduct({
                  id: item.product_ref.id,
                  quantity: `${item.quantity}`,
                });
              }}
            />
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", marginTop: 16 }}>
            <Text>No products</Text>
          </View>
        }
        ItemSeparatorComponent={() => {
          return <Divider />;
        }}
      />

      <FAB
        style={styles.fab}
        onPress={() => {
          setModalVisible(true);
        }}
        icon="plus"
      />

      <Modal
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

          <SearchBar
            placeholder="Search"
            onChangeText={(text) => {
              console.log(text);
            }}
          />
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
      </Modal>

      <Portal>
        <Dialog
          visible={!!selectedProduct}
          onDismiss={() => {
            setSelectedProduct(undefined);
          }}
          dismissable={false}
        >
          <Dialog.Title>{selectedProductObj?.product_name}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Quantity"
              placeholder="Enter quantity"
              keyboardType="number-pad"
              value={selectedProduct?.quantity}
              autoFocus
              onChangeText={(text) => {
                setSelectedProduct((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    quantity: text,
                  };
                });
              }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleAddProduct}>Save</Button>

            <Button
              onPress={() => {
                setSelectedProduct(undefined);
              }}
            >
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ManageStorageStock;
