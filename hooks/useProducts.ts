import { useRecoilState } from "recoil";
import { ProductItemType, productsState } from "../atoms/app";
import { useQuery } from "react-query";
import { wenderApi } from "../api";
import { useEffect } from "react";
import { db } from "../utils/firebase";
import { DBCollection } from "../types/common";

export const useProducts = () => {
  const [products, setProducts] = useRecoilState(productsState);
  const {
    isLoading,
    data: productsRes,
    refetch,
  } = useQuery(
    DBCollection.PRODUCTS,
    async () => {
      return await wenderApi.post("/products/product", {
        start_price: 1,
        end_price: 100000,
        limit: 1000,
        offset: 0,
      });
    },
    { enabled: !products?.length }
  );

  useEffect(() => {
    if (productsRes) {
      const ps: ProductItemType[] = productsRes.data.data;
      setProducts(
        productsRes.data.data.map?.((p: ProductItemType) => ({
          ...p,
          _docID: p.product_id,
        }))
      );

      const batch = db.batch();
      ps.forEach((p) => {
        const ref = db.collection(DBCollection.PRODUCTS).doc(p.product_id);
        batch.set(ref, p, { merge: true });
      });
      batch.commit();
    }
  }, [productsRes?.data.data]);

  return { products, isLoading, refetch };
};
