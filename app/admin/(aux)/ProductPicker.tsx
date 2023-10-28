import { FC, useMemo } from "react";
import { FlatList, Modal } from "react-native";
import { Appbar, Divider, IconButton, List } from "react-native-paper";
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

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      return !disabledItems.includes(product.product_id);
    });
  }, [allProducts, disabledItems]);

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <Appbar.Header style={{ elevation: 4 }}>
        <IconButton icon="close" onPress={onDismiss} />
        <Appbar.Content title="Select product" />
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
