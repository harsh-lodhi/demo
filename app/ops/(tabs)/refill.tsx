import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList } from "react-native";
import { Divider, List, Text } from "react-native-paper";
import { wenderApi } from "../../../api";
import { useQuery } from "react-query";
import { useUser } from "../../../hooks/useUserInfo";
import RefillProductsModal from "../../../components/RefillProducts/RefillProducts";
import {
  db,
  serverTimestamp,
  updateProductQuantity,
} from "../../../utils/firebase";
import Loader from "../../../components/Loader/Loader";

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

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["refill-history"],
    queryFn: async () => {
      const res = await wenderApi.post("/liveStatusRefill/getRefillHistory", {
        start_date: addDaysToDate(-1).toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        limit: 5,
        offset: 0,
        machine_ids: [],
      });
      return res.data.data as RefillHistoryItemType[];
    },
  });

  const filteredData = useMemo(() => {
    if (!data) return [];

    if (user?.claims?.role === "admin") {
      return data;
    }

    return data.filter((item) => item.refiller_id === user?.claims?.wenderId);
  }, [data]);

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
    [selectedRefillId]
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
        { cancelable: false }
      );
    },
    [confirmSubmit]
  );

  return (
    <>
      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <List.Item
            title={item.refiller_name}
            description={item.created_at}
            onPress={() => setSelectedRefillId(item.refill_id)}
          />
        )}
        keyExtractor={(item) => item.refill_id}
        refreshing={isLoading}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={() =>
          filteredData.length > 0 ? (
            <Text variant="labelLarge" style={{ padding: 16 }}>
              Confirm your refills
            </Text>
          ) : undefined
        }
        ListEmptyComponent={() =>
          isLoading ? null : (
            <Text style={{ padding: 16 }}>No refills found</Text>
          )
        }
      />

      <RefillProductsModal
        id={selectedRefillId}
        onDismiss={() => setSelectedRefillId(undefined)}
        onSubmit={handleSubmit}
      />

      <Loader visible={saving} />
    </>
  );
};

export default RefillScreen;
