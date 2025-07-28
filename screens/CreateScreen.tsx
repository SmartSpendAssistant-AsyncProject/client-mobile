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
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import { Calendar, ChevronDown } from 'lucide-react-native';
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

export default function CreateScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [token, setToken] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [ammount, setAmmount] = useState<number>(0);

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
  const [walletId, setWalletId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [wallet, setWallet] = useState<string>('');
  const [wallets, setWallets] = useState<{ label: string; value: string }[]>([]);
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

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
        const categoryOptions = data.map((category: { _id: string; name: string }) => ({
          label: category.name,
          value: category._id,
        }));
        setCategories(categoryOptions);
      }
    };
    const fetchInitialData = async () => {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        setToken(token);
        fetchWallets(token);
        fetchCategories(token);
      }
    };
    if (isFocused) {
      fetchInitialData();
      setName('');
      setDescription('');
      setAmmount(0);
      setDate(getCurrentLocalDate());
      setCategoryId('');
      setWalletId('');
      setCategory('');
      setWallet('');
      setCategory('');
      setShowCategoryDropdown(false);
      setShowWalletDropdown(false);
    }
  }, [isFocused]);

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
    setCategory(category.label);
    setShowCategoryDropdown(false);
  };

  //   Wallet selection handler
  const handleWalletSelect = (wallet: { label: string; value: string }) => {
    setWalletId(wallet.value);
    setWallet(wallet.label);
    setShowWalletDropdown(false);
  };

  //   Add transaction handler with validation and navigation
  const handleAddTransaction = async () => {
    const response = await fetch(`${BASE_URL}/api/transactions`, {
      method: 'POST',
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
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      Alert.alert('Error', error.message || 'Failed to add transaction');
      return;
    } else {
      navigation.navigate('Home');
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

  return (
    <SafeAreaView style={styles.container}>
      {/*   Header section with title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Transaction</Text>
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
                onChangeText={(value) => setAmmount(Number(value))}
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
                  category ? styles.selectedText : styles.placeholderText,
                ]}>
                {category || 'Select category'}
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
                style={[styles.selectText, wallet ? styles.selectedText : styles.placeholderText]}>
                {wallet || 'Select wallet'}
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
