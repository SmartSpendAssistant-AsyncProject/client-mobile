// screens/RegisterScreen.tsx
// Registration screen wired with backend API integration

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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import { registerUser, RegisterApiError } from '../services/registerAPi';

export default function RegisterScreen() {
  // Navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  // Form state management for user input fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state management for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Client-side form validation before API submission
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate name field (matching backend validation rules)
    if (!fullName.trim()) {
      newErrors.fullName = 'Name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long';
    } else if (fullName.trim().length > 50) {
      newErrors.fullName = 'Name must not exceed 50 characters';
    }

    // Validate email field with basic regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    // Validate password field (matching backend validation rules)
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (password.length > 100) {
      newErrors.password = 'Password must not exceed 100 characters';
    }

    // Validate password confirmation matches original password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Update error state and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler with API integration
  const handleSubmit = async () => {
    // Clear previous errors before new validation
    setErrors({});

    // Perform client-side validation first
    if (!validateForm()) {
      return; // Exit early if validation fails
    }

    // Set loading state to prevent multiple submissions
    setIsLoading(true);

    try {
      // Prepare user data for API request (username auto-generated)
      const userData = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };

      // Call registration API with user data
      console.log('Attempting to register user...');
      const response = await registerUser(userData);

      // Show success message and navigate to login
      Alert.alert(
        'Registration Successful! 🎉',
        response.message || 'Your account has been created successfully. You can now sign in.',
        [
          {
            text: 'Sign In Now',
            onPress: () => {
              // Navigate to login screen on success
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (error) {
      // Handle registration errors with specific messaging
      console.error('Registration error:', error);

      if (error instanceof RegisterApiError) {
        // Handle known API errors with appropriate user messages
        if (error.status === 400) {
          // Handle validation errors from server (duplicate username/email)
          Alert.alert('Registration Failed', error.message, [
            { text: 'Try Again', style: 'default' },
          ]);
        } else if (error.status === 0) {
          // Handle network connectivity issues
          Alert.alert(
            'Connection Error',
            'Unable to connect to the server. Please check your internet connection and try again.',
            [{ text: 'Retry', style: 'default' }]
          );
        } else {
          // Handle other server errors (500, etc.)
          Alert.alert(
            'Server Error',
            'Something went wrong on our end. Please try again in a few moments.',
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        // Handle unexpected errors not from API
        Alert.alert('Unexpected Error', 'An unexpected error occurred. Please try again.', [
          { text: 'OK', style: 'default' },
        ]);
      }
    } finally {
      // Always reset loading state when request completes
      setIsLoading(false);
    }
  };

  // Navigation handler to go back to login screen
  const handleSignIn = () => {
    navigation.navigate('Login');
  };

  // Helper function to apply error styling to input fields
  const getInputStyle = (fieldName: string) => [
    styles.input,
    errors[fieldName] && styles.inputError, // Add red border if field has error
  ];

  return (
    // Main container with safe area handling
    <SafeAreaView style={styles.container}>
      {/* Keyboard avoiding view for better UX on mobile */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        {/* App logo and branding section */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>SSA</Text>
          <Text style={styles.subtitleText}>Smart Spend Assistant</Text>
        </View>

        {/* Scrollable form container for better mobile experience */}
        <View style={styles.centerContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.formWrapper}>
              {/* Registration form with validation */}
              <View style={styles.formSection}>
                <Text style={styles.registerTitle}>Sign Up</Text>

                <View style={styles.inputContainer}>
                  {/* Full name input with real-time validation */}
                  <TextInput
                    style={getInputStyle('fullName')}
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading} // Disable during API call
                  />
                  {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

                  {/* Email input with validation */}
                  <TextInput
                    style={getInputStyle('email')}
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading} // Disable during API call
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                  {/* Password input with secure entry */}
                  <TextInput
                    style={getInputStyle('password')}
                    placeholder="Password (min. 8 characters)"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading} // Disable during API call
                  />
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                  {/* Password confirmation input */}
                  <TextInput
                    style={getInputStyle('confirmPassword')}
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading} // Disable during API call
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>

                {/* Submit button with loading state */}
                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading} // Prevent multiple submissions
                >
                  {isLoading ? (
                    // Show loading indicator during API call
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Creating Account...</Text>
                    </View>
                  ) : (
                    // Show normal button text when not loading
                    <Text style={styles.submitButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Sign in link at bottom */}
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

// Comprehensive styling for registration screen
const styles = StyleSheet.create({
  // Main container styling
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Keyboard avoiding container
  keyboardContainer: {
    flex: 1,
    paddingHorizontal: 24, // Horizontal padding for mobile screens
    paddingVertical: 32, // Vertical padding for safe area
  },

  // Logo section at top
  logoSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
  },

  // Main logo text
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 8,
  },

  // Subtitle under logo
  subtitleText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Container for centering form
  centerContainer: {
    flex: 1,
  },

  // ScrollView content container
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form wrapper with max width
  formWrapper: {
    width: '100%',
    maxWidth: 384, // Limit form width on larger screens
  },

  // Form section container
  formSection: {
    width: '100%',
  },

  // Registration title
  registerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },

  // Input container with spacing
  inputContainer: {
    marginBottom: 24,
  },

  // Base input field styling
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8, // Space for error text
    color: '#000000',
  },

  // Input field error state
  inputError: {
    borderColor: '#EF4444', // Red border for errors
    borderWidth: 2,
  },

  // Error text styling
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 8,
    marginLeft: 4,
  },

  // Submit button base styling
  submitButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#3b667c',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Android shadow
  },

  // Submit button disabled state
  submitButtonDisabled: {
    opacity: 0.7,
  },

  // Loading container for spinner and text
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Submit button text
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Sign in section at bottom
  signInSection: {
    alignItems: 'center',
    paddingBottom: 32,
  },

  // Sign in text
  signInText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Sign in link
  signInLink: {
    color: '#1F2937',
    textDecorationLine: 'underline',
  },
});
