/**
 * Navigation stack for Movies tab
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoviesScreen } from '../screens/MoviesScreen';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';

export type MoviesStackParamList = {
  Movies: undefined;
  MovieDetail: { movieId: number };
};

const Stack = createNativeStackNavigator<MoviesStackParamList>();

export function MoviesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Movies" component={MoviesScreen} />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{
          headerShown: true,
          title: 'Movie Details',
        }}
      />
    </Stack.Navigator>
  );
}

