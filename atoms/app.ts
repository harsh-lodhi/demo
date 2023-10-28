import { atom } from "recoil";

export interface DocType {
  _docID: string;
}

export interface ProductItemType extends DocType {
  org_brand_id: string;
  org_id: string;
  brand_id: string;
  created_at: string;
  updated_at: string;
  product_id: string;
  product_name: string;
  product_price: number;
  brand_id_backup: string;
  miscellaneous: any;
  image: string;
  image_mini: string;
  created_by: string;
  description: string;
  is_approved: boolean;
  barcode: string;
  weight: any;
  tax: string;
  nutrition_id: any;
  is_without_barcode: any;
  packaging_type: any;
  category_id: string;
  unit_of_weight: any;
  is_active: boolean;
  shelf_life_id: number;
  hsn_id: number;
  brand_name: string;
}

export const productsState = atom<ProductItemType[]>({
  key: "productsState",
  default: [],
});

export interface WarehouseItemType extends DocType {
  name: string;
}

export const warehousesState = atom<WarehouseItemType[]>({
  key: "warehousesState",
  default: [],
});

export interface VendingMachineItemType extends DocType {
  machine_id: string;
  name: string;
  is_open: boolean;
  machine_status: string;
  assigned: boolean;
  organisation_id: number;
  org_name: string;
  profile_percent: number;
  sdcard_serial_number: string;
  left_units: number;
  total_units: number;
  total_price: number;
}

export const vendingMachinesState = atom<{
  isLoading: boolean;
  items: VendingMachineItemType[];
  shouldRefetch?: boolean;
}>({
  key: "vendingMachinesState",
  default: {
    isLoading: false,
    shouldRefetch: false,
    items: [],
  },
});

export interface TeamMemberItemType extends DocType {
  user_id: string;
  name: string;
  email: string;
  is_admin: boolean;
  phone_number: string;
  is_active: boolean;
  profile_pic: string;
  address: string;
  role_name: string;
}

export const teamMemberState = atom<{
  isLoading: boolean;
  items: TeamMemberItemType[];
  shouldRefetch?: boolean;
}>({
  key: "teamMemberState",
  default: {
    isLoading: false,
    shouldRefetch: false,
    items: [],
  },
});

interface ProductQuantityMap {
  [productId: string]: number;
}

interface StorageProductQuantityMap {
  [storageId: string]: ProductQuantityMap;
}

export interface ProductQuantityInStorageMap {
  [storageType: string]: StorageProductQuantityMap;
}

export const productsQuantityState = atom<{
  isLoading: boolean;
  data: ProductQuantityInStorageMap;
  shouldRefetch?: boolean;
}>({
  key: "productsQuantityState",
  default: {
    isLoading: false,
    shouldRefetch: false,
    data: {},
  },
});
