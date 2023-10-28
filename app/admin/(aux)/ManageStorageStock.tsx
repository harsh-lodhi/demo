import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
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

const ManageStorageStock: FC<StorageProductsFormProps> = ({
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

  const [savingProduct, setSavingProduct] = useState(false);

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

  const totalValue = useMemo(() => {
    return products.reduce((acc, cur) => {
      return (
        acc + cur.quantity * allProductsObj[cur.product_ref.id].product_price
      );
    }, 0);
  }, [products, allProductsObj]);

  const handleSelectProduct = useCallback((product_id: string) => {
    setSelectedProduct({
      id: product_id,
      quantity: `${productsObj[product_id]?.quantity || ""}`,
    });
    setModalVisible(false);
  }, []);

  const handleAddProduct = useCallback(async () => {
    if (!selectedProduct) return;
    setSavingProduct(true);
    await db
      .collection(`${storageName}/${id}/products`)
      .doc(selectedProduct.id)
      .set({
        product_ref: db.doc(`Products/${selectedProduct.id}`),
        quantity: parseInt(selectedProduct.quantity),
      });
    setSelectedProduct(undefined);
    setSavingProduct(false);
  }, [selectedProduct, storageName]);

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: 16,
        }}
      >
        <List.Subheader>{storageName}</List.Subheader>
        <Text variant="labelLarge">Total: {formatPrice(totalValue)}</Text>
      </View>

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
                  <View
                    style={{
                      gap: 8,
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                    }}
                  >
                    <Chip compact>{item.quantity}</Chip>
                    <Text>{formatPrice(item.quantity * _p.product_price)}</Text>
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
              disabled={savingProduct}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
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
