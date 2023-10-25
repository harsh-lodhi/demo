import { Tabs } from "expo-router";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

const OpsLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Pick items",
          tabBarLabel: "Pick",
          tabBarIcon: ({ color, size }) => (
            <Icon name="hand-okay" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="refill"
        options={{
          title: "Refill",
          tabBarLabel: "Refill",
          tabBarIcon: ({ color, size }) => (
            <Icon name="fridge-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default OpsLayout;
