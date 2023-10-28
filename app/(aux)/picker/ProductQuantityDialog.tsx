import { FC, useEffect, useState } from "react";
import { View } from "react-native";
import { Portal, Dialog, TextInput, Button, Chip } from "react-native-paper";

export interface ProductItem {
  enabled: boolean;
  left_units: number;
  machine_price: number;
  percent: number;
  pos: string;
  product_id: number;
  product_name: string;
  product_price: number;
  show_column: boolean;
  show_pos: string;
  total_units: number;
}

interface ProductQuantityDialogProps {
  selectedProduct?: ProductItem;
  value: string;
  onDismiss: () => void;
  onSubmit: (quantity: number) => void;
}

const increment = (prev: string, by: number = 1) => {
  let value = parseInt(prev, 10);

  if (isNaN(value)) {
    value = 0;
  }

  return (value + by).toString();
};

const ProductQuantityDialog: FC<ProductQuantityDialogProps> = ({
  selectedProduct,
  value,
  onDismiss,
  onSubmit,
}) => {
  const [quantityValue, setQuantityValue] = useState("");

  useEffect(() => {
    if (selectedProduct) {
      setQuantityValue(value || "");
    } else {
      setQuantityValue("");
    }
  }, [selectedProduct, value]);

  const handleSubmit = () => {
    const quantity = parseInt(quantityValue, 10);

    if (quantity) {
      onSubmit(quantity);
    }
  };

  return (
    <Portal>
      <Dialog visible={!!selectedProduct} onDismiss={onDismiss}>
        <Dialog.Title>{selectedProduct?.product_name}</Dialog.Title>

        <Dialog.Content style={{ gap: 16 }}>
          <TextInput
            label="Quantity"
            keyboardType="number-pad"
            value={quantityValue}
            onChangeText={setQuantityValue}
            autoFocus
            right={
              <TextInput.Icon
                icon="close-circle"
                onPress={() => setQuantityValue("")}
              />
            }
          />
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <Chip
              icon="plus"
              onPress={() => setQuantityValue((prev) => increment(prev, 3))}
            >
              3
            </Chip>
            <Chip
              icon="plus"
              onPress={() => setQuantityValue((prev) => increment(prev, 5))}
            >
              5
            </Chip>

            <Chip
              icon="plus"
              onPress={() => setQuantityValue((prev) => increment(prev, 10))}
            >
              10
            </Chip>

            <Chip
              icon="plus"
              onPress={() => setQuantityValue((prev) => increment(prev, 20))}
            >
              20
            </Chip>
          </View>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <View style={{ flex: 1 }} />
          <Button onPress={handleSubmit}>Submit</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ProductQuantityDialog;
