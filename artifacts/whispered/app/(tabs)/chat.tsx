import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function ChatScreen() {
  const { user, isLoaded } = useUser();
  const colors = useColors();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  if (!isLoaded || !user) {
    return <View style={styles.container}><Text style={{ color: colors.foreground }}>Loading...</Text></View>;
  }

  const partnerName = user.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!user.unsafeMetadata?.partnerCode;

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // TODO: In a full version, send to partner via backend or Clerk
  };

  if (!isLinked) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Feather name="message-circle" size={48} color={colors.mutedForeground} />
          <Text style={[styles.title, { color: colors.foreground, marginTop: 16 }]}>Chat</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, textAlign: 'center', marginTop: 8 }]}>
            Link with your partner to start chatting
          </Text>
          <Pressable onPress={() => router.push('/(auth)/link-partner')} style={[styles.button, { backgroundColor: colors.primary, marginTop: 24 }]}>
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Link Partner</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {partnerName ? `Chat with ${partnerName}` : 'Chat with Partner'}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.fromMe ? styles.myMessage : styles.theirMessage]}>
            <Text style={[styles.messageText, { color: item.fromMe ? 'white' : colors.foreground }]}>
              {item.text}
            </Text>
            <Text style={styles.messageTime}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          onSubmitEditing={sendMessage}
        />
        <Pressable onPress={sendMessage} style={styles.sendButton}>
          <Feather name="send" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  myMessage: { backgroundColor: '#00E5FF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: '#1A1A1A', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16 },
  messageTime: { fontSize: 11, color: '#888', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#111' },
  input: { flex: 1, backgroundColor: '#1A1A1A', color: 'white', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  sendButton: { justifyContent: 'center', alignItems: 'center', padding: 10 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 999 },
  buttonText: { fontSize: 16, fontWeight: '600' },
});