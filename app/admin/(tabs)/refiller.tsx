import { TeamMemberItemType } from "atoms/app";
import { router } from "expo-router";
import { useTeamMembersState } from "hooks/appState";
import { useCallback } from "react";
import { FlatList, Image } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { Storage } from "types/common";
import { DEFAULT_PRODUCT_IMAGE } from "utils/constants";

const RefillerScreen = () => {
  const [teamMembers] = useTeamMembersState();

  const handleItemPress = useCallback((item: TeamMemberItemType) => {
    router.push({
      pathname: "/admin/storage",
      params: {
        storageName: Storage.REFILLER,
        id: item.user_id,
      },
    });
  }, []);

  return (
    <FlatList
      data={teamMembers.items}
      renderItem={({ item }) => (
        <List.Item
          title={item.name}
          description={`${item.is_active ? "✅" : "❌"}`}
          style={{
            paddingLeft: 16,
          }}
          right={(props) => <Text>{item.phone_number}</Text>}
          left={(props) => (
            <Image
              source={{ uri: item.profile_pic || DEFAULT_PRODUCT_IMAGE }}
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#f9f9f9",
              }}
            />
          )}
          onPress={() => handleItemPress(item)}
        />
      )}
      keyExtractor={(item) => item._docID}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
};

export default RefillerScreen;
