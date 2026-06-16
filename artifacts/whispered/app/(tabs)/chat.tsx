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
  Alert,
} from 'react-native';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationDrawer from '@/components/NavigationDrawer';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/syncClerkToSupabase';

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
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const partnerCode = user?.unsafeMetadata?.partnerCode as string | undefined;
  const partnerName = user?.unsafeMetadata?.partnerName as string | undefined;
  const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
  const isLinked = !!partnerCode;
  const myUserId = user?.id;

  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 50);
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    const nearBottom = distanceFromBottom < 120;
    setIsNearBottom(nearBottom);
  };

  const fetchMessages = async () => {
    if (!myUserId || !partnerUserId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`from_user_id.eq.${myUserId},to_user_id.eq.${myUserId}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const filtered = (data || []).filter(
        (msg: any) =>
          (msg.from_user_id === myUserId && msg.to_user_id === partnerUserId) ||
          (msg.from_user_id === partnerUserId && msg.to_user_id === myUserId)
      );

      const formatted = filtered.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        fromMe: msg.from_user_id === myUserId,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      setMessages(formatted);
      if (isNearBottom) scrollToBottom(false);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!isLinked || !myUserId || !partnerUserId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (
            (newMsg.from_user_id === myUserId && newMsg.to_user_id === partnerUserId) ||
            (newMsg.from_user_id === partnerUserId && newMsg.to_user_id === myUserId)
          ) {
            const formattedMsg: Message = {
              id: newMsg.id,
              text: newMsg.text,
              fromMe: newMsg.from_user_id === myUserId,
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, formattedMsg]);

            if (isNearBottom) {
              scrollToBottom(true);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to messages realtime');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLinked, myUserId, partnerUserId]);

  // Polling every second as backup
  useEffect(() => {
    if (!isLinked) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 1000);

    return () => clearInterval(interval);
  }, [isLinked]);

  useEffect(() => {
    if (isLinked) {
      fetchMessages();
    }
  }, [isLinked, partnerUserId]);

  const sendMessage = async () => {
    if (!input.trim() || !myUserId || !partnerUserId) {
      if (!partnerUserId) {
        Alert.alert('Linking Incomplete', 'Please re-link so both of you have each other\'s user ID.');
      }
      return;
    }

    const messageText = input.trim();
    setInput('');

    try {
      const client = supabaseAdmin || supabase;
      const { error } = await client.from('messages').insert({
        from_user_id: myUserId,
        to_user_id: partnerUserId,
        text: messageText,
      });

      if (error) {
        console.error('Error sending message:', error);
        Alert.alert('Failed to send', error.message);
      } else {
        setIsNearBottom(true);
        scrollToBottom(true);

        // Send push notification to partner
        if (partnerUserId) {
          supabase.functions.invoke('send-push-notification', {
            body: {
              toUserId: partnerUserId,
              title: partnerName || 'New message',
              body: messageText,
            },
          }).catch(console.error);
        }
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      Alert.alert('Failed to send', err.message || 'Unknown error');
    }
  };

  const jumpToBottom = () => {
    setIsNearBottom(true);
    scrollToBottom(true);
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

  if (!isLoaded || !user) {
    return <View style={styles.container}><Text style={{ color: colors.foreground }}>Loading...</Text></View>;
  }

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scanLine} />
      <View style={{ paddingTop: insets.top, paddingHorizontal: 20 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {partnerName ? partnerName : 'Partner'}
          </Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (isNearBottom) scrollToBottom(false);
          }}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          showsVerticalScrollIndicator={false}
        />

        {!isNearBottom && messages.length > 0 && (
          <Pressable onPress={jumpToBottom} style={styles.jumpToBottomButton}>
            <Feather name="arrow-down" size={18} color="#fff" />
          </Pressable>
        )}
      </View>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 50 }]}>
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

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
  messagesContainer: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  messageRow: { flexDirection: 'row', marginVertical: 4 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  myMessage: { backgroundColor: '#00E5FF', borderBottomRightRadius: 6 },
  theirMessage: { backgroundColor: '#2C2C2E', borderBottomLeftRadius: 6 },
  messageText: { fontSize: 16, lineHeight: 22 },
  messageTime: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { paddingHorizontal: 12, paddingTop: 10, backgroundColor: 'rgba(17,17,17,0.9)', borderTopWidth: 1, borderTopColor: '#222' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 22, paddingHorizontal: 4, paddingVertical: 4 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100 },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#00E5FF', justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  sendButtonDisabled: { backgroundColor: '#333' },
  jumpToBottomButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#00E5FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 999 },
  buttonText: { fontSize: 16, fontWeight: '600' },
});