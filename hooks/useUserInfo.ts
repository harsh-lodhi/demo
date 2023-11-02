import { useRecoilState } from "recoil";
import { userState } from "../atoms/auth";

export const useUser = () => {
  return useRecoilState(userState);
};
