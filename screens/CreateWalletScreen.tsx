import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from 'types/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';

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
  const [initialBalance, setInitialBalance] = useState('0');
  const [description, setDescription] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Wallet type options
  const walletTypes: WalletTypeOption[] = [
    { value: 'Cash', label: 'Cash', subtitle: 'Physical money' },
    { value: 'Saving', label: 'Saving', subtitle: 'Savings account' },
  ];

  // Handle wallet creation
  const handleCreateWallet = (): void => {
    // Basic validation
    if (!walletName.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }

    if (!initialBalance || isNaN(Number(initialBalance))) {
      Alert.alert('Error', 'Please enter a valid initial balance');
      return;
    }

    // Here you would typically save the wallet data
    // For now, just show success and navigate back
    Alert.alert('Success', 'Wallet created successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  // Format number input for balance
  const formatBalance = (text: string): void => {
    // Remove non-numeric characters except dots
    const numericValue = text.replace(/[^0-9]/g, '');
    setInitialBalance(numericValue);
  };

  // Handle wallet type selection
  const selectWalletType = (type: string): void => {
    setWalletType(type);
    setShowTypeModal(false);
  };

  return (
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
          <TouchableOpacity style={styles.typeSelector} onPress={() => setShowTypeModal(true)}>
            <View style={styles.typeSelectorContent}>
              <View>
                <Text style={styles.typeTitle}>{walletType}</Text>
                <Text style={styles.typeSubtitle}>
                  {walletTypes.find((type) => type.value === walletType)?.subtitle}
                </Text>
              </View>
              <ChevronDown size={20} color="#666" />
            </View>
          </TouchableOpacity>
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
              onChangeText={formatBalance}
              keyboardType="numeric"
            />
          </View>
        </View>

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
        <TouchableOpacity style={styles.createButton} onPress={handleCreateWallet}>
          <Text style={styles.createButtonText}>Create Wallet</Text>
        </TouchableOpacity>
      </View>

      {/* Wallet Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Wallet Type</Text>
            {walletTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[styles.typeOption, walletType === type.value && styles.selectedTypeOption]}
                onPress={() => selectWalletType(type.value)}>
                <View>
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      walletType === type.value && styles.selectedTypeText,
                    ]}>
                    {type.label}
                  </Text>
                  <Text
                    style={[
                      styles.typeOptionSubtitle,
                      walletType === type.value && styles.selectedTypeSubtext,
                    ]}>
                    {type.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowTypeModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeOption: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTypeOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#5A8A9B',
  },
  typeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedTypeText: {
    color: '#5A8A9B',
  },
  typeOptionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  selectedTypeSubtext: {
    color: '#5A8A9B',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
