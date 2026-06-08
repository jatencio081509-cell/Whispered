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
import { Feather } from '@expo/vector-icons';

export default function ChatScreen() {
  const { user, isLoaded } = useUser();
  const colors = useColors();

  const [messages, setMessages] = useState([
    { id: '1', text: 'Hey! How are you feeling today?', fromMe: false },
  ]);
  const [inputText, setInputText] = useState('');

  if (!isLoaded || !user) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const partnerName = user.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!user.unsafeMetadata?.partnerCode;

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      fromMe: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate partner reply (for demo)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "That's nice! 😊",
        fromMe: false,
      }]);
    }, 800);
  };

  if (!isLinked) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Feather name="message-circle" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Chat with your partner</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Link with your partner first to start chatting
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Chat with {partnerName || 'Partner'}
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.fromMe ? styles.myMessage : styles.theirMessage]}>
            <Text style={[styles.messageText, { color: item.fromMe ? '#000' : colors.foreground }]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          onSubmitEditing={sendMessage}
        />
        <Pressable onPress={sendMessage} style={styles.sendButton}>
          <Feather name="send" size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  messagesList: { flex: 1 },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20, marginBottom: 8 },
  myMessage: { backgroundColor: '#00E5FF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: '#1A1A1A', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#333', backgroundColor: '#111' },
  input: { flex: 1, backgroundColor: '#1A1A1A', color: 'white', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, fontSize: 16, marginRight: 10 },
  sendButton: { backgroundColor: '#00E5FF', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 16 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 8 },
});