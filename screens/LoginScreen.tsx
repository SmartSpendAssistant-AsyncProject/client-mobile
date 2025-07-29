import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import { useAuth } from '../utils/AuthContext';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://ssa-server-omega.vercel.app';

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function LoginScreen() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  //   Navigation and State Management
  //     Initialize navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  // Line 2-3: State management for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ''))
      .catch((error: unknown) => setExpoPushToken(`${error}`));
  }, []);

  console.log('Expo Push Token:', expoPushToken);

  //   Form Submission Handler
  //    Handle login form submission and navigate to main tabs

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Login request to server
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          token: expoPushToken, // Send expo push token with login
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use AuthContext login method
        await login(data.access_token);

        console.log('Login successful:', {
          email,
          token: expoPushToken,
          access_token: data.access_token,
        });

        // Navigate to main tabs on successful login
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ALGORITHM: Navigation Handler
  // Line 5: Navigate to registration screen
  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  return (
    // ALGORITHM: Main Container Setup
    // Line 6: SafeAreaView ensures content stays within device safe boundaries
    <SafeAreaView style={styles.container}>
      {/* Line 7: KeyboardAvoidingView prevents keyboard from covering inputs */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        {/* ALGORITHM: Logo Section - Fixed at Top */}
        {/* Line 8-10: Brand identity display fixed at top with proper padding */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SSA</Text>
          <Text style={styles.subtitleText}>Smart Spend Assistant</Text>
        </View>

        {/* ALGORITHM: Spacer and Centered Login Form */}
        {/* Line 11: Flex container to center the login form vertically */}
        <View style={styles.centerContainer}>
          <View style={styles.formWrapper}>
            {/* ALGORITHM: Login Form Section */}
            {/* Line 12: Form container with proper spacing */}
            <View style={styles.formSection}>
              {/* Line 13: Login title */}
              <Text style={styles.loginTitle}>Login</Text>

              {/* Line 14: Input fields container */}
              <View style={styles.inputContainer}>
                {/* Line 15-21: Email input field with state binding */}
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Line 22-28: Password input field with secure text entry */}
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/*    Submit button with press handler */}

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}>
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Logging in...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ALGORITHM: Sign Up Link Section - Fixed at Bottom */}
        {/* Line 34-40: Registration redirect fixed at bottom with proper padding */}
        <View style={styles.signUpSection}>
          <Text style={styles.signUpText}>
            Dont have an account?{' '}
            <Text style={styles.signUpLink} onPress={handleSignUp}>
              Sign up.
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ALGORITHM: StyleSheet Definition
// Line 41-120: Comprehensive styling with fixed positioning layout
const styles = StyleSheet.create({
  // Main container with white background and full screen coverage
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Keyboard avoiding container with flex layout
  keyboardContainer: {
    flex: 1,
    paddingHorizontal: 24, // px-6 equivalent
    paddingVertical: 32, // py-8 equivalent
  },

  // Logo section fixed at top with proper spacing
  logoSection: {
    alignItems: 'center',
    paddingTop: 32, // pt-8 equivalent
    paddingBottom: 16, // pb-4 equivalent
  },

  // Main logo text styling
  logoText: {
    fontSize: 36, // text-4xl equivalent
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -0.5, // tracking-tight equivalent
    marginBottom: 8, // space-y-2 equivalent
  },

  // Subtitle text styling
  subtitleText: {
    fontSize: 14, // text-sm equivalent
    color: '#6B7280', // text-gray-600 equivalent
  },

  // Center container to vertically center the login form
  centerContainer: {
    flex: 1, // flex-1 equivalent
    justifyContent: 'center', // items-center equivalent
    alignItems: 'center',
  },

  // Form wrapper with max width constraint
  formWrapper: {
    width: '100%',
    maxWidth: 384, // max-w-sm equivalent (24rem = 384px)
  },

  // Form section container
  formSection: {
    width: '100%',
  },

  // Login title styling
  loginTitle: {
    fontSize: 30, // text-3xl equivalent
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24, // space-y-6 equivalent
  },

  // Input container with spacing
  inputContainer: {
    marginBottom: 24, // space-y-6 equivalent
  },

  // Individual input field styling
  input: {
    height: 48, // h-12 equivalent
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300 equivalent
    borderRadius: 12, // rounded-xl equivalent
    paddingHorizontal: 16,
    fontSize: 16, // text-base equivalent
    backgroundColor: '#FFFFFF',
    marginBottom: 16, // space-y-4 equivalent
    color: '#000000',
  },

  // Submit button styling
  submitButton: {
    width: '100%',
    height: 48, // h-12 equivalent
    backgroundColor: '#475569', // bg-slate-600 equivalent
    borderRadius: 12, // rounded-xl equivalent
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  // Submit button disabled styling
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF', // Gray color when disabled
    opacity: 0.7,
  },

  // Submit button text styling
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // text-base equivalent
    fontWeight: '500', // font-medium equivalent
  },

  // Sign up section fixed at bottom
  signUpSection: {
    alignItems: 'center',
    paddingBottom: 32, // pb-8 equivalent
  },

  // Sign up text styling
  signUpText: {
    fontSize: 14, // text-sm equivalent
    color: '#6B7280', // text-gray-600 equivalent
  },

  // Sign up link styling
  signUpLink: {
    color: '#1F2937', // text-gray-800 equivalent
    textDecorationLine: 'underline',
  },
});
