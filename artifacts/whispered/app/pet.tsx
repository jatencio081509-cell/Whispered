import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';
import { supabase } from '@/lib/supabase';

export default function PetScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoaded } = useUser();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  
  const [petData, setPetData] = useState({
    level: 1,
    daysOld: 0,
    playsNeeded: 3,
    lastPlayed: null as Date | null,
    totalPlays: 0,
    happiness: 75,
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchPetData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('pet_level, pet_days_old, pet_plays_needed, pet_last_played, pet_total_plays, pet_happiness')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setPetData({
            level: data.pet_level || 1,
            daysOld: data.pet_days_old || 0,
            playsNeeded: data.pet_plays_needed || 3,
            lastPlayed: data.pet_last_played ? new Date(data.pet_last_played) : null,
            totalPlays: data.pet_total_plays || 0,
            happiness: data.pet_happiness || 75,
          });
        }
      } catch (error) {
        console.error('Error fetching pet data:', error);
      }
    };

    fetchPetData();
  }, [user]);

  const playWithPet = async () => {
    if (!user) return;
    
    try {
      const newPlaysNeeded = petData.playsNeeded - 1;
      const newLevel = newPlaysNeeded <= 0 ? petData.level + 1 : petData.level;
      const newPlaysNeededForLevel = newPlaysNeeded <= 0 ? newLevel + 2 : newPlaysNeeded;
      const newHappiness = Math.min(100, petData.happiness + 10);
      
      await supabase
        .from('users')
        .update({
          pet_level: newLevel,
          pet_plays_needed: newPlaysNeededForLevel,
          pet_last_played: new Date().toISOString(),
          pet_total_plays: petData.totalPlays + 1,
          pet_happiness: newHappiness,
        })
        .eq('id', user.id);
      
      setPetData({
        ...petData,
        level: newLevel,
        playsNeeded: newPlaysNeededForLevel,
        lastPlayed: new Date(),
        totalPlays: petData.totalPlays + 1,
        happiness: newHappiness,
      });
    } catch (error) {
      console.error('Error playing with pet:', error);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const getPetEmoji = () => {
    if (petData.level === 1) return '🐕';
    if (petData.level === 2) return '🐩';
    if (petData.level === 3) return '🦮';
    if (petData.level === 4) return '🐕‍🦺';
    return '🐺';
  };

  const getHappinessEmoji = () => {
    if (petData.happiness >= 80) return '😊';
    if (petData.happiness >= 60) return '🙂';
    if (petData.happiness >= 40) return '😐';
    if (petData.happiness >= 20) return '😔';
    return '😢';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeBackground>
      <ScrollView style={[styles.scrollView, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.headerRow]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Our Pet</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Pet Display */}
        <View style={[styles.petDisplay, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.petEmoji}>{getPetEmoji()}</Text>
          <Text style={[styles.petLevel, { color: colors.primary }]}>Level {petData.level}</Text>
          <View style={styles.happinessContainer}>
            <Text style={styles.happinessEmoji}>{getHappinessEmoji()}</Text>
            <Text style={[styles.happinessText, { color: colors.mutedForeground }]}>
              {petData.happiness}% happy
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Days Old</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{petData.daysOld}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Plays</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{petData.totalPlays}</Text>
          </View>
        </View>

        {/* Progress to Next Level */}
        <View style={[styles.progressSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress to Level {petData.level + 1}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${((3 - petData.playsNeeded) / 3) * 100}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
            {petData.playsNeeded} plays needed
          </Text>
        </View>

        {/* Happiness Level */}
        <View style={[styles.happinessSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Happiness Level</Text>
          <View style={styles.happinessBar}>
            <View 
              style={[
                styles.happinessFill, 
                { 
                  backgroundColor: petData.happiness >= 60 ? colors.primary : '#FFA500',
                  width: `${petData.happiness}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.happinessLabel, { color: colors.mutedForeground }]}>
            {petData.happiness}% happiness
          </Text>
        </View>

        {/* Last Played */}
        <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Last Played</Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {petData.lastPlayed 
              ? new Date(petData.lastPlayed).toLocaleDateString() 
              : 'Never'}
          </Text>
        </View>

        {/* Play Button */}
        <Pressable 
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={playWithPet}
        >
          <Feather name="heart" size={24} color="#fff" />
          <Text style={styles.playButtonText}>Play with Pet</Text>
        </Pressable>

      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "System",
    fontWeight: '600',
  },
  petDisplay: {
    margin: 20,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  petEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  petLevel: {
    fontSize: 20,
    fontFamily: "System",
    fontWeight: '600',
    marginBottom: 8,
  },
  happinessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  happinessEmoji: {
    fontSize: 24,
  },
  happinessText: {
    fontSize: 16,
    fontFamily: "System",
  },
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "System",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "System",
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
  },
  progressSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "System",
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "System",
  },
  happinessSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  happinessBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  happinessFill: {
    height: '100%',
    borderRadius: 4,
  },
  happinessLabel: {
    fontSize: 14,
    fontFamily: "System",
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 16,
    fontFamily: "System",
  },
  playButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: "System",
    fontWeight: '600',
  },
});
