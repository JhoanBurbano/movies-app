/**
 * Root navigation with bottom tabs
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="film" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStack}
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bookmark" color={color} focused={focused} />
          ),
          tabBarAccessibilityLabel: "saved-tab",
        }}
      />
    </Tab.Navigator>
  );
}

// Icon component using Expo Vector Icons
function TabIcon({ name, color, focused }: { name: string; color: string; focused?: boolean }) {
  const iconMap: Record<string, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
    film: { outline: 'film-outline', filled: 'film' },
    bookmark: { outline: 'bookmark-outline', filled: 'bookmark' },
  };

  const icons = iconMap[name] || { outline: 'ellipse-outline', filled: 'ellipse' };
  const iconName = focused ? icons.filled : icons.outline;
  return <Ionicons name={iconName} size={24} color={color} />;
}

