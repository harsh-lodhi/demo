import { productsQuantityState } from "atoms/app";
import { useCallback } from "react";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";
import { Storage } from "types/common";
import { fetchProductQuantity } from "utils/storage";

import {
  useTeamMembersState,
  useVendingMachinesState,
  useWarehousesState,
} from "./appState";

const useProductsQuantity = () => {
  const [warehouses] = useWarehousesState();
  const [refillers] = useTeamMembersState();
  const [vendingMachines] = useVendingMachinesState();

  const [, setPoductsQuantity] = useRecoilState(productsQuantityState);

  const fetchAllProductsQuantity = useCallback(async () => {
    const warehousesQuantity = await fetchProductQuantity(
      Storage.WAREHOUSE,
      warehouses,
    );

    const refillersQuantity = await fetchProductQuantity(
      Storage.REFILLER,
      refillers.items,
    );

    const vendingMachinesQuantity = await fetchProductQuantity(
      Storage.VENDING_MACHINE,
      vendingMachines.items,
    );

    return {
      [Storage.WAREHOUSE]: {
        ...warehousesQuantity[Storage.WAREHOUSE],
      },
      [Storage.REFILLER]: {
        ...refillersQuantity[Storage.REFILLER],
      },
      [Storage.VENDING_MACHINE]: {
        ...vendingMachinesQuantity[Storage.VENDING_MACHINE],
      },
    };
  }, [warehouses, refillers.items, vendingMachines.items]);

  return useQuery("productsQuantity", fetchAllProductsQuantity, {
    refetchOnWindowFocus: false,
    enabled: !!(
      warehouses.length ||
      refillers.items.length ||
      vendingMachines.items.length
    ),
    onSuccess(data) {
      setPoductsQuantity((r) => ({
        ...r,
        isLoading: false,
        shouldRefetch: false,
        data,
      }));
    },
  });
};

export default useProductsQuantity;
