import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';
import { Eye, EyeOff } from 'lucide-react-native';
import * as securestore from 'expo-secure-store';

// Interface definition for wallet data structure
// This defines the shape of each wallet object with all required properties
interface WalletItem {
  _id: string; // MongoDB ObjectId
  name: string; // Display name of the wallet
  type: string; // Type category (Cash, Saving, Investment, etc.)
  balance: number; // Current balance as a number for calculations
  currency?: string; // Currency symbol (Rp., $, €, etc.) - optional as it may not come from API
  color?: string; // Hex color code for the wallet icon background - optional
  description?: string; // Optional description
  target?: number; // Optional target amount
  threshold?: number; // Optional threshold amount
  user_id: string; // User ID from database
  isDefault?: boolean; // Optional flag to mark the primary/default wallet
}

export default function WalletsScreen() {
  // Navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  // State for balance visibility toggle
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  // State for wallets data from API
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch wallets from API
  const fetchWallets = async () => {
    try {
      setIsLoading(true);

      console.log('Fetching wallets from API...');

      // Direct API call to get wallets using token authentication
      const token = await securestore.getItemAsync('access_token'); // Replace with actual token from auth

      const response = await fetch('https://ssa-server-omega.vercel.app/api/wallets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // Get the actual error message from the API
        const errorData = await response.text();
        console.log('Error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      // Map the data to include default currency and color if not provided
      const mappedWallets: WalletItem[] = data.map((wallet: any, index: number) => ({
        ...wallet,
        currency: 'Rp.', // Default currency
        color: getDefaultColor(wallet.type, index), // Default color based on type
        isDefault: index === 0, // First wallet is default for demo
      }));

      setWallets(mappedWallets);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      Alert.alert('Error', `Failed to load wallets: ${error}`);
      // Fallback to empty array
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get default colors based on wallet type
  const getDefaultColor = (type: string, index: number): string => {
    const colorMap: { [key: string]: string } = {
      Cash: '#2C5F6F',
      Saving: '#4CAF50',
      Investment: '#9C27B0',
      Credit: '#FF5722',
    };

    const defaultColors = ['#2C5F6F', '#4CAF50', '#FF9800', '#9C27B0', '#FF5722'];
    return colorMap[type] || defaultColors[index % defaultColors.length];
  };

  // Fetch wallets when component mounts
  useEffect(() => {
    fetchWallets();
  }, []);

  // Refresh wallets when screen comes into focus (e.g., after creating a new wallet)
  useFocusEffect(
    React.useCallback(() => {
      fetchWallets();
    }, [])
  );

  //   Currency formatting utility
  // Converts raw number to Indonesian Rupiah format
  // Input: 1500000 → Output: "1.500.000"
  // Uses Indonesian locale for proper thousand separators (dots instead of commas)
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('id-ID');
  };

  //   Balance display utility
  // Shows actual balance or asterisks based on visibility state
  const displayBalance = (amount: number): string => {
    if (isBalanceVisible) {
      return formatCurrency(amount);
    }
    // Show asterisks when balance is hidden for privacy
    return '******';
  };

  //   Wallet item renderer
  // Creates individual wallet components with:
  // 1. Left section: Icon + wallet info (name, type, default badge)
  // 2. Right section: Currency + formatted balance + menu button
  // Returns a TouchableOpacity for future tap interactions (edit, view details, etc.)
  const renderWalletItem = (wallet: WalletItem) => (
    <TouchableOpacity key={wallet._id} style={styles.walletItem}>
      {/* Left Section: Icon and Wallet Information */}
      <View style={styles.walletLeft}>
        {/* Wallet details container */}
        <View style={styles.walletInfo}>
          {/* Name row with conditional default badge */}
          <View style={styles.nameContainer}>
            <Text style={styles.walletName}>{wallet.name}</Text>
            {/* Conditional rendering: only show badge if wallet is marked as default */}
            {wallet.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          {/* Wallet type/category */}
          <Text style={styles.walletType}>{wallet.type}</Text>
        </View>
      </View>

      {/* Right Section: Balance and Menu */}
      <View style={styles.walletRight}>
        <Text style={styles.balance}>
          {wallet.currency || 'Rp.'} {displayBalance(wallet.balance)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* SECTION: Header with title and visibility toggle */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallets</Text>
        {/* Balance visibility toggle - shows/hides all wallet balances */}
        <TouchableOpacity
          style={styles.visibilityButton}
          onPress={() => setIsBalanceVisible(!isBalanceVisible)}>
          {isBalanceVisible ? <Eye size={24} color="white" /> : <EyeOff size={24} color="white" />}
        </TouchableOpacity>
      </View>

      {/* SECTION: Main wallets container */}
      <View style={styles.walletsSection}>
        {/* Section header with title and add button */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Wallets</Text>
          {/* Add new wallet button - navigates to CreateWallet screen */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateWallet')}>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/*   List rendering with map function */}
        {/* Maps through wallets array and renders each item */}
        {/* Uses ScrollView for vertical scrolling when list is long */}
        <ScrollView style={styles.walletsList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2C5F6F" />
              <Text style={styles.loadingText}>Loading wallets...</Text>
            </View>
          ) : wallets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No wallets found</Text>
              <Text style={styles.emptySubtext}>Create your first wallet to get started</Text>
            </View>
          ) : (
            wallets.map(renderWalletItem)
          )}
        </ScrollView>
      </View>

      {/* SECTION: Navigation controls */}
      <View style={styles.navigationContainer}>
        {/* Back navigation button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// STYLING: StyleSheet object for component styling
// Organized by component sections for maintainability
const styles = StyleSheet.create({
  // Main container - full screen with light background
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // HEADER SECTION STYLES
  header: {
    backgroundColor: '#2C5F6F', // Darker teal color (was #4A90A4)
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row', // Horizontal layout
    justifyContent: 'space-between', // Title left, button right
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  visibilityButton: {
    padding: 8, // Clickable area padding
  },

  // WALLETS SECTION STYLES
  walletsSection: {
    flex: 1, // Takes remaining space
    backgroundColor: 'white',
    margin: 16, // Space around the card
    borderRadius: 12, // Rounded corners
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2C5F6F', // Darker teal (was #4A90A4)
    width: 32,
    height: 32,
    borderRadius: 16, // Perfect circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },

  // WALLET ITEM STYLES
  walletsList: {
    flex: 1,
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1, // Separator line
    borderBottomColor: '#f0f0f0', // Light gray
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Takes available space
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 8, // Slightly rounded square
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16, // Space between icon and text
  },
  iconText: {
    fontSize: 20,
  },
  walletInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50', // Green badge
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12, // Pill shape
  },
  defaultText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  walletType: {
    fontSize: 14,
    color: '#666', // Gray text
  },

  // RIGHT SECTION (Balance) STYLES
  walletRight: {
    alignItems: 'flex-end', // Right-align text
    position: 'relative', // For absolute positioning of menu
  },
  currency: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  menuButton: {
    position: 'absolute', // Overlay on top-right
    top: -8,
    right: -8,
    padding: 8, // Increase tap area
  },
  menuDots: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },

  // NAVIGATION STYLES
  navigationContainer: {
    padding: 16,
  },
  backButton: {
    backgroundColor: '#2C5F6F', // Darker teal (was #4A90A4)
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // LOADING AND EMPTY STATES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
