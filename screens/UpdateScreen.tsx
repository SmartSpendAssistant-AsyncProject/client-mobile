import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import { Calendar, ChevronDown, Plus } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';

//   Interface for transaction form data
export interface IFormTransaction {
  name: string;
  description: string;
  ammount: number;
  date: string;
  category_id: string;
  wallet_id: string;
}

const BASE_URL = process.env.BASE_URL || 'https://ssa-server-omega.vercel.app';

export default function UpdateScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const { _id } = route.params as { _id: string };
  console.log('🚀 ~ UpdateScreen ~ _id:', _id);

  const [token, setToken] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [ammount, setAmmount] = useState<string>('');

  // Initialize with current local date
  const getCurrentLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState<string>(getCurrentLocalDate());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [categoryId, setCategoryId] = useState<string>('');
  const [categoryLabel, setCategoryLabel] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [walletLabel, setWalletLabel] = useState<string>('');
  const [wallets, setWallets] = useState<{ label: string; value: string }[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: string; type: string }[]>(
    []
  );
  const [incomeCategories, setIncomeCategories] = useState<{ label: string; value: string }[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<{ label: string; value: string }[]>(
    []
  );
  const [debtCategories, setDebtCategories] = useState<{ label: string; value: string }[]>([]);
  const [loanCategories, setLoanCategories] = useState<{ label: string; value: string }[]>([]);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'debt' | 'loan'>(
    'expense'
  );

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchWallets = async (token: string) => {
      const response = await fetch(`${BASE_URL}/api/wallets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const walletOptions = data.map((wallet: { _id: string; name: string }) => ({
          label: wallet.name,
          value: wallet._id,
        }));
        setWallets(walletOptions);
      }
    };

    const fetchCategories = async (token: string) => {
      const response = await fetch(`${BASE_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const categoryOptions = data.map(
          (category: { _id: string; name: string; type?: string }) => ({
            label: category.name,
            value: category._id,
            type: category.type || 'expense', // Default to expense if no type
          })
        );
        setCategories(categoryOptions);

        // Separate categories by type
        const income = categoryOptions.filter(
          (cat: { label: string; value: string; type: string }) => cat.type === 'income'
        );
        const expense = categoryOptions.filter(
          (cat: { label: string; value: string; type: string }) => cat.type === 'expense'
        );
        const debt = categoryOptions.filter(
          (cat: { label: string; value: string; type: string }) => cat.type === 'debt'
        );
        const loan = categoryOptions.filter(
          (cat: { label: string; value: string; type: string }) => cat.type === 'loan'
        );
        setIncomeCategories(income);
        setExpenseCategories(expense);
        setDebtCategories(debt);
        setLoanCategories(loan);
      }
    };

    const fetchTransaction = async (token: string, transactionId: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/transactions/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const transaction = await response.json();
          console.log('🚀 ~ fetchTransaction ~ transaction:', transaction);
          setName(transaction.name);
          setDescription(transaction.description);
          setAmmount(transaction.ammount.toString());
          setDate(transaction.date);
          setCategoryId(transaction.category_id);
          setWalletId(transaction.wallet_id);

          // Set transaction type based on the fetched data
          setTransactionType(transaction.category.type || 'expense');

          // Set the selected date for date picker
          const [year, month, day] = transaction.date.split('-');
          setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
          onDateChange(null, new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        Alert.alert('Error', 'Failed to fetch transaction data');
      }
    };

    const fetchInitialData = async () => {
      try {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          setToken(token);
          await Promise.all([
            fetchWallets(token),
            fetchCategories(token),
            fetchTransaction(token, _id),
          ]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        Alert.alert('Error', 'Failed to load data. Please try again.');
      }
    };

    if (isFocused) {
      fetchInitialData();
    }
  }, [isFocused, _id]);

  // Update category and wallet labels when data is loaded
  useEffect(() => {
    if (categories.length > 0 && categoryId) {
      const selectedCategory = categories.find((cat) => cat.value === categoryId);
      if (selectedCategory) {
        setCategoryLabel(selectedCategory.label);
      }
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (wallets.length > 0 && walletId) {
      const selectedWallet = wallets.find((wallet) => wallet.value === walletId);
      if (selectedWallet) {
        setWalletLabel(selectedWallet.label);
      }
    }
  }, [wallets, walletId]);

  //   Date picker handler
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);

    // Format date as YYYY-MM-DD for the API using local timezone
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    setDate(formattedDate);
    return event;
  };

  //   Format date for display (DD-MM-YYYY) using local timezone
  const formatDateForDisplay = (dateString: string) => {
    // Parse the date string as local date (not UTC)
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    const displayDay = String(date.getDate()).padStart(2, '0');
    const displayMonth = String(date.getMonth() + 1).padStart(2, '0');
    const displayYear = date.getFullYear();
    return `${displayDay}-${displayMonth}-${displayYear}`;
  };

  //   Category selection handler
  const handleCategorySelect = (category: { label: string; value: string }) => {
    setCategoryId(category.value);
    setCategoryLabel(category.label);
    setShowCategoryDropdown(false);
  };

  //   Transaction type selection handler
  const handleTypeSelect = (type: 'income' | 'expense' | 'debt' | 'loan') => {
    setTransactionType(type);
    setShowTypeDropdown(false);
    // Reset category when type changes
    setCategoryId('');
    setCategoryLabel('');
  };

  //   Get categories based on transaction type
  const getCurrentCategories = () => {
    switch (transactionType) {
      case 'income':
        return incomeCategories;
      case 'expense':
        return expenseCategories;
      case 'debt':
        return debtCategories;
      case 'loan':
        return loanCategories;
      default:
        return expenseCategories;
    }
  };

  //   Wallet selection handler
  const handleWalletSelect = (wallet: { label: string; value: string }) => {
    setWalletId(wallet.value);
    setWalletLabel(wallet.label);
    setShowWalletDropdown(false);
  };

  //   Update transaction handler with validation and navigation
  const handleUpdateTransaction = async () => {
    // Prevent multiple submissions
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Validate required fields
      if (!name.trim()) {
        Alert.alert('Validation Error', 'Transaction name is required');
        return;
      }
      if (!ammount || Number(ammount) <= 0) {
        Alert.alert('Validation Error', 'Amount must be greater than 0');
        return;
      }
      if (!categoryId) {
        Alert.alert('Validation Error', 'Please select a category');
        return;
      }
      if (!walletId) {
        Alert.alert('Validation Error', 'Please select a wallet');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/transactions/${_id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          ammount: Number(ammount),
          date,
          category_id: categoryId,
          wallet_id: walletId,
          type: transactionType,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to update transaction');
        return;
      }

      Alert.alert('Success', 'Transaction updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Update transaction error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
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

  //   Custom dropdown for transaction type
  const renderTypeDropdown = (
    show: boolean,
    onSelect: (type: 'income' | 'expense' | 'debt' | 'loan') => void
  ) => {
    if (!show) return null;

    const typeOptions = [
      { label: 'Income', value: 'income' },
      { label: 'Expense', value: 'expense' },
      { label: 'Debt', value: 'debt' },
      { label: 'Loan', value: 'loan' },
    ];

    return (
      <View style={styles.dropdownContainer}>
        {typeOptions.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={styles.dropdownItem}
            onPress={() => onSelect(item.value as 'income' | 'expense' | 'debt' | 'loan')}>
            <Text style={styles.dropdownItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleAddCategory = () => {
    navigation.navigate('CreateCategory');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/*   Header section with title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Update Transaction</Text>
      </View>

      {/*   Main form content with scroll */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/*   Name input field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Transaction Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={(value) => setName(value)}
              placeholder="Enter name"
              placeholderTextColor="#D1D5DB"
            />
          </View>
          {/*   Amount input field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>Rp.</Text>
              <TextInput
                style={styles.amountInput}
                value={ammount.toString()}
                onChangeText={(value) => setAmmount(value)}
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
              value={description}
              onChangeText={(value) => setDescription(value)}
              placeholder="Enter description"
              placeholderTextColor="#D1D5DB"
            />
          </View>

          {/*   Transaction Type selector field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Transaction Type</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowCategoryDropdown(false);
                setShowWalletDropdown(false);
              }}>
              <Text
                style={[
                  styles.selectText,
                  transactionType ? styles.selectedText : styles.placeholderText,
                ]}>
                {transactionType === 'income'
                  ? 'Income'
                  : transactionType === 'expense'
                    ? 'Expense'
                    : transactionType === 'debt'
                      ? 'Debt'
                      : transactionType === 'loan'
                        ? 'Loan'
                        : 'Select Type'}
              </Text>
              <ChevronDown
                size={20}
                color="#9CA3AF"
                style={[styles.chevronIcon, showTypeDropdown && styles.chevronRotated]}
              />
            </TouchableOpacity>
            {/*   Transaction type dropdown options */}
            {renderTypeDropdown(showTypeDropdown, handleTypeSelect)}
          </View>

          {/*   Date input field with calendar icon */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateInputText}>{formatDateForDisplay(date)}</Text>
              <Calendar size={20} color="#9CA3AF" style={styles.calendarIcon} />
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}

          {/*   Category selector field with dropdown */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithButton}>
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity style={styles.addCategoryButton} onPress={handleAddCategory}>
                <Plus size={16} color="#3b667c" />
                <Text style={styles.addCategoryButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowWalletDropdown(false); // Close other dropdown
                setShowTypeDropdown(false); // Close type dropdown
              }}>
              <Text
                style={[
                  styles.selectText,
                  categoryLabel ? styles.selectedText : styles.placeholderText,
                ]}>
                {categoryLabel || `Select ${transactionType} category`}
              </Text>
              <ChevronDown
                size={20}
                color="#9CA3AF"
                style={[styles.chevronIcon, showCategoryDropdown && styles.chevronRotated]}
              />
            </TouchableOpacity>
            {/*   Category dropdown options - filtered by transaction type */}
            {renderDropdown(showCategoryDropdown, getCurrentCategories(), handleCategorySelect)}
          </View>

          {/*   Wallet selector field with dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Wallet</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => {
                setShowWalletDropdown(!showWalletDropdown);
                setShowCategoryDropdown(false); // Close category dropdown
                setShowTypeDropdown(false); // Close type dropdown
              }}>
              <Text
                style={[
                  styles.selectText,
                  walletLabel ? styles.selectedText : styles.placeholderText,
                ]}>
                {walletLabel || 'Select wallet'}
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

          {/*   Update transaction submit button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.addButton, isLoading && styles.addButtonDisabled]}
              onPress={handleUpdateTransaction}
              disabled={isLoading}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Updating...</Text>
                </View>
              ) : (
                <Text style={styles.addButtonText}>Update Transaction</Text>
              )}
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

  //   Label with button styles
  labelWithButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addCategoryButtonText: {
    fontSize: 12,
    color: '#3b667c',
    fontWeight: '500',
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
  dateInputText: {
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
  addButtonDisabled: {
    backgroundColor: '#9CA3AF', // Gray when disabled
    opacity: 0.7,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  //   Loading overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    minWidth: 120,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
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
