import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MenuScreen from '../screens/MenuScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ExpenseScreen from '../screens/ExpenseScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          
          if (route.name === 'Menu') {
            iconName = 'food';
          } else if (route.name === 'Attendance') {
            iconName = 'account-check';
          } else if (route.name === 'Expenses') {
            iconName = 'cash';
          }
          
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Menu" 
        component={MenuScreen}
        options={{ title: 'Mess Menu' }}
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen}
        options={{ title: 'Attendance' }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpenseScreen}
        options={{ title: 'Expenses' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;