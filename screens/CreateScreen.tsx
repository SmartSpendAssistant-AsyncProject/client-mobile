import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import { Calendar, ChevronDown } from 'lucide-react-native';

//   Interface for transaction form data
interface TransactionData {
  amount: string;
  description: string;
  category: string;
  wallet: string;
  date: string;
}

export default function CreateScreen() {
  //   Navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  //   State management for form inputs
  const [formData, setFormData] = useState<TransactionData>({
    amount: '',
    description: '',
    category: '',
    wallet: '',
    date: '24/07/2025',
  });

  //   State for dropdown visibility
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  //   Category options array
  const categories = [
    { label: 'Food & Dining', value: 'food' },
    { label: 'Transportation', value: 'transport' },
    { label: 'Shopping', value: 'shopping' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Bills & Utilities', value: 'bills' },
  ];

  //   Wallet options array
  const wallets = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank Account', value: 'bank' },
    { label: 'Credit Card', value: 'credit' },
    { label: 'Digital Wallet', value: 'digital' },
  ];

  //   Form input handler function
  const handleInputChange = (field: keyof TransactionData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //   Category selection handler
  const handleCategorySelect = (category: { label: string; value: string }) => {
    handleInputChange('category', category.label);
    setShowCategoryDropdown(false);
  };

  //   Wallet selection handler
  const handleWalletSelect = (wallet: { label: string; value: string }) => {
    handleInputChange('wallet', wallet.label);
    setShowWalletDropdown(false);
  };

  //   Form validation function
  const validateForm = (): boolean => {
    if (!formData.amount.trim()) {
      Alert.alert('Error', 'Please enter an amount');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.wallet) {
      Alert.alert('Error', 'Please select a wallet');
      return false;
    }
    return true;
  };

  //   Add transaction handler with validation and navigation
  const handleAddTransaction = () => {
    if (!validateForm()) return;

    //   Show success message and navigate back
    Alert.alert('Success', 'Transaction added successfully!', [
      {
        text: 'OK',
        onPress: () => {
          //   Navigate back to Home screen
          navigation.navigate('Home');
        },
      },
    ]);
  };

  //   Custom dropdown component
  const renderDropdown = (
    show: boolean,
    items: { label: string; value: string }[],
    onSelect: (item: { label: string; value: string }) => void
  ) => {
    if (!show) return null;

    return (
      <View style={styles.dropdownContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={styles.dropdownItem}
            onPress={() => onSelect(item)}>
            <Text style={styles.dropdownItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/*   Header section with title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Transaction</Text>
      </View>

      {/*   Main form content with scroll */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/*   Amount input field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>Rp.</Text>
              <TextInput
                style={styles.amountInput}
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/*   Description input field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textInput}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter description"
              placeholderTextColor="#D1D5DB"
            />
          </View>

          {/*   Category selector field with dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowWalletDropdown(false); // Close other dropdown
              }}>
              <Text
                style={[
                  styles.selectText,
                  formData.category ? styles.selectedText : styles.placeholderText,
                ]}>
                {formData.category || 'Select category'}
              </Text>
              <ChevronDown
                size={20}
                color="#9CA3AF"
                style={[styles.chevronIcon, showCategoryDropdown && styles.chevronRotated]}
              />
            </TouchableOpacity>
            {/*   Category dropdown options */}
            {renderDropdown(showCategoryDropdown, categories, handleCategorySelect)}
          </View>

          {/*   Wallet selector field with dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Wallet</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => {
                setShowWalletDropdown(!showWalletDropdown);
                setShowCategoryDropdown(false); // Close other dropdown
              }}>
              <Text
                style={[
                  styles.selectText,
                  formData.wallet ? styles.selectedText : styles.placeholderText,
                ]}>
                {formData.wallet || 'Select wallet'}
              </Text>
              <ChevronDown
                size={20}
                color="#9CA3AF"
                style={[styles.chevronIcon, showWalletDropdown && styles.chevronRotated]}
              />
            </TouchableOpacity>
            {/*   Wallet dropdown options */}
            {renderDropdown(showWalletDropdown, wallets, handleWalletSelect)}
          </View>

          {/*   Date input field with calendar icon */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                value={formData.date}
                onChangeText={(value) => handleInputChange('date', value)}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#9CA3AF"
              />
              <Calendar size={20} color="#9CA3AF" style={styles.calendarIcon} />
            </View>
          </View>

          {/*   Add transaction submit button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

//   StyleSheet object for component styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  //   Header section styles
  header: {
    backgroundColor: '#3b667c', // Slate-600
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  //   Content and form styles
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background
  },
  formContainer: {
    padding: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },

  //   Amount input styles
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  currencyPrefix: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
  },

  //   Regular text input styles
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
    fontSize: 16,
    color: '#1F2937',
  },

  //   Select input styles
  selectInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
  },
  selectedText: {
    color: '#1F2937',
  },
  placeholderText: {
    color: '#D1D5DB',
  },

  //   Chevron icon styles
  chevronIcon: {
    // No transition needed - React Native handles transforms differently
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },

  //   Date input styles
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 48,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  calendarIcon: {
    marginLeft: 8,
  },

  //   Submit button styles
  buttonContainer: {
    paddingTop: 16,
  },
  addButton: {
    backgroundColor: '#3b667c', // Slate-600
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    height: 48,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  //   Dropdown styles
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
});
