import { useRecoilState } from "recoil";
import { userCredential, userState } from "../atoms/auth";

export const useUserCredential = () => {
  return useRecoilState(userCredential);
};

export const useUser = () => {
  return useRecoilState(userState);
};
