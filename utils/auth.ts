import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "./firebase";

export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    await auth.signOut();
  } catch (error) {
    console.error("[EEEEEE]", error);
  }
};
