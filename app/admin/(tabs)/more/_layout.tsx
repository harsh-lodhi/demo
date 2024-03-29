import { Stack } from "expo-router";

const MoreLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="settings"
        options={{
          title: "More",
        }}
      />
      <Stack.Screen
        name="team"
        options={{
          title: "Team",
        }}
      />
    </Stack>
  );
};

export default MoreLayout;
