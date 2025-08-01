import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Mic, ChevronDown, Bot, Wallet } from 'lucide-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import { VoiceRecorderModal } from '../components/VoiceRecorderModal';
import { VoiceApiService } from '../utils/VoiceApiService';
import { getAuthToken, getUserWallets } from '../utils/AuthUtils';
import * as SecureStore from 'expo-secure-store';

//   Define message interface for type safety
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

//   Define dropdown option type
interface DropdownOption {
  value: string;
  label: string;
}

//   Define wallet interface for type safety
interface WalletItem {
  _id: string;
  name: string;
  balance: number;
  type: string;
}

export default function ChatScreen() {
  //   Navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  //   State management for chat functionality
  const [messages, setMessages] = useState<Message[]>([]);

  //   Ref for scroll view auto-scroll
  const scrollViewRef = useRef<ScrollView>(null);

  //   Ref for wallet refresh interval
  const walletRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  //   Input state management
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'ask' | 'input'>('ask');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  //   Voice recording state management
  const [isVoiceModalVisible, setIsVoiceModalVisible] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  //   AI typing indicator state
  const [isAiTyping, setIsAiTyping] = useState(false);

  //   Wallet management state
  const [userWallets, setUserWallets] = useState<WalletItem[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [isWalletDropdownVisible, setIsWalletDropdownVisible] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletUpdateIndicator, setWalletUpdateIndicator] = useState(false);

  // User data state
  const [userProfile, setUserProfile] = useState({
    _id: '',
    name: '',
    username: '',
    email: '',
    createdAt: '',
    updatedAt: '',
    status: '',
  });

  //   Dropdown options configuration
  const dropdownOptions: DropdownOption[] = [
    { value: 'ask', label: 'Ask' },
    { value: 'input', label: 'Input' },
  ];

  //   Load user wallets on component mount
  useEffect(() => {
    loadUserWallets();
  }, []);

  //   Function to silently refresh wallet data (no loading indicator)
  const silentRefreshWallets = useCallback(async () => {
    try {
      console.log(' Silent wallet refresh...');
      setWalletUpdateIndicator(true); // Show subtle update indicator

      const wallets = await getUserWallets();

      if (wallets && wallets.length > 0) {
        const currentSelectedId = selectedWallet?._id;
        const previousBalance = selectedWallet?.balance;

        // Update wallets array
        setUserWallets(wallets);

        // Update selected wallet with new data if it still exists
        if (currentSelectedId) {
          const updatedSelectedWallet = wallets.find((w) => w._id === currentSelectedId);
          if (updatedSelectedWallet) {
            setSelectedWallet(updatedSelectedWallet);

            // Log balance change
            if (
              previousBalance !== undefined &&
              previousBalance !== updatedSelectedWallet.balance
            ) {
              const change = updatedSelectedWallet.balance - previousBalance;
              console.log(' Wallet balance changed:', {
                previous: previousBalance,
                current: updatedSelectedWallet.balance,
                change: change > 0 ? `+${change}` : change,
              });
            }
          }
        } else if (!selectedWallet && wallets.length > 0) {
          // If no wallet selected, select the first one
          setSelectedWallet(wallets[0]);
        }
      }
    } catch (error) {
      console.error(' Silent wallet refresh failed:', error);
      // Don't show alert for silent refresh failures
    } finally {
      // Hide update indicator after a short delay
      setTimeout(() => {
        setWalletUpdateIndicator(false);
      }, 500);
    }
  }, [selectedWallet]);

  //   Auto-scroll to bottom when new messages arrive or AI is typing
  useEffect(() => {
    if (messages.length > 0 || isAiTyping) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isAiTyping]);

  //   Setup periodic wallet refresh when component mounts
  useEffect(() => {
    // Start periodic wallet refresh every 30 seconds
    walletRefreshIntervalRef.current = setInterval(() => {
      silentRefreshWallets();
    }, 30000); // 30 seconds

    return () => {
      // Cleanup interval on unmount
      if (walletRefreshIntervalRef.current) {
        clearInterval(walletRefreshIntervalRef.current);
      }
    };
  }, [silentRefreshWallets]);

  //   Function to load user wallets from API
  const loadUserWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const wallets = await getUserWallets();

      if (wallets && wallets.length > 0) {
        setUserWallets(wallets);
        //   Set first wallet as default selected
        setSelectedWallet(wallets[0]);
      } else {
        setUserWallets([]);
        setSelectedWallet(null);
      }
    } catch (error) {
      console.error('  Failed to load wallets:', error);
      Alert.alert('Error', 'Failed to load wallets. Please try again.');
    } finally {
      setIsLoadingWallets(false);
    }
  };

  //   Handle wallet dropdown toggle
  const toggleWalletDropdown = () => {
    setIsWalletDropdownVisible(!isWalletDropdownVisible);
  };

  //   Handle wallet selection
  const selectWallet = (wallet: WalletItem) => {
    setSelectedWallet(wallet);
    setIsWalletDropdownVisible(false);
  };

  //   Handle pull to refresh for wallet data
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        silentRefreshWallets(),
        new Promise((resolve) => setTimeout(resolve, 1000)), // Minimum 1 second for UX
      ]);
    } catch (error) {
      console.error(' Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [silentRefreshWallets]);

  //   Handle back navigation
  const handleBackPress = () => {
    navigation.goBack();
  };

  //   Handle message sending logic with real API integration
  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const messageText = inputText.trim();
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };

      //   Update messages state with new user message
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText('');

      try {
        //   Get authentication token and use selected wallet
        const authToken = await getAuthToken();

        console.log(' Auth token:', authToken ? 'Token found' : 'No token');
        console.log(' Selected wallet:', selectedWallet);

        if (!authToken) {
          //   For testing purposes, create a mock token or skip auth
          console.log(' No auth token found, using demo mode');

          //   Create a simple demo response instead of API call
          const demoResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Demo mode: I understand your question about spending habits. Please log in for personalized financial analysis.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
          };

          setMessages((prevMessages) => [...prevMessages, demoResponse]);
          return;
        }

        if (!selectedWallet) {
          //   Handle case where user has no wallet selected
          console.log(' No wallet selected');

          const noWalletResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: 'Please select a wallet first to start using the AI assistant.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
          };

          setMessages((prevMessages) => [...prevMessages, noWalletResponse]);
          return;
        }

        //   Send message to AI backend
        setIsAiTyping(true); // Show AI typing indicator

        const response = await VoiceApiService.sendMessageToAI(
          messageText,
          selectedMode,
          selectedWallet._id, // Use selected wallet ID
          authToken
        );

        //   Create AI response message
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.aiResponse.text,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        };

        //   Add AI response to messages
        setIsAiTyping(false); // Hide AI typing indicator
        setMessages((prevMessages) => [...prevMessages, aiResponse]);

        //   Trigger wallet refresh after AI response (might have created transaction)
        setTimeout(() => {
          silentRefreshWallets();
        }, 2000); // Refresh after 2 seconds
      } catch (error) {
        console.error('  Failed to send message:', error);

        //   Hide AI typing indicator on error
        setIsAiTyping(false);

        //   Add error message to chat
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error. Please try again.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        };

        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  //   Handle voice input button press to show recording modal
  const handleVoiceInput = () => {
    setIsVoiceModalVisible(true);
  };

  //   Handle voice recording completion and transcription
  const handleVoiceTranscriptionComplete = async (transcription: string, audioUri: string) => {
    try {
      setIsProcessingVoice(true);
      setIsVoiceModalVisible(false);

      //   Get authentication credentials and use selected wallet
      const authToken = await getAuthToken();

      if (!authToken || !selectedWallet) {
        Alert.alert('Error', 'Authentication required or no wallet selected');
        return;
      }

      //   Process complete voice message workflow
      const result = await VoiceApiService.processVoiceMessage(
        audioUri,
        selectedMode,
        selectedWallet._id, // Use selected wallet ID
        authToken
      );

      //   Add user's transcribed message to chat
      const userMessage: Message = {
        id: Date.now().toString(),
        text: result.transcription,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);

      //   Show AI typing indicator for voice response
      setIsAiTyping(true);

      //   Add AI response to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.aiResponse.aiResponse.text,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };

      //   Hide AI typing indicator and show response
      setIsAiTyping(false);
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

      //   Trigger wallet refresh after voice AI response (might have created transaction)
      setTimeout(() => {
        silentRefreshWallets();
      }, 2000); // Refresh after 2 seconds
    } catch (error) {
      console.error('  Voice processing failed:', error);
      setIsAiTyping(false); // Hide AI typing indicator on error
      Alert.alert('Error', 'Failed to process voice message. Please try again.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  //   Handle voice recording cancellation
  const handleVoiceCancel = () => {
    setIsVoiceModalVisible(false);
  };

  //   Handle dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  //   Handle dropdown option selection
  const selectDropdownOption = (option: 'ask' | 'input') => {
    setSelectedMode(option);
    setIsDropdownVisible(false);
  };

  // Handle get user profile
  const fetchUserProfile = async () => {
    const access_token = await SecureStore.getItemAsync('access_token');
    try {
      const response = await fetch('https://ssa-server-omega.vercel.app/api/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  //   Render individual message component
  const renderMessage = (message: Message) => {
    if (message.isUser) {
      //   Render user message (right-aligned, blue background)
      return (
        <View key={message.id} style={{ alignItems: 'flex-end', marginBottom: 16 }}>
          <View style={{ maxWidth: '80%' }}>
            <View
              style={{
                backgroundColor: '#3b667c',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  lineHeight: 20,
                }}>
                {message.text}
              </Text>
            </View>
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 12,
                marginTop: 4,
                textAlign: 'right',
              }}>
              {message.timestamp}
            </Text>
          </View>
        </View>
      );
    } else {
      //   Render assistant message (left-aligned, white background with avatar)
      return (
        <View key={message.id} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          {/*   Assistant avatar */}
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: '#3b667c',
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }}>
            <Bot size={16} color="#FFFFFF" />
          </View>

          {/*   Message content */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}>
              <Text
                style={{
                  color: '#1F2937',
                  fontSize: 14,
                  lineHeight: 20,
                }}>
                {message.text}
              </Text>
            </View>
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 12,
                marginTop: 4,
              }}>
              {message.timestamp}
            </Text>
          </View>
        </View>
      );
    }
  };

  //   Render AI typing indicator
  const renderAiTypingIndicator = () => {
    if (!isAiTyping) return null;

    return (
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        {/*   Assistant avatar */}
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor: '#3b667c',
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}>
          <Bot size={16} color="#FFFFFF" />
        </View>

        {/*   Typing indicator content */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
            <Text
              style={{
                color: '#6B7280',
                fontSize: 14,
                fontStyle: 'italic',
              }}>
              AI is thinking
            </Text>
            {/*   Animated dots */}
            <View style={{ flexDirection: 'row', gap: 2 }}>
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: '#6B7280',
                  borderRadius: 2,
                  opacity: 0.4,
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: '#6B7280',
                  borderRadius: 2,
                  opacity: 0.6,
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: '#6B7280',
                  borderRadius: 2,
                  opacity: 0.8,
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
      loadUserWallets(); // Auto-refresh wallet data saat screen focus
      return () => {
        console.log('Chat focus effect cleanup');
      };
    }, [])
  );

  if (userProfile.status === 'free') {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            width: 300,
          }}>
          This is feature is unlocked once you are a premium user
        </Text>

        <View
          style={{
            paddingTop: 16,
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#3b667c', // Slate-600
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: 'center',
              height: 48,
            }}
            onPress={() => navigation.navigate('Profile')}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '500',
              }}>
              Go premium
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
        {/*   Set status bar style */}
        <StatusBar barStyle="light-content" backgroundColor="#3b667c" />

        {/*   Custom header component */}
        <View
          style={{
            backgroundColor: '#3b667c',
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          {/*   Back button */}
          <TouchableOpacity onPress={handleBackPress} style={{ padding: 4 }} activeOpacity={0.7}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/*   Assistant avatar in header */}
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Bot size={20} color="#FFFFFF" />
          </View>

          {/*   Header title and subtitle */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '600',
              }}>
              Smart Spend Assistant
            </Text>
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 14,
              }}>
              AI Financial Advisor
            </Text>
          </View>

          {/*   Wallet selector dropdown */}
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 8,
                minWidth: 120,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 12,
                flexDirection: 'row',
                gap: 8,
              }}
              onPress={toggleWalletDropdown}
              activeOpacity={0.8}
              disabled={isLoadingWallets}>
              <Wallet size={16} color="#FFFFFF" />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                  numberOfLines={1}>
                  {isLoadingWallets
                    ? 'Loading...'
                    : selectedWallet
                      ? selectedWallet.name
                      : 'No Wallet'}
                </Text>
                {selectedWallet && (
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: 10,
                      textAlign: 'center',
                    }}
                    numberOfLines={1}>
                    Rp {selectedWallet.balance.toLocaleString('id-ID')}
                    {walletUpdateIndicator && ' '}
                  </Text>
                )}
              </View>
              <ChevronDown
                size={14}
                color="#FFFFFF"
                style={{
                  transform: [{ rotate: isWalletDropdownVisible ? '180deg' : '0deg' }],
                }}
              />
            </TouchableOpacity>

            {/*   Wallet dropdown options */}
            {isWalletDropdownVisible && (
              <View
                style={{
                  position: 'absolute',
                  top: 45,
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  minWidth: 200,
                  maxHeight: 200,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: '#3b667c',
                  zIndex: 1000,
                }}>
                <ScrollView style={{ maxHeight: 180 }}>
                  {userWallets.length > 0 ? (
                    userWallets.map((wallet, index) => (
                      <TouchableOpacity
                        key={wallet._id}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          borderBottomWidth: index < userWallets.length - 1 ? 1 : 0,
                          borderBottomColor: '#E5E7EB',
                          backgroundColor:
                            selectedWallet?._id === wallet._id ? '#F0F9FF' : 'transparent',
                        }}
                        onPress={() => selectWallet(wallet)}
                        activeOpacity={0.7}>
                        <Text
                          style={{
                            color: selectedWallet?._id === wallet._id ? '#3b667c' : '#1F2937',
                            fontSize: 14,
                            fontWeight: selectedWallet?._id === wallet._id ? '600' : '400',
                          }}
                          numberOfLines={1}>
                          {wallet.name}
                        </Text>
                        <Text
                          style={{
                            color: '#6B7280',
                            fontSize: 12,
                            marginTop: 2,
                          }}>
                          Rp {wallet.balance.toLocaleString('id-ID')} • {wallet.type}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={{ padding: 12 }}>
                      <Text
                        style={{
                          color: '#6B7280',
                          fontSize: 14,
                          textAlign: 'center',
                        }}>
                        No wallets found
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/*   Chat messages container */}
        <ScrollView
          ref={scrollViewRef}
          style={{
            flex: 1,
            backgroundColor: '#F9FAFB',
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#3b667c']}
              tintColor="#3b667c"
              title="Updating wallet data..."
              titleColor="#6B7280"
            />
          }>
          {/*   Render all messages */}
          {messages.map(renderMessage)}
          {/*   Render AI typing indicator */}
          {renderAiTypingIndicator()}
        </ScrollView>

        {/*   Input area container */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
            }}>
            {/*   Mode selector dropdown */}
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#3b667c',
                  borderRadius: 8,
                  minWidth: 70,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  flexDirection: 'row',
                  gap: 4,
                }}
                onPress={toggleDropdown}
                activeOpacity={0.8}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '500',
                    textTransform: 'lowercase',
                  }}>
                  {selectedMode}
                </Text>
                <ChevronDown
                  size={16}
                  color="#FFFFFF"
                  style={{
                    transform: [{ rotate: isDropdownVisible ? '180deg' : '0deg' }],
                  }}
                />
              </TouchableOpacity>

              {/*   Dropdown options */}
              {isDropdownVisible && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 45,
                    left: 0,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    minWidth: 70,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                    borderWidth: 1,
                    borderColor: '#3b667c',
                    zIndex: 1000,
                  }}>
                  {dropdownOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderBottomWidth: option.value === 'ask' ? 1 : 0,
                        borderBottomColor: '#E5E7EB',
                      }}
                      onPress={() => selectDropdownOption(option.value as 'ask' | 'input')}
                      activeOpacity={0.7}>
                      <Text
                        style={{
                          color: selectedMode === option.value ? '#3b667c' : '#1F2937',
                          fontSize: 14,
                          fontWeight: selectedMode === option.value ? '600' : '400',
                          textTransform: 'lowercase',
                        }}>
                        {option.label.toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/*   Input field container */}
            <View style={{ flex: 1, position: 'relative' }}>
              <TextInput
                style={{
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: '#3b667c',
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingRight: 48,
                  paddingVertical: 12,
                  fontSize: 14,
                  height: 48,
                }}
                placeholder="Ask me about your finances..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleSendMessage}
              />

              {/*   Voice input button with processing state */}
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: [{ translateY: -16 }],
                  width: 32,
                  height: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: isProcessingVoice ? 0.5 : 1,
                }}
                onPress={handleVoiceInput}
                activeOpacity={0.7}
                disabled={isProcessingVoice}>
                <Mic size={16} color={isProcessingVoice ? '#6B7280' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            {/*   Send button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#3b667c',
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={handleSendMessage}
              activeOpacity={0.8}>
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/*   Dropdown overlay to close dropdown when tapping outside */}
        {isDropdownVisible && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              zIndex: 999,
            }}
            onPress={() => setIsDropdownVisible(false)}
            activeOpacity={1}
          />
        )}

        {/*   Wallet dropdown overlay to close dropdown when tapping outside */}
        {isWalletDropdownVisible && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              zIndex: 999,
            }}
            onPress={() => setIsWalletDropdownVisible(false)}
            activeOpacity={1}
          />
        )}

        {/*   Voice recording modal component */}
        <VoiceRecorderModal
          isVisible={isVoiceModalVisible}
          currentMode={selectedMode}
          onTranscriptionComplete={handleVoiceTranscriptionComplete}
          onCancel={handleVoiceCancel}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
