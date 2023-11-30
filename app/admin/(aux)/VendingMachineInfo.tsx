import { VendingMachineItemType } from "atoms/app";
import { Stack } from "expo-router";
import { useVendingMachinesState } from "hooks/appState";
import React, { useMemo } from "react";
import { listToDocsObj } from "utils/common";

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
