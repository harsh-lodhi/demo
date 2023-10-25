import { useCallback, useEffect, useState } from "react";
import {
  useTeamMembersState,
  useVendingMachinesState,
  useWarehousesState,
} from "./appState";
import { Storage } from "../types/common";
import { db } from "../utils/firebase";
import { productsQuantityState } from "../atoms/app";
import { useRecoilState } from "recoil";
import { useQueries, useQuery } from "react-query";

interface ProductQuantityMap {
  [productId: string]: number;
}

interface StorageProductQuantityMap {
  [storageId: string]: ProductQuantityMap;
}

interface ProductQuantityInStorageMap {
  [storageType: string]: StorageProductQuantityMap;
}

const getStorageProductQuantity = async (
  storageType: Storage,
  storageId: string
) => {
  const productsCol = db
    .collection(storageType)
    .doc(storageId)
    .collection("products");

  const products = await productsCol.get();

  return products.docs.reduce((r, doc) => {
    return {
      ...r,
      [doc.id]: doc.data().quantity,
    };
  }, {} as ProductQuantityMap);
};

const fetchProductQuantity = async (
  storageType: Storage,
  storages: { _docID: string }[]
) => {
  const quantitiesPromises = storages.map(async (s) => {
    const quantity = await getStorageProductQuantity(storageType, s._docID);
    return { id: s._docID, quantity };
  });

  const quantities = await Promise.all(quantitiesPromises);

  const updateObject = quantities.reduce(
    (acc, { id, quantity }) => {
      acc[storageType][id] = quantity;
      return acc;
    },
    {
      [storageType]: {},
    } as ProductQuantityInStorageMap
  );

  return updateObject;
};

const useProductsQuantity = () => {
  const [warehouses] = useWarehousesState();
  const [refillers] = useTeamMembersState();
  const [vendingMachines] = useVendingMachinesState();

  const [, setPoductsQuantity] = useRecoilState(productsQuantityState);

  const fetchAllProductsQuantity = useCallback(async () => {
    const warehousesQuantity = await fetchProductQuantity(
      Storage.WAREHOUSE,
      warehouses
    );

    const refillersQuantity = await fetchProductQuantity(
      Storage.REFILLER,
      refillers.items
    );

    const vendingMachinesQuantity = await fetchProductQuantity(
      Storage.VENDING_MACHINE,
      vendingMachines.items
    );

    console.log(
      JSON.stringify(
        [warehousesQuantity, refillersQuantity, vendingMachinesQuantity],
        null,
        2
      )
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
