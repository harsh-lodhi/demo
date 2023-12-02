import { wenderApi } from "api";
import { VendingMachineItemType, vendingMachinesState } from "atoms/app";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";
import { DBCollection } from "types/common";

export const useVendingMachines = () => {
  const [, setVendingMachines] = useRecoilState(vendingMachinesState);

  return useQuery(
    DBCollection.VENDING_MACHINES,
    async () => {
      const res = await wenderApi.post("/liveStatusRefill/allMachineStatusV3", {
        page: 1,
      });

      return res.data.data.machinesStatus.map((p: VendingMachineItemType) => ({
        ...p,
        _docID: p.machine_id,
      })) as VendingMachineItemType[];
    },
    {
      onSuccess: (items) => {
        setVendingMachines((r) => ({
          ...r,
          isLoading: false,
          items,
          shouldRefetch: false,
        }));
      },
      placeholderData: [],
    },
  );
};
