import { FC, useState, useCallback } from "react";
import { Modal, FlatList, View, StyleSheet } from "react-native";
import { Appbar, List, Divider, FAB, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { VendingMachineItemType } from "../atoms/app";
import { useVendingMachinesState } from "../hooks/appState";

interface MachinePickerModalProps {
  selectedMachines: VendingMachineItemType[];
  onSelectedMachinesChange: (items: VendingMachineItemType[]) => void;

  visible: boolean;
  onDismiss: () => void;
}

const MachinePickerModal: FC<MachinePickerModalProps> = ({
  selectedMachines,
  onSelectedMachinesChange,
  visible,
  onDismiss,
}) => {
  const [vendingMachines] = useVendingMachinesState();
  const [selected, setSelected] = useState<VendingMachineItemType[]>([]);

  const onSelectMachine = useCallback(
    (item: VendingMachineItemType) => {
      setSelected((prev) => {
        if (prev.includes(item)) {
          return prev.filter((i) => i.machine_id !== item.machine_id);
        } else {
          return [...prev, item];
        }
      });
    },
    [setSelected]
  );

  const handleSubmit = useCallback(() => {
    onSelectedMachinesChange(selected);
  }, [selected, onSelectedMachinesChange]);

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={onDismiss} />
        <Appbar.Content title="Select Machines" />
      </Appbar.Header>

      <FlatList
        data={vendingMachines.items}
        keyExtractor={(item) => item.machine_id}
        renderItem={({ item }) => {
          return (
            <List.Item
              title={item.name}
              description={item.machine_id}
              onPress={() => onSelectMachine(item)}
              left={(props) => {
                const isSelected = selected.includes(item);
                return (
                  <Icon
                    name={isSelected ? "check-circle" : "checkbox-blank"}
                    size={24}
                    color={isSelected ? "green" : "#e9e9e9"}
                    style={props.style}
                  />
                );
              }}
              right={(props) => (
                <View style={props.style}>
                  <Text variant="labelSmall">
                    {item.total_units} - {item.left_units}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <Text variant="labelSmall" style={{ color: "gray" }}>
                      ={" "}
                    </Text>
                    <Text variant="titleSmall">
                      {item.total_units - item.left_units}
                    </Text>
                  </View>
                </View>
              )}
            />
          );
        }}
        ItemSeparatorComponent={() => <Divider />}
      />
      <FAB style={styles.fab} icon="check" onPress={handleSubmit} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  title: {
    padding: 16,
  },
  item: {
    backgroundColor: "#fff",
    padding: 16,
  },
  itemSelected: {
    backgroundColor: "#ccc",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default MachinePickerModal;
