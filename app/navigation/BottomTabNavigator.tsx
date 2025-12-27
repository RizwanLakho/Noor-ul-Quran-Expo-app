import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

// Import your screens
import HomeScreen from '../screens/Home';
import QuranScreen from '../screens/QuranScreen';
import Quiz from '../screens/Quiz';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingScreen';

import SettingHeader from 'app/components/SettingHeader';
import Header from 'app/components/Header';
import TabIcon from '../components/TabIcon';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.surface,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        options={{
          headerShown: true,
          header: () => <Header />,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              IconComponent={Ionicons}
              iconName="home"
            />
          ),
        }}>
        {(props) => (
          <HomeScreen
            {...props}
            onNotificationPress={() => props.navigation.navigate('Notifications' as never)}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Quran"
        component={QuranScreen}
        options={{
          headerShown: true,
          header: () => <Header />,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              IconComponent={MaterialCommunityIcons}
              iconName="book-open-page-variant"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Quiz"
        component={Quiz}
        options={{
          headerShown: true,
          header: () => <Header />,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              IconComponent={MaterialCommunityIcons}
              iconName="brain"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: true,
          header: () => <Header />,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              IconComponent={Feather}
              iconName="search"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          header: () => <SettingHeader />,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              IconComponent={Ionicons}
              iconName="settings"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

