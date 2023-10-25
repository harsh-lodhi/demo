import React, { useMemo } from "react";
import { VendingMachineItemType } from "../../../atoms/app";
import { useVendingMachinesState } from "../../../hooks/appState";
import { listToDocsObj } from "../../../utils/common";
import { Stack } from "expo-router";

interface VendingMachineInfoProps {
  id: string;
}

const VendingMachineInfo: React.FC<VendingMachineInfoProps> = ({ id }) => {
  const [vendingMachines] = useVendingMachinesState();

  const vendingMachinesObj: { [key: string]: VendingMachineItemType } =
    useMemo(() => {
      return listToDocsObj(vendingMachines.items);
    }, [vendingMachines.items]);

  const machineInfo = useMemo(() => {
    return vendingMachinesObj[id];
  }, [vendingMachinesObj, id]);

  if (!vendingMachinesObj[id]) {
    return null;
  }

  return <Stack.Screen options={{ title: machineInfo.name }} />;
};

export default VendingMachineInfo;
