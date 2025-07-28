import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

type NotificationDetailRouteProp = RouteProp<RootStackParamList, 'NotificationDetail'>;

export default function NotificationDetailScreen() {
  const route = useRoute<NotificationDetailRouteProp>();
  const { title, description } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b667c',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
  },
});
