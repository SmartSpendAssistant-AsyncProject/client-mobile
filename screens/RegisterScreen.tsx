import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';

export default function RegisterScreen() {
  // ALGORITHM: Navigation and State Management
  // Line 1: Initialize navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  // Line 2-5: State management for registration form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ALGORITHM: Form Submission Handler
  // Line 6: Handle registration form submission and navigate to main tabs
  const handleSubmit = () => {
    // TODO: Add registration validation and API call logic here
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    console.log('Registration attempt with:', { fullName, email, password });
    navigation.navigate('MainTabs');
  };

  // ALGORITHM: Navigation Handler
  // Line 7: Navigate back to login screen
  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    // ALGORITHM: Main Container Setup
    // Line 8: SafeAreaView ensures content stays within device safe boundaries
    <SafeAreaView style={styles.container}>
      {/* Line 9: KeyboardAvoidingView prevents keyboard from covering inputs */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        {/* ALGORITHM: Logo Section - Fixed at Top */}
        {/* Line 10-12: Brand identity display fixed at top with proper padding */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SSA</Text>
          <Text style={styles.subtitleText}>Smart Spend Assistant</Text>
        </View>

        {/* ALGORITHM: Spacer and Centered Register Form */}
        {/* Line 13: Flex container to center the register form vertically */}
        <View style={styles.centerContainer}>
          {/* Line 14: ScrollView to handle longer form content */}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.formWrapper}>
              {/* ALGORITHM: Register Form Section */}
              {/* Line 15: Form container with proper spacing */}
              <View style={styles.formSection}>
                {/* Line 16: Register title */}
                <Text style={styles.registerTitle}>Sign Up</Text>

                {/* Line 17: Input fields container */}
                <View style={styles.inputContainer}>
                  {/* Line 18-24: Full name input field with state binding */}
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />

                  {/* Line 25-31: Email input field with state binding */}
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

                  {/* Line 32-38: Password input field with secure text entry */}
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

                  {/* Line 39-45: Confirm password input field with secure text entry */}
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Line 46-50: Submit button with press handler */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* ALGORITHM: Sign In Link Section - Fixed at Bottom */}
        {/* Line 51-57: Login redirect fixed at bottom with proper padding */}
        <View style={styles.signInSection}>
          <Text style={styles.signInText}>
            Already have an account?{' '}
            <Text style={styles.signInLink} onPress={handleSignIn}>
              Sign in.
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ALGORITHM: StyleSheet Definition
// Line 58-150: Comprehensive styling with fixed positioning layout for registration
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

  // Center container to vertically center the register form
  centerContainer: {
    flex: 1, // flex-1 equivalent
  },

  // ScrollView container for form content
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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

  // Register title styling
  registerTitle: {
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

  // Submit button text styling
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // text-base equivalent
    fontWeight: '500', // font-medium equivalent
  },

  // Sign in section fixed at bottom
  signInSection: {
    alignItems: 'center',
    paddingBottom: 32, // pb-8 equivalent
  },

  // Sign in text styling
  signInText: {
    fontSize: 14, // text-sm equivalent
    color: '#6B7280', // text-gray-600 equivalent
  },

  // Sign in link styling
  signInLink: {
    color: '#1F2937', // text-gray-800 equivalent
    textDecorationLine: 'underline',
  },
});
