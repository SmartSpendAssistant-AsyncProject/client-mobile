import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';
import { Eye, EyeOff } from 'lucide-react-native';

// Interface definition for wallet data structure
// This defines the shape of each wallet object with all required properties
interface WalletItem {
  id: string; // Unique identifier for each wallet
  name: string; // Display name of the wallet
  type: string; // Type category (Cash, Saving, Investment, etc.)
  balance: number; // Current balance as a number for calculations
  currency: string; // Currency symbol (Rp., $, €, etc.)
  color: string; // Hex color code for the wallet icon background

  isDefault?: boolean; // Optional flag to mark the primary/default wallet
}

export default function WalletsScreen() {
  // Navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  // State for balance visibility toggle
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // ALGORITHM: Static wallet data structure
  // In a real app, this would come from:
  // 1. AsyncStorage for local persistence
  // 2. API calls to backend server
  // 3. State management (Redux, Zustand, Context)
  // 4. Database query results
  const wallets: WalletItem[] = [
    // Main spending wallet - typically checking account or daily cash
    {
      id: '1',
      name: 'Main Wallet',
      type: 'Cash',
      balance: 1500000,
      currency: 'Rp.',
      color: '#2C5F6F',

      isDefault: true, // Primary wallet for transactions
    },
    // Long-term savings account - higher balance, less frequent access
    {
      id: '2',
      name: 'Savings Account',
      type: 'Saving',
      balance: 15000000,
      currency: 'Rp.',
      color: '#4CAF50',
    },
    // Emergency fund - separate savings for unexpected expenses
    {
      id: '3',
      name: 'Emergency Fund',
      type: 'Saving',
      balance: 5000000,
      currency: 'Rp.',
      color: '#FF9800',
    },
    // Investment portfolio - highest balance, long-term growth
    {
      id: '4',
      name: 'Investment',
      type: 'Saving',
      balance: 25000000,
      currency: 'Rp.',
      color: '#9C27B0',
    },
  ];

  // ALGORITHM: Currency formatting utility
  // Converts raw number to Indonesian Rupiah format
  // Input: 1500000 → Output: "1.500.000"
  // Uses Indonesian locale for proper thousand separators (dots instead of commas)
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('id-ID');
  };

  // ALGORITHM: Balance display utility
  // Shows actual balance or asterisks based on visibility state
  const displayBalance = (amount: number): string => {
    if (isBalanceVisible) {
      return formatCurrency(amount);
    }
    // Show asterisks when balance is hidden for privacy
    return '******';
  };

  // ALGORITHM: Wallet item renderer
  // Creates individual wallet components with:
  // 1. Left section: Icon + wallet info (name, type, default badge)
  // 2. Right section: Currency + formatted balance + menu button
  // Returns a TouchableOpacity for future tap interactions (edit, view details, etc.)
  const renderWalletItem = (wallet: WalletItem) => (
    <TouchableOpacity key={wallet.id} style={styles.walletItem}>
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
          {wallet.currency} {displayBalance(wallet.balance)}
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

        {/* ALGORITHM: List rendering with map function */}
        {/* Maps through wallets array and renders each item */}
        {/* Uses ScrollView for vertical scrolling when list is long */}
        <ScrollView style={styles.walletsList}>{wallets.map(renderWalletItem)}</ScrollView>
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
});
