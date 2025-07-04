import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { useEvents } from '@/context/EventContext';
import { CameraView, Camera, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react-native';

export default function ScannerScreen() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { getBookingById, markTicketAsUsed } = useEvents();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      // Find booking by QR code
      const booking = Object.values(useEvents().bookings).find(b => b.qrCode === data);
      
      if (!booking) {
        Alert.alert(
          'تذكرة غير صالحة ❌',
          'رمز QR غير صحيح أو التذكرة غير موجودة',
          [{ text: 'موافق', onPress: () => setScanned(false) }]
        );
        return;
      }
      
      if (booking.status === 'used') {
        Alert.alert(
          'تذكرة مستخدمة ⚠️',
          'تم استخدام هذه التذكرة مسبقاً',
          [{ text: 'موافق', onPress: () => setScanned(false) }]
        );
        return;
      }
      
      if (booking.status === 'cancelled') {
        Alert.alert(
          'تذكرة ملغاة ❌',
          'هذه التذكرة تم إلغاؤها',
          [{ text: 'موافق', onPress: () => setScanned(false) }]
        );
        return;
      }
      
      // Valid ticket
      Alert.alert(
        'تذكرة صالحة ✅',
        `تذكرة صحيحة!\nعدد التذاكر: ${booking.ticketCount}\nالسعر: ${booking.totalPrice === 0 ? 'مجاني' : `${booking.totalPrice} د.ل`}`,
        [
          { text: 'إلغاء', style: 'cancel', onPress: () => setScanned(false) },
          {
            text: 'تأكيد الدخول',
            onPress: async () => {
              try {
                await markTicketAsUsed(booking.id);
                Alert.alert(
                  'تم تأكيد الدخول! 🎉',
                  'تم تسجيل دخول الضيف بنجاح',
                  [{ text: 'موافق', onPress: () => setScanned(false) }]
                );
              } catch (error) {
                Alert.alert('خطأ', 'فشل في تسجيل الدخول');
                setScanned(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'خطأ في المسح',
        'حدث خطأ أثناء معالجة التذكرة',
        [{ text: 'موافق', onPress: () => setScanned(false) }]
      );
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Cairo-Bold',
      color: 'white',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 20,
    },
    flashButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    camera: {
      flex: 1,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanArea: {
      width: 250,
      height: 250,
      borderWidth: 2,
      borderColor: 'white',
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    scanAreaCorner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: theme.colors.primary,
      borderWidth: 4,
    },
    topLeft: {
      top: -2,
      left: -2,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: 20,
    },
    topRight: {
      top: -2,
      right: -2,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: 20,
    },
    bottomLeft: {
      bottom: -2,
      left: -2,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: 20,
    },
    bottomRight: {
      bottom: -2,
      right: -2,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: 20,
    },
    instructions: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: 16,
      padding: 20,
    },
    instructionsTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: 'white',
      textAlign: 'center',
      marginBottom: 12,
    },
    instructionsText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      lineHeight: 20,
    },
    resetButton: {
      position: 'absolute',
      bottom: 30,
      alignSelf: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    resetButtonText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: 'white',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      fontFamily: 'Cairo-Regular',
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    permissionTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      textAlign: 'center',
      marginBottom: 16,
    },
    permissionText: {
      fontSize: 16,
      fontFamily: 'Cairo-Regular',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    permissionButton: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
    },
    permissionButtonText: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: 'white',
    },
  }), [theme]);

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>جاري تحميل الكاميرا...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>إذن الكاميرا مطلوب</Text>
          <Text style={[styles.permissionText, { color: theme.colors.textSecondary }]}>
            نحتاج إلى إذن الكاميرا لمسح رموز QR الخاصة بالتذاكر
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>منح الإذن</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>مسح التذاكر</Text>
          
          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            {flashOn ? (
              <FlashlightOff size={24} color="white" />
            ) : (
              <Flashlight size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera */}
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        flash={flashOn ? 'on' : 'off'}
      >
        {/* Scan Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.scanAreaCorner, styles.topLeft]} />
            <View style={[styles.scanAreaCorner, styles.topRight]} />
            <View style={[styles.scanAreaCorner, styles.bottomLeft]} />
            <View style={[styles.scanAreaCorner, styles.bottomRight]} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>وجه الكاميرا نحو رمز QR</Text>
          <Text style={styles.instructionsText}>
            ضع رمز QR الخاص بالتذكرة داخل الإطار المربع لمسحه تلقائياً
          </Text>
        </View>

        {/* Reset Button */}
        {scanned && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setScanned(false)}
          >
            <RotateCcw size={20} color="white" />
            <Text style={styles.resetButtonText}>مسح مرة أخرى</Text>
          </TouchableOpacity>
        )}
      </CameraView>
    </SafeAreaView>
  );
}