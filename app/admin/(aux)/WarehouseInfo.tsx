import { WarehouseItemType } from "atoms/app";
import { Stack } from "expo-router";
import { useWarehousesState } from "hooks/appState";
import React, { useMemo } from "react";
import { listToDocsObj } from "utils/common";

interface WarehouseInfoProps {
  id: string;
}

const WarehouseInfo: React.FC<WarehouseInfoProps> = ({ id }) => {
  const [Warehouses] = useWarehousesState();

  const WarehousesObj: { [key: string]: WarehouseItemType } = useMemo(() => {
    return listToDocsObj(Warehouses);
  }, [Warehouses]);

  const warehouseInfo = useMemo(() => {
    return WarehousesObj[id];
  }, [WarehousesObj, id]);

  if (!WarehousesObj[id]) {
    return null;
  }

  return <Stack.Screen options={{ title: warehouseInfo.name }} />;
};

export default WarehouseInfo;
