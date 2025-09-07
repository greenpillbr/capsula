import { Activity } from '@/lib/icons/Activity';
import { Profile } from '@/lib/icons/Profile';
import { Wallet } from '@/lib/icons/Wallet';
import { Tabs } from 'expo-router';

export const unstable_settings = {
  initialRouteName: "index",
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50', // GPBR Green
        tabBarInactiveTintColor: '#9E9E9E', // Medium Gray
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size }) => <Wallet className="text-foreground" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Activity className="text-foreground" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Profile className="text-foreground" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide this tab from navigation
        }}
      />
    </Tabs>
  );
}
