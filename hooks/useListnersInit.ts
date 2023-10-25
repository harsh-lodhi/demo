import { useProducts } from "./useProducts";
import { useTeamMembers } from "./useTeamMembers";
import { useVendingMachines } from "./useVendingMachines";
import { useWarehouses } from "./useWarehouses";

const useListenersInit = () => {
  useProducts();
  useWarehouses();
  useVendingMachines();
  useTeamMembers();
};

export default useListenersInit;
