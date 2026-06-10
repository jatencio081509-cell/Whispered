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
import { supabase } from '@/lib/supabase';
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

  const generateCode = async (isRegenerate = false) => {
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

      await supabase.from('users').upsert({
        id: user.id,
        linking_code: code,
        first_name: user.firstName,
        username: user.username,
        avatar_url: user.imageUrl,
      });

      setMyCode(code);

      if (isRegenerate) {
        Alert.alert('Code Regenerated', `Your new code is: ${code}\nOld code is no longer valid.`);
      } else {
        Alert.alert('Code Generated', `Share this code with your partner: ${code}`);
      }
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
      const { data: ownerData, error: lookupError } = await supabase
        .from('users')
        .select('id')
        .eq('linking_code', partnerCode.trim().toUpperCase())
        .single();

      if (lookupError || !ownerData) {
        setError('Code not found. Make sure your partner generated it.');
        setLoading(false);
        return;
      }

      const partnerUserIdFromDb = ownerData.id;

      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          partnerCode: partnerCode.trim().toUpperCase(),
          partnerName: partnerName.trim() || 'Partner',
          partner_user_id: partnerUserIdFromDb,
        },
      });

      await syncAllData(
        user.id,
        user.firstName,
        user.username,
        user.imageUrl,
        partnerCode.trim().toUpperCase(),
        partnerName.trim() || 'Partner'
      );

      await supabase.from('users').upsert({
        id: user.id,
        partner_code: partnerCode.trim().toUpperCase(),
        partner_name: partnerName.trim() || 'Partner',
        partner_user_id: partnerUserIdFromDb,
        first_name: user.firstName,
        username: user.username,
        avatar_url: user.imageUrl,
      });

      setLinkedPartner(partnerCode.trim().toUpperCase());
      Alert.alert('Success', 'Partner linked successfully!');
      router.replace('/(tabs)');
    } catch (err) {
      console.error(err);
      setError('Failed to link partner. Please try again.');
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
            <Text style={{ color: colors.primary }}>Currently linked with code: {linkedPartner}</Text>
            <Text style={{ color: colors.mutedForeground, marginTop: 4, fontSize: 14 }}>
              You can re-enter a new code below to update your link
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Code</Text>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Generate and share this with your partner
          </Text>

          {myCode ? (
            <View style={styles.codeContainer}>
              <View style={styles.codeBox}>
                <Text style={styles.code}>{myCode}</Text>
              </View>
              <Pressable 
                onPress={() => generateCode(true)} 
                disabled={loading}
                style={styles.regenerateButton}
              >
                <Text style={styles.regenerateText}>Regenerate</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => generateCode(false)} style={[styles.button, { backgroundColor: colors.primary }]}>
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

          <Pressable 
            onPress={linkPartner} 
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Link / Update Partner</Text>
            )}
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
  codeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  codeBox: { 
    flex: 1,
    backgroundColor: '#1A1A1A', 
    padding: 20, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  code: { fontSize: 28, fontWeight: '700', letterSpacing: 3 },
  regenerateButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: '#333', 
    borderRadius: 12 
  },
  regenerateText: { color: '#00E5FF', fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: '#1A1A1A', color: 'white', padding: 16, borderRadius: 12, fontSize: 18, textAlign: 'center', marginBottom: 12 },
  button: { padding: 18, borderRadius: 999, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  error: { color: '#FF3B30', marginTop: 8 },
  statusBox: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 12, marginBottom: 20 },
});