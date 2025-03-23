import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  Dimensions,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry, 
  icon 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute' as const,
    left: 50,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [9, -8],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "#0057B7",
    paddingHorizontal: 4,
  };

  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={24} color="#fff" style={styles.icon} />
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry}
        underlineColorAndroid="transparent"
      />
    </View>
  );
};

const LoginScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoMoveAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isButtonActive = username.length > 0 && password.length > 0;

  useEffect(() => {
    // Background fade in first
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Wait 2 seconds then fade in logo
      Animated.delay(2000),
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Wait 3 seconds then move logo up
      Animated.delay(3000),
      Animated.timing(logoMoveAnim, {
        toValue: -150,
        duration: 800,
        useNativeDriver: true,
      }),
      // Wait 1 second then show welcome text and form
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(formFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1, width: '100%' }}>
        <Animated.View 
          style={[
            styles.logoContainer, 
            { 
              opacity: logoFadeAnim,
              transform: [{ translateY: logoMoveAnim }]
            }
          ]}
        >
          <Image 
            source={require("../assets/logo.png")} 
            style={styles.logo} 
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.formContainer,
            {
              transform: [{ translateY: formAnim }],
              opacity: formFadeAnim,
            }
          ]}
        >
          <Text style={styles.welcome}>Welcome to HUCE!</Text>

          <FloatingLabelInput
            label="Tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            icon="person-outline"
          />

          <FloatingLabelInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <TouchableOpacity
            style={[
              styles.loginButton,
              isButtonActive && styles.loginButtonActive
            ]}
            disabled={!isButtonActive}
          >
            <Text style={[
              styles.loginButtonText,
              !isButtonActive && styles.loginButtonTextInactive
            ]}>ĐĂNG NHẬP</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0057B7",
  },
  logoContainer: {
    alignItems: "center",
    position: "absolute",
    width: '100%',
    top: "35%",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  welcome: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 30,
    fontWeight: "700",
    textAlign: "center",
  },
  formContainer: {
    width: width * 0.9,
    position: "absolute",
    alignSelf: "center",
    top: "45%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 15,
    height: 55,
    position: 'relative',
  },
  icon: {
    marginRight: 10,
    width: 24,
    height: 24,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: 55,
    paddingTop: 10,
    paddingBottom: 0,
  },
  loginButton: {
    height: 45,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
    width: '60%',
    alignSelf: 'center',
  },
  loginButtonActive: {
    backgroundColor: "#FFA500",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
  loginButtonTextInactive: {
    opacity: 0.9,
  },
});

export default LoginScreen;