import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { useEvents } from '@/context/EventContext';
import { ArrowLeft, Download, Share as ShareIcon, Calendar, MapPin, QrCode, Ticket } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

export default function TicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale, t } = useI18n();
  const { theme } = useTheme();
  const { getBookingById, getEventById } = useEvents();

  const booking = getBookingById(id);
  const event = booking ? getEventById(booking.eventId) : null;

  if (!booking || !event) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>التذكرة غير موجودة</Text>
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
  const location = locale === 'ar' ? event.locationAr : event.location;

  const handleShare = async () => {
    try {
      const shareContent = {
        title: 'تذكرة Mi3AD',
        message: `تذكرتي لفعالية: ${title}\nالتاريخ: ${new Date(event.date).toLocaleDateString('ar-LY')}\nرقم التذكرة: ${booking.qrCode}`,
      };

      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: shareContent.title,
            text: shareContent.message,
          });
        } else {
          await navigator.clipboard.writeText(shareContent.message);
          Alert.alert('تم النسخ!', 'تم نسخ تفاصيل التذكرة إلى الحافظة');
        }
      } else {
        await Share.share({
          title: shareContent.title,
          message: shareContent.message,
        });
      }
    } catch (error) {
      console.error('Error sharing ticket:', error);
    }
  };

  const handleDownload = () => {
    Alert.alert('تحميل التذكرة', 'سيتم تحميل التذكرة كملف PDF قريباً');
  };

  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      case 'used':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (booking.status) {
      case 'confirmed':
        return 'مؤكدة';
      case 'cancelled':
        return 'ملغاة';
      case 'used':
        return 'مستخدمة';
      default:
        return booking.status;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    ticketCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.isDark ? 0.4 : 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
    ticketHeader: {
      backgroundColor: theme.colors.primary,
      padding: 24,
      alignItems: 'center',
    },
    ticketIcon: {
      marginBottom: 12,
    },
    ticketTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: 'white',
      textAlign: 'center',
      marginBottom: 8,
    },
    ticketSubtitle: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
    },
    ticketBody: {
      padding: 24,
    },
    eventInfo: {
      marginBottom: 24,
    },
    eventTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    eventDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    eventDetailText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      flex: 1,
    },
    qrSection: {
      alignItems: 'center',
      marginBottom: 24,
      paddingVertical: 24,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    qrCode: {
      marginBottom: 16,
    },
    qrText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    ticketDetails: {
      gap: 16,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
    },
    detailValue: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: theme.colors.text,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-end',
    },
    statusText: {
      fontSize: 14,
      fontFamily: 'Cairo-Bold',
      color: 'white',
    },
    ticketFooter: {
      backgroundColor: theme.colors.background,
      padding: 20,
      alignItems: 'center',
    },
    ticketCode: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.primary,
      letterSpacing: 2,
    },
    instructions: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    instructionsTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 12,
    },
    instructionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    instructionNumber: {
      fontSize: 16,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.primary,
      marginRight: 8,
      minWidth: 20,
    },
    instructionText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 20,
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تذكرتي</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <ShareIcon size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Download size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Header */}
          <View style={styles.ticketHeader}>
            <Ticket size={48} color="white" style={styles.ticketIcon} />
            <Text style={styles.ticketTitle}>تذكرة دخول</Text>
            <Text style={styles.ticketSubtitle}>Mi3AD Event Ticket</Text>
          </View>

          {/* Ticket Body */}
          <View style={styles.ticketBody}>
            {/* Event Info */}
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{title}</Text>
              
              <View style={styles.eventDetail}>
                <Calendar size={20} color={theme.colors.primary} />
                <Text style={styles.eventDetailText}>
                  {new Date(event.date).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-US')} - {event.time}
                </Text>
              </View>
              
              <View style={styles.eventDetail}>
                <MapPin size={20} color={theme.colors.primary} />
                <Text style={styles.eventDetailText}>{location}</Text>
              </View>
            </View>

            {/* QR Code */}
            <View style={styles.qrSection}>
              <View style={styles.qrCode}>
                <QRCode
                  value={booking.qrCode}
                  size={150}
                  color={theme.colors.text}
                  backgroundColor={theme.colors.surface}
                />
              </View>
              <Text style={styles.qrText}>امسح هذا الرمز عند الدخول</Text>
            </View>

            {/* Ticket Details */}
            <View style={styles.ticketDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>عدد التذاكر</Text>
                <Text style={styles.detailValue}>{booking.ticketCount}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>السعر الإجمالي</Text>
                <Text style={styles.detailValue}>
                  {booking.totalPrice === 0 ? 'مجاني' : `${booking.totalPrice} د.ل`}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>تاريخ الحجز</Text>
                <Text style={styles.detailValue}>
                  {new Date(booking.bookingDate).toLocaleDateString('ar-LY')}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>حالة التذكرة</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                  <Text style={styles.statusText}>{getStatusLabel()}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ticket Footer */}
          <View style={styles.ticketFooter}>
            <Text style={styles.ticketCode}>{booking.qrCode}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>تعليمات مهمة</Text>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              احضر هذه التذكرة معك إلى الفعالية (رقمياً أو مطبوعة)
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              اعرض رمز QR للمسح عند نقطة الدخول
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              احضر هوية شخصية صالحة للتحقق من الهوية
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              الوصول قبل 30 دقيقة من بداية الفعالية مستحسن
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}