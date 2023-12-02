import { wenderApi } from "api";
import { ProductItem } from "app/(aux)/picker/ProductQuantityDialog";
import ProductPicker from "app/admin/(aux)/ProductPicker";
import RefillItem from "app/ops/(tabs)/refill.new/(aux)/refill-item";
import { ProductItemType } from "atoms/app";
import Loader from "components/Loader/Loader";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FC, useCallback, useRef, useState } from "react";
import { Alert, FlatList, SectionList, View } from "react-native";
import { Button, Text, TouchableRipple } from "react-native-paper";
import { useQuery } from "react-query";

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
  const router = useRouter();
  const [changedItems, setChangedItems] = useState<Record<string, ProductItem>>(
    {},
  );
  const [itemToEdit, setItemToEdit] = useState<ProductItem | null>(null);
  const sectionList = useRef<SectionList>(null);
  const [submitting, setSubmitting] = useState(false);

  const { isLoading, data = [] } = useQuery({
    queryKey: ["PickTrayProducts", params.machine_id],
    queryFn: async () => {
      const res = await wenderApi.get(
        `/liveStatusRefill/machineInventory/${params.machine_id}`,
      );
      const data = res.data.data[0].rows_details as ProductItem[];
      const result: { title: string; data: ProductItem[] }[] = [];
      data.forEach((v) => {
        const tray = v.pos[0] as unknown as number;
        if (!result[tray]) {
          result[tray] = { title: `${tray}`, data: [] };
        }
        result[tray].data.push(v);
      });

      return result.filter((v) => v);
    },
    enabled: !!params.machine_id || typeof params.machine_id !== "string",
    refetchOnMount: true,
  });

  const handleItemChange = useCallback((item: ProductItem) => {
    setChangedItems((prev) => ({ ...prev, [item.pos]: item }));
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
    [itemToEdit],
  );

  const handleSubmit = useCallback(async () => {
    const allChangedItems = Object.values(changedItems);
    const totalChangedItems = allChangedItems.length;
    if (!totalChangedItems) {
      Alert.alert(
        "Empty",
        "You haven't changed anything. Please change something and try again.",
      );
      return;
    }

    const allItems = data.flatMap((v) => {
      return v.data.map((i) => changedItems[i.pos] || i);
    });

    const totalAmount = allItems.reduce((acc, v) => {
      return acc + v.product_price * v.left_units;
    }, 0);

    try {
      setSubmitting(true);

      await wenderApi.post("/refiller-app/updateMachineProducts", {
        items: allChangedItems.map((item) => ({
          left_units: item.left_units,
          new_price: item.product_price,
          pos: item.pos,
          product_id: item.product_id,
          show_pos: item.show_pos,
        })),
        machine_id: params.machine_id,
        total_amount: `${totalAmount}`,
        warehouse_id: "",
      });

      Alert.alert("Success", "Machine has been refilled successfully.");

      // Goback
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message ??
          "Something went wrong. Please try again later or contact support.",
      );
    } finally {
      setSubmitting(false);
    }

    console.log(JSON.stringify(allItems, null, 2));
    console.log("totalAmount", totalAmount);
    console.log("changedItems", JSON.stringify(changedItems, null, 2));
  }, [changedItems, data, params.machine_id, router]);

  return (
    <>
      <ScreenOptions onSubmit={handleSubmit} />
      <Loader visible={isLoading || submitting} />

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
            style={{ backgroundColor: "#0bbf64" }}
          >
            <View style={{ padding: 4 }}>
              <Text
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  borderRadius: 4,
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

      <SectionList
        ref={sectionList}
        stickySectionHeadersEnabled
        sections={data}
        windowSize={6}
        // getItemLayout={(data, index) => {
        //   console.log(data?.[index]);

        //   return {
        //     length: 80,
        //     offset: 80 * index,
        //     index,
        //   };
        // }}
        keyExtractor={(item) => item.pos}
        renderItem={({ item }) => (
          <RefillItem
            item={changedItems[item.pos] || item}
            onChange={handleItemChange}
            onPressEdit={setItemToEdit}
          />
        )}
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
        onDismiss={() => setItemToEdit(null)}
        onSelectProduct={handleProductChange}
        disabledItems={
          itemToEdit?.product_id ? [`${itemToEdit.product_id}`] : undefined
        }
      />
    </>
  );
};

export default RefillMachineScreen;
