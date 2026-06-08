import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const colors = useColors();

  if (!isLoaded || !user) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const partnerCode = user.unsafeMetadata?.partnerCode as string | undefined;
  const isLinked = !!partnerCode;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

        {/* Account Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account Status</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Feather 
                name={isLinked ? "users" : "user"} 
                size={20} 
                color={isLinked ? colors.primary : colors.mutedForeground} 
              />
              <Text style={[styles.statusText, { color: colors.foreground }]}>
                {isLinked 
                  ? `Linked to ${partnerCode}` 
                  : "Solo"
                }
              </Text>
            </View>
            
            {!isLinked && (
              <Pressable 
                onPress={() => router.push('/(auth)/link-partner')}
                style={styles.linkButton}
              >
                <Text style={[styles.linkButtonText, { color: colors.primary }]}>
                  Link Partner
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Your Couple Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Couple</Text>
          
          {isLinked ? (
            <View style={styles.coupleCard}>
              <Text style={[styles.coupleText, { color: colors.foreground }]}>
                You're connected with your partner
              </Text>
              <Text style={[styles.coupleSubtext, { color: colors.mutedForeground }]}>
                Code: {partnerCode}
              </Text>
            </View>
          ) : (
            <Pressable 
              onPress={() => router.push('/(auth)/link-partner')}
              style={styles.emptyCoupleCard}
            >
              <Feather name="user-plus" size={24} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Link with your partner to unlock couple features
              </Text>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Link Partner →
              </Text>
            </Pressable>
          )}
        </View>

        {/* Other settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Preferences</Text>
          {/* Add more settings here later */}
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  coupleCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  coupleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  coupleSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyCoupleCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
});