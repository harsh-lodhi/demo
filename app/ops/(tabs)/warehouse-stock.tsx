import { WarehouseItemType } from "atoms/app";
import { router } from "expo-router";
import { useWarehousesState } from "hooks/appState";
import { useCallback } from "react";
import { FlatList } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { Storage } from "types/common";

const WarehouseOpsScreen = () => {
  const [warehouses] = useWarehousesState();

  const handleItemPress = useCallback((item: WarehouseItemType) => {
    // console.log(item);
    router.push({
      pathname: "/ops/ops-storage",
      params: {
        storageName: Storage.WAREHOUSE,
        storageLabel: item.name,
        id: item._docID,
      },
    });
  }, []);

  return (
    <>
      <Text variant="labelLarge" style={{ padding: 16 }}>
        Select warehouse
      </Text>
      
      <FlatList
        data={warehouses}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            // description={item._docID}
            onPress={() => handleItemPress(item)}
            left={(props) => <List.Icon {...props} icon="warehouse" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        keyExtractor={(item) => item._docID}
      />
    </>
  );
};

export default WarehouseOpsScreen;
