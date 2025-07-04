import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { useChat, Chat } from '@/context/ChatContext';
import { router } from 'expo-router';
import { Search, MessageCircle, Trash2, ArrowLeft, Plus } from 'lucide-react-native';

export default function ChatListScreen() {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const { chats, deleteChat, getSchoolById } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat => {
    const school = getSchoolById(chat.schoolId);
    if (!school) return false;
    
    const schoolName = locale === 'ar' ? school.nameAr : school.name;
    return schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.lastMessage?.content.includes(searchQuery);
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleDeleteChat = (chatId: string) => {
    Alert.alert(
      'حذف المحادثة',
      'هل أنت متأكد من رغبتك في حذف هذه المحادثة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChat(chatId);
            } catch (error) {
              Alert.alert('خطأ', 'فشل في حذف المحادثة');
            }
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'الآن' : `${diffInMinutes} د`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} س`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? 'أمس' : `${diffInDays} أيام`;
    }
  };

  const renderChatItem = (chat: Chat) => {
    const school = getSchoolById(chat.schoolId);
    if (!school) return null;

    const schoolName = locale === 'ar' ? school.nameAr : school.name;
    const lastMessageTime = chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : '';

    return (
      <TouchableOpacity
        key={chat.id}
        style={[styles.chatItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
        onPress={() => router.push(`/chat/${chat.id}`)}
      >
        <Image source={{ uri: school.image }} style={styles.schoolAvatar} />
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.schoolName, { color: theme.colors.text }]} numberOfLines={1}>{schoolName}</Text>
            <View style={styles.chatMeta}>
              {lastMessageTime && (
                <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>{lastMessageTime}</Text>
              )}
              {chat.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.lastMessageContainer}>
            <Text style={[
              styles.lastMessage,
              { color: theme.colors.textSecondary },
              chat.unreadCount > 0 && [styles.lastMessageUnread, { color: theme.colors.text }]
            ]} numberOfLines={2}>
              {chat.lastMessage?.content || 'لا توجد رسائل بعد'}
            </Text>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteChat(chat.id)}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
    },
    newChatButton: {
      padding: 8,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.text,
    },
    chatList: {
      flexGrow: 1,
    },
    chatItem: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    schoolAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 16,
      backgroundColor: theme.colors.border,
    },
    chatContent: {
      flex: 1,
    },
    chatHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    schoolName: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      flex: 1,
    },
    chatMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timeText: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
    },
    unreadBadge: {
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    unreadBadgeText: {
      fontSize: 12,
      fontFamily: 'Cairo-Bold',
      color: 'white',
    },
    lastMessageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    lastMessage: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      flex: 1,
      lineHeight: 20,
    },
    lastMessageUnread: {
      fontFamily: 'Cairo-SemiBold',
    },
    deleteButton: {
      padding: 8,
      marginLeft: 8,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    startChatButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    startChatButtonText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: 'white',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>المحادثات</Text>
          
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => router.push('/(tabs)/schools')}
          >
            <Plus size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث في المحادثات..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
      </View>

      {/* Chat List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chatList}>
        {filteredChats.length > 0 ? (
          filteredChats.map(renderChatItem)
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color={theme.colors.border} />
            <Text style={styles.emptyStateTitle}>لا توجد محادثات</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? 'لم يتم العثور على محادثات تطابق البحث'
                : 'ابدأ محادثة جديدة مع إحدى المدارس'
              }
            </Text>
            <TouchableOpacity
              style={styles.startChatButton}
              onPress={() => router.push('/(tabs)/schools')}
            >
              <Text style={styles.startChatButtonText}>تصفح المدارس</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}