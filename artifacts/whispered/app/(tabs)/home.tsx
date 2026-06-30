import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import NavigationDrawer from '@/components/NavigationDrawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/expo';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import RoomBackground from '@/components/home/RoomBackground';
import MemoryFrame from '@/components/home/MemoryFrame';
import PetCompanion from '@/components/home/PetCompanion';
import PlantGrowth from '@/components/home/PlantGrowth';
import MoodLamp from '@/components/home/MoodLamp';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const { myMood, partnerMood } = useApp();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  
  const [recentMemory, setRecentMemory] = useState<any>(null);
  const [plantLevel, setPlantLevel] = useState(1);
  const [petLevel, setPetLevel] = useState(1);
  const [petType, setPetType] = useState<'cat' | 'dog' | 'fish'>('dog');

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

    const fetchPlantData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('plant_level')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setPlantLevel(data.plant_level || 1);
        }
      } catch (error) {
        console.error('Error fetching plant data:', error);
      }
    };

    const fetchPetData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('pet_level, pet_type')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setPetLevel(data.pet_level || 1);
          setPetType(data.pet_type || 'dog');
        }
      } catch (error) {
        console.error('Error fetching pet data:', error);
      }
    };

    fetchRecentMemory();
    fetchPlantData();
    fetchPetData();
  }, [user]);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/welcome');
            } catch (err) {
              console.error('Sign out failed', err);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <RoomBackground>
        <View style={[styles.room, { paddingTop: topPad + 12 }]}>
          {/* Header */}
          <View style={[styles.headerRow]}>
            <Text style={[styles.title, { color: colors.text }]}>Our Home</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={handleSignOut} style={styles.headerButton}>
                <Feather name="log-out" size={20} color={colors.mutedForeground} />
              </Pressable>
              <Pressable onPress={() => setShowNavigationDrawer(true)} style={styles.headerButton}>
                <Feather name="menu" size={24} color={colors.text} />
              </Pressable>
            </View>
          </View>

          {/* Room elements */}
          <View style={styles.roomContent}>
            {/* Memory Frame - Top Center */}
            <MemoryFrame memory={recentMemory} />

            {/* Mood Lamps */}
            <MoodLamp mood={myMood || '😊'} isPartner={false} position="left" />
            <MoodLamp mood={partnerMood || '😊'} isPartner={true} position="right" />

            {/* Plant - Bottom Left */}
            <PlantGrowth level={plantLevel} />

            {/* Pet - Bottom Right */}
            <PetCompanion petType={petType} level={petLevel} />

            {/* Games Shelf - Bottom Center */}
            <Pressable 
              style={[styles.gamesShelf, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/games')}
            >
              <View style={styles.shelfSurface}>
                <View style={[styles.shelfItem, { backgroundColor: colors.primary }]}>
                  <Feather name="grid" size={20} color={colors.primaryForeground} />
                </View>
                <View style={[styles.shelfItem, { backgroundColor: colors.accent }]}>
                  <Feather name="grid" size={20} color={colors.accentForeground} />
                </View>
                <View style={[styles.shelfItem, { backgroundColor: colors.rose }]}>
                  <Feather name="heart" size={20} color={colors.primaryForeground} />
                </View>
              </View>
              <View style={[styles.shelfSupport, { backgroundColor: colors.border }]} />
              <Text style={[styles.shelfLabel, { color: colors.mutedForeground }]}>Games</Text>
            </Pressable>
          </View>
        </View>

        <NavigationDrawer
          visible={showNavigationDrawer}
          onClose={() => setShowNavigationDrawer(false)}
        />
      </RoomBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  room: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: "System",
    fontWeight: '600',
  },
  roomContent: {
    flex: 1,
    position: 'relative',
  },
  gamesShelf: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -60 }],
    width: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  shelfSurface: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
  },
  shelfItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shelfSupport: {
    height: 4,
    borderRadius: 2,
    marginBottom: 6,
  },
  shelfLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: "System",
  },
});
