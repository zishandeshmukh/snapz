import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import AddScreen from './screens/AddScreen';
import SettingsScreen from './screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { SupabaseProvider } from './context/SupabaseContext';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { handleIncomingShare } from './utils/shareUtils';
import ReceiveSharingIntent from 'expo-receive-sharing-intent';
// Make sure your sendToBackend function is exported from this file
import { sendToBackend } from './utils/shareUtils';
import { Alert } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
 useEffect(() => {
    // This function will be called when a share is received
    const handleShare = (files) => {
      if (files && files.length > 0) {
        
        // Extract the URL or text from the share data
        // On Android, this can be 'text' or 'weblink'. On iOS, it's usually 'text'.
        const sharedContent = files[0].text || files[0].weblink || files[0].url;
        
        if (sharedContent) {
          console.log('Received shared content:', sharedContent);
          
          // Show an alert to the user confirming receipt and asking to proceed
          Alert.alert(
            'Content Received!',
            `Send this to your SnapMind dashboard?\n\n(${sharedContent})`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: async () => {
                  try {
                    // Use your existing sendToBackend function
                    // We'll use the URL as the title for now and provide minimal content
                    await sendToBackend(sharedContent, sharedContent, 'Shared from mobile');
                    Alert.alert('Success!', 'Added to your SnapMind dashboard.');
                  } catch (e) {
                    console.error('Failed to send to backend', e);
                    Alert.alert('Error', 'Could not save this memory.');
                  }
                },
              },
            ]
          );
        }
      }
    };

    // 1. Listen for shared files when the app is already open
    const subscription = ReceiveSharingIntent.addReceiveSharingIntentListener(handleShare);

    // 2. Get files shared when the app was closed or in the background
    ReceiveSharingIntent.getReceivedSharingIntent(handleShare);

    // 3. Clean up the listener when the app is unmounted
    return () => {
      subscription.remove();
    };
  }, []);
  // --- END OF HOOK ---
  return (
    <SupabaseProvider>
      <NavigationContainer>
        <StatusBar style="light" />
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

