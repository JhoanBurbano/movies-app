/**
 * Navigation stack for Saved tab
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SavedScreen } from '../screens/SavedScreen';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';

export type SavedStackParamList = {
  Saved: undefined;
  MovieDetail: { movieId: number };
};

const Stack = createNativeStackNavigator<SavedStackParamList>();

export function SavedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Saved" component={SavedScreen} />
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

