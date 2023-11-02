import { Alert, FlatList, View } from "react-native";
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  Divider,
  List,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import { useQuery } from "react-query";
import { functionApi } from "../../../../api";
import { useCallback, useState } from "react";

interface UserItem {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL: string;
  disabled: boolean;
  metadata: {
    lastSignInTime: string;
    creationTime: string;
    lastRefreshTime: string;
  };
  customClaims?: {
    role?: "admin";
    wenderId?: string;
  };
  tokensValidAfterTime: string;
  providerData: [
    {
      uid: string;
      displayName: string;
      email: string;
      photoURL: string;
      providerId: string;
    }
  ];
}

const TeamScreen = () => {
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);
  const [claimData, setClaimData] = useState<{
    wenderId?: string;
    role?: "admin";
  }>({});
  const [saving, setSaving] = useState(false);

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: "firebase-users",
    queryFn: async () => {
      const res = await functionApi.get<{ users: UserItem[] }>("/getAllUsers");
      return res.data?.users;
    },
  });

  const handleUserPress = useCallback((user: UserItem) => {
    setUserToEdit(user);
    setClaimData(user.customClaims || {});
  }, []);

  const handleSaveClaim = useCallback(async () => {
    if (!userToEdit) return;

    setSaving(true);
    try {
      await functionApi.post("/setCustomClaims", {
        uid: userToEdit.uid,
        claims: claimData,
      });
    } catch (error: any) {
      Alert.alert("Error", error.toString(), [{ text: "OK" }], {
        cancelable: false,
      });
      return;
    } finally {
      setSaving(false);
    }

    handleDialogDismiss();

    refetch();
  }, [userToEdit, claimData, refetch]);

  const handleDialogDismiss = useCallback(() => {
    setUserToEdit(null);
    setClaimData({});
  }, []);

  return (
    <>
      <FlatList
        data={data}
        renderItem={({ item }) => {
          return (
            <List.Item
              title={`${item.displayName} (${
                item.customClaims?.wenderId || "..."
              })`}
              description={() => {
                return (
                  <View style={{ gap: 4 }}>
                    <Text>{item.email}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {item?.customClaims?.role && (
                        <Chip compact>{item.customClaims.role}</Chip>
                      )}
                    </View>
                  </View>
                );
              }}
              left={(props) => (
                <List.Image
                  {...props}
                  source={{ uri: item.photoURL }}
                  style={[
                    props.style,
                    {
                      width: 32,
                      height: 32,
                      borderRadius: 32,
                      backgroundColor: "#ccc",
                    },
                  ]}
                />
              )}
              onPress={() => handleUserPress(item)}
            />
          );
        }}
        refreshing={isLoading}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={() => (
          <View style={{ height: 40, backgroundColor: "transparent" }} />
        )}
      />

      <Portal>
        <Dialog visible={!!userToEdit} onDismiss={() => setUserToEdit(null)}>
          <Dialog.Title>Update user</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Wender ID"
              value={claimData.wenderId}
              onChangeText={(text) =>
                setClaimData({ ...claimData, wenderId: text })
              }
            />
            <Checkbox.Item
              label="Admin"
              status={claimData.role === "admin" ? "checked" : "unchecked"}
              onPress={() =>
                setClaimData({
                  ...claimData,
                  role: claimData.role === "admin" ? undefined : "admin",
                })
              }
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDialogDismiss} disabled={saving}>
              Cancel
            </Button>
            <View style={{ flex: 1 }} />
            <Button
              onPress={handleSaveClaim}
              icon="check"
              disabled={saving}
              loading={saving}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default TeamScreen;
