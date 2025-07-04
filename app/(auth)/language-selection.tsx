import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '@/context/I18nContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function LanguageSelection() {
  const { changeLanguage, getSupportedLanguages } = useI18n();

  const selectLanguage = async (language: string) => {
    await changeLanguage(language);
    router.replace('/(auth)/login');
  };

  const supportedLanguages = getSupportedLanguages();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#A855F7', '#3B82F6']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/39325347-c946-48c0-951e-f341796fdfd4_removalai_preview.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>اختر اللغة / Choose Language</Text>
            <Text style={styles.subtitle}>
              اجتماعاتك ومناسباتك في مكان واحد
            </Text>
            <Text style={styles.subtitle}>
              Your events and occasions in one place
            </Text>
            <Text style={styles.subtitle}>
              Vos événements et occasions en un seul endroit
            </Text>
            <Text style={styles.subtitle}>
              Ваши события и мероприятия в одном месте
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {supportedLanguages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={styles.languageButton}
                onPress={() => selectLanguage(language.code)}
              >
                <Text style={styles.languageEmoji}>{language.flag}</Text>
                <Text style={styles.languageText}>{language.nativeName}</Text>
                <Text style={styles.languageSubtext}>{language.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 280,
    height: 180,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Cairo-Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 6,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  languageEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 18,
    fontFamily: 'Cairo-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  languageSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});