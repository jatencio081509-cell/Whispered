import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoaded } = useUser();
  const { myMood, setMyMood, partnerMood } = useApp();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  
  const [recentMemory, setRecentMemory] = useState<any>(null);
  const [plantLevel, setPlantLevel] = useState(1);
  const [petLevel, setPetLevel] = useState(1);

  useEffect(() => {
    if (!user) return;
    
    const fetchRecentMemory = async () => {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data && !error) {
          setRecentMemory(data);
        }
      } catch (error) {
        console.error('Error fetching recent memory:', error);
      }
    };

    fetchRecentMemory();
  }, [user]);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const partnerName = user?.unsafeMetadata?.partnerName as string | undefined;
  const combinedMood = myMood || partnerMood || '😊';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeBackground>
      <View style={[styles.wall, { paddingTop: topPad + 12 }]}>
        {/* Header */}
        <View style={[styles.headerRow]}>
          <Text style={[styles.title, { color: colors.text }]}>Our Home</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Wall with furniture */}
        <View style={styles.wallContent}>
          
          {/* Picture Frame - Top Center */}
          <Pressable 
            style={[styles.pictureFrame, { borderColor: colors.border }]}
            onPress={() => router.push('/(tabs)/memories')}
          >
            <View style={[styles.frameInner, { backgroundColor: colors.card }]}>
              {recentMemory?.image_url ? (
                <Image 
                  source={{ uri: recentMemory.image_url }} 
                  style={styles.frameImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.framePlaceholder, { backgroundColor: colors.mutedForeground }]}>
                  <Text style={[styles.framePlaceholderText, { color: colors.text }]}>
                    {recentMemory?.text || recentMemory?.caption || 'No memory yet'}
                  </Text>
                </View>
              )}
            </View>
            <View style={[styles.frameShadow, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
          </Pressable>

          {/* Mood Lamp - Top Right */}
          <View style={[styles.lampContainer]}>
            <View style={[styles.lampBase, { backgroundColor: colors.card }]}>
              <View style={[styles.lampStand, { backgroundColor: colors.border }]} />
              <View style={[styles.lampShade, { backgroundColor: colors.primary }]}>
                <Text style={styles.lampLight}>{combinedMood}</Text>
              </View>
            </View>
            <Text style={[styles.lampLabel, { color: colors.mutedForeground }]}>Mood Lamp</Text>
          </View>

          {/* Plant - Bottom Left */}
          <Pressable 
            style={styles.plantContainer}
            onPress={() => router.push('/plant')}
          >
            <View style={[styles.plantPot, { backgroundColor: colors.card }]}>
              <Text style={styles.plantEmoji}>�</Text>
            </View>
            <View style={[styles.plantShadow, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
            <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Our Plant</Text>
          </Pressable>

          {/* Pet - Bottom Right */}
          <Pressable 
            style={styles.petContainer}
            onPress={() => router.push('/pet')}
          >
            <Text style={styles.petEmoji}>🐕</Text>
            <View style={[styles.petShadow, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
            <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Our Pet</Text>
          </Pressable>

          {/* Games Shelf - Bottom Center */}
          <Pressable 
            style={[styles.shelfContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/games')}
          >
            <View style={styles.shelfSurface}>
              <Text style={styles.bookEmoji}>📚</Text>
              <Text style={styles.gameEmoji}>🎮</Text>
              <Text style={styles.bookEmoji}>📖</Text>
            </View>
            <View style={[styles.shelfSupport, { backgroundColor: colors.border }]} />
            <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Games Shelf</Text>
          </Pressable>

        </View>
      </View>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />
      </ThemeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  wall: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "System",
    fontWeight: '600',
  },
  wallContent: {
    flex: 1,
    position: 'relative',
    height: 600,
  },
  pictureFrame: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    height: 160,
    borderWidth: 8,
    borderRadius: 4,
    padding: 4,
  },
  frameInner: {
    flex: 1,
    borderRadius: 2,
    overflow: 'hidden',
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  framePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  framePlaceholderText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: "System",
  },
  frameShadow: {
    position: 'absolute',
    bottom: -8,
    left: 8,
    right: -8,
    height: 8,
    borderRadius: 4,
  },
  lampContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    alignItems: 'center',
  },
  lampBase: {
    width: 60,
    height: 20,
    borderRadius: 30,
    marginBottom: 4,
  },
  lampStand: {
    width: 4,
    height: 80,
    alignSelf: 'center',
    borderRadius: 2,
  },
  lampShade: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  lampLight: {
    fontSize: 24,
  },
  lampLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "System",
  },
  plantContainer: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    alignItems: 'center',
  },
  plantPot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  plantEmoji: {
    fontSize: 40,
  },
  plantShadow: {
    position: 'absolute',
    bottom: -6,
    left: 10,
    right: 10,
    height: 6,
    borderRadius: 3,
  },
  petContainer: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 50,
    marginBottom: 4,
  },
  petShadow: {
    position: 'absolute',
    bottom: -8,
    left: 15,
    right: 15,
    height: 8,
    borderRadius: 4,
  },
  shelfContainer: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -75 }],
    width: 150,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
  },
  shelfSurface: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookEmoji: {
    fontSize: 24,
  },
  gameEmoji: {
    fontSize: 28,
  },
  shelfSupport: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: "System",
  },
});
