import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ListRenderItem,
} from 'react-native';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
};

export default function ChatScreen() {
  const { user, isLoaded } = useUser();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const partnerCode = user?.unsafeMetadata?.partnerCode as string | undefined;
  const partnerName = user?.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!partnerCode;
  const chatKey = `chat_${partnerCode || 'solo'}`;

  // Load persisted messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem(chatKey);
        if (stored) {
          setMessages(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load chat messages', e);
      }
    };
    if (isLinked) {
      loadMessages();
    }
  }, [chatKey, isLinked]);

  // Save messages
  useEffect(() => {
    const saveMessages = async () => {
      try {
        await AsyncStorage.setItem(chatKey, JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save chat messages', e);
      }
    };
    if (isLinked && messages.length > 0) {
      saveMessages();
    }
  }, [messages, chatKey, isLinked]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  if (!isLoaded || !user) {
    return <View style={styles.container}><Text style={{ color: colors.foreground }}>Loading...</Text></View>;
  }

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      fromMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <View style={[styles.messageRow, item.fromMe ? styles.rowRight : styles.rowLeft]}>
      <View style={[styles.messageBubble, item.fromMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, { color: item.fromMe ? '#fff' : colors.foreground }]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, { color: item.fromMe ? 'rgba(255,255,255,0.7)' : colors.mutedForeground }]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

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
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>
          {partnerName ? partnerName : 'Partner'}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="iMessage"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline={false}
          />
          <Pressable 
            onPress={sendMessage} 
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            disabled={!input.trim()}
          >
            <Feather name="send" size={18} color={input.trim() ? colors.primary : colors.mutedForeground} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#222', 
    backgroundColor: '#111' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },
  messagesContainer: { 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    flexGrow: 1 
  },
  messageRow: { 
    flexDirection: 'row', 
    marginVertical: 4 
  },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  messageBubble: { 
    maxWidth: '78%', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myMessage: { 
    backgroundColor: '#00E5FF', 
    borderBottomRightRadius: 6 
  },
  theirMessage: { 
    backgroundColor: '#2C2C2E', 
    borderBottomLeftRadius: 6 
  },
  messageText: { 
    fontSize: 16,
    lineHeight: 22 
  },
  messageTime: { 
    fontSize: 11, 
    marginTop: 4, 
    alignSelf: 'flex-end' 
  },
  inputBar: { 
    paddingHorizontal: 12, 
    paddingTop: 10, 
    backgroundColor: '#111', 
    borderTopWidth: 1, 
    borderTopColor: '#222' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1C1C1E', 
    borderRadius: 22, 
    paddingHorizontal: 4, 
    paddingVertical: 4 
  },
  input: { 
    flex: 1, 
    color: '#FFFFFF', 
    fontSize: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    maxHeight: 100 
  },
  sendButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#00E5FF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 6 
  },
  sendButtonDisabled: { 
    backgroundColor: '#333' 
  },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 999 },
  buttonText: { fontSize: 16, fontWeight: '600' },
});