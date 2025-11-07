import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Import your screens
import HomeScreen from './screens/HomeScreen';
import AddScreen from './screens/AddScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import the new Auth components
import { SupabaseProvider, useSupabase } from './context/SupabaseContext';
import { Auth } from '@supabase/auth-ui-react-native';

const Tab = createBottomTabNavigator();

// This is your *existing* app layout, unchanged.
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
          return <Icon name={iconName} type="ionicon" size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// This new component decides to show Login or your App
function AppRoot() {
  const { session, loading, supabase } = useSupabase();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.container, { padding: 20 }]}>
        <Auth
          supabaseClient={supabase}
          providers={['google']} // Add any providers you enabled in Supabase
          theme="dark"
        />
      </View>
    );
  }

  // User is logged in, show the main app
  return <AppTabs />;
}

// The final export wraps everything in the Provider
export default function App() {
  return (
    <SupabaseProvider>
      <NavigationContainer>
        <AppRoot />
      </NavigationContainer>
    </SupabaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c' // Match dark theme
  }
});