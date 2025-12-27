import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useCustomAlert } from '../context/CustomAlertContext';
import StyledText from '../components/StyledText';
import { apiService } from '../services/ApiService';
import SettingHeader from '../components/SettingHeader';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'goal_reminder' | 'verse_of_day' | 'achievement' | 'general';
  is_read: boolean;
  data?: any;
  created_at: string;
  read_at?: string;
}

export default function NotificationsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { showAlert } = useCustomAlert();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  /**
   * Load notifications from backend
   */
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showAlert('Error', 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull to refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showAlert('Success', 'All notifications marked as read', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showAlert('Error', 'Failed to mark all as read', 'error');
    }
  };

  /**
   * Delete notification
   */
  const handleDelete = async (notificationId: number) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      showAlert('Success', 'Notification deleted', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showAlert('Error', 'Failed to delete notification', 'error');
    }
  };

  /**
   * Handle notification press
   */
  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.type === 'goal_reminder') {
      // Navigate to goals screen or goal detail
      navigation.navigate('Home');
    } else if (notification.type === 'verse_of_day') {
      // Navigate to home or Quran reader
      navigation.navigate('Home');
    }
  };

  /**
   * Get icon for notification type
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'goal_reminder':
        return 'flag-outline';
      case 'verse_of_day':
        return 'book-outline';
      case 'achievement':
        return 'trophy-outline';
      default:
        return 'notifications-outline';
    }
  };

  /**
   * Get icon color for notification type
   */
  const getIconColor = (type: string) => {
    switch (type) {
      case 'goal_reminder':
        return '#f59e0b'; // amber
      case 'verse_of_day':
        return colors.primary;
      case 'achievement':
        return '#10b981'; // green
      default:
        return colors.textSecondary;
    }
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  /**
   * Render right swipe actions (delete)
   */
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    notificationId: number
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.swipeDeleteContainer,
          {
            transform: [{ translateX: trans }],
          },
        ]}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDelete(notificationId)}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <StyledText style={styles.deleteActionText}>Delete</StyledText>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /**
   * Render notification item
   */
  const renderNotification = ({ item }: { item: Notification }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}
      overshootRight={false}
      friction={2}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleNotificationPress(item)}>
        <View
          style={[
            styles.notificationCard,
            {
              backgroundColor: item.is_read ? colors.surface : colors.primary + '10',
              borderColor: item.is_read ? colors.border : colors.primary + '30',
            },
          ]}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: getIconColor(item.type) + '20',
              },
            ]}>
            <Ionicons name={getNotificationIcon(item.type) as any} size={24} color={getIconColor(item.type)} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <StyledText
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    fontWeight: item.is_read ? '500' : '700',
                  },
                ]}>
                {item.title}
              </StyledText>
              {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </View>

            <StyledText style={[styles.message, { color: colors.textSecondary }]}>
              {item.message}
            </StyledText>

            <StyledText style={[styles.time, { color: colors.textSecondary }]}>
              {formatTimeAgo(item.created_at)}
            </StyledText>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.border }]}>
        <Ionicons name="notifications-outline" size={48} color={colors.textSecondary} />
      </View>
      <StyledText style={[styles.emptyTitle, { color: colors.text }]}>
        No Notifications
      </StyledText>
      <StyledText style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        You're all caught up! Check back later for updates.
      </StyledText>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <SettingHeader
        title="Notifications"
        backgroundColor={colors.background}
        backIconColor={colors.text}
        titleColor={colors.text}
        onBackPress={() => navigation.goBack()}
      />

      {/* Header Actions */}
      {notifications.length > 0 && (
        <View style={[styles.headerActions, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <StyledText style={[styles.unreadText, { color: colors.textSecondary }]}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </StyledText>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <StyledText style={[styles.markAllButton, { color: colors.primary }]}>
                Mark all as read
              </StyledText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <StyledText style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading notifications...
          </StyledText>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  unreadText: {
    fontSize: 14,
    fontWeight: '500',
  },
  markAllButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 11,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  swipeDeleteContainer: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '100%',
    paddingHorizontal: 20,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
