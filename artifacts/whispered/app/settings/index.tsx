import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const colors = useColors();

  const [anniversaryInput, setAnniversaryInput] = useState('');
  const [savingDate, setSavingDate] = useState(false);

  if (!isLoaded || !user) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const partnerCode = user.unsafeMetadata?.partnerCode as string | undefined;
  const partnerName = user.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!partnerCode;
  const currentAnniversary = user.unsafeMetadata?.anniversaryDate as string | undefined;

  const saveAnniversaryDate = async () => {
    if (!anniversaryInput) return;
    setSavingDate(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          anniversaryDate: anniversaryInput,
        },
      });
      setAnniversaryInput('');
    } catch (err) {
      console.error('Failed to save anniversary date', err);
    } finally {
      setSavingDate(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (err) {
      console.error('Sign out failed', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

        {/* Account Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Feather name={isLinked ? "users" : "user"} size={20} color={isLinked ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.statusText, { color: colors.foreground }]}>
                {isLinked ? `Linked to ${partnerName || partnerCode}` : "Solo"}
              </Text>
            </View>
            {!isLinked && (
              <Pressable onPress={() => router.push('/(auth)/link-partner')} style={styles.linkButton}>
                <Text style={[styles.linkButtonText, { color: colors.primary }]}>Link Partner</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Your Couple */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Couple</Text>
          {isLinked ? (
            <View style={styles.coupleCard}>
              <Text style={[styles.coupleText, { color: colors.foreground }]}>
                You're connected with {partnerName || 'your partner'}
              </Text>
            </View>
          ) : (
            <Pressable onPress={() => router.push('/(auth)/link-partner')} style={styles.emptyCoupleCard}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Link with your partner to unlock couple features
              </Text>
            </Pressable>
          )}
        </View>

        {/* Anniversary Date */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Anniversary Date</Text>
          {currentAnniversary ? (
            <View style={styles.anniversaryCard}>
              <Text style={[styles.anniversaryText, { color: colors.foreground }]}>{currentAnniversary}</Text>
              <Text style={[styles.anniversarySubtext, { color: colors.mutedForeground }]}>Relationship start date</Text>
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No anniversary date set yet</Text>
          )}
          <View style={styles.dateInputContainer}>
            <TextInput
              value={anniversaryInput}
              onChangeText={setAnniversaryInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              style={styles.dateInput}
            />
            <Pressable onPress={saveAnniversaryDate} disabled={!anniversaryInput || savingDate} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>{savingDate ? 'Saving...' : 'Save Date'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account</Text>
          <Pressable onPress={handleSignOut} style={styles.signOutButton}>
            <Feather name="log-out" size={20} color="#FF3B30" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Preferences</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  statusCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusText: { fontSize: 18, fontWeight: '600' },
  linkButton: { marginTop: 12, alignSelf: 'flex-start' },
  linkButtonText: { fontSize: 15, fontWeight: '600' },
  coupleCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  coupleText: { fontSize: 16, fontWeight: '500' },
  emptyCoupleCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  emptyText: { textAlign: 'center', fontSize: 15 },
  anniversaryCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, alignItems: 'center' },
  anniversaryText: { fontSize: 18, fontWeight: '600' },
  anniversarySubtext: { fontSize: 14, marginTop: 4 },
  dateInputContainer: { marginTop: 16 },
  dateInput: { backgroundColor: '#1A1A1A', color: 'white', padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 12 },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, gap: 12 },
  signOutText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },
});