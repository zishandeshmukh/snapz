import { Tabs } from 'expo-router';
import { Home, Share2 } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0066cc',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shares"
        options={{
          title: 'Shared Items',
          tabBarIcon: ({ color, size }) => <Share2 color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
