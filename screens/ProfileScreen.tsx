import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';

export default function ProfileScreen() {
  // ALGORITMANYA: Navigation and State Management
  // Line 1: Initialize navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  // Line 2-7: State management for user profile data
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: 'January 2024',
    planType: 'Free Plan',
    walletCount: 3,
    transactionCount: 127,
    activeDebts: 2,
  });

  // Line 8: Loading state for database operations
  const [isLoading, setIsLoading] = useState(false);

  // ALGORITHM: Data Fetching Effect
  // Line 9: Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ALGORITHM: Database Integration Functions
  // Line 10: Fetch user profile from database
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.getUserProfile();
      // setUserProfile(response.data);
      console.log('Fetching user profile from database...');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  // ALGORITHM: Upgrade Plan Handler
  // Line 11: Handle plan upgrade navigation
  const handleUpgradePlan = async () => {
    const response = await fetch('https://ssa-server-omega.vercel.app/api/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI2ODgyNDhmYjc2NTM3ZGQ0ZjZjYzllMDkifQ.Wg9sGQZ4Go_rLGXtwiJPUshoee5wW1GjELrzwiLU850'}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      navigation.navigate('UpgradePlan', { uri: data.paymentUrl });
    }
  };

  // ALGORITHM: Edit Profile Handler
  // Line 12: Navigate to edit profile screen
  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    console.log('Navigating to edit profile...');
    // navigation.navigate('EditProfile');
  };

  // ALGORITHM: Sign Out Handler
  // Line 13: Handle user logout with confirmation
  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            // TODO: Add logout API call
            // await api.logout();
            console.log('User signed out');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  return (
    // ALGORITHM: Main Container Setup
    // Line 14: SafeAreaView ensures content stays within device safe boundaries
    <SafeAreaView style={styles.container}>
      {/* ALGORITHM: Header Section */}
      {/* Line 15: Fixed header with title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Line 16: Scrollable content container */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* ALGORITHM: Profile Information Section */}
        {/* Line 17-19: User profile display with avatar and basic info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraText}>📷</Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{userProfile.name}</Text>
                <TouchableOpacity onPress={handleEditProfile}>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.email}>{userProfile.email}</Text>
              <Text style={styles.memberSince}>Member since {userProfile.memberSince}</Text>
            </View>
          </View>

          {/* ALGORITHM: Plan Information Section */}
          {/* Line 20-22: Current plan display with upgrade option */}
          <View style={styles.planSection}>
            <View style={styles.planHeader}>
              <Text style={styles.planIcon}>👑</Text>
              <Text style={styles.planTitle}>{userProfile.planType}</Text>
            </View>
            <Text style={styles.planDescription}>Limited features available</Text>
            <Text style={styles.planFeatures}>
              • Up to 3 wallets • Basic reports • Limited AI chat
            </Text>

            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePlan}>
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ALGORITHM: Statistics Section */}
        {/* Line 23-25: User statistics display with database-driven values */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProfile.walletCount}</Text>
            <Text style={styles.statLabel}>Wallets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.greenText]}>
              {userProfile.transactionCount}
            </Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.redText]}>{userProfile.activeDebts}</Text>
            <Text style={styles.statLabel}>Active Debts</Text>
          </View>
        </View>

        {/* ALGORITHM: Sign Out Section */}
        {/* Line 26-28: Sign out button with confirmation dialog */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutIcon}>↗️</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a6b7c',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 24,
    color: '#666',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4a6b7c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 12,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  editIcon: {
    fontSize: 16,
    color: '#666',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
  },
  planSection: {
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  planFeatures: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#4a6b7c',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  greenText: {
    color: '#4caf50',
  },
  redText: {
    color: '#f44336',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signOutIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#f44336',
  },
  signOutText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '500',
  },
});
