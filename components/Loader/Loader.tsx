import { FC } from "react";
import { View } from "react-native";
import { ActivityIndicator, Portal } from "react-native-paper";

interface LoaderProps {
  visible: boolean;
}

const Loader: FC<LoaderProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Portal>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    </Portal>
  );
};

export default Loader;
