import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useMemo, useState } from "react";
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

interface CustomClaimsType {
  role?: "admin";
  wenderId?: string;
  approved?: boolean;
}

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
  customClaims?: CustomClaimsType;
  tokensValidAfterTime: string;
  providerData: [
    {
      uid: string;
      displayName: string;
      email: string;
      photoURL: string;
      providerId: string;
    },
  ];
}

const TeamScreen = () => {
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);
  const [claimData, setClaimData] = useState<CustomClaimsType>({});
  const [saving, setSaving] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);

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

  const filteredData = useMemo(() => {
    return data.filter(
      (item) => item.disabled === false || showDisabled === true,
    );
  }, [data, showDisabled]);

  const handleUserPress = useCallback((user: UserItem) => {
    setUserToEdit(user);
    setClaimData(user.customClaims || {});
  }, []);

  const handleDialogDismiss = useCallback(() => {
    setUserToEdit(null);
    setClaimData({});
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
  }, [userToEdit, handleDialogDismiss, refetch, claimData]);

  return (
    <>
      <FlatList
        data={filteredData}
        renderItem={({ item }) => {
          return (
            <List.Item
              title={() => {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text variant="labelLarge">
                      {`${item.displayName} (${
                        item.customClaims?.wenderId || "..."
                      })`}
                    </Text>
                    {item.customClaims?.approved ? (
                      <Icon name="check-circle" size={16} color="green" />
                    ) : (
                      <Icon name="alert-circle" size={16} color="red" />
                    )}
                  </View>
                );
              }}
              description={() => {
                return (
                  <View style={{ gap: 4 }}>
                    <Text style={{ color: "#999" }}>{item.email}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {item?.customClaims?.role && (
                        <Chip compact icon="account">
                          {item.customClaims.role}
                        </Chip>
                      )}
                      {item.disabled && (
                        <Chip compact icon="alert-circle">
                          Disabled
                        </Chip>
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
          <>
            <Divider />
            <List.Item
              title="Show disabled users"
              onPress={() => setShowDisabled((prev) => !prev)}
              left={(props) => (
                <View {...props}>
                  <Checkbox
                    status={showDisabled ? "checked" : "unchecked"}
                    onPress={() => setShowDisabled((prev) => !prev)}
                  />
                </View>
              )}
            />

            <Divider />
            <View style={{ height: 40, backgroundColor: "transparent" }} />
          </>
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
              label="Approved"
              status={claimData.approved ? "checked" : "unchecked"}
              onPress={() =>
                setClaimData({
                  ...claimData,
                  approved: !claimData.approved,
                })
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
