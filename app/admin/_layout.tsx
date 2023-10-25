import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="storage"
        options={{
          title: "Manage storage stock",
          presentation: "modal",
        }}
      />
    </Stack>
  );
};

export default Layout;
