import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface NotificationsContextType {
  expoPushToken: string | null;
  scheduleLocalNotification: (title: string, body: string, seconds?: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
  expoPushToken: null,
  scheduleLocalNotification: async () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef<string | null>(null);
  const notifListener    = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotifications();
    notifListener.current = Notifications.addNotificationReceivedListener(n => {
      console.log('Notification received:', n.request.identifier);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      if (data?.scanId) console.log('Navigate to scan:', data.scanId);
    });
    return () => {
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      tokenRef.current = token;
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('security-alerts', {
          name: 'Security Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0077cc',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
        await Notifications.setNotificationChannelAsync('scan-complete', {
          name: 'Scan Complete',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }
    } catch (e) {
      console.warn('Push notification setup error:', e);
    }
  };

  const scheduleLocalNotification = async (title: string, body: string, seconds = 1) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { seconds },
    });
  };

  return (
    <NotificationsContext.Provider value={{ expoPushToken: tokenRef.current, scheduleLocalNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
