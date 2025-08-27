import { theme } from '@/common/styles/theme';
import type { MainTabParamList, RootStackParamList } from '@/common/types';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Placeholder screens - will be implemented later
const HomeScreen = () => null;
const ActivityScreen = () => null;
const MiniAppsScreen = () => null;
const ProfileScreen = () => null;
const OnboardingScreen = () => null;
const SendScreen = () => null;
const ReceiveScreen = () => null;

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Activity':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'MiniApps':
              iconName = focused ? 'apps' : 'apps-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mediumGray,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.xs,
          paddingBottom: theme.spacing.sm,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.caption,
          fontWeight: theme.typography.fontWeight.medium,
          marginTop: theme.spacing.xs,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          fontSize: theme.typography.fontSize.h6,
          fontWeight: theme.typography.fontWeight.semiBold,
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.text,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Wallet',
          headerShown: false, // Custom header in HomeScreen
        }}
      />
      <Tab.Screen 
        name="Activity" 
        component={ActivityScreen}
        options={{ title: 'Activity' }}
      />
      <Tab.Screen 
        name="MiniApps" 
        component={MiniAppsScreen}
        options={{ title: 'Mini-apps' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
          headerTitleStyle: {
            fontSize: theme.typography.fontSize.h6,
            fontWeight: theme.typography.fontWeight.semiBold,
            color: theme.colors.text,
          },
          headerTintColor: theme.colors.text,
          headerBackTitleVisible: false,
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Send" 
          component={SendScreen}
          options={{ 
            title: 'Send',
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="Receive" 
          component={ReceiveScreen}
          options={{ 
            title: 'Receive',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}