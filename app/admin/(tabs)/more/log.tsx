import { Stack, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";
import { List, Text } from "react-native-paper";
import { useQuery } from "react-query";
import { db } from "../../../../utils/firebase";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { functionApi } from "../../../../api";
import { UserType } from "../../../../atoms/auth";
import { useMemo } from "react";

interface LogItem {
  _id: string;
  created_at: FirebaseFirestoreTypes.Timestamp;
  created_by: string;
  products: Record<string, number>;

  createdAt?: FirebaseFirestoreTypes.Timestamp;
  createdBy?: string;
}

const LogView = () => {
  const searchParams = useLocalSearchParams();

  const {
    data: users = [],
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: "firebase-users",
    queryFn: async () => {
      const res = await functionApi.get<{ users: UserType[] }>("/getAllUsers");
      return res.data?.users;
    },
  });

  const {
    data: logs,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["logs", searchParams.type],
    queryFn: async () => {
      const collectionName = searchParams.type;
      if (!collectionName || typeof collectionName != "string") return;
      return db
        .collection(collectionName)
        .orderBy(
          collectionName == "picklog" ? "createdAt" : "created_at",
          "desc"
        )
        .limit(10)
        .get()
        .then((snapshot) => {
          const data: LogItem[] = [];
          snapshot.forEach((doc) => {
            data.push({
              _id: doc.id,
              ...(doc.data() as Omit<LogItem, "_id">),
            });
          });

          return data.map((d) => ({
            ...d,
            created_at: d.createdAt || d.created_at,
            created_by: d.createdBy || d.created_by,
          }));
        });
    },
    enabled: !!searchParams.type,
  });

  const usersObj = useMemo(() => {
    const obj: Record<string, UserType> = {};
    users.forEach((u) => {
      obj[u.uid] = u;
    });
    return obj;
  }, [users]);

  if (typeof searchParams.type != "string") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Invalid type</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: {
            picklog: "Pick Logs",
            refilllog: "Refill Logs",
            returnlog: "Return Logs",
          }[searchParams.type],
        }}
      />
      <FlatList
        data={logs}
        renderItem={({ item }) => {
          const user = usersObj[item.created_by];
          return (
            <List.Item
              title={item.created_at?.toDate().toLocaleString("en-IN")}
              description={`By ${user?.displayName}`}
              left={(props) => <List.Icon {...props} icon="account-multiple" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          );
        }}
        keyExtractor={(item) => item._id}
        refreshing={isLoading || isLoadingUsers}
        onRefresh={() => {
          refetchUsers();
          refetch();
        }}
      />
    </>
  );
};

export default LogView;
