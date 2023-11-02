import { Tabs } from "expo-router";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

const Layout = () => {
  return (
    <Tabs screenOptions={{ tabBarHideOnKeyboard: true }}>
      <Tabs.Screen
        name="warehouse"
        options={{
          title: "Warehouses",
          tabBarLabel: "Warehouses",
          tabBarIcon: ({ color, size }) => (
            <Icon name="warehouse" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="machine"
        options={{
          title: "Machines",
          tabBarLabel: "Machines",
          tabBarIcon: ({ color, size }) => (
            <Icon name="fridge-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="refiller"
        options={{
          title: "Refillers",
          tabBarLabel: "Refillers",
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-multiple-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarLabel: "Products",
          tabBarIcon: ({ color, size }) => (
            <Icon name="package-variant-closed" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarLabel: "More",
          tabBarIcon: ({ color, size }) => (
            <Icon name="dots-horizontal" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen name="home" options={{ href: null }} />
    </Tabs>
  );
};

export default Layout;
