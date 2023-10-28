import { Stack } from "expo-router";
import { IconButton, List, Menu } from "react-native-paper";
import { useState } from "react";
import useListenersInit from "../../hooks/useListnersInit";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "../../utils/firebase";
import { useUser } from "../../hooks/useUserInfo";

const AppLayout = () => {
  const [show, setShow] = useState(false);
  const [user, setUser] = useUser();

  useListenersInit();

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("[EEEEEE]", error);
    }
  };

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
                <List.Subheader>{user?.displayName}</List.Subheader>
                <Menu.Item
                  onPress={signOut}
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

export default AppLayout;
