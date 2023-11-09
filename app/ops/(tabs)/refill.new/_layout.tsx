import { Stack } from "expo-router";

const RefillLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="select-machine" />
      <Stack.Screen name="refill-machine" />
    </Stack>
  );
};

export default RefillLayout;
