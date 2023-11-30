import { userState } from "atoms/auth";
import { useRecoilState } from "recoil";

export const useUser = () => {
  return useRecoilState(userState);
};
