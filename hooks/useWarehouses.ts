import { WarehouseItemType, warehousesState } from "atoms/app";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { DBCollection } from "types/common";
import { db } from "utils/firebase";

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useRecoilState(warehousesState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs = db.collection(DBCollection.WAREHOUSES).onSnapshot(
      (snapshot) => {
        const ws = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...(data as WarehouseItemType),
            _docID: doc.id,
          };
        });
        setWarehouses(ws);
        setLoading(false);
      },
      (err) => {
        console.log(err);
        setLoading(false);
      },
    );

    return () => {
      unsubs();
    };
  }, [setWarehouses]);

  return { warehouses, loading };
};
