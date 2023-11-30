import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack, useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";

import { VendingMachineItemType } from "../../../../atoms/app";
import { useVendingMachinesState } from "../../../../hooks/appState";

const ScreenOptions = () => {
  return <Stack.Screen options={{ title: "Select machine" }} />;
};

const SelectMachineScreen = () => {
  const [machines] = useVendingMachinesState();
  const router = useRouter();

  const handleItemPress = useCallback(
    (item: VendingMachineItemType) => {
      router.push(
        `/ops/(tabs)/refill.new/refill-machine?machine_id=${item.machine_id}`,
      );
    },
    [router],
  );

  return (
    <>
      <ScreenOptions />
      <FlatList
        data={machines.items}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.machine_id}
            onPress={() => {
              handleItemPress(item);
            }}
            right={(props) => (
              <Icon name="chevron-right" {...props} size={24} />
            )}
          />
        )}
        keyExtractor={(item) => item.machine_id}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={() => (
          <View>
            <Text
              style={{
                textAlign: "center",
                padding: 16,
              }}
            >
              {machines.items.length} machine
              {machines.items.length > 1 ? "s" : ""}
            </Text>
          </View>
        )}
      />
    </>
  );
};

export default SelectMachineScreen;
