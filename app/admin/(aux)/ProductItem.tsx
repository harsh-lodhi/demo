import { Chip, List, Text } from "react-native-paper";
import { ProductItemType } from "../../../atoms/app";
import { FC, ReactNode, memo } from "react";
import { formatPrice } from "../../../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../../../constants";
import { Storage } from "../../../types/common";
import { View } from "react-native";

interface ProductItemProps {
  item: ProductItemType & {
    totalQty: number;
    storageQty: {
      [storageType: string]: {
        [storageId: string]: number;
      };
    };
  };
}

const getStorageIcon = (storageType: Storage) => {
  switch (storageType) {
    case Storage.WAREHOUSE:
      return "warehouse";
    case Storage.REFILLER:
      return "account-multiple-outline";
    case Storage.VENDING_MACHINE:
      return "fridge-outline";
    default:
      return "help";
  }
};

const QtyChips = ({
  data,
}: {
  data: ProductItemProps["item"]["storageQty"];
}) => {
  let chips: ReactNode[] = [];

  for (let storageType in data) {
    let totalQty = 0;
    let items: { label: string; value: number }[] = [];

    for (let storageId in data[storageType]) {
      totalQty += data[storageType][storageId];

      items.push({
        label: storageId,
        value: data[storageType][storageId],
      });
    }

    chips.push(
      <Chip
        key={storageType}
        style={{ marginRight: 5 }}
        icon={getStorageIcon(storageType as Storage)}
        compact
      >
        {totalQty}
      </Chip>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {chips}
    </View>
  );
};

const ProductItem: FC<ProductItemProps> = memo(({ item }) => {
  return (
    <List.Item
      title={item.product_name}
      description={(props) => {
        return (
          <View style={{ gap: 8 }}>
            <Text>{formatPrice(item.product_price)}</Text>
            <QtyChips data={item.storageQty} />
          </View>
        );
      }}
      left={(props) => (
        <List.Image
          source={{ uri: item.image_mini || DEFAULT_PRODUCT_IMAGE }}
          style={[props.style, { backgroundColor: "#f9f9f9" }]}
        />
      )}
      right={(props) => (
        <Text style={props.style} variant="labelLarge">
          {item.totalQty}
        </Text>
      )}
    />
  );
});

export default ProductItem;
