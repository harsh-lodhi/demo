import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { atom } from "recoil";

export interface UserType extends FirebaseAuthTypes.User {
  claims?: {
    wenderId?: string;
    role?: "admin";
    approved?: boolean;
  };
  idTokenResult?: FirebaseAuthTypes.IdTokenResult;
}

export const userState = atom<UserType | null>({
  key: "userState",
  default: null,
});
