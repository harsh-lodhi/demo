import { Stack, useLocalSearchParams } from "expo-router";
import { Animated, FlatList, SectionList, View } from "react-native";
import { Button, Text, TouchableRipple } from "react-native-paper";
import { useQuery } from "react-query";
import { wenderApi } from "../../../../api";
import Loader from "../../../../components/Loader/Loader";
import { ProductItem } from "../../../(aux)/picker/ProductQuantityDialog";
import RefillItem from "./(aux)/refill-item";
import { FC, useCallback, useRef, useState } from "react";
import ProductPicker from "../../../admin/(aux)/ProductPicker";
import { ProductItemType } from "../../../../atoms/app";

interface RefillMachineScreenProps {
  onSubmit: () => void;
}

const ScreenOptions: FC<RefillMachineScreenProps> = ({ onSubmit }) => (
  <Stack.Screen
    options={{
      title: "Refill Machine",
      headerRight: () => (
        <Button onPress={onSubmit} compact>
          Submit
        </Button>
      ),
    }}
  />
);

const RefillMachineScreen = () => {
  const params = useLocalSearchParams();
  const [changedItems, setChangedItems] = useState<Record<string, ProductItem>>(
    {}
  );
  const [itemToEdit, setItemToEdit] = useState<ProductItem | null>(null);

  const sectionList = useRef<SectionList>(null);

  const {
    isLoading,
    data = [],
    refetch,
  } = useQuery({
    queryKey: ["PickTrayProducts", params.machine_id],
    queryFn: async () => {
      const res = await wenderApi.get(
        `/liveStatusRefill/machineInventory/${params.machine_id}`
      );
      const data = res.data.data[0].rows_details as ProductItem[];

      const result: {
        title: string;
        data: ProductItem[];
      }[] = [];

      data.forEach((v) => {
        const tray = v.pos[0] as unknown as number;
        if (!result[tray]) {
          result[tray] = {
            title: `${tray}`,
            data: [],
          };
        }

        result[tray].data.push(v);
      });

      return result.filter((v) => v);
    },
    enabled: !!params.machine_id || typeof params.machine_id !== "string",
  });

  const handleItemChange = useCallback((item: ProductItem) => {
    setChangedItems((prev) => ({
      ...prev,
      [item.pos]: item,
    }));
  }, []);

  const handleProductChange = useCallback(
    (item: ProductItemType) => {
      setChangedItems((prev) => {
        if (!itemToEdit) return prev;

        return {
          ...prev,
          [itemToEdit.pos]: {
            ...itemToEdit,
            product_id: Number(item.product_id),
            product_name: item.product_name,
            product_price: item.product_price,
            left_units: 0,
          },
        };
      });

      setItemToEdit(null);
    },
    [itemToEdit?.product_id]
  );

  const handleSubmit = useCallback(async () => {
    console.log("changedItems", JSON.stringify(changedItems, null, 2));
  }, [changedItems]);

  return (
    <>
      <ScreenOptions onSubmit={handleSubmit} />
      <Loader visible={isLoading} />

      <FlatList
        horizontal
        data={data}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableRipple
            onPress={() => {
              sectionList.current?.scrollToLocation({
                sectionIndex: index,
                itemIndex: 1,
              });
            }}
            style={{
              backgroundColor: "#0bbf64",
            }}
          >
            <View
              style={{
                padding: 4,
              }}
            >
              <Text
                style={{
                  // backgroundColor: theme.colors.primary,
                  // color: theme.colors.onPrimary,
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  borderRadius: 4,
                  // elevation: 2,
                }}
              >
                {item.title}
              </Text>
            </View>
          </TouchableRipple>
        )}
        keyExtractor={(item) => item.title}
        ItemSeparatorComponent={() => <View style={{ width: 2 }} />}
        ListHeaderComponent={() => (
          <View
            style={{
              paddingHorizontal: 8,
              height: 33,
              // backgroundColor: "#333",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text>Tray</Text>
          </View>
        )}
        contentContainerStyle={{
          padding: 4,
        }}
      />

      <Animated.SectionList
        ref={sectionList}
        stickySectionHeadersEnabled={true}
        sections={data}
        keyExtractor={(item) => item.pos}
        renderItem={({ item }) => (
          <RefillItem
            item={changedItems[item.pos] || item}
            onChange={handleItemChange}
            onPressEdit={(item) => {
              setItemToEdit(item);
            }}
          />
        )}
        onViewableItemsChanged={({ viewableItems }) => {
          // if (!viewableItems.length) return;
          // console.log(viewableItems);
          // sectionList.current?.scrollToLocation({
          //   sectionIndex: index,
          //   itemIndex: 1,
          // });
        }}
        renderSectionHeader={({ section: { title } }) => {
          return (
            <View
              style={{
                backgroundColor: "#f1f1f1",
                padding: 16,
                elevation: 2,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                variant="labelLarge"
                style={{
                  backgroundColor: "#333",
                  color: "#ffffff",
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  borderRadius: 4,
                  alignSelf: "flex-start",
                }}
              >
                Tray {title}
              </Text>
            </View>
          );
        }}
      />

      <ProductPicker
        visible={!!itemToEdit}
        onDismiss={() => {
          // setItemToEdit(null)
        }}
        onSelectProduct={(item) => {
          handleProductChange(item);
        }}
        disabledItems={
          itemToEdit?.product_id ? [`${itemToEdit.product_id}`] : undefined
        }
      />
    </>
  );
};

export default RefillMachineScreen;
