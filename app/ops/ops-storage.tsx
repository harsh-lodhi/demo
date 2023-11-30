import ManageStorageStock from "app/admin/(aux)/ManageStorageStock";
import { StorageInfo } from "app/admin/storage";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { Storage } from "types/common";

const OpsStorageScreen = () => {
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
        storageLabel={params.storageLabel}
        id={params.id}
        ops
      />
    </>
  );
};

export default OpsStorageScreen;
