export enum DBCollection {
  WAREHOUSES = "Warehouses",
  VENDING_MACHINES = "VendingMachines",
  PRODUCTS = "Products",
  TEAM_MEMBERS = "TeamMembers",

  VENDING_MACHINE_STORAGE = "VendingMachineStorage",
  REFILLER_STORAGE = "RefillerStorage",
  WAREHOUSE_STORAGE = "WarehouseStorage",
}

export enum Storage {
  VENDING_MACHINE = DBCollection.VENDING_MACHINE_STORAGE,
  REFILLER = DBCollection.REFILLER_STORAGE,
  WAREHOUSE = DBCollection.WAREHOUSE_STORAGE,
}
