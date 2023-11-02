import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "react-native-paper";
import VendingMachineInfo from "./(aux)/VendingMachineInfo";
import { Storage } from "../../types/common";
import React from "react";
import ManageStorageStock from "./(aux)/ManageStorageStock";
import RefillerInfo from "./(aux)/RefillerInfo";
import WarehouseInfo from "./(aux)/WarehouseInfo";

interface StorageInfoProps {
  storageName: Storage;
  id: string;
}

export const StorageInfo: React.FC<StorageInfoProps> = ({
  storageName,
  id,
}) => {
  if (storageName == Storage.VENDING_MACHINE) {
    return <VendingMachineInfo id={id} />;
  }

  if (storageName == Storage.REFILLER) {
    return <RefillerInfo id={id} />;
  }

  if (storageName == Storage.WAREHOUSE) {
    return <WarehouseInfo id={id} />;
  }

  return null;
};

const storage = () => {
  const params = useLocalSearchParams<{
    storageName: Storage;
    storageLabel: string;
    id: string;
  }>();

  if (!params.id || !params.storageName) {
    return (
      <View>
        <Text>Unknow storage selected</Text>
      </View>
    );
  }

  return (
    <>
      <StorageInfo storageName={Storage.VENDING_MACHINE} id={params.id} />
      <StorageInfo storageName={Storage.REFILLER} id={params.id} />
      <StorageInfo storageName={Storage.WAREHOUSE} id={params.id} />

      <ManageStorageStock
        storageName={params.storageName}
        id={params.id}
        storageLabel={params.storageLabel}
      />
    </>
  );
};

export default storage;
