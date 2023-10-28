import { View } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { router } from "expo-router";
import { useUser } from "../hooks/useUserInfo";
import * as Application from "expo-application";

const admins = ["hasis.raj@gmail.com", "akanshmathur1807@gmail.com"];

const Home = () => {
  const [user] = useUser();

  return (
    <View style={{ flex: 1 }}>
      <List.Section>
        <List.Subheader>Navigation</List.Subheader>

        <List.Item
          title="Operations"
          onPress={() => {
            router.push("/ops");
          }}
          right={() => <List.Icon icon="chevron-right" />}
        />

        {admins.includes(user?.email || "") && (
          <>
            <Divider />
            <List.Item
              title="Admin"
              onPress={() => {
                router.push("/admin");
              }}
              right={() => <List.Icon icon="chevron-right" />}
            />
          </>
        )}
      </List.Section>
      <View style={{ flex: 1 }} />
      <View style={{ marginVertical: 16 }}>
        <Text
          variant="labelSmall"
          style={{ textAlign: "center", color: "#ccc" }}
        >
          Version: {Application.nativeApplicationVersion}-
          {Application.nativeBuildVersion}
        </Text>
      </View>
    </View>
  );
};

export default Home;
