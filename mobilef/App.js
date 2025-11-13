import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

// Import your screens
import HomeScreen from './screens/HomeScreen';
import AddScreen from './screens/AddScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import AuthScreen from './screens/AuthScreen';
import EditScreen from './screens/EditScreen';
import InsightsScreen from './screens/InsightsScreen';

// Import Supabase
import { SupabaseProvider, useSupabase } from './context/SupabaseContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ MAIN TAB NAVIGATOR (without Add tab)
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#71717a',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#18181b',
          borderTopWidth: 1,
          borderTopColor: '#27272a',
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ✅ STACK NAVIGATOR (includes modal Add screen)
function AppStack() {
  const { session, loading } = useSupabase();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="MainTabs" component={AppTabs} />
          <Stack.Screen 
            name="Add" 
            component={AddScreen}
            options={{
              presentation: 'modal',
              gestureEnabled: true,
              cardStyle: { backgroundColor: '#09090b' },
            }}
          />
          <Stack.Screen
            name="Edit"
            component={EditScreen}
            options={({ navigation }) => ({
              presentation: 'modal',
              gestureEnabled: true,
              headerShown: true,
              headerTitle: 'Edit Memory',
              headerStyle: { backgroundColor: '#18181b' },
              headerTitleStyle: { color: '#fafafa' },
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                  <Ionicons name="close" size={28} color="#a1a1aa" />
                </TouchableOpacity>
              ),
            })}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}

// ✅ ROOT APP COMPONENT
export default function App() {
  return (
    <SupabaseProvider>
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    </SupabaseProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09090b',
  }
});