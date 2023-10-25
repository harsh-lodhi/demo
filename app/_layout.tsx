import { Stack } from "expo-router";
import useListenersInit from "../hooks/useListnersInit";
import { Divider, IconButton, List, Menu, Text } from "react-native-paper";
import { auth } from "../utils/firebase";
import { useState } from "react";

const Layout = () => {
  const [show, setShow] = useState(false);
  useListenersInit();

  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "GoGrab",
            headerRight: () => (
              <Menu
                visible={show}
                onDismiss={() => setShow(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => setShow(true)}
                  />
                }
              >
                <List.Subheader>Auth</List.Subheader>
                <Menu.Item
                  onPress={() => {
                    auth.signOut();
                  }}
                  title="Logout"
                  leadingIcon="logout"
                />
              </Menu>
            ),
          }}
        />
        <Stack.Screen
          name="admin"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ops"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default Layout;
