import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import fbAuth from "@react-native-firebase/auth";

export const db = firestore();
export const auth = fbAuth();
export const serverTimestamp = firestore.FieldValue.serverTimestamp;
export const increment = firestore.FieldValue.increment;

export const generateFirestoreId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let autoId = "";
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
};

interface AuditType {
  quantity: number;
  expectedFinalQuantity?: number;
  operation: "set" | "update" | "delete";
  increment: boolean;
  productRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
}

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

  if (!(batch as any)._id) {
    (batch as any)._id = generateFirestoreId();
  }

  const productAudits: Record<string, AuditType> = {};

  const productsData = await Promise.all(
    Object.keys(products).map(async (id) => {
      const ref = col.doc(id);
      const doc = await ref.get();
      return { id, ref, doc, data: doc.data() };
    })
  );

  productsData.forEach(({ id, ref, doc, data }) => {
    if (!batch) {
      throw new Error("Batch is not defined");
    }

    productAudits[id] = {
      quantity: products[id],
      operation: "set",
      increment,
      productRef: ref,
    };

    if (!doc.exists || !data) {
      batch.set(ref, {
        quantity: increment ? products[id] : products[id] * -1,
        createdAt: serverTimestamp(),
        product_ref: db.doc(`Products/${id}`),
      });
      return;
    }

    const expectedFinalQuantity = increment
      ? data.quantity + products[id]
      : data.quantity - products[id];

    productAudits[id] = {
      ...productAudits[id],
      expectedFinalQuantity,
      operation: expectedFinalQuantity === 0 ? "delete" : "update",
    };

    if (expectedFinalQuantity == 0) {
      batch.delete(ref);
      return;
    }

    batch.update(ref, {
      quantity: firestore.FieldValue.increment(
        increment ? products[id] : products[id] * -1
      ),
      updatedAt: serverTimestamp(),
    });
  });

  // for (const id in products) {
  //   const productRef = col.doc(id);

  //   let _audit: AuditType = {
  //     quantity: products[id],
  //     operation: "set",
  //     increment,
  //     productRef,
  //   };

  //   const productDoc = await productRef.get();
  //   const productData = productDoc.data();
  //   if (!productDoc.exists || !productData) {
  //     batch.set(productRef, {
  //       quantity: increment ? products[id] : products[id] * -1,
  //       createdAt: serverTimestamp(),
  //       product_ref: db.doc(`Products/${id}`),
  //     });
  //   } else {
  //     const expectedFinalQuantity = increment
  //       ? productData.quantity + products[id]
  //       : productData.quantity - products[id];

  //     _audit = {
  //       ..._audit,
  //       expectedFinalQuantity,
  //       operation: expectedFinalQuantity === 0 ? "delete" : "update",
  //     };

  //     if (expectedFinalQuantity == 0) {
  //       batch.delete(productRef);
  //     } else {
  //       batch.update(productRef, {
  //         quantity: firestore.FieldValue.increment(
  //           increment ? products[id] : products[id] * -1
  //         ),
  //         updatedAt: serverTimestamp(),
  //       });
  //     }
  //   }

  //   productAudits[id] = _audit;
  // }

  const auditCol = db.collection("Audits");
  const productQuantityAuditCol = auditCol.doc("ProductQuantity");
  batch.set(
    productQuantityAuditCol,
    {
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.uid,
    },
    { merge: true }
  );

  const auditRef = productQuantityAuditCol.collection("Entries").doc();
  batch.set(auditRef, {
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser?.uid,
    products: productAudits,
    collectionPath: col.path,
    batchId: (batch as any)._id,
  });

  return batch;
};
