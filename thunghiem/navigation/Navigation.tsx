import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import TrangChu from '../screens/TrangChu';
import ThongTinCaNhan from '../screens/ThongTinCaNhan';

const Tab = createBottomTabNavigator();

const Navigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'TrangChu') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ThongTinCaNhan') {
            iconName = focused ? 'person' : 'person-outline';
          }
          // Ensure iconName is defined before using it
          return <Icon name={iconName || 'person-outline'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 20,
          left: 40,
          right: 40,
          borderRadius: 35,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          paddingBottom: 8,
        },
      })}
    >
      <Tab.Screen 
        name="TrangChu" 
        component={TrangChu} 
        options={{ 
          title: 'Trang chủ',
        }} 
      />
      <Tab.Screen 
        name="ThongTinCaNhan" 
        component={ThongTinCaNhan} 
        options={{ 
          title: 'Thông tin cá nhân',
        }} 
      />
    </Tab.Navigator>
  );
};

export default Navigation; 