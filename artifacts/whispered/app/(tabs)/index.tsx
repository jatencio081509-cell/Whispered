import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';

import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

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

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (user?.unsafeMetadata?.currentMood) {
      setSelectedMood(user.unsafeMetadata.currentMood as string);
    }
  }, [user]);

  const saveMood = async (moodLabel: string) => {
    if (!user) return;
    setSaving(true);

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          currentMood: moodLabel,
        },
      });
      setSelectedMood(moodLabel);
    } catch (error) {
      console.error('Failed to save mood', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const partnerCode = user?.unsafeMetadata?.partnerCode as string | undefined;
  const isLinked = !!partnerCode;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            Good {new Date().getHours() < 12 ? 'morning' : 'evening'}
          </Text>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {user?.firstName || 'there'}
          </Text>
        </View>

        {/* Mood Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How are you feeling?</Text>
          
          <View style={styles.moodContainer}>
            {MOODS.map((mood) => (
              <Pressable
                key={mood.label}
                onPress={() => saveMood(mood.label)}
                style={[
                  styles.moodButton,
                  selectedMood === mood.label && styles.moodButtonActive,
                  { borderColor: selectedMood === mood.label ? colors.primary : colors.border }
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, { color: colors.foreground }]}>
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedMood && (
            <Text style={[styles.currentMood, { color: colors.mutedForeground }]}>
              You're feeling {selectedMood.toLowerCase()} today
            </Text>
          )}
        </View>

        {/* Partner Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Partner</Text>
          
          {isLinked ? (
            <View style={styles.partnerCard}>
              <View style={styles.partnerHeader}>
                <Feather name="users" size={20} color={colors.primary} />
                <Text style={[styles.partnerTitle, { color: colors.foreground }]}>
                  Linked with {partnerCode}
                </Text>
              </View>
              <Text style={[styles.partnerSubtext, { color: colors.mutedForeground }]}>
                Partner's mood will appear here
              </Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    borderWidth: 2,
    borderColor: '#333',
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
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  partnerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  partnerSubtext: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    color: '#00E5FF',
  },
});