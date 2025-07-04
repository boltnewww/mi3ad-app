import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions, RefreshControl, Share, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useI18n } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { ArrowLeft, MoveVertical as MoreVertical, Heart, Share as ShareIcon, MessageCircle, Bookmark, Calendar, Filter, ExternalLink, User } from 'lucide-react-native';

interface Post {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  uploadDate: string;
  views: number;
  likes: number;
  shares: number;
  status: 'published' | 'draft' | 'pending' | 'rejected';
  category: string;
  tags: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const { width } = Dimensions.get('window');

// Mock data for user posts
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'منظر طبيعي خلاب من الجبل الأخضر',
    description: 'صورة رائعة تم التقاطها أثناء رحلة إلى الجبل الأخضر في ليبيا',
    imageUrl: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
    uploadDate: '2024-01-15T10:30:00Z',
    views: 1250,
    likes: 89,
    shares: 12,
    status: 'published',
    category: 'طبيعة',
    tags: ['طبيعة', 'جبال', 'ليبيا'],
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    title: 'فعالية ثقافية في طرابلس',
    description: 'لحظات مميزة من الفعالية الثقافية التي أقيمت في العاصمة',
    imageUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    uploadDate: '2024-01-12T14:20:00Z',
    views: 890,
    likes: 67,
    shares: 8,
    status: 'published',
    category: 'فعاليات',
    tags: ['ثقافة', 'فعاليات', 'طرابلس'],
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: '3',
    title: 'غروب الشمس على البحر المتوسط',
    description: 'منظر ساحر لغروب الشمس من شواطئ ليبيا',
    imageUrl: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg',
    uploadDate: '2024-01-10T18:45:00Z',
    views: 2100,
    likes: 156,
    shares: 28,
    status: 'published',
    category: 'طبيعة',
    tags: ['غروب', 'بحر', 'شاطئ'],
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '4',
    title: 'معمار تقليدي ليبي',
    description: 'تفاصيل معمارية جميلة من المدينة القديمة',
    imageUrl: 'https://images.pexels.com/photos/1134166/pexels-photo-1134166.jpeg',
    uploadDate: '2024-01-08T09:15:00Z',
    views: 650,
    likes: 45,
    shares: 5,
    status: 'pending',
    category: 'معمار',
    tags: ['معمار', 'تراث', 'تاريخ'],
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '5',
    title: 'مشروع فني جديد',
    description: 'عمل فني معاصر يجمع بين التراث والحداثة',
    imageUrl: 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg',
    uploadDate: '2024-01-05T16:30:00Z',
    views: 320,
    likes: 28,
    shares: 3,
    status: 'draft',
    category: 'فن',
    tags: ['فن', 'إبداع', 'معاصر'],
    isLiked: true,
    isBookmarked: false,
  },
];

export default function MyPostsScreen() {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'pending'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs for each post
  const likeAnimations = useRef<{ [key: string]: Animated.Value }>({});
  const bookmarkAnimations = useRef<{ [key: string]: Animated.Value }>({});

  // Initialize animations for each post
  useEffect(() => {
    posts.forEach(post => {
      if (!likeAnimations.current[post.id]) {
        likeAnimations.current[post.id] = new Animated.Value(1);
      }
      if (!bookmarkAnimations.current[post.id]) {
        bookmarkAnimations.current[post.id] = new Animated.Value(1);
      }
    });
  }, [posts]);

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const animateButton = (animationRef: Animated.Value, callback?: () => void) => {
    Animated.sequence([
      Animated.timing(animationRef, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animationRef, {
        toValue: 1.2,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(animationRef, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleLikePost = (postId: string) => {
    const animationRef = likeAnimations.current[postId];
    if (!animationRef) return;

    animateButton(animationRef, () => {
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
              }
            : post
        )
      );
    });

    // Add haptic feedback for mobile
    if (Platform.OS !== 'web') {
      // Note: Haptics would be imported and used here in a real app
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleBookmarkPost = (postId: string) => {
    const animationRef = bookmarkAnimations.current[postId];
    if (!animationRef) return;

    animateButton(animationRef, () => {
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: !post.isBookmarked }
            : post
        )
      );
    });
  };

  const handleSharePost = async (post: Post) => {
    try {
      const shareContent = {
        title: post.title,
        message: `${post.title}\n\n${post.description || ''}\n\nشاهد هذا المنشور الرائع على تطبيق Mi3AD!`,
        url: `https://mi3ad.app/post/${post.id}`, // Mock URL
      };

      if (Platform.OS === 'web') {
        // Web sharing using Web Share API or fallback
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareContent.title,
              text: shareContent.message,
              url: shareContent.url,
            });
            
            // Update shares count on successful share
            setPosts(prev => 
              prev.map(p => 
                p.id === post.id 
                  ? { ...p, shares: p.shares + 1 }
                  : p
              )
            );
            
            Alert.alert('تم المشاركة!', 'تم مشاركة المنشور بنجاح');
          } catch (shareError: any) {
            // Handle Web Share API failures (permission denied, user cancellation, etc.)
            if (shareError.name === 'AbortError') {
              // User cancelled the share - don't show error
              return;
            }
            
            // Fallback to clipboard for other errors
            await navigator.clipboard.writeText(`${shareContent.message}\n${shareContent.url}`);
            Alert.alert('تم النسخ!', 'تم نسخ رابط المنشور إلى الحافظة');
          }
        } else {
          // Fallback for web browsers that don't support Web Share API
          await navigator.clipboard.writeText(`${shareContent.message}\n${shareContent.url}`);
          Alert.alert('تم النسخ!', 'تم نسخ رابط المنشور إلى الحافظة');
        }
      } else {
        // Mobile sharing
        const result = await Share.share({
          title: shareContent.title,
          message: Platform.OS === 'ios' ? shareContent.message : `${shareContent.message}\n${shareContent.url}`,
          url: Platform.OS === 'ios' ? shareContent.url : undefined,
        });

        if (result.action === Share.sharedAction) {
          // Update shares count
          setPosts(prev => 
            prev.map(p => 
              p.id === post.id 
                ? { ...p, shares: p.shares + 1 }
                : p
            )
          );
          
          // Show success message
          Alert.alert('تم المشاركة!', 'تم مشاركة المنشور بنجاح');
        }
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('خطأ في المشاركة', 'فشل في مشاركة المنشور. يرجى المحاولة مرة أخرى.');
    }
  };

  const handlePostAction = (postId: string, action: 'edit' | 'delete' | 'download') => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    switch (action) {
      case 'edit':
        Alert.alert('تعديل المنشور', `تعديل: ${post.title}`);
        break;
      case 'delete':
        Alert.alert(
          'حذف المنشور',
          'هل أنت متأكد من رغبتك في حذف هذا المنشور؟',
          [
            { text: 'إلغاء', style: 'cancel' },
            {
              text: 'حذف',
              style: 'destructive',
              onPress: () => {
                setPosts(prev => prev.filter(p => p.id !== postId));
                Alert.alert('تم الحذف', 'تم حذف المنشور بنجاح');
              }
            }
          ]
        );
        break;
      case 'download':
        Alert.alert('تحميل', 'سيتم تحميل الصورة قريباً');
        break;
    }
  };

  const getStatusColor = (status: Post['status']) => {
    switch (status) {
      case 'published':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'draft':
        return theme.colors.textSecondary;
      case 'rejected':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: Post['status']) => {
    switch (status) {
      case 'published':
        return 'منشور';
      case 'pending':
        return 'قيد المراجعة';
      case 'draft':
        return 'مسودة';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} س`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} د`;
    } else {
      return date.toLocaleDateString('ar-LY', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'م';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ك';
    }
    return num.toString();
  };

  const renderPost = (post: Post) => {
    const likeAnimation = likeAnimations.current[post.id] || new Animated.Value(1);
    const bookmarkAnimation = bookmarkAnimations.current[post.id] || new Animated.Value(1);

    return (
      <View key={post.id} style={[styles.postCard, { backgroundColor: theme.colors.surface }]}>
        {/* Post Header - Instagram Style */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.userAvatar, { backgroundColor: theme.colors.primary }]}>
              <User size={20} color="white" />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.username, { color: theme.colors.text }]}>أنت</Text>
              <Text style={[styles.postTime, { color: theme.colors.textSecondary }]}>
                {formatDate(post.uploadDate)}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(post.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(post.status) }]}>
                {getStatusLabel(post.status)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                Alert.alert(
                  'خيارات المنشور',
                  post.title,
                  [
                    { text: 'تعديل', onPress: () => handlePostAction(post.id, 'edit') },
                    { text: 'تحميل', onPress: () => handlePostAction(post.id, 'download') },
                    { text: 'حذف', style: 'destructive', onPress: () => handlePostAction(post.id, 'delete') },
                    { text: 'إلغاء', style: 'cancel' }
                  ]
                );
              }}
            >
              <MoreVertical size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Post Image */}
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

        {/* Action Buttons - Instagram Style */}
        <View style={styles.actionButtons}>
          <View style={styles.leftActions}>
            {/* Like Button */}
            <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLikePost(post.id)}
                activeOpacity={0.7}
              >
                <Heart 
                  size={24} 
                  color={post.isLiked ? '#FF3040' : theme.colors.text}
                  fill={post.isLiked ? '#FF3040' : 'transparent'}
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Comment Button */}
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={24} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleSharePost(post)}
            >
              <ShareIcon size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Bookmark Button */}
          <Animated.View style={{ transform: [{ scale: bookmarkAnimation }] }}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleBookmarkPost(post.id)}
              activeOpacity={0.7}
            >
              <Bookmark 
                size={24} 
                color={post.isBookmarked ? theme.colors.text : theme.colors.text}
                fill={post.isBookmarked ? theme.colors.text : 'transparent'}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Likes Count */}
        <View style={styles.likesSection}>
          <Text style={[styles.likesText, { color: theme.colors.text }]}>
            {formatNumber(post.likes)} إعجاب
          </Text>
        </View>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={[styles.postCaption, { color: theme.colors.text }]}>
            <Text style={styles.username}>أنت </Text>
            {post.description}
          </Text>
          
          {/* Tags */}
          {post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.slice(0, 3).map((tag, index) => (
                <Text key={index} style={[styles.hashtag, { color: theme.colors.primary }]}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* View Comments */}
        <TouchableOpacity style={styles.viewComments}>
          <Text style={[styles.viewCommentsText, { color: theme.colors.textSecondary }]}>
            عرض جميع التعليقات
          </Text>
        </TouchableOpacity>
      </View>
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
      alignItems: 'center',
      marginBottom: 16,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      flex: 1,
    },
    uploadButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    uploadButtonText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: 'white',
    },
    filterTabs: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 4,
    },
    filterTab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignItems: 'center',
    },
    filterTabActive: {
      backgroundColor: theme.colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    filterTabText: {
      fontSize: 14,
      fontFamily: 'Cairo-SemiBold',
      color: theme.colors.textSecondary,
    },
    filterTabTextActive: {
      color: theme.colors.text,
    },
    content: {
      paddingBottom: 88, // Add padding for tab bar
    },
    statsOverview: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    statsTitle: {
      fontSize: 18,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    overviewStat: {
      alignItems: 'center',
    },
    overviewStatNumber: {
      fontSize: 24,
      fontFamily: 'Cairo-Bold',
      marginBottom: 4,
    },
    overviewStatLabel: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
      color: theme.colors.textSecondary,
    },
    postsContainer: {
      gap: 0, // No gap between posts like Instagram
    },
    postCard: {
      marginBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 16,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    userDetails: {
      flex: 1,
    },
    username: {
      fontSize: 14,
      fontFamily: 'Cairo-Bold',
      color: theme.colors.text,
      marginBottom: 2,
    },
    postTime: {
      fontSize: 12,
      fontFamily: 'Cairo-Regular',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 10,
      fontFamily: 'Cairo-Bold',
      textTransform: 'uppercase',
    },
    moreButton: {
      padding: 4,
    },
    postImage: {
      width: '100%',
      height: width, // Square aspect ratio like Instagram
      backgroundColor: theme.colors.border,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    leftActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      paddingRight: 16,
      paddingVertical: 8,
    },
    likesSection: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    likesText: {
      fontSize: 14,
      fontFamily: 'Cairo-Bold',
    },
    postContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    postCaption: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
      lineHeight: 20,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 8,
    },
    hashtag: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
    },
    viewComments: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    viewCommentsText: {
      fontSize: 14,
      fontFamily: 'Cairo-Regular',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 64,
      paddingHorizontal: 32,
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
    createPostButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    createPostButtonText: {
      fontSize: 16,
      fontFamily: 'Cairo-SemiBold',
      color: 'white',
    },
  });

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const publishedCount = posts.filter(post => post.status === 'published').length;

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
          
          <Text style={styles.headerTitle}>منشوراتي</Text>
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => router.push('/(tabs)/upload')}
          >
            <Text style={styles.uploadButtonText}>رفع جديد</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {[
            { key: 'all', label: 'الكل' },
            { key: 'published', label: 'منشور' },
            { key: 'pending', label: 'قيد المراجعة' },
            { key: 'draft', label: 'مسودة' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                filter === tab.key && styles.filterTabActive
              ]}
              onPress={() => setFilter(tab.key as any)}
            >
              <Text style={[
                styles.filterTabText,
                filter === tab.key && styles.filterTabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsOverview}>
          <Text style={styles.statsTitle}>إحصائيات المنشورات</Text>
          <View style={styles.statsGrid}>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewStatNumber, { color: theme.colors.primary }]}>
                {posts.length}
              </Text>
              <Text style={styles.overviewStatLabel}>إجمالي المنشورات</Text>
            </View>
            
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewStatNumber, { color: theme.colors.success }]}>
                {publishedCount}
              </Text>
              <Text style={styles.overviewStatLabel}>منشور</Text>
            </View>
            
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewStatNumber, { color: '#FF3040' }]}>
                {formatNumber(totalLikes)}
              </Text>
              <Text style={styles.overviewStatLabel}>إجمالي الإعجابات</Text>
            </View>
          </View>
        </View>

        {/* Posts List */}
        {filteredPosts.length > 0 ? (
          <View style={styles.postsContainer}>
            {filteredPosts.map(renderPost)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {filter === 'all' ? 'لا توجد منشورات' : `لا توجد منشورات ${getStatusLabel(filter as Post['status'])}`}
            </Text>
            <Text style={styles.emptyStateText}>
              {filter === 'all' 
                ? 'ابدأ برفع صورك الأولى ومشاركتها مع المجتمع'
                : `لا توجد منشورات بحالة "${getStatusLabel(filter as Post['status'])}" حالياً`
              }
            </Text>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => router.push('/(tabs)/upload')}
            >
              <Text style={styles.createPostButtonText}>إنشاء منشور جديد</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}