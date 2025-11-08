// import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { View, ActivityIndicator, StyleSheet, TextInput, Button } from 'react-native';

// Import your screens
import HomeScreen from './screens/HomeScreen';
import AddScreen from './screens/AddScreen';
import SearchScreen from './screens/SearchScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import the new Auth components
import { SupabaseProvider, useSupabase } from './context/SupabaseContext';

const Tab = createBottomTabNavigator();

// ---------- SIMPLE LOGIN SCREEN ----------
function AuthScreen({ supabase }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }

  return (
    <View style={styles.authContainer}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={signIn} />
    </View>
  );
}

// ---------- TAB NAVIGATOR (UNCHANGED) ----------
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

// ---------- ROOT CONTAINER ----------
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
    return <AuthScreen supabase={supabase} />;
  }

  return <AppTabs />;
}

// ---------- APP WRAPPER ----------
export default function App() {
  return (
    <SupabaseProvider>
      <NavigationContainer>
        <AppRoot />
      </NavigationContainer>
    </SupabaseProvider>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
});