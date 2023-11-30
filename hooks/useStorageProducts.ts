import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Storage } from "types/common";
import { db } from "utils/firebase";

interface _ProductType {
  product_ref: FirebaseFirestoreTypes.DocumentReference;
  quantity: number;
}

interface Props {
  storageName: Storage;
  id: string;
}

const useStorageProducts = (storages: Props[]) => {
  const [products, setProducts] = useState<_ProductType[]>([]);

  useEffect(() => {
    setProducts([]);

    console.log("Subscribing to storage products");
    const unsubs = storages.map(({ storageName, id }) => {
      return db
        .collection(`${storageName}/${id}/products`)
        .onSnapshot((snapshot) => {
          const products: _ProductType[] = [];
          snapshot.forEach((doc) => {
            products.push(doc.data() as _ProductType);
          });
          setProducts(products);
        });
    });

    return () => {
      console.log("Unsubscribing from storage products");
      unsubs.forEach((unsub) => unsub());
    };
  }, [storages]);

  return products;
};

export default useStorageProducts;
