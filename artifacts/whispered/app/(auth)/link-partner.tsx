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

export default function LinkPartnerScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const colors = useColors();

  const [partnerCode, setPartnerCode] = useState('');
  const [myCode, setMyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkedPartner, setLinkedPartner] = useState<string | null>(null);

  // Load existing partner code from Clerk metadata
  useEffect(() => {
    if (user?.unsafeMetadata?.partnerCode) {
      setLinkedPartner(user.unsafeMetadata.partnerCode as string);
    }
    if (user?.unsafeMetadata?.myLinkingCode) {
      setMyCode(user.unsafeMetadata.myLinkingCode as string);
    }
  }, [user]);

  // Generate a random linking code
  const generateCode = async () => {
    if (!user) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLoading(true);

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          myLinkingCode: code,
        },
      });
      setMyCode(code);
      Alert.alert('Code Generated', `Your linking code is: ${code}\nShare this with your partner.`);
    } catch (err) {
      setError('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Link with partner's code
  const linkPartner = async () => {
    if (!user || !partnerCode.trim()) {
      setError('Please enter a valid code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          partnerCode: partnerCode.trim().toUpperCase(),
        },
      });

      setLinkedPartner(partnerCode.trim().toUpperCase());
      Alert.alert('Success', 'Partner linked successfully!');
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to link partner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Link your partner</Text>

        {/* Show current linked status */}
        {linkedPartner && (
          <View style={styles.statusBox}>
            <Text style={[styles.statusText, { color: colors.primary }]}>
              ✅ Linked with code: {linkedPartner}
            </Text>
          </View>
        )}

        {/* Generate Code Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Your Linking Code
          </Text>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Generate a code and share it with your partner
          </Text>

          {myCode ? (
            <View style={styles.codeDisplay}>
              <Text style={[styles.codeText, { color: colors.primary }]}>{myCode}</Text>
            </View>
          ) : (
            <Pressable
              onPress={generateCode}
              disabled={loading}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                  Generate Code
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Enter Partner's Code */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Enter Partner's Code
          </Text>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Enter the code your partner shared with you
          </Text>

          <TextInput
            value={partnerCode}
            placeholder="Enter code (e.g. ABC123)"
            placeholderTextColor={colors.mutedForeground}
            onChangeText={setPartnerCode}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            autoCapitalize="characters"
            maxLength={6}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={linkPartner}
            disabled={loading || !partnerCode.trim()}
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                Link Partner
              </Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.replace('/(tabs)')}> 
          <Text style={[styles.skip, { color: colors.mutedForeground }]}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  codeDisplay: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  codeText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    padding: 18,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusBox: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skip: {
    textAlign: 'center',
    fontSize: 15,
  },
});