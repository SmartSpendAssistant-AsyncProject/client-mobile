import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { RootStackNavigationProp } from '../types/navigation';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

interface NotificationItem {
  _id: string;
  user_id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const BASE_URL = 'https://ssa-server-omega.vercel.app';

export default function NotificationScreen() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const isFocused = useIsFocused();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const access_token = await SecureStore.getItemAsync('access_token');
      if (!access_token) {
        Alert.alert('Error', 'No authentication token found');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Failed to fetch notifications:', response.status);
        Alert.alert('Error', 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchNotifications();
    }
  }, [isFocused]);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // Refresh notifications when a new one is received
      fetchNotifications();
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notifikasi</Text>
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
        </View>
      ) : (
        notifications.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() =>
              navigation.navigate('NotificationDetail', {
                id: item._id,
                title: item.title,
                description: item.description,
                date: item.createdAt,
                isRead: item.isRead,
              })
            }>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3b667c',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadCard: {
    borderLeftColor: '#3b667c',
    backgroundColor: '#f8f9fa',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b667c',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b667c',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
    lineHeight: 20,
  },
  cardDate: {
    fontSize: 12,
    marginTop: 8,
    color: '#999',
  },
});
