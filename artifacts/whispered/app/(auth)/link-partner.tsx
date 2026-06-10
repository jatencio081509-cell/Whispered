import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { syncAllData } from '@/lib/syncClerkToSupabase';

export default function LinkPartnerScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const colors = useColors();

  const [partnerCode, setPartnerCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [myCode, setMyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkedPartner, setLinkedPartner] = useState<string | null>(null);

  useEffect(() => {
    if (user?.unsafeMetadata?.partnerCode) {
      setLinkedPartner(user.unsafeMetadata.partnerCode as string);
    }
    if (user?.unsafeMetadata?.myLinkingCode) {
      setMyCode(user.unsafeMetadata.myLinkingCode as string);
    }
    if (user?.unsafeMetadata?.partnerName) {
      setPartnerName(user.unsafeMetadata.partnerName as string);
    }
  }, [user]);

  const generateCode = async () => {
    if (!user) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLoading(true);

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          myLinkingCode: code,
          myUserId: user.id,
        },
      });
      setMyCode(code);
      Alert.alert('Code Generated', `Share this code with your partner: ${code}`);
    } catch (err) {
      setError('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const linkPartner = async () => {
    if (!user || !partnerCode.trim()) {
      setError('Please enter a code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update Clerk metadata
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          partnerCode: partnerCode.trim().toUpperCase(),
          partnerName: partnerName.trim() || 'Partner',
        },
      });

      // Also sync linking info to Supabase
      await syncAllData(
        user.id,
        user.firstName,
        user.username,
        user.imageUrl,
        partnerCode.trim().toUpperCase(),
        partnerName.trim() || 'Partner'
      );

      setLinkedPartner(partnerCode.trim().toUpperCase());
      Alert.alert('Success', 'Partner linked in both Clerk and Supabase!');
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to link partner');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <View style={styles.container}><ActivityIndicator /></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Link your partner</Text>

        {linkedPartner && (
          <View style={styles.statusBox}>
            <Text style={{ color: colors.primary }}>Already linked</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Code</Text>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Generate and share this with your partner
          </Text>

          {myCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.code}>{myCode}</Text>
            </View>
          ) : (
            <Pressable onPress={generateCode} style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Generate Code</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Enter Partner's Code</Text>
          <TextInput
            value={partnerCode}
            onChangeText={setPartnerCode}
            placeholder="Enter code"
            style={styles.input}
            autoCapitalize="characters"
            maxLength={6}
          />

          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 16 }]}>Partner's Name (optional)</Text>
          <TextInput
            value={partnerName}
            onChangeText={setPartnerName}
            placeholder="Her name (e.g. Claire)"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={linkPartner} style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Link Partner</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 24 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 24 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  sectionDesc: { fontSize: 14, marginBottom: 12 },
  codeBox: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 12, alignItems: 'center' },
  code: { fontSize: 28, fontWeight: '700', letterSpacing: 3 },
  input: { backgroundColor: '#1A1A1A', color: 'white', padding: 16, borderRadius: 12, fontSize: 18, textAlign: 'center', marginBottom: 12 },
  button: { padding: 18, borderRadius: 999, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  error: { color: '#FF3B30', marginTop: 8 },
  statusBox: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 20 },
});