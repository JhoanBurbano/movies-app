/**
 * Root navigation with bottom tabs
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../ui/theme/theme';
import { MoviesStack } from './MoviesStack';
import { SavedStack } from './SavedStack';

export type RootTabParamList = {
  MoviesTab: undefined;
  SavedTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tab.Screen
        name="MoviesTab"
        component={MoviesStack}
        options={{
          title: 'Movies',
          tabBarIcon: ({ color }) => (
            <TabIcon name="film" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStack}
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => (
            <TabIcon name="bookmark" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Simple icon component (using text for simplicity)
// In production, use react-native-vector-icons or similar
function TabIcon({ name }: { name: string; color: string }) {
  const iconMap: Record<string, string> = {
    film: '🎬',
    bookmark: '⭐',
  };
  return <Text>{iconMap[name] || '•'}</Text>;
}

