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
import { useSignIn } from '@clerk/clerk-expo';
import { useColors } from '@/hooks/useColors';

export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const colors = useColors();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)'); // or your main app route
      } else {
        setError('Sign in incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid email or password.');
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
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email address"
          placeholderTextColor={colors.mutedForeground}
          onChangeText={setEmailAddress}
          style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          keyboardType="email-address"
        />

        <TextInput
          value={password}
          placeholder="Password"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          onChangeText={setPassword}
          style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onSignInPress}
          disabled={loading || !emailAddress || !password}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Sign In</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={[styles.link, { color: colors.primary }]}>Forgot password?</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(auth)/sign-up')} style={{ marginTop: 16 }}>
          <Text style={[styles.link, { color: colors.primary }]}>Don't have an account? Sign up</Text>
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
    marginBottom: 32,
    textAlign: 'center',
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