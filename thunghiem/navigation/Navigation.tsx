import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import TrangChu from '../screens/TrangChu';
import ThongTinCaNhan from '../screens/ThongTinCaNhan';
import ChuongTrinhKhung from '../screens/ChuongTrinhKhung';
import DangKyHocPhan from '../screens/DangKyHocPhan';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tạo một Stack Navigator cho tab Trang chủ và các màn hình con của nó
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrangChuScreen" component={TrangChu} />
      <Stack.Screen name="ChuongTrinhKhung" component={ChuongTrinhKhung} />
      <Stack.Screen name="DangKyHocPhan" component={DangKyHocPhan} />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // Do any route-based calculations here
        const hideTabBar = route.name === 'SomeScreenToHideTabBar';
        
        return {
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'TrangChuTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'ThongTinCaNhan') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Icon name={iconName || 'person-outline'} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0066CC',
          tabBarInactiveTintColor: '#666',
          headerShown: false,
          tabBarStyle: {
            height: 70,
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
            // Apply conditional styling here
            display: hideTabBar ? 'none' : 'flex',
          },
          tabBarLabelStyle: {
            fontSize: 14,
            paddingBottom: 8,
          },
        };
      }}
    >
      <Tab.Screen 
        name="TrangChuTab" 
        component={HomeStack} 
        options={({ route }) => ({
          title: 'Trang chủ',
          // Ẩn tabBar khi ở màn hình ChuongTrinhKhung hoặc DangKyHocPhan
          tabBarStyle: (() => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'TrangChuScreen';
            if (routeName === 'ChuongTrinhKhung' || routeName === 'DangKyHocPhan') {
              return { display: 'none' };
            }
            return {
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
            };
          })(),
        })}
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