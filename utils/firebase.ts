import firestore from "@react-native-firebase/firestore";
import fbAuth from "@react-native-firebase/auth";

export const db = firestore();
export const auth = fbAuth();
export const serverTimestamp = firestore.FieldValue.serverTimestamp;
export const increment = firestore.FieldValue.increment;
