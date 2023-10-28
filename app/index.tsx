import { View } from "react-native";
import { Divider, List } from "react-native-paper";
import { router } from "expo-router";
import { useState } from "react";
import { useUser } from "../hooks/useUserInfo";

const admins = ["hasis.raj@gmail.com", "akanshmathur1807@gmail.com"];

const Home = () => {
  const [id, setId] = useState(0);
  const [user] = useUser();

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
    </View>
  );
};

export default Home;
