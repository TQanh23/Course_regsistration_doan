import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LoadingScreen from "../screens/LoadingScreen";
import LoginScreen from "../screens/LoginScreen";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<"LoadingScreen" | "LoginScreen">("LoadingScreen");
  const fadeAnim = useRef(new Animated.Value(1)).current; // Bắt đầu với opacity 1 (hiển thị LoadingScreen)

  useEffect(() => {
    setTimeout(() => {
      // Fade out LoadingScreen
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen("LoginScreen"); // Chuyển màn hình sau khi fade out
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(); // Fade in LoginScreen
      });
    }, 3000);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {currentScreen === "LoadingScreen" ? <LoadingScreen /> : <LoginScreen />}
    </Animated.View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
