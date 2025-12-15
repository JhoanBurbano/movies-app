/**
 * Navigation stack for Movies tab
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoviesScreen } from '../screens/MoviesScreen';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { useTheme } from '../../ui/theme/theme';

export type MoviesStackParamList = {
  Movies: undefined;
  MovieDetail: { movieId: number };
};

const Stack = createNativeStackNavigator<MoviesStackParamList>();

export function MoviesStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Movies"
        component={MoviesScreen}
        options={{
          headerShown: true,
          title: 'Movies',
          headerRight: () => <ThemeToggleButton />,
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: theme.typography.weights.semibold,
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
            fontWeight: theme.typography.weights.semibold,
          },
        }}
      />
    </Stack.Navigator>
  );
}

