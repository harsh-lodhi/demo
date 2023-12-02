import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { VendingMachineItemType } from "atoms/app";
import { Stack, useRouter } from "expo-router";
import { useVendingMachines } from "hooks/useVendingMachines";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";

const ScreenOptions = () => {
  return <Stack.Screen options={{ title: "Select machine" }} />;
};

const SelectMachineScreen = () => {
  const { data: machines, isLoading, refetch } = useVendingMachines();
  const router = useRouter();

  const handleItemPress = useCallback(
    (item: VendingMachineItemType) => {
      router.push(
        `/ops/(tabs)/refill.new/refill-machine?machine_id=${item.machine_id}`,
      );
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item: machine }: { item: VendingMachineItemType }) => {
      return (
        <List.Item
          title={() => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Icon
                name={
                  machine.machine_status === "running"
                    ? "check-circle"
                    : "alert-circle-outline"
                }
                size={16}
                color={machine.machine_status === "running" ? "green" : "red"}
              />
              <Text style={{ fontWeight: "bold" }}>{machine.name}</Text>
              <Text>{machine.machine_id}</Text>
            </View>
          )}
          description={() => {
            return (
              <View style={{ paddingLeft: 24, paddingTop: 8 }}>
                <Text>₹{machine.total_price}</Text>
                <Text>
                  {((machine.left_units / machine.total_units) * 100).toFixed(
                    1,
                  )}
                  % filled ({machine.left_units} / {machine.total_units})
                </Text>
              </View>
            );
          }}
          onPress={() => handleItemPress(machine)}
          right={(props) => <Icon name="chevron-right" {...props} size={24} />}
        />
      );
    },
    [handleItemPress],
  );

  const renderListFooterComponent = useCallback(() => {
    if (isLoading) return null;
    const totalMachines = machines?.length ?? 0;

    return (
      <Text style={{ textAlign: "center", padding: 16 }}>
        {totalMachines === 0
          ? "No machines found"
          : `Total ${totalMachines} machines`}
      </Text>
    );
  }, [isLoading, machines?.length]);

  const renderItemSeparatorComponent = useCallback(() => {
    return <Divider />;
  }, []);

  const keyExtractor = useCallback((item: VendingMachineItemType) => {
    return item.machine_id;
  }, []);

  return (
    <>
      <ScreenOptions />
      <FlatList
        data={machines}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={renderItemSeparatorComponent}
        ListFooterComponent={renderListFooterComponent}
      />
    </>
  );
};

export default SelectMachineScreen;
