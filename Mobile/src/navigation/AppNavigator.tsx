import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PersonDetailScreen from '../screens/PersonDetailScreen';
import AddPersonScreen from '../screens/AddPersonScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1e293b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ title: 'People' }}
      />
      <Stack.Screen
        name="PersonDetail"
        component={PersonDetailScreen}
        options={({ route }: any) => ({
          title: route.params?.person?.name || 'Person Details',
        })}
      />
      <Stack.Screen
        name="AddPerson"
        component={AddPersonScreen}
        options={{ title: 'Add Person' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC<AppNavigatorProps> = ({ onLogout }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1e293b',
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarActiveTintColor: '#f59e0b',
          tabBarInactiveTintColor: '#94a3b8',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            tabBarLabel: 'People',
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <TabIcon name="👥" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <TabIcon name="👤" color={color} size={size} />
            ),
          }}
        >
          {(props: any) => <ProfileScreen {...props} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Simple icon component using emoji
const TabIcon: React.FC<{ name: string; color: string; size: number }> = ({ name }) => {
  return <Text style={{ fontSize: 24 }}>{name}</Text>;
};

export default AppNavigator;
