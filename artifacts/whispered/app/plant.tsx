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

export default function PlantScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoaded } = useUser();
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  
  const [plantData, setPlantData] = useState({
    level: 1,
    daysOld: 0,
    wateringsNeeded: 3,
    lastWatered: null as Date | null,
    totalWaterings: 0,
  });

  useEffect(() => {
    if (!user) return;
    
    const fetchPlantData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('plant_level, plant_days_old, plant_waterings_needed, plant_last_watered, plant_total_waterings')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setPlantData({
            level: data.plant_level || 1,
            daysOld: data.plant_days_old || 0,
            wateringsNeeded: data.plant_waterings_needed || 3,
            lastWatered: data.plant_last_watered ? new Date(data.plant_last_watered) : null,
            totalWaterings: data.plant_total_waterings || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching plant data:', error);
      }
    };

    fetchPlantData();
  }, [user]);

  const waterPlant = async () => {
    if (!user) return;
    
    try {
      const newWateringsNeeded = plantData.wateringsNeeded - 1;
      const newLevel = newWateringsNeeded <= 0 ? plantData.level + 1 : plantData.level;
      const newWateringsNeededForLevel = newWateringsNeeded <= 0 ? newLevel + 2 : newWateringsNeeded;
      
      await supabase
        .from('users')
        .update({
          plant_level: newLevel,
          plant_waterings_needed: newWateringsNeededForLevel,
          plant_last_watered: new Date().toISOString(),
          plant_total_waterings: plantData.totalWaterings + 1,
        })
        .eq('id', user.id);
      
      setPlantData({
        ...plantData,
        level: newLevel,
        wateringsNeeded: newWateringsNeededForLevel,
        lastWatered: new Date(),
        totalWaterings: plantData.totalWaterings + 1,
      });
    } catch (error) {
      console.error('Error watering plant:', error);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const getPlantEmoji = () => {
    if (plantData.level === 1) return '🌱';
    if (plantData.level === 2) return '🌿';
    if (plantData.level === 3) return '🪴';
    if (plantData.level === 4) return '🌳';
    return '🌲';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeBackground>
      <ScrollView style={[styles.scrollView, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.headerRow]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Our Plant</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Plant Display */}
        <View style={[styles.plantDisplay, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.plantEmoji}>{getPlantEmoji()}</Text>
          <Text style={[styles.plantLevel, { color: colors.primary }]}>Level {plantData.level}</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Days Old</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{plantData.daysOld}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Waterings</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{plantData.totalWaterings}</Text>
          </View>
        </View>

        {/* Progress to Next Level */}
        <View style={[styles.progressSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress to Level {plantData.level + 1}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary,
                  width: `${((3 - plantData.wateringsNeeded) / 3) * 100}%`
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
            {plantData.wateringsNeeded} waterings needed
          </Text>
        </View>

        {/* Last Watered */}
        <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Last Watered</Text>
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            {plantData.lastWatered 
              ? new Date(plantData.lastWatered).toLocaleDateString() 
              : 'Never'}
          </Text>
        </View>

        {/* Water Button */}
        <Pressable 
          style={[styles.waterButton, { backgroundColor: colors.primary }]}
          onPress={waterPlant}
        >
          <Feather name="droplet" size={24} color="#fff" />
          <Text style={styles.waterButtonText}>Water Plant</Text>
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
  plantDisplay: {
    margin: 20,
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  plantEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  plantLevel: {
    fontSize: 20,
    fontFamily: "System",
    fontWeight: '600',
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
  waterButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  waterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: "System",
    fontWeight: '600',
  },
});
