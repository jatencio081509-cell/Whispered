import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useColors } from '@/hooks/useColors';

export default function LinkPartnerScreen() {
  const router = useRouter();
  const colors = useColors();

  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onLinkPartner = async () => {
    if (!partnerCode.trim()) {
      setError('Please enter a partner code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual partner linking logic (API / Clerk metadata / etc.)
      // For now this is a placeholder
      await new Promise(resolve => setTimeout(resolve, 800));
      
      Alert.alert('Success', 'Partner linked successfully!');
      router.replace('/(tabs)');
    } catch (err) {
      setError('Failed to link partner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Link your partner</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Enter your partner's code to connect accounts
        </Text>

        <TextInput
          value={partnerCode}
          placeholder="Partner code"
          placeholderTextColor={colors.mutedForeground}
          onChangeText={setPartnerCode}
          style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          autoCapitalize="characters"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onLinkPartner}
          disabled={loading || !partnerCode.trim()}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Link Partner</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace('/(tabs)')}> 
          <Text style={[styles.link, { color: colors.mutedForeground }]}>Skip for now</Text>
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    padding: 18,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
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
  link: {
    textAlign: 'center',
    fontSize: 15,
  },
});