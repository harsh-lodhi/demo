import { View } from "react-native";
import {
  Button,
  Divider,
  IconButton,
  List,
  Menu,
  Text,
} from "react-native-paper";
import { Stack, router } from "expo-router";
import { useUser } from "../hooks/useUserInfo";
import * as Application from "expo-application";
import { useState } from "react";
import { signOut } from "../utils/auth";

const StackScreenOptions = () => {
  const [show, setShow] = useState(false);
  const [user] = useUser();

  return (
    <Stack.Screen
      options={{
        title: "GoGrab",
        headerRight: () => (
          <Menu
            visible={show}
            onDismiss={() => setShow(false)}
            anchor={
              <IconButton icon="dots-vertical" onPress={() => setShow(true)} />
            }
          >
            <List.Subheader>{user?.displayName}</List.Subheader>
            <Menu.Item onPress={signOut} title="Logout" leadingIcon="logout" />
          </Menu>
        ),
      }}
    />
  );
};

const Home = () => {
  const [user] = useUser();

  if (!user?.claims?.approved) {
    return (
      <>
        <StackScreenOptions />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            maxWidth: "70%",
            alignSelf: "center",
          }}
        >
          <Text
            variant="labelLarge"
            style={{ textAlign: "center", marginBottom: 16 }}
          >
            You are not authorized to use this app.
          </Text>
          <Text style={{ textAlign: "center" }}>
            Please reachout to your reporting Manager to get your user approved
            to be able to login
          </Text>
          <Text style={{ textAlign: "center" }}>
            if you are already approved, please logout and login again.
          </Text>
          <Button onPress={signOut}>Logout</Button>
        </View>
      </>
    );
  }

  return (
    <>
      <StackScreenOptions />
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

          {user?.claims?.role == "admin" && (
            <>
              <Divider />
              <List.Item
                title="Admin"
                onPress={() => router.push("/admin")}
                right={() => <List.Icon icon="chevron-right" />}
              />
            </>
          )}
        </List.Section>

        {/* <View
        style={{
          alignSelf: "center",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
        }}
      >
        <Button onPress={() => {}}>Check-in</Button>
        <Timer />
      </View> */}

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
    </>
  );
};

export default Home;
