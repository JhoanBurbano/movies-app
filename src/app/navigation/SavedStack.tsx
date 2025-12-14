/**
 * Navigation stack for Saved tab
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SavedScreen } from '../screens/SavedScreen';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { useTheme } from '../../ui/theme/theme';

export type SavedStackParamList = {
  Saved: undefined;
  MovieDetail: { movieId: number };
};

const Stack = createNativeStackNavigator<SavedStackParamList>();

export function SavedStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          headerShown: true,
          title: 'Saved',
          headerRight: () => <ThemeToggleButton />,
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{
          headerShown: true,
          title: 'Movie Details',
          headerRight: () => <ThemeToggleButton />,
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
}

