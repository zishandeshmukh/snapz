import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking'; // ✅ Deep linking support

// Import your screens
import HomeScreen from './screens/HomeScreen';
import AddScreen from './screens/AddScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import AuthScreen from './screens/AuthScreen';

// Import Supabase
import { SupabaseProvider, useSupabase } from './context/SupabaseContext';

const Tab = createBottomTabNavigator();

// Main App Tabs
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
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
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main App Component
function AppContent() {
  const { session, loading, supabase } = useSupabase();

  // ✅ Deep link handler for auth confirmation
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url) return;
      
      // Handle auth callback
      if (url.includes('access_token') || url.includes('type=signup')) {
        const params = new URLSearchParams(url.split('#')[1]);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
    };

    // Check for initial URL
    Linking.getInitialURL().then(handleDeepLink);

    // Subscribe to URL events
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [supabase]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  // ✅ Show Auth screen if not logged in
  if (!session) {
    return <AuthScreen />;
  }

  // ✅ Show app if logged in
  return <AppTabs />;
}

export default function App() {
  return (
    <SupabaseProvider>
      <NavigationContainer
        linking={{
          prefixes: ['snapmind://', 'exp://10.30.206.76:8081'], // ✅ Deep link prefixes
          config: {
            screens: {
              Home: 'home',
              Add: 'add',
              Search: 'search',
              Settings: 'settings',
            },
          },
        }}
      >
        <AppContent />
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