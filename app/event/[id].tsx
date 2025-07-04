import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { useEvents } from '@/context/EventContext';
import { ArrowLeft, Calendar, MapPin, Users, Share as ShareIcon, Heart, Bookmark, Clock, Star, Ticket } from 'lucide-react-native';
import * as Linking from 'expo-linking';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale, t } = useI18n();
  const { theme } = useTheme();
  const { getEventById } = useEvents();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const event = getEventById(id);

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>الفعالية غير موجودة</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const title = locale === 'ar' ? event.titleAr : event.title;
  const description = locale === 'ar' ? event.descriptionAr : event.description;
  const location = locale === 'ar' ? event.locationAr : event.location;
  const organizer = locale === 'ar' ? event.organizerAr : event.organizer;

  const handleShare = async () => {
    try {
      const shareContent = {
        title: title,
        message: `${title}\n\n${description}\n\nتاريخ: ${new Date(event.date).toLocaleDateString('ar-LY')}\nالموقع: ${location}`,
        url: `https://mi3ad.app/event/${event.id}`,
      };

      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: shareContent.title,
            text: shareContent.message,
            url: shareContent.url,
          });
        } else {
          await navigator.clipboard.writeText(`${shareContent.message}\n${shareContent.url}`);
          Alert.alert('تم النسخ!', 'تم نسخ تفاصيل الفعالية إلى الحافظة');
        }
      } else {
        await Share.share({
          title: shareContent.title,
          message: Platform.OS === 'ios' ? shareContent.message : `${shareContent.message}\n${shareContent.url}`,
          url: Platform.OS === 'ios' ? shareContent.url : undefined,
        });
      }
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  const handleAddToCalendar = () => {
    const eventDate = new Date(event.date);
    const startDate = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    
    Linking.openURL(calendarUrl);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    imageContainer: {
      position: 'relative',
      height: 300,
    },
    eventImage: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.border,
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtons: {
      position: 'absolute',
      top: 50,
      right: 20,
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: 20,
    },
    eventHeader: {
      marginBottom: 20,
    },
    eventTitle: {
      fontSize: 28,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 12,
      lineHeight: 36,
    },
    eventOrganizer: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    ratingText: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: '#F59E0B',
    },
    reviewsText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
    },
    eventDescription: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: 24,
    },
    quickInfo: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    quickInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    quickInfoText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.text,
      flex: 1,
    },
    priceSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    priceTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    priceValue: {
      fontSize: 32,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    priceNote: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
    },
    bottomContainer: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      flexDirection: 'row',
      gap: 12,
    },
    bookButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    bookButtonText: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: 'white',
    },
    calendarButton: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    errorText: {
      fontSize: 18,
      fontFamily: 'Cairo-Regular',
      marginBottom: 24,
    },
    backButtonText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: 'white',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsLiked(!isLiked)}
            >
              <Heart 
                size={20} 
                color={isLiked ? '#FF3040' : 'white'}
                fill={isLiked ? '#FF3040' : 'transparent'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark 
                size={20} 
                color={isBookmarked ? 'white' : 'white'}
                fill={isBookmarked ? 'white' : 'transparent'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
            >
              <ShareIcon size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.content}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{title}</Text>
            <Text style={styles.eventOrganizer}>{organizer}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.reviewsText}>(124 تقييم)</Text>
            </View>
          </View>

          <Text style={styles.eventDescription}>{description}</Text>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Calendar size={20} color={theme.colors.primary} />
              <Text style={styles.quickInfoText}>
                {new Date(event.date).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-US')} - {event.time}
              </Text>
            </View>
            
            <View style={styles.quickInfoItem}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text style={styles.quickInfoText}>{location}</Text>
            </View>
            
            <View style={styles.quickInfoItem}>
              <Users size={20} color={theme.colors.primary} />
              <Text style={styles.quickInfoText}>
                {event.currentAttendees}/{event.maxAttendees} مشارك
              </Text>
            </View>
            
            <View style={styles.quickInfoItem}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.quickInfoText}>مدة الفعالية: ساعتان</Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.priceTitle}>سعر التذكرة</Text>
            <Text style={styles.priceValue}>
              {event.price === 0 ? 'مجاني' : `${event.price} د.ل`}
            </Text>
            <Text style={styles.priceNote}>
              {event.price === 0 ? 'دخول مجاني للجميع' : 'شامل جميع الخدمات'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={handleAddToCalendar}
        >
          <Calendar size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push(`/booking/${event.id}`)}
        >
          <Ticket size={24} color="white" />
          <Text style={styles.bookButtonText}>{t('bookNow')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}