import Icon from "@expo/vector-icons/MaterialCommunityIcons";
// require('dotenv').config();
import {NEW_RELIC_LICENSE_KEY} from "@env"
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { ProductItemType } from "atoms/app";
import { Tabs } from "expo-router";
import { useProductsState } from "hooks/appState";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import { Storage } from "types/common";
import { listToDocsObj } from "utils/common";
import { DEFAULT_PRODUCT_IMAGE } from "utils/constants";
import { formatPrice } from "utils/currency";
import { db, increment } from "utils/firebase";

import ProductPicker from "./ProductPicker";



interface _ProductType {
  product_ref: FirebaseFirestoreTypes.DocumentReference;
  quantity: number;
  title: string;
  price: number;
}

interface StorageProductsFormProps {
  id: string;
  storageName: Storage;
  storageLabel?: string;
  ops?: boolean;
}
// const newRelicLicenseKey = process.env.NEW_RELIC_LICENSE_KEY;
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
    title: string;
    price: number
  }>();

  const [savingProduct, setSavingProduct] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [newQuantityChange, setNewQuantityChange] = useState("");
  const allProductsObj: {
    [key: string]: ProductItemType;  
  } = useMemo(() => {
    return listToDocsObj(allProducts);
  }, [allProducts]);

  useEffect(() => {
    const unsubs = db
      .collection(`${storageName}/${id}/products`)
      .onSnapshot(async (snapshot) => {
        const products: _ProductType[] = [];
  
        // Fetch product data for each document concurrently
        await Promise.all(snapshot.docs.map(async (doc) => {
          const productData = doc.data() as _ProductType;
          const title = allProductsObj[productData.product_ref.id]?.product_name || "Unknown";
          const price = allProductsObj[productData.product_ref.id]?.product_price || 0;
          products.push({ ...productData, title, price }); // Add productName to the product object
        }));
        
  
        setProducts(products.sort((a, b) => b.quantity - a.quantity));
  
        // Prepare the data to send to New Relic
        const events = products.map(product => ({
          eventType: storageLabel || 'Unknown',
          productName: product.title,
          quantity: product.quantity,
          price: product.price
        }));
        
        // Now you can send events to New Relic
        sendEventsToNewRelic(events);
      });
  
  
        
  
  const sendEventsToNewRelic = async (events:any) => {
    // console.log(products)
    products.forEach(product => {
      console.log( allProductsObj[product.product_ref.id].product_name , "-", product.price);
    });
    
    try {
      const res = await fetch(
        'https://insights-collector.newrelic.com/v1/accounts/4142841/events',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': NEW_RELIC_LICENSE_KEY || '',
          },
          body: JSON.stringify(events),
        }
      );

      if (res.ok) {
        console.log('Data sent to New Relic successfully');
      } else {
        console.error('Failed to send data to New Relic:', res.status);
      }
    } catch (error) {
      console.error('Error sending data to New Relic:', error instanceof Error ? error.message : error);
    }
    
  };
  
    return () => {
      unsubs();
    };
  }, [id, storageName]);



  

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

  const handleSelectProduct = useCallback(
    (product_id: string) => {
      setSelectedProduct({
        id: product_id,
        quantity: productsObj[product_id]?.quantity || 0, // Assign default value of 0 if quantity is not available
        title: productsObj[product_id]?.product_name || "",
        price: productsObj[product_id]?.product_price || 0,
      });
      setModalVisible(false);
    },
    [productsObj],
  );

  const handleSetProduct = useCallback(
    async (inc: boolean) => {
      const v = parseInt(newQuantityChange, 10);
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
            { merge: true },
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
    [newQuantityChange, selectedProduct, storageName, id],
  );
  

  return (
    <>
      <Tabs.Screen
        options={{
          title: storageLabel,
          headerRight: () => (
            <>
              <View>
                <IconButton
                  icon={isSearching ? "close" : "magnify"}
                  onPress={() => {
                    setIsSearching((v) => !v);
                  }}
                />
                {isSearching ? (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      alignSelf: "center",
                    }}
                  >
                    <Icon name="chevron-down" size={16} />
                  </View>
                ) : null}
              </View>
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
              icon="close-circle"
              onPress={() => {
                if (searchText !== "") {
                  setSearchText("");
                } else {
                  setIsSearching(false);
                }
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
                        title: _p.product_name,
                        price: _p.product_price
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
