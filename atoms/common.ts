import { atom } from "recoil";

export const listToObjState = atom<{
  items: {
    [key: string]: unknown;
  };
}>({
  key: "listToObjState",
  default: {
    items: {},
  },
});
