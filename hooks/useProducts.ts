import { useRecoilState } from "recoil";
import { ProductItemType, categoriesState, productsState } from "../atoms/app";
import { useQuery } from "react-query";
import { wenderApi } from "../api";
import { DBCollection } from "../types/common";

export const useProducts = () => {
  const [ps, setProducts] = useRecoilState(productsState);
  const [, setCategories] = useRecoilState(categoriesState);

  return useQuery(
    DBCollection.PRODUCTS,
    async () => {
      const res = await wenderApi.post("/products/product", {
        start_price: 1,
        end_price: 100000,
        limit: 1000,
        offset: 0,
      });

      const categoriesRes = await wenderApi.get("/products/categories");

      const items: ProductItemType[] = res.data.data.map?.(
        (p: ProductItemType) => ({ ...p, _docID: p.product_id })
      );

      return { items, categories: categoriesRes.data.data.categories };
    },
    {
      enabled: !ps?.length,
      onSuccess(data) {
        setProducts(data.items);
        setCategories(data.categories);
      },
    }
  );
};
