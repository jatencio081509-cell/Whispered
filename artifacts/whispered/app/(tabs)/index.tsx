import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

import { View, Text, Pressable, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '❤️', label: 'Loved' },
  { emoji: '🔥', label: 'Motivated' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const colors = useColors();
  const { myMood, setMyMood, partnerMood } = useApp();

  const [showMyMoodDropdown, setShowMyMoodDropdown] = useState(false);
  const [showEditPartnerName, setShowEditPartnerName] = useState(false);
  const [editingPartnerName, setEditingPartnerName] = useState('');
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const coupleId = user?.unsafeMetadata?.coupleId as string | undefined;
  const partnerCode = user?.unsafeMetadata?.partnerCode as string | undefined;
  const partnerName = user?.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!coupleId || !!partnerCode;

  const [weddingDate, setWeddingDate] = useState<string>();
  const [engagementDate, setEngagementDate] = useState<string>();
  const [officialDate, setOfficialDate] = useState<string>();

  // Force re-render when screen comes into focus
  const [refreshKey, setRefreshKey] = React.useState(0);
  useFocusEffect(
    React.useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Load dates from Supabase when component mounts or refreshes
  React.useEffect(() => {
    const loadDates = async () => {
      if (!coupleId) {
        // Fallback to Clerk metadata if no couple exists
        setWeddingDate(user?.unsafeMetadata?.weddingDate as string | undefined);
        setEngagementDate(user?.unsafeMetadata?.engagementDate as string | undefined);
        setOfficialDate(user?.unsafeMetadata?.officialDate as string | undefined);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('couples')
          .select('official_date, engagement_date, wedding_date')
          .eq('id', coupleId)
          .single();

        if (error) throw error;

        setWeddingDate(data?.wedding_date || undefined);
        setEngagementDate(data?.engagement_date || undefined);
        setOfficialDate(data?.official_date || undefined);
      } catch (err) {
        console.error('Failed to load dates:', err);
      }
    };

    loadDates();

    // Real-time sync for couples table
    if (coupleId) {
      const channel = supabase
        .channel('couples-dates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'couples',
            filter: `id=eq.${coupleId}`,
          },
          (payload) => {
            console.log('Couples date change:', payload);
            const updated = payload.new as any;
            setWeddingDate(updated.wedding_date || undefined);
            setEngagementDate(updated.engagement_date || undefined);
            setOfficialDate(updated.official_date || undefined);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [coupleId, user, refreshKey]);

  // Update editing partner name when partnerName changes
  React.useEffect(() => {
    if (partnerName && !editingPartnerName) {
      setEditingPartnerName(partnerName);
    }
  }, [partnerName]);

  const savePartnerName = async () => {
    if (!user) return;
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          partnerName: editingPartnerName.trim() || 'Partner',
        },
      });
      setShowEditPartnerName(false);
    } catch (error) {
      console.error('Failed to save partner name', error);
    }
  };

  // Calculate days together if anniversary date exists
  // Priority: Wedding > Engagement > Official
  const anniversaryDate = weddingDate || engagementDate || officialDate;
  
  // Determine which date type is being used for display
  let dateLabel = '';
  if (weddingDate) dateLabel = 'Wedding';
  else if (engagementDate) dateLabel = 'Engagement';
  else if (officialDate) dateLabel = 'Official';
  
  let daysTogether = null;
  let daysUntilAnniversary = null;
  if (anniversaryDate) {
    const start = new Date(anniversaryDate);
    const today = new Date();
    daysTogether = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    // Calculate next anniversary
    const nextAnniversary = new Date(start);
    nextAnniversary.setFullYear(today.getFullYear());
    if (nextAnniversary < today) {
      nextAnniversary.setFullYear(today.getFullYear() + 1);
    }
    daysUntilAnniversary = Math.floor((nextAnniversary.getTime() - today.getTime()) / (1000 * 3600 * 24));
  }

  // Calculate progress for 365-day circle
  const progress = daysUntilAnniversary !== null ? (365 - daysUntilAnniversary) / 365 : 0;
  const circumference = 2 * Math.PI * 80; // radius = 80
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeBackground>
        <ScrollView style={[styles.scrollView, { paddingTop: insets.top + 12 }]} key={refreshKey}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
              </Text>
              <Text style={[styles.name, { color: colors.text }]}>
                {user?.firstName || 'there'}
              </Text>
            </View>
            <Pressable onPress={() => setShowNavigationDrawer(true)}>
              <Feather name="menu" size={24} color={colors.text} />
            </Pressable>
          </View>

        {/* Anniversary Date Section - Moved to middle */}
        {anniversaryDate && daysTogether !== null && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Anniversary</Text>
            
            {/* Holographic 365-day countdown circle */}
            <View style={styles.circleContainer}>
              <Svg width={200} height={200} style={styles.circle}>
                {/* Background circle */}
                <Circle
                  cx={100}
                  cy={100}
                  r={80}
                  stroke="rgba(0, 229, 255, 0.1)"
                  strokeWidth={8}
                  fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                  cx={100}
                  cy={100}
                  r={80}
                  stroke="#00E5FF"
                  strokeWidth={8}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 100 100)`}
                />
              </Svg>
              <View style={styles.circleContent}>
                <Text style={[styles.circleDays, { color: colors.text }]}>
                  {daysUntilAnniversary}
                </Text>
                <Text style={[styles.circleLabel, { color: colors.mutedForeground }]}>
                  days left
                </Text>
              </View>
            </View>

            <View style={styles.anniversaryCard}>
              <Text style={[styles.anniversaryText, { color: colors.text }]}>
                {daysTogether} days together
              </Text>
              {daysUntilAnniversary !== null && (
                <Text style={[styles.anniversarySubtext, { color: colors.mutedForeground }]}>
                  {dateLabel} since {anniversaryDate}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Moods Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Moods</Text>
          <View style={styles.moodsRow}>
            {/* My Mood */}
            <View style={styles.moodBox}>
              <Text style={[styles.moodBoxTitle, { color: colors.text }]}>My mood</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.moodDropdown,
                  { 
                    borderColor: myMood ? colors.primary : colors.border,
                    backgroundColor: myMood ? "rgba(0,229,255,0.05)" : colors.surface,
                    opacity: pressed ? 0.8 : 1
                  }
                ]}
                onPress={() => setShowMyMoodDropdown(true)}
              >
                <View style={styles.moodDropdownContent}>
                  <Text style={[styles.moodDropdownText, { color: myMood ? colors.text : colors.mutedForeground }]}>
                    {myMood ? MOODS.find(m => m.label.toLowerCase() === myMood)?.emoji + ' ' + myMood : 'Select mood'}
                  </Text>
                  <Feather name="chevron-down" size={16} color={myMood ? colors.primary : colors.mutedForeground} />
                </View>
              </Pressable>
            </View>

            {/* Partner's Mood - Display only */}
            <View style={styles.moodBox}>
              <Text style={[styles.moodBoxTitle, { color: colors.text }]}>
                {partnerName ? `${partnerName}'s mood` : "Partner's mood"}
              </Text>
              <View style={[styles.moodDropdown, { 
                borderColor: partnerMood ? colors.primary : colors.border,
                backgroundColor: partnerMood ? "rgba(0,229,255,0.05)" : colors.surface
              }]}>
                <View style={styles.moodDropdownContent}>
                  <Text style={[styles.moodDropdownText, { color: partnerMood ? colors.text : colors.mutedForeground }]}>
                    {partnerMood ? MOODS.find(m => m.label.toLowerCase() === partnerMood)?.emoji + ' ' + partnerMood : 'Not set'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Partner Section - Moved below anniversary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Partner</Text>
          
          {isLinked ? (
            <View style={styles.partnerCard}>
              <View style={styles.partnerHeader}>
                <Feather name="heart" size={20} color={colors.primary} />
                <Text style={[styles.partnerTitle, { color: colors.text }]}>
                  {partnerName ? `Linked with ${partnerName}` : 'Linked with partner'}
                </Text>
                <Pressable onPress={() => { setEditingPartnerName(partnerName || ''); setShowEditPartnerName(true); }}>
                  <Feather name="edit-2" size={16} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable 
              style={styles.partnerCard}
              onPress={() => router.push('/(auth)/link-partner')}
            >
              <Text style={[styles.partnerTitle, { color: colors.mutedForeground }]}>
                You're currently solo
              </Text>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Link with your partner →
              </Text>
            </Pressable>
          )}
        </View>

      </View>

      {/* My Mood Dropdown Modal */}
      <Modal
        visible={showMyMoodDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMyMoodDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMyMoodDropdown(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select your mood</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <Pressable
                  key={mood.label}
                  style={({ pressed }) => [
                    styles.moodOption,
                    { 
                      backgroundColor: myMood === mood.label.toLowerCase() ? "rgba(0,229,255,0.1)" : colors.surface,
                      borderColor: myMood === mood.label.toLowerCase() ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1
                    }
                  ]}
                  onPress={() => {
                    setMyMood(mood.label.toLowerCase() as any);
                    setShowMyMoodDropdown(false);
                  }}
                >
                  <Text style={styles.moodOptionEmoji}>{mood.emoji}</Text>
                  <Text style={[styles.moodOptionLabel, { color: colors.text }]}>{mood.label}</Text>
                  {myMood === mood.label.toLowerCase() && (
                    <View style={styles.selectedIndicator}>
                      <Feather name="check" size={14} color={colors.primary} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Partner Name Modal */}
      <Modal
        visible={showEditPartnerName}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditPartnerName(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditPartnerName(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit partner name</Text>
            <TextInput
              style={[styles.editInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={editingPartnerName}
              onChangeText={setEditingPartnerName}
              placeholder="Enter partner's name"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowEditPartnerName(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={savePartnerName}
              >
                <Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />

      </ScrollView>
      </ThemeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "System",
  },
  name: {
    fontSize: 28,
    fontFamily: "System",
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "System",
    fontWeight: '600',
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  moodButtonActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentMood: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
  },
  partnerCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  partnerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  partnerSubtext: {
    fontSize: 14,
    fontFamily: 'System',
  },
  moodPlaceholder: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  anniversaryCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    alignItems: 'center',
    marginTop: 8,
  },
  anniversaryText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  anniversarySubtext: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'System',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    color: '#00E5FF',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
    height: 160,
  },
  circle: {
    position: 'absolute',
  },
  circleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDays: {
    fontSize: 36,
    fontWeight: '700',
  },
  circleLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  moodsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  moodBox: {
    flex: 1,
  },
  moodBoxTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  moodDropdown: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  moodDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moodDropdownText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 4,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
    borderBottomColor: 'rgba(0, 229, 255, 0.1)',
  },
  moodOptionEmoji: {
    fontSize: 24,
  },
  moodOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  editInput: {
    height: 48,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  saveButton: {
    borderRadius: 4,
    backgroundColor: '#00E5FF',
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});