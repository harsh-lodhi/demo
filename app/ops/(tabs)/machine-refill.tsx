import { View } from "react-native";
import { Chip } from "react-native-paper";

const MachineRefillScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", gap: 8, padding: 4 }}>
        <Chip>1</Chip>
        <Chip>2</Chip>
        <Chip>3</Chip>
        <Chip>4</Chip>
      </View>
    </View>
  );
};

export default MachineRefillScreen;
