import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
        <View style={styles.loading}>
          <LottieView style={{flex: 1}} source={require("../assets/loading.json")} autoPlay loop={true} />
        </View>
      
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loading: {
    height: 300,
    aspectRatio: 1
  }
});
