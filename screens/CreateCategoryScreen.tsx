import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'https://ssa-server-omega.vercel.app';
const access_token =
  'eyJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI2ODg0ZjA0NGJlNWY2NGQwMDI0MzIyNjYifQ.z7DO3TL-SXjRw0nAw0lno6VR3Q04pcRaJJECHu0HcV0';

const TYPES = ['income', 'expense', 'debt', 'loan'];

export default function CreateCategoryScreen() {
  const [name, setName] = useState('');
  const [type, setType] = useState('debt');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Category name is required.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create category.');
      }

      Alert.alert('Success', `Category "${data.name}" created successfully!`);
      setName('');
      setType('debt');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 24 }}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
          Create New Category
        </Text>

        {/* Category Name Input */}
        <Text style={{ marginBottom: 4 }}>Category Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Hutang ke Amar"
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 20,
          }}
        />

        {/* Custom Dropdown */}
        <Text style={{ marginBottom: 4 }}>Category Type</Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 12,
            marginBottom: 24,
          }}>
          <Text>{type.toUpperCase()}</Text>
        </Pressable>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: '#00000099',
              justifyContent: 'center',
              padding: 24,
            }}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 16,
              }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
                Select Category Type
              </Text>
              <FlatList
                data={TYPES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setType(item);
                      setModalVisible(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderColor: '#eee',
                    }}>
                    <Text>{item.toUpperCase()}</Text>
                  </Pressable>
                )}
              />
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{
                  marginTop: 16,
                  backgroundColor: '#3b667c',
                  paddingVertical: 10,
                  borderRadius: 8,
                }}>
                <Text style={{ color: 'white', textAlign: 'center' }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#aaa' : '#3b667c',
            paddingVertical: 12,
            borderRadius: 8,
          }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            {loading ? 'Creating...' : 'Create Category'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
