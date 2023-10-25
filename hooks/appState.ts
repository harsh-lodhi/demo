import { useRecoilState } from "recoil";
import {
  productsQuantityState,
  productsState,
  teamMemberState,
  vendingMachinesState,
  warehousesState,
} from "../atoms/app";

export const useProductsState = () => {
  return useRecoilState(productsState);
};

export const useTeamMembersState = () => {
  return useRecoilState(teamMemberState);
};

export const useVendingMachinesState = () => {
  return useRecoilState(vendingMachinesState);
};

export const useWarehousesState = () => {
  return useRecoilState(warehousesState);
};

export const useProductsQuantityState = () => {
  return useRecoilState(productsQuantityState);
};
