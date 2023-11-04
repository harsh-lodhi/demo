import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { Storage } from "../../types/common";
import React from "react";
import { StorageInfo } from "../admin/storage";
import ManageStorageStock from "../admin/(aux)/ManageStorageStock";

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
        storageLabel={params.storageLabel}
        id={params.id}
        ops
      />
    </>
  );
};

export default storage;
