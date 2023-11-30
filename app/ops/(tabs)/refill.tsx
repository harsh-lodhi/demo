import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { wenderApi } from "api";
import Loader from "components/Loader/Loader";
import RefillProductsModal from "components/RefillProducts/RefillProducts";
import { format } from "date-fns";
import { useUser } from "hooks/useUserInfo";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { useQuery } from "react-query";
import { db, serverTimestamp, updateProductQuantity } from "utils/firebase";

function addDaysToDate(days: number, date = new Date()) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

interface RefillHistoryItemType {
  created_at: string;
  machine_id: string;
  refill_id: string;
  refiller_id: string;
  refiller_name: string;
}

const RefillScreen = () => {
  const [selectedRefillId, setSelectedRefillId] = useState<string>();
  const [user] = useUser();
  const [saving, setSaving] = useState(false);

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["refill-history"],
    queryFn: async () => {
      const res = await wenderApi.post("/liveStatusRefill/getRefillHistory", {
        start_date: addDaysToDate(-1).toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        limit: 100,
        offset: 0,
        machine_ids: [],
      });
      return res.data.data as RefillHistoryItemType[];
    },
  });

  const filteredData = useMemo(() => {
    let result = data;
    if (user?.claims?.role !== "admin") {
      result = data.filter(
        (item) => item.refiller_id === user?.claims?.wenderId,
      );
    }

    return result.map((item) => ({
      ...item,
      created_at: new Date(item.created_at),
    }));
  }, [data, user?.claims?.role, user?.claims?.wenderId]);

  const confirmSubmit = useCallback(
    async (products: Record<string, number>) => {
      setSaving(true);
      try {
        let batch = db.batch();

        const refillLogRef = db.collection("refilllog").doc(selectedRefillId);
        batch.set(refillLogRef, {
          products,
          created_at: serverTimestamp(),
          created_by: user?.uid,
        });

        batch = await updateProductQuantity({
          col: db.collection(`RefillerStorage/${user!.uid}/products`),
          products,
          increment: false,
          batch,
        });

        await batch.commit();
      } catch (error: any) {
        Alert.alert("Error", error.toString() || "Something went wrong");
      } finally {
        setSelectedRefillId(undefined);
        setSaving(false);
      }
    },
    [selectedRefillId, user],
  );

  const handleSubmit = useCallback(
    async (products: Record<string, number>) => {
      Alert.alert(
        "Confirm",
        "Are you sure you want to submit this refill?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Submit",
            onPress: () => confirmSubmit(products),
          },
        ],
        { cancelable: false },
      );
    },
    [confirmSubmit],
  );

  return (
    <>
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <List.Item
            title={item.refiller_name}
            description={
              <View>
                <Text>
                  {format(new Date(item.created_at), "dd-MMM-yyyy hh:mm a")}
                </Text>
                <Text variant="labelSmall">RID: {item.refill_id}</Text>
              </View>
            }
            left={(props) => (
              <View
                {...props}
                style={[
                  props.style,
                  {
                    backgroundColor: "#ddd",
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                  },
                ]}
              >
                <Text>{item.machine_id}</Text>
              </View>
            )}
            right={(props) => (
              <Icon {...props} name="chevron-right" size={24} />
            )}
            onPress={() => setSelectedRefillId(item.refill_id)}
          />
        )}
        keyExtractor={(item) => item.refill_id}
        refreshing={isLoading}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={() => {
          return filteredData.length > 0 ? (
            <Text variant="labelLarge" style={{ padding: 16 }}>
              Confirm your refills
            </Text>
          ) : undefined;
        }}
        ListEmptyComponent={() => {
          return isLoading ? null : (
            <Text style={{ padding: 16 }}>No refills found</Text>
          );
        }}
        ListFooterComponent={() => {
          return isLoading ? null : (
            <Text
              style={{ padding: 16, textAlign: "center" }}
              variant="labelSmall"
            >
              {filteredData.length} refills found
            </Text>
          );
        }}
      />

      {selectedRefillId && (
        <RefillProductsModal
          id={selectedRefillId}
          onDismiss={() => setSelectedRefillId(undefined)}
          onSubmit={handleSubmit}
        />
      )}

      <Loader visible={saving} />
    </>
  );
};

export default RefillScreen;
