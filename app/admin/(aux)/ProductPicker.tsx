import { FC, useEffect, useMemo, useState } from "react";
import { BackHandler, FlatList, Modal } from "react-native";
import {
  Appbar,
  Divider,
  IconButton,
  List,
  TextInput,
} from "react-native-paper";
import { useProductsState } from "../../../hooks/appState";
import { DEFAULT_PRODUCT_IMAGE } from "../../../constants";
import { formatPrice } from "../../../utils/currency";
import { ProductItemType } from "../../../atoms/app";

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
  const [searchText, setSearchText] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

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
        {searchVisible ? (
          <>
            <TextInput
              autoFocus
              style={{ flex: 1 }}
              placeholder="Search product"
              value={searchText}
              onChangeText={setSearchText}
            />
          </>
        ) : (
          <>
            <IconButton icon="close" onPress={onDismiss} />
            <Appbar.Content title="Select product" />
          </>
        )}

        <IconButton
          icon={searchVisible ? "close" : "magnify"}
          onPress={() => {
            setSearchVisible((prev) => !prev);
          }}
        />
      </Appbar.Header>

      <FlatList
        data={filteredProducts}
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
                onSelectProduct(item);
              }}
            />
          );
        }}
        ItemSeparatorComponent={() => {
          return <Divider />;
        }}
      />
    </Modal>
  );
};

export default ProductPicker;
