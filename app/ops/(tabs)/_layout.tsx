import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

const OpsLayout = () => {
  return (
    <Tabs screenOptions={{ tabBarHideOnKeyboard: true }}>
      <Tabs.Screen
        name="pick"
        options={{
          title: "Pick items",
          tabBarLabel: "Pick",
          tabBarIcon: ({ color, size }) => (
            <Icon name="hand-okay" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-bag"
        options={{
          title: "My Bag",
          tabBarLabel: "My Bag",
          tabBarIcon: ({ color, size }) => (
            <Icon name="bag-personal" color={color} size={size} />
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
            <Icon name="alert-rhombus" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="machine-refill"
        options={{
          href: null,
          title: "M Refill",
          tabBarLabel: "M Refill",
          tabBarIcon: ({ color, size }) => (
            <Icon name="fridge" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="refill.new"
        options={{
          // href: null,
          headerShown: false,
          title: "Refill",
          tabBarLabel: "Refill",
          tabBarIcon: ({ color, size }) => (
            <Icon name="fridge-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="refill"
        options={{
          // headerShown: false,
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
