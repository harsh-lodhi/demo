import { ToastAndroid, View } from "react-native";
import {
  Banner,
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
import { useCallback, useState } from "react";
import { signOut } from "../utils/auth";
import * as Updates from "expo-updates";
import { useQuery } from "react-query";

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
  const [applyingUpdate, setApplyingUpdate] = useState(false);

  const {
    data: update,
    refetch: checkForUpdate,
    isFetching: isCheckingForUpdate,
  } = useQuery({
    queryKey: "checkForUpdate",
    queryFn: async () => {
      if (__DEV__) return;
      return await Updates.checkForUpdateAsync();
    },
    refetchInterval: 1000 * 60 * 60 * 24,
  });

  const updateApp = useCallback(async () => {
    try {
      setApplyingUpdate(true);
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error: any) {
      ToastAndroid.show(
        error.message ?? "Error applying update. Please try again later.",
        ToastAndroid.LONG
      );
    } finally {
      setApplyingUpdate(false);
    }
  }, []);

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

      <Banner
        visible={!!update?.isAvailable}
        actions={[
          {
            label: applyingUpdate ? "Updating..." : "Apply Update",
            loading: applyingUpdate,
            disabled: applyingUpdate,
            onPress: updateApp,
          },
        ]}
        icon="information"
      >
        A new update is available.
      </Banner>

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

        <View style={{ flex: 1 }} />

        <View style={{ opacity: 0.4 }}>
          {isCheckingForUpdate ? (
            <View style={{ alignSelf: "center", alignItems: "center" }}>
              <Text variant="labelSmall">Checking for updates...</Text>
            </View>
          ) : (
            !update?.isAvailable && (
              <View style={{ alignSelf: "center", alignItems: "center" }}>
                <Text variant="labelSmall">You are on the latest version.</Text>
                <Button
                  onPress={() => checkForUpdate()}
                  loading={isCheckingForUpdate}
                  disabled={isCheckingForUpdate}
                >
                  Check for updates
                </Button>
              </View>
            )
          )}
        </View>

        <View style={{ marginVertical: 16 }}>
          <Text
            variant="labelSmall"
            style={{ textAlign: "center", color: "#ccc" }}
          >
            Version: {Application.nativeApplicationVersion}-
            {Application.nativeBuildVersion}
          </Text>
          <Text
            variant="labelSmall"
            style={{ textAlign: "center", color: "#ccc" }}
          >
            ({Updates.updateId || "null"})
          </Text>
        </View>
      </View>
    </>
  );
};

export default Home;
