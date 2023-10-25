import React, { useMemo } from "react";
import { WarehouseItemType } from "../../../atoms/app";
import { useWarehousesState } from "../../../hooks/appState";
import { listToDocsObj } from "../../../utils/common";
import { Stack } from "expo-router";

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
