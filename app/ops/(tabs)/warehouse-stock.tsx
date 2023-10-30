import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { useCallback } from "react";
import { router } from "expo-router";
import { Storage } from "../../../types/common";
import { WarehouseItemType } from "../../../atoms/app";
import { useWarehousesState } from "../../../hooks/appState";

const WarehouseOpsScreen = () => {
  const [warehouses] = useWarehousesState();

  const handleItemPress = useCallback((item: WarehouseItemType) => {
    router.push({
      pathname: "/ops/ops-storage",
      params: {
        storageName: Storage.WAREHOUSE,
        id: item._docID,
      },
    });
  }, []);

  return (
    <>
      <FlatList
        data={warehouses}
        renderItem={({ item }) => (
          <List.Item title={item.name} onPress={() => handleItemPress(item)} />
        )}
        keyExtractor={(item) => item._docID}
      />
    </>
  );
};

export default WarehouseOpsScreen;
