import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/language-selection');
      }
    }
  }, [user, isLoading]);

  return null;
}