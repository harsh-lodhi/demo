import { FC, useCallback } from "react";
import { FlatList, Modal, StyleSheet, View } from "react-native";
import { Appbar, Button, Divider, List, Text } from "react-native-paper";
import { useQuery } from "react-query";
import { wenderApi } from "../../api";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

interface RefillItem {
  after_price: number;
  after_product_id: string;
  after_product_name: string;
  after_quantity: number;
  after_show_pos: null;
  before_price: number;
  before_product_id: string;
  before_product_name: string;
  before_quantity: number;
  before_show_pos: null;
  created_at: string;
  refill_id: string;
  refill_item_id: string;
  row_position: string;
}

interface RefillProductsProps {
  id?: string;
  onDismiss: () => void;
  onSubmit: (products: Record<string, number>) => void;
}

const RefillProductsModal: FC<RefillProductsProps> = ({
  id,
  onDismiss,
  onSubmit,
}) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["refill-history", id],
    queryFn: async () => {
      return await wenderApi
        .get(`/liveStatusRefill/getRefillHistoryDetails/${id}`)
        .then((res) => res.data.data as RefillItem[]);
    },
    enabled: !!id,
  });

  const handleSubmit = useCallback(() => {
    const result: {
      product_id: string;
      quantity: number;
    }[] = [];

    data?.forEach((item) => {
      if (item.before_product_id == item.after_product_id) {
        result.push({
          product_id: item.before_product_id,
          quantity: item.after_quantity - item.before_quantity,
        });
      } else {
        result.push({
          product_id: item.before_product_id,
          quantity: item.before_quantity * -1,
        });
        result.push({
          product_id: item.after_product_id,
          quantity: item.after_quantity,
        });
      }
    });

    onSubmit(
      result.reduce((acc, item) => {
        if (acc[item.product_id]) {
          acc[item.product_id] += item.quantity;
        } else {
          acc[item.product_id] = item.quantity;
        }
        return acc;
      }, {} as Record<string, number>)
    );
  }, [data]);

  if (!id) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      visible={!!id}
      onRequestClose={onDismiss}
      onDismiss={onDismiss}
    >
      <Appbar
        style={{
          elevation: 1,
        }}
      >
        <Appbar.BackAction onPress={onDismiss} />
        <Appbar.Content title="Refill Products" />
      </Appbar>
      <FlatList
        data={data}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => {
          const itemChanged = item.before_product_id !== item.after_product_id;

          if (!itemChanged) {
            return (
              <List.Item
                title={item.before_product_name}
                left={(props) => (
                  <View style={[props.style, styles.pos]}>
                    <Text
                      style={{
                        textAlign: "center",
                      }}
                    >
                      {item.row_position}
                    </Text>
                  </View>
                )}
                description={
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Text>
                      Quantity: {item.after_quantity - item.before_quantity}
                    </Text>
                    <Icon
                      name="arrow-up-circle-outline"
                      color={
                        item.after_quantity - item.before_quantity > 0
                          ? "green"
                          : "red"
                      }
                      size={16}
                    />
                  </View>
                }
              />
            );
          }

          if (item.before_quantity === 0) {
            return (
              <List.Item
                title={item.after_product_name}
                left={(props) => (
                  <View style={[props.style, styles.pos]}>
                    <Text
                      style={{
                        textAlign: "center",
                      }}
                    >
                      {item.row_position}
                    </Text>
                  </View>
                )}
                description={
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Text>Quantity: {item.after_quantity}</Text>
                    <Icon
                      name="arrow-up-circle-outline"
                      color="green"
                      size={16}
                    />
                  </View>
                }
              />
            );
          }

          return (
            <View style={{ flexDirection: "row" }}>
              <View style={[styles.pos, { marginLeft: 16 }]}>
                <Text
                  style={{
                    textAlign: "center",
                  }}
                >
                  {item.row_position}
                </Text>
              </View>
              <List.Item
                title={item.before_product_name}
                style={{ flex: 1 }}
                description={
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Text>Quantity: {item.before_quantity}</Text>
                    <Icon
                      name="arrow-down-circle-outline"
                      color="red"
                      size={16}
                    />
                  </View>
                }
              />
              <List.Item
                title={item.after_product_name}
                style={{ flex: 1 }}
                description={
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Text>Quantity: {item.after_quantity}</Text>
                    <Icon
                      name="arrow-up-circle-outline"
                      color="green"
                      size={16}
                    />
                  </View>
                }
              />
            </View>
          );
        }}
        ItemSeparatorComponent={() => <Divider />}
      />

      <Button
        onPress={handleSubmit}
        mode="contained"
        style={{ borderRadius: 0 }}
      >
        Submit
      </Button>
    </Modal>
  );
};

const styles = StyleSheet.create({
  pos: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    width: 50,
    borderRadius: 8,
    alignSelf: "center",
  },
});

export default RefillProductsModal;
