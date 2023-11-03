import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { List } from "react-native-paper";

const SettingsScreen = () => {
  const route = useRouter();

  return (
    <ScrollView>
      <List.Section title="Org">
        <List.Item
          title="Users"
          description="Manage users"
          left={(props) => <List.Icon {...props} icon="account-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => route.push("admin/(tabs)/more/team")}
        />
        <List.Item
          title="Product mismatch"
          description="Issues reported by refillers"
          left={(props) => <List.Icon {...props} icon="account-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => route.push("admin/(tabs)/more/product-missmatch")}
        />
      </List.Section>
      <List.Section title="Logs">
        <List.Item
          title="Picks"
          description="Warehouse to Refiller bag"
          left={(props) => <List.Icon {...props} icon="file-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => route.push("admin/(tabs)/more/log?type=picklog")}
        />
        <List.Item
          title="Refills"
          description="Refiller bag to Vending machine"
          left={(props) => <List.Icon {...props} icon="file-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => route.push("admin/(tabs)/more/log?type=refilllog")}
        />
        <List.Item
          title="Returns"
          description="Refiller bag to Warehouse"
          left={(props) => <List.Icon {...props} icon="file-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => route.push("admin/(tabs)/more/log?type=returnlog")}
        />
      </List.Section>
    </ScrollView>
  );
};

export default SettingsScreen;
