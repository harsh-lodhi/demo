import { Storage } from "../types/common";
import { db } from "./firebase";

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

export const fetchProductQuantity = async (
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
