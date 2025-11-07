import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import AddScreen from './screens/AddScreen';
import SettingsScreen from './screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { SupabaseProvider } from './context/SupabaseContext';
import { useEffect, useRef }
from 'react';
import { Linking } from 'react-native';
// We don't import handleIncomingShare here anymore, App.js will handle navigation
// import { handleIncomingShare } from './utils/shareUtils'; 

const Tab = createBottomTabNavigator();

// We need a component inside NavigationContainer to use the navigation hook
function AppNavigator() {
  const navigation = useNavigation();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const handleShare = (url) => {
      if (url && isMounted.current) {
        console.log('App.js received URL:', url);
        // Navigate to the 'Add' tab and pass the URL as a param
        navigation.navigate('Add', { sharedUrl: url });
      }
    };

    const handleInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      console.log('Initial URL:', initialUrl);
      handleShare(initialUrl);
    };

    handleInitialUrl();

    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Event URL:', event.url);
      handleShare(event.url);
    });

    return () => {
      isMounted.current = false;
      subscription.remove();
    };
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#71717a',
        headerStyle: styles.header,
        headerTintColor: '#fff',
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerTitle: 'SnapMind',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
          headerTitle: 'Quick Add',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SupabaseProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SupabaseProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#18181b',
    borderTopColor: '#27272a',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  header: {
    backgroundColor: '#18181b',
    borderBottomColor: '#27272a',
    borderBottomWidth: 1,
  },
});

