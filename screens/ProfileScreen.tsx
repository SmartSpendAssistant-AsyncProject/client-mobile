import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import * as SecureStore from 'expo-secure-store';

interface Wallet {
  _id: string;
  name: string;
}

interface Transaction {
  _id: string;
  name: string;
  description: string;
  ammount: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();

  const [userProfile, setUserProfile] = useState({
    _id: '',
    name: '',
    username: '',
    email: '',
    createdAt: '',
    updatedAt: '',
    status: '',
  });
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProfile = async () => {
    const access_token = await SecureStore.getItemAsync('access_token');
    try {
      setIsLoading(true);
      const response = await fetch('https://ssa-server-omega.vercel.app/api/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const data = await response.json();
      setUserProfile(data);

      const wallets = await fetch('https://ssa-server-omega.vercel.app/api/wallets', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const walletsData = await wallets.json();
      setWallets(walletsData);

      const transactions = await fetch('https://ssa-server-omega.vercel.app/api/transactions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const transactionsData = await transactions.json();
      setTransactions(transactionsData.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradePlan = async () => {
    const access_token = await SecureStore.getItemAsync('access_token');
    const response = await fetch('https://ssa-server-omega.vercel.app/api/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      navigation.navigate('UpgradePlan', { uri: data.paymentUrl });
    }
  };

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
            // Hapus token
            await SecureStore.deleteItemAsync('access_token');

            // Navigasi ke halaman login dan reset stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
      return () => {
        console.log('ProfileScreen focus effect cleanup');
      };
    }, [])
  );

  // Show loading screen when data is being fetched
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6b7c" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
              {/* <View style={styles.cameraIcon}>
                <Text style={styles.cameraText}>📷</Text>
              </View> */}
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{userProfile.name || 'Loading...'}</Text>
                {/* <TouchableOpacity onPress={handleEditProfile}>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity> */}
              </View>
              <Text style={styles.email}>{userProfile.email || 'Loading...'}</Text>
              <Text style={styles.memberSince}>
                Member since{' '}
                {userProfile.createdAt
                  ? `${String(new Date(userProfile.createdAt).getMonth() + 1).padStart(2, '0')}/${new Date(userProfile.createdAt).getFullYear()}`
                  : 'Loading...'}
              </Text>
            </View>
          </View>

          {userProfile.status === 'free' && (
            <View style={styles.planSection}>
              <View style={styles.planHeader}>
                <Text style={styles.planIcon}>👑</Text>
                <Text style={styles.planTitle}>Let&apos;s go Premium!</Text>
              </View>
              <Text style={styles.planDescription}>Feature you will gets</Text>
              <Text style={styles.planFeatures}>
                • Unlimited AI Chat • AI Based Financial advice
              </Text>

              <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradePlan}>
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{wallets.length}</Text>
            <Text style={styles.statLabel}>Wallets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.greenText]}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
