import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../lib/AuthContext";
import { COLORS } from "../lib/config";
import AuthScreen from "../screens/AuthScreen";
import ScannerScreen from "../screens/ScannerScreen";
import { HistoryScreen, MonitoringScreen, AlertsScreen, PricingScreen, SettingsScreen } from "../screens/OtherScreens";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONS: Record<string, string> = {
  Scanner: "⚡", History: "📋", Monitoring: "👁", Alerts: "🔔", Pricing: "💎", Settings: "⚙️"
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>{ICONS[route.name]}</Text>
        ),
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.text3,
        tabBarStyle: { backgroundColor: COLORS.bg2, borderTopColor: COLORS.border, paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontFamily: "Courier New", fontSize: 10, fontWeight: "700" },
        headerStyle:      { backgroundColor: COLORS.bg2 },
        headerTitleStyle: { fontFamily: "Courier New", fontWeight: "800", color: COLORS.text, fontSize: 16 },
        headerTitleAlign: "center",
      })}
    >
      <Tab.Screen name="Scanner"    component={ScannerScreen}    options={{ title: "⚡ SCAN" }} />
      <Tab.Screen name="History"    component={HistoryScreen}    options={{ title: "HISTORY" }} />
      <Tab.Screen name="Monitoring" component={MonitoringScreen} options={{ title: "MONITOR" }} />
      <Tab.Screen name="Alerts"     component={AlertsScreen}     options={{ title: "ALERTS" }} />
      <Tab.Screen name="Pricing"    component={PricingScreen}    options={{ title: "UPGRADE" }} />
      <Tab.Screen name="Settings"   component={SettingsScreen}   options={{ title: "SETTINGS" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bg }}>
        <Text style={{ fontFamily: "Courier New", fontSize: 18, fontWeight: "800", color: COLORS.primary, marginBottom: 16 }}>⚡ SECURESCAN</Text>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ animationTypeForReplace: "pop" }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
