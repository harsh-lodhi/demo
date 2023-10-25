import { FlatList, StyleSheet } from "react-native";
import {
  Button,
  Dialog,
  FAB,
  List,
  Portal,
  TextInput,
} from "react-native-paper";
import { useWarehousesState } from "../../../hooks/appState";
import { useCallback, useState } from "react";
import { db, serverTimestamp } from "../../../utils/firebase";
import { DBCollection, Storage } from "../../../types/common";
import { router } from "expo-router";
import { WarehouseItemType } from "../../../atoms/app";

const WarehouseScreen = () => {
  const [warehouses] = useWarehousesState();
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [newName, setNewName] = useState("");
  const [itemIDToEdit, setItemIDToEdit] = useState<string | undefined>(
    undefined
  );

  const handleDialogDismiss = useCallback(() => {
    setShowAddWarehouse(false);
    setNewName("");
    setItemIDToEdit(undefined);
  }, []);

  const handleUpdateWarehouse = useCallback(async () => {
    await db.collection(DBCollection.WAREHOUSES).doc(itemIDToEdit).set({
      name: newName,
      createdAt: serverTimestamp(),
    });

    handleDialogDismiss();
  }, [newName]);

  const handleEditPress = useCallback(async (id: string) => {
    const warehouse = warehouses.find((item) => item._docID == id);

    if (!warehouse) {
      return;
    }

    setNewName(warehouse.name);
    setShowAddWarehouse(true);
    setItemIDToEdit(id);
  }, []);

  const handleItemPress = useCallback((item: WarehouseItemType) => {
    router.push({
      pathname: "/admin/storage",
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
          <List.Item
            title={item.name}
            onLongPress={() => handleEditPress(item._docID)}
            onPress={() => handleItemPress(item)}
          />
        )}
        keyExtractor={(item) => item._docID}
      />

      <Portal>
        <Dialog visible={showAddWarehouse} onDismiss={handleDialogDismiss}>
          <Dialog.Title>{itemIDToEdit ? "Edit" : "Add"} Warehouse</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              placeholder="Enter warehouse name"
              value={newName}
              onChangeText={(text) => setNewName(text)}
            />
          </Dialog.Content>
          <Dialog.Actions>
            {/* <FAB icon="check" onPress={() => handleUpdateWarehouse()} /> */}
            <Button onPress={() => handleUpdateWarehouse()}>
              {itemIDToEdit ? "Update" : "Add"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        onPress={() => {
          setShowAddWarehouse(true);
        }}
        style={styles.fab}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default WarehouseScreen;
