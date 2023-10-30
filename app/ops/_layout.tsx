import { Stack } from "expo-router";

const OpsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ops-storage"
        options={{
          title: "Storage stock",
          presentation: "modal",
        }}
      />
    </Stack>
  );
};

export default OpsLayout;
