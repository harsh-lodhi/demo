import { View } from "react-native";
import { Divider, List } from "react-native-paper";
import { router } from "expo-router";
import { useState } from "react";

const Home = () => {
  const [id, setId] = useState(0);

  return (
    <View>
      <List.Section>
        <List.Subheader>Navigation</List.Subheader>

        <List.Item
          title="Operations"
          onPress={() => {
            router.push("/ops");
          }}
          right={() => <List.Icon icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title="Admin"
          onPress={() => {
            router.push("/admin");
          }}
          right={() => <List.Icon icon="chevron-right" />}
        />
      </List.Section>

      <Divider />
    </View>
  );
};

export default Home;
