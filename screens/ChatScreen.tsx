import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { ArrowLeft, Send, Mic, ChevronDown, Bot } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';

// Algorithm: Define message interface for type safety
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

// Algorithm: Define dropdown option type
interface DropdownOption {
  value: string;
  label: string;
}

export default function ChatScreen() {
  // Algorithm: Navigation hook for screen transitions
  const navigation = useNavigation<RootStackNavigationProp>();

  // Algorithm: State management for chat functionality
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Smart Spend Assistant. How can I help you manage your finances today?",
      isUser: false,
      timestamp: '10:00',
    },
    {
      id: '2',
      text: 'Hi! Can you help me analyze my spending this month?',
      isUser: true,
      timestamp: '10:01',
    },
    {
      id: '3',
      text: "Of course! Based on your recent transactions, I can see you've spent Rp. 4.100.000 this month. Your biggest expense category is Entertainment (Rp. 1.500.000). Would you like me to suggest ways to optimize your spending?",
      isUser: false,
      timestamp: '10:01',
    },
  ]);

  // Algorithm: Input state management
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<'ask' | 'input'>('ask');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Algorithm: Dropdown options configuration
  const dropdownOptions: DropdownOption[] = [
    { value: 'ask', label: 'Ask' },
    { value: 'input', label: 'Input' },
  ];

  // Algorithm: Handle back navigation
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Algorithm: Handle message sending logic
  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };

      // Algorithm: Update messages state with new user message
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText('');

      // Algorithm: Simulate AI response (in real app, this would be API call)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I understand your question. Let me analyze your financial data and provide you with personalized recommendations.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      }, 1000);
    }
  };

  // Algorithm: Handle voice input (placeholder for future implementation)
  const handleVoiceInput = () => {
    // TODO: Implement voice recognition functionality
    console.log('Voice input pressed');
  };

  // Algorithm: Handle dropdown toggle
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  // Algorithm: Handle dropdown option selection
  const selectDropdownOption = (option: 'ask' | 'input') => {
    setSelectedMode(option);
    setIsDropdownVisible(false);
  };

  // Algorithm: Render individual message component
  const renderMessage = (message: Message) => {
    if (message.isUser) {
      // Algorithm: Render user message (right-aligned, blue background)
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
      // Algorithm: Render assistant message (left-aligned, white background with avatar)
      return (
        <View key={message.id} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          {/* Algorithm: Assistant avatar */}
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

          {/* Algorithm: Message content */}
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Algorithm: Set status bar style */}
      <StatusBar barStyle="light-content" backgroundColor="#3b667c" />

      {/* Algorithm: Custom header component */}
      <View
        style={{
          backgroundColor: '#3b667c',
          paddingHorizontal: 16,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        {/* Algorithm: Back button */}
        <TouchableOpacity onPress={handleBackPress} style={{ padding: 4 }} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Algorithm: Assistant avatar in header */}
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

        {/* Algorithm: Header title and subtitle */}
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
      </View>

      {/* Algorithm: Chat messages container */}
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: '#F9FAFB',
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Algorithm: Render all messages */}
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Algorithm: Input area container */}
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
          {/* Algorithm: Mode selector dropdown */}
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

            {/* Algorithm: Dropdown options */}
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

          {/* Algorithm: Input field container */}
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

            {/* Algorithm: Voice input button */}
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
              }}
              onPress={handleVoiceInput}
              activeOpacity={0.7}>
              <Mic size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Algorithm: Send button */}
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

      {/* Algorithm: Dropdown overlay to close dropdown when tapping outside */}
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
    </SafeAreaView>
  );
}
