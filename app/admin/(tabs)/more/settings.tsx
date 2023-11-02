import { useRouter } from "expo-router";
import { View } from "react-native";
import { List } from "react-native-paper";

const SettingsScreen = () => {
  const route = useRouter();

  return (
    <View>
      <List.Section title="Personal">
        <List.Item
          title="Users"
          description="Manage users"
          left={(props) => <List.Icon {...props} icon="account-multiple" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => route.push("admin/(tabs)/more/team")}
        />
      </List.Section>
    </View>
  );
};

export default SettingsScreen;
