import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { atom } from "recoil";

interface UserType extends FirebaseAuthTypes.User {
  claims?: {
    wenderId?: string;
    role?: "admin";
  };
}

export const userState = atom<UserType | null>({
  key: "userState",
  default: null,
});
