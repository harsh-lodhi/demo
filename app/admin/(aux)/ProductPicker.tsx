import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Modal,
  SectionList,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Appbar,
  Button,
  Divider,
  FAB,
  IconButton,
  List,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import { useCategoriesState, useProductsState } from "../../../hooks/appState";
import { DEFAULT_PRODUCT_IMAGE } from "../../../constants";
import { formatPrice } from "../../../utils/currency";
import { ProductItemType } from "../../../atoms/app";

interface ProductListProps {
  product: ProductItemType;
  onPress: () => void;
}

const ProductItem = React.memo(({ product, onPress }: ProductListProps) => {
  return (
    <List.Item
      title={product.product_name}
      description={
        <View>
          <Text>{formatPrice(product.product_price)}</Text>
        </View>
      }
      left={() => {
        return (
          <List.Image
            style={{ marginLeft: 16, backgroundColor: "#f9f9f9" }}
            source={{ uri: product.image_mini || DEFAULT_PRODUCT_IMAGE }}
          />
        );
      }}
      onPress={onPress}
    />
  );
});

interface ProductPickerProps {
  visible: boolean;
  disabledItems?: string[];
  onDismiss: () => void;
  onSelectProduct: (product: ProductItemType) => void;
}

const ProductPicker: FC<ProductPickerProps> = ({
  visible,
  disabledItems = [],
  onDismiss,
  onSelectProduct,
}) => {
  const [allProducts] = useProductsState();
  const [categories] = useCategoriesState();
  const [searchText, setSearchText] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [categoriesMenuVisible, setCategoriesMenuVisible] = useState(false);

  const sectionList = useRef<SectionList>(null);

  const filteredProducts = useMemo(() => {
    let products = allProducts;

    if (searchText) {
      products = products.filter((product) => {
        return product.product_name
          .toLowerCase()
          .includes(searchText.toLowerCase());
      });
    }

    return products
      .filter((product) => {
        return !disabledItems.includes(product.product_id.toString());
      })
      .sort((a, b) => {
        return a.product_name.localeCompare(b.product_name);
      });
  }, [allProducts, disabledItems, searchText]);

  const groupedProducts = useMemo(() => {
    const grouped: {
      title: string;
      data: ProductItemType[];
    }[] = [];

    const groupedCategories: {
      [key: string]: ProductItemType[];
    } = {};

    filteredProducts.forEach((product) => {
      const categoryName = categories[product.category_id]?.category_name;

      if (categoryName) {
        if (!groupedCategories[categoryName]) {
          groupedCategories[categoryName] = [];
        }

        groupedCategories[categoryName].push(product);
      } else {
        if (!groupedCategories["Uncategorized"]) {
          groupedCategories["Uncategorized"] = [];
        }

        groupedCategories["Uncategorized"].push(product);
      }
    });

    Object.entries(groupedCategories).forEach(([title, data]) => {
      grouped.push({
        title,
        data,
      });
    });

    return grouped.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
  }, [categories, filteredProducts]);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", () => {
      if (searchVisible) {
        setSearchVisible(false);
        return true;
      }

      return false;
    });
  }, [searchVisible]);

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <Appbar.Header style={{ elevation: 4 }}>
        <IconButton icon="close" onPress={onDismiss} />
        {searchVisible ? (
          <TextInput
            autoFocus
            style={{ flex: 1 }}
            placeholder="Search product"
            value={searchText}
            onChangeText={setSearchText}
            dense
            right={
              <TextInput.Icon icon="close" onPress={() => setSearchText("")} />
            }
          />
        ) : (
          <Appbar.Content title="Select product" />
        )}

        {searchVisible ? (
          <Button onPress={() => setSearchVisible((prev) => !prev)}>
            Cancel
          </Button>
        ) : (
          <IconButton
            icon="magnify"
            onPress={() => setSearchVisible((prev) => !prev)}
          />
        )}
      </Appbar.Header>

      <SectionList
        stickySectionHeadersEnabled
        sections={groupedProducts}
        keyExtractor={(item) => item.product_id.toString()}
        ref={sectionList}
        renderItem={({ item }) => {
          return (
            <ProductItem product={item} onPress={() => onSelectProduct(item)} />
          );
        }}
        renderSectionHeader={({ section: { title } }) => {
          return (
            <List.Subheader
              style={{
                backgroundColor: "#fff",
                elevation: 4,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              {title}
            </List.Subheader>
          );
        }}
        ItemSeparatorComponent={() => {
          return <Divider />;
        }}
        ListEmptyComponent={() => {
          return <Text style={{ padding: 16 }}>No products found</Text>;
        }}
      />

      {categoriesMenuVisible && (
        <TouchableWithoutFeedback
          onPress={() => {
            setCategoriesMenuVisible(false);
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff90",
              position: "absolute",
              zIndex: 1,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: "#f9f9f9",
                padding: 16,
                elevation: 3,
                marginBottom: 64,
                borderRadius: 8,
              }}
            >
              {groupedProducts.map((group, i) => {
                return (
                  <List.Item
                    key={group.title}
                    title={group.title}
                    onPress={() => {
                      setCategoriesMenuVisible(false);

                      if (sectionList.current) {
                        sectionList.current.scrollToLocation({
                          sectionIndex: i,
                          itemIndex: 1,
                        });
                      }
                    }}
                  />
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      <FAB
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        icon="menu"
        onPress={() => {
          setCategoriesMenuVisible(true);
        }}
      />
    </Modal>
  );
};

export default ProductPicker;
