import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';

export default function RegisterScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    console.log('Register form submitted:', { fullName, username, email, password });
    navigation.navigate('Login');
  };

  const handleSignInNavigation = () => {
    navigation.navigate('Login');
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingTop: 80,
                paddingBottom: 40,
              }}>
              {/* Logo section */}
              <View style={{ alignItems: 'center', marginBottom: 80 }}>
                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: '900',
                    color: '#000000',
                    marginBottom: 4,
                    letterSpacing: 2,
                  }}>
                  SSA
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#666666',
                  }}>
                  Smart Spend Assistant
                </Text>
              </View>

              {/* Form section */}
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#000000',
                    marginBottom: 30,
                  }}>
                  Register
                </Text>

                <View style={{ width: '100%', maxWidth: 350 }}>
                  {/* Full Name input */}
                  <View style={{ marginBottom: 12 }}>
                    <TextInput
                      style={{
                        height: 56,
                        width: '100%',
                        borderRadius: 28,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: '#000000',
                      }}
                      placeholder="Full name"
                      placeholderTextColor="#AAAAAA"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Username input */}
                  <View style={{ marginBottom: 12 }}>
                    <TextInput
                      style={{
                        height: 56,
                        width: '100%',
                        borderRadius: 28,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: '#000000',
                      }}
                      placeholder="Username"
                      placeholderTextColor="#AAAAAA"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Email input */}
                  <View style={{ marginBottom: 12 }}>
                    <TextInput
                      style={{
                        height: 56,
                        width: '100%',
                        borderRadius: 28,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: '#000000',
                      }}
                      placeholder="Email address"
                      placeholderTextColor="#AAAAAA"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Password input */}
                  <View style={{ marginBottom: 20 }}>
                    <TextInput
                      style={{
                        height: 56,
                        width: '100%',
                        borderRadius: 28,
                        borderWidth: 1,
                        borderColor: '#E0E0E0',
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 20,
                        fontSize: 16,
                        color: '#000000',
                      }}
                      placeholder="Passwords"
                      placeholderTextColor="#AAAAAA"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Submit button */}
                  <TouchableOpacity
                    style={{
                      height: 56,
                      width: '100%',
                      backgroundColor: '#3b667c',
                      borderRadius: 28,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                    }}
                    onPress={handleSubmit}
                    activeOpacity={0.8}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#ffffff',
                      }}>
                      Submit
                    </Text>
                  </TouchableOpacity>

                  {/* Sign in link - Simplified to avoid nested Text issues */}
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: '#666666' }}>Already have an account?</Text>
                    <TouchableOpacity onPress={handleSignInNavigation} style={{ marginTop: 4 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#000000',
                          textDecorationLine: 'underline',
                          fontWeight: '500',
                        }}>
                        Sign in.
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}
