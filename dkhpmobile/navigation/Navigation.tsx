import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import LoadingScreen from '../screens/LoadingScreen';
import TrangChu from '../screens/TrangChu';
import DangKyHocPhan from '../screens/DangKyHocPhan';
import DanhSachMonHocdangky from '../screens/DanhSachMonHocdangky';
import ThongTinCaNhan from '../screens/ThongTinCaNhan';
import ChuongTrinhKhung from '../screens/ChuongTrinhKhung';
import Calendar from '../screens/Calendar';
import ThongBao from '../screens/ThongBao';

// Import auth context
import { useAuth } from '../src/api/context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigation for authenticated users
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Trang Chủ') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Đăng Ký') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Môn Học') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Cá Nhân') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Return Ionicons component
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#003366',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Trang Chủ" 
        component={TrangChu} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Đăng Ký" 
        component={DangKyStackNavigator} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Môn Học" 
        component={DanhSachMonHocdangky} 
        options={{ title: 'Môn Học' }}
      />
      <Tab.Screen 
        name="Cá Nhân" 
        component={ProfileStackNavigator} 
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Stack navigator for registration flow
const DangKyStack = createNativeStackNavigator();
const DangKyStackNavigator = () => {
  return (
    <DangKyStack.Navigator>
      <DangKyStack.Screen 
        name="DangKyHocPhan" 
        component={DangKyHocPhan} 
        options={{ title: 'Đăng Ký Học Phần' }}
      />
      <DangKyStack.Screen 
        name="ChuongTrinhKhung" 
        component={ChuongTrinhKhung} 
        options={{ title: 'Chương Trình Khung' }}
      />
      <DangKyStack.Screen 
        name="DanhSachMonHocdangky" 
        component={DanhSachMonHocdangky} 
        options={{ title: 'Môn Học Đã Đăng Ký' }}
      />
    </DangKyStack.Navigator>
  );
};

// Stack navigator for profile flow
const ProfileStack = createNativeStackNavigator();
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ThongTinCaNhan" 
        component={ThongTinCaNhan} 
        options={{ title: 'Thông Tin Cá Nhân' }}
      />
      <ProfileStack.Screen 
        name="Calendar" 
        component={Calendar} 
        options={{ title: 'Lịch Học' }}
      />
      <ProfileStack.Screen 
        name="ThongBao" 
        component={ThongBao} 
        options={{ title: 'Thông Báo' }}
      />
    </ProfileStack.Navigator>
  );
};

// Main navigation container that handles auth state
const Navigation = () => {
  const { isLoggedIn, isLoading } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        // User is logged in - show the main app
        <Stack.Screen 
          name="Main" 
          component={MainTabs} 
          options={{ headerShown: false }}
        />
      ) : (
        // User is not logged in - show the login screen
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default Navigation;