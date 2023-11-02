import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import fbAuth from "@react-native-firebase/auth";

export const db = firestore();
export const auth = fbAuth();
export const serverTimestamp = firestore.FieldValue.serverTimestamp;
export const increment = firestore.FieldValue.increment;

export const updateProductQuantity = async ({
  col,
  products,
  increment,
  batch,
}: {
  col: FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>;
  products: { [key: string]: number };
  increment: boolean;
  batch?: FirebaseFirestoreTypes.WriteBatch;
}) => {
  if (!batch) {
    batch = db.batch();
  }
  for (const id in products) {
    const productRef = col.doc(id);
    const productDoc = await productRef.get();
    const productData = productDoc.data();
    if (!productDoc.exists || !productData) {
      batch.set(productRef, {
        quantity: increment ? products[id] : products[id] * -1,
        createdAt: serverTimestamp(),
        product_ref: db.doc(`Products/${id}`),
      });
    } else {
      const expectedFinalQuantity = increment
        ? productData.quantity + products[id]
        : productData.quantity - products[id];
      if (expectedFinalQuantity == 0) {
        batch.delete(productRef);
      } else {
        batch.update(productRef, {
          quantity: firestore.FieldValue.increment(
            increment ? products[id] : products[id] * -1
          ),
          updatedAt: serverTimestamp(),
        });
      }
    }
  }
  return batch;
};
