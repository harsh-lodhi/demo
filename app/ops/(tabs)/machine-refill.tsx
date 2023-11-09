import { SectionList, StatusBar, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text } from "react-native-paper";
import { useProductsState } from "../../../hooks/appState";
import { useState } from "react";
import { useQuery } from "react-query";
import { wenderApi } from "../../../api";
import { ProductItem } from "../../(aux)/picker/ProductQuantityDialog";

const MachineRefillScreen = () => {
  const [machineIds, setMachineIds] = useState([2181]);

  const {
    isLoading: isLoadingTrayProducts,
    data: dataTrayProducts = [],
    refetch: refetchTrayProducts,
  } = useQuery({
    queryKey: ["PickTrayProducts", machineIds],
    queryFn: async () => {
      const res = await Promise.all(
        machineIds.map((v) => {
          return wenderApi.get(`/liveStatusRefill/machineInventory/${v}`);
        })
      );

      const data = res.map((v) => v.data.data[0]);
      return data;
    },
    onSuccess(data) {
      console.log("---", data[0]);
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", gap: 8, padding: 4 }}>
        <Chip>1</Chip>
        <Chip>2</Chip>
        <Chip>3</Chip>
        <Chip>4</Chip>
      </View>

      {/* <SectionList
        stickySectionHeadersEnabled={true}
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <Card style={styles.item}>

            <Card.Cover
              source={{
                uri: "https://picsum.photos/700",
              }}
            />

            <Card.Content>
              <Text style={styles.title}>{item}</Text>
              <Card.Actions>
                <Button>Full</Button>
                <Button>Empty</Button>
              </Card.Actions>
            </Card.Content>
          </Card>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.header}>{title}</Text>
        )}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          padding: 8,
        }}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    // backgroundColor: "#f9c2ff",
    // paddingVertical: 120,
    marginVertical: 8,
  },
  header: {
    // fontSize: 32,
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  title: {
    // fontSize: 24,
  },
});

export default MachineRefillScreen;
