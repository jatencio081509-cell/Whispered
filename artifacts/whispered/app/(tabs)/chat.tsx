import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationDrawer from '@/components/NavigationDrawer';

export default function ChatScreen() {
  const { user, isLoaded } = useUser();
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);

  if (!isLoaded || !user) {
    return <View style={styles.container}><Text style={{ color: colors.foreground }}>Loading...</Text></View>;
  }

  const partnerName = user.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!user.unsafeMetadata?.coupleId || !!user.unsafeMetadata?.partnerCode;

  // Load messages and subscribe to realtime updates
  useEffect(() => {
    const coupleIdValue = user.unsafeMetadata?.coupleId as string | undefined;
    if (!coupleIdValue) return;

    setCoupleId(coupleIdValue);

    // Load existing messages
    loadMessages(coupleIdValue);

    // Subscribe to realtime updates
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `couple_id=eq.${coupleIdValue}`,
        },
        (payload) => {
          const newMessage = {
            id: payload.new.id,
            text: payload.new.content,
            fromMe: payload.new.user_id === user.id,
            time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadMessages = async (coupleIdValue: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', coupleIdValue)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        id: msg.id,
        text: msg.content,
        fromMe: msg.user_id === user.id,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !coupleId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: Date.now().toString(),
          couple_id: coupleId,
          user_id: user.id,
          content: input.trim(),
        });

      if (error) throw error;

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isLinked) {
    return (
      <LinearGradient
        colors={['#0A1628', '#0D2840', '#0F3A5C', '#0A4A6E', '#0A1628']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.container}>
          <View style={styles.centered}>
            <View style={styles.iconContainer}>
              <Feather name="message-circle" size={64} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground, marginTop: 24 }]}>Chat</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, textAlign: 'center', marginTop: 12 }]}>
              Link with your partner to start chatting
            </Text>
            <Pressable onPress={() => router.push('/(auth)/link-partner')} style={[styles.button, { backgroundColor: colors.primary, marginTop: 32 }]}>
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Link Partner</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0A1628', '#0D2840', '#0F3A5C', '#0A4A6E', '#0A1628']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Feather name="heart" size={20} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                {partnerName ? partnerName : 'Partner'}
              </Text>
            </View>
          </View>
          <Pressable onPress={() => setShowNavigationDrawer(true)} style={styles.menuButton}>
            <Feather name="menu" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageWrapper, item.fromMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
              <View style={[styles.messageBubble, item.fromMe ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, { color: item.fromMe ? 'white' : colors.foreground }]}>
                  {item.text}
                </Text>
                <Text style={styles.messageTime}>{item.time}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.messagesContainer}
          style={styles.messagesList}
        />

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 40 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.mutedForeground}
              style={styles.input}
              onSubmitEditing={sendMessage}
            />
            <Pressable onPress={sendMessage} style={[styles.sendButton, input.trim() ? styles.sendButtonActive : null]}>
              <Feather name="send" size={20} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 16, lineHeight: 24 },
  button: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 999 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  header: { 
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(14, 165, 233, 0.2)',
    backgroundColor: 'rgba(15, 35, 65, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', lineHeight: 22 },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  theirMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: { 
    maxWidth: '80%', 
    padding: 16, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myMessage: { 
    backgroundColor: '#0EA5E9', 
    borderBottomRightRadius: 6,
  },
  theirMessage: { 
    backgroundColor: 'rgba(20, 40, 70, 0.8)', 
    borderBottomLeftRadius: 6,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  messageTime: { fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginTop: 6, alignSelf: 'flex-end' },
  inputContainer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(14, 165, 233, 0.2)', 
    backgroundColor: 'rgba(15, 35, 65, 0.3)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 60, 100, 0.5)',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: { 
    flex: 1, 
    color: 'white', 
    fontSize: 16,
    paddingVertical: 8,
  },
  sendButton: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 10,
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#0EA5E9',
    borderRadius: 20,
  },
  menuButton: {
    marginLeft: 16,
  },
});