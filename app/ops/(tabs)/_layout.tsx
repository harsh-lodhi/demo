import { Tabs } from "expo-router";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

const OpsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
      }}
    >
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
        name="warehouse-stock"
        options={{
          title: "Warehouses",
          tabBarLabel: "Warehouses",
          tabBarIcon: ({ color, size }) => (
            <Icon name="warehouse" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarLabel: "Report",
          tabBarIcon: ({ color, size }) => (
            <Icon name="abjad-arabic" color={color} size={size} />
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
