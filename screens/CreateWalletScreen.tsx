import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as securestore from 'expo-secure-store';

// Interface for wallet type options
interface WalletTypeOption {
  value: string;
  label: string;
  subtitle: string;
}

export default function CreateWalletScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();

  // Form state management
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState('Cash');
  const [initialBalance, setInitialBalance] = useState('');
  const [walletThreshold, setWalletThreshold] = useState('');
  const [savingTarget, setSavingTarget] = useState('');
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Wallet type options
  const walletTypes: WalletTypeOption[] = [
    { value: 'Cash', label: 'Cash', subtitle: 'Physical money' },
    { value: 'Saving', label: 'Saving', subtitle: 'Savings account' },
  ];

  // Update the handleCreateWallet function
  const handleCreateWallet = async (): Promise<void> => {
    if (!walletName.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }

    if (!initialBalance || isNaN(Number(initialBalance))) {
      Alert.alert('Error', 'Please enter a valid balance');
      return;
    }

    try {
      setIsCreating(true);

      // Prepare wallet data for API
      const walletData = {
        name: walletName.trim(),
        description: description.trim(),
        type: walletType,
        balance: Number(initialBalance),
        target: Number(savingTarget),
        threshold: Number(walletThreshold),
      };

      // Use the same token format as WalletsScreen
      const token = await securestore.getItemAsync('access_token');

      const response = await fetch('https://ssa-server-omega.vercel.app/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      // Show success message and navigate back
      Alert.alert('Success', 'Wallet created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create wallet. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Format number input for balance
  // const formatBalance = (text: string): void => {
  //   // Remove non-numeric characters except dots
  //   const numericValue = text.replace(/[^0-9]/g, '');
  //   setInitialBalance(numericValue);
  // };

  // Handle wallet type selection
  const selectWalletType = (type: string): void => {
    setWalletType(type);
    setIsDropdownOpen(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Wallet</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Wallet Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Wallet Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter wallet name"
              placeholderTextColor="#A0A0A0"
              value={walletName}
              onChangeText={setWalletName}
            />
          </View>

          {/* Wallet Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Wallet Type</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.typeSelector}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
                <View style={styles.typeSelectorContent}>
                  <View>
                    <Text style={styles.typeTitle}>{walletType}</Text>
                    <Text style={styles.typeSubtitle}>
                      {walletTypes.find((type) => type.value === walletType)?.subtitle}
                    </Text>
                  </View>
                  {isDropdownOpen ? (
                    <ChevronUp size={20} color="#666" />
                  ) : (
                    <ChevronDown size={20} color="#666" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <View style={styles.dropdownOptions}>
                  {walletTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.dropdownOption,
                        walletType === type.value && styles.selectedDropdownOption,
                      ]}
                      onPress={() => selectWalletType(type.value)}>
                      <View>
                        <Text
                          style={[
                            styles.dropdownOptionTitle,
                            walletType === type.value && styles.selectedDropdownText,
                          ]}>
                          {type.label}
                        </Text>
                        <Text
                          style={[
                            styles.dropdownOptionSubtitle,
                            walletType === type.value && styles.selectedDropdownSubtext,
                          ]}>
                          {type.subtitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Initial Balance */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Initial Balance</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.currencyPrefix}>Rp.</Text>
              <TextInput
                style={styles.balanceInput}
                placeholder="0"
                placeholderTextColor="#A0A0A0"
                value={initialBalance}
                onChangeText={setInitialBalance}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Wallet Threshold */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Wallet Threshold</Text>
            <View style={styles.balanceContainer}>
              <Text style={styles.currencyPrefix}>Rp.</Text>
              <TextInput
                style={styles.balanceInput}
                placeholder="0"
                placeholderTextColor="#A0A0A0"
                value={walletThreshold}
                onChangeText={setWalletThreshold}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Saving target */}
          {walletType === 'Saving' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Saving Target</Text>
              <View style={styles.balanceContainer}>
                <Text style={styles.currencyPrefix}>Rp.</Text>
                <TextInput
                  style={styles.balanceInput}
                  placeholder="0"
                  placeholderTextColor="#A0A0A0"
                  value={savingTarget}
                  onChangeText={setSavingTarget}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="Add a description for this wallet"
              placeholderTextColor="#A0A0A0"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.createButton, isCreating && styles.createButtonDisabled]}
            onPress={handleCreateWallet}
            disabled={isCreating}>
            {isCreating ? (
              <Text style={styles.createButtonText}>Creating...</Text>
            ) : (
              <Text style={styles.createButtonText}>Create Wallet</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#5A8A9B',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Compensate for back button
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeSelector: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  typeSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  typeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  dropdownOptions: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedDropdownOption: {
    backgroundColor: '#E3F2FD',
  },
  dropdownOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedDropdownText: {
    color: '#5A8A9B',
  },
  dropdownOptionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  selectedDropdownSubtext: {
    color: '#5A8A9B',
  },
  balanceContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    fontWeight: '500',
  },
  balanceInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  descriptionInput: {
    height: 100,
    paddingTop: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  createButton: {
    backgroundColor: '#5A8A9B',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  createButtonDisabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
  },
});
