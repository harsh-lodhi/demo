import { VendingMachineItemType } from "atoms/app";
import { router } from "expo-router";
import { useVendingMachinesState } from "hooks/appState";
import { useCallback } from "react";
import { FlatList } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { Storage } from "types/common";

const MachineScreen = () => {
  const [vendingMachines] = useVendingMachinesState();

  const handleItemPress = useCallback((item: VendingMachineItemType) => {
    router.push({
      pathname: "/admin/storage",
      params: {
        storageName: Storage.VENDING_MACHINE,
        id: item._docID,
      },
    });
  }, []);

  return (
    <FlatList
      data={vendingMachines.items}
      renderItem={({ item }) => (
        <List.Item
          title={item.name}
          description={`${item.assigned ? "✅" : "❌"}`}
          style={{
            paddingLeft: 16,
          }}
          right={(props) => <Text>{item.left_units}</Text>}
          onPress={() => handleItemPress(item)}
        />
      )}
      keyExtractor={(item) => item._docID}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

export default MachineScreen;
