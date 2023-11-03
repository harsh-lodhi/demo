import { Stack } from "expo-router";
import useListenersInit from "../../hooks/useListnersInit";

const AppLayout = () => {
  useListenersInit();

  return (
    <>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="admin"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ops"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default AppLayout;
