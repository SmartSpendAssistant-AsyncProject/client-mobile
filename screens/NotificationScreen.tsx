import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import * as Notifications from 'expo-notifications';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Tagihan Bulanan',
      description: 'Jangan lupa bayar tagihan listrik bulan ini.',
      date: '2025-07-25',
    },
    {
      id: '2',
      title: 'Pembayaran Berhasil',
      description: 'Pembayaran kartu kredit berhasil dikonfirmasi.',
      date: '2025-07-24',
    },
    {
      id: '3',
      title: 'Angsuran Jatuh Tempo',
      description: 'Angsuran mobil akan jatuh tempo besok.',
      date: '2025-07-23',
    },
  ]);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notifikasi</Text>
      {notifications.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate('NotificationDetail', {
              id: item.id,
              title: item.title,
              description: item.description,
            })
          }>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3b667c',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b667c',
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
  cardDate: {
    fontSize: 12,
    marginTop: 4,
    color: '#999',
  },
});
