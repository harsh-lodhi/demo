import { useRecoilState } from "recoil";
import { VendingMachineItemType, vendingMachinesState } from "../atoms/app";
import { useEffect } from "react";
import { db } from "../utils/firebase";
import { useQuery } from "react-query";
import { wenderApi } from "../api";
import { DBCollection } from "../types/common";

export const useVendingMachines = () => {
  const [vendingMachines, setVendingMachines] =
    useRecoilState(vendingMachinesState);

  const {
    isLoading,
    data: vendingMachinesRes,
    refetch,
  } = useQuery(
    DBCollection.VENDING_MACHINES,
    async () => {
      return await wenderApi.post("/liveStatusRefill/allMachineStatusV3", {
        page: 1,
      });
    },
    {
      enabled:
        vendingMachines.shouldRefetch || vendingMachines.items.length === 0,
    }
  );

  useEffect(() => {
    if (vendingMachinesRes) {
      const ps: VendingMachineItemType[] =
        vendingMachinesRes.data.data.machinesStatus;
      setVendingMachines((r) => ({
        ...r,
        isLoading: false,
        items: vendingMachinesRes.data.data.machinesStatus.map(
          (p: VendingMachineItemType) => ({
            ...p,
            _docID: p.machine_id,
          })
        ),
        shouldRefetch: false,
      }));

      const batch = db.batch();
      ps.forEach((p) => {
        const ref = db
          .collection(DBCollection.VENDING_MACHINES)
          .doc(p.machine_id);
        batch.set(ref, p, { merge: true });
      });
      batch.commit();
    }
  }, [vendingMachinesRes?.data.data.machinesStatus]);

  return { vendingMachines, isLoading, refetch };
};
