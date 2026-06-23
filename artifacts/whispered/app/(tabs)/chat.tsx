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
import ThemeBackground from '@/components/ThemeBackground';
import { supabase } from '@/lib/supabase';

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
  const [initialLoad, setInitialLoad] = useState(true);

  const partnerCode = user?.unsafeMetadata?.partnerCode as string | undefined;
  const partnerName = user?.unsafeMetadata?.partnerName as string | undefined;
  const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
  const isLinked = !!partnerCode;
  const myUserId = user?.id;

  const formatMessageTime = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Less than 24 hours: show time
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // Over 24 hours: show date
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

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

  const fetchMessages = async (shouldScroll = false) => {
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
        time: formatMessageTime(msg.created_at),
      }));

      const previousLength = messages.length;
      setMessages(formatted);

      // Scroll to bottom on initial load or if new messages were added and user is near bottom
      if (shouldScroll) {
        if (initialLoad || (formatted.length > previousLength && isNearBottom)) {
          scrollToBottom(false);
        }
      }
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
              time: formatMessageTime(newMsg.created_at),
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
      fetchMessages(false); // Don't auto-scroll on polling
    }, 1000);

    return () => clearInterval(interval);
  }, [isLinked]);

  useEffect(() => {
    if (isLinked) {
      fetchMessages(true); // Scroll on initial load
    }
  }, [isLinked, partnerUserId]);

  // Scroll to bottom on initial load after messages are rendered
  useEffect(() => {
    if (initialLoad && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom(false);
        setInitialLoad(false);
      }, 100);
    }
  }, [messages, initialLoad]);

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
      const { error } = await supabase.from('messages').insert({
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
      <View style={[styles.messageBubble, item.fromMe ? styles.myMessage : styles.theirMessage, item.fromMe && { backgroundColor: colors.chatBoxes }]}>
        <Text style={[styles.messageText, { color: item.fromMe ? colors.chatBoxesForeground : colors.foreground }]}>
          {item.text}
        </Text>
        <Text style={[styles.messageTime, { color: item.fromMe ? colors.chatBoxesForeground : colors.mutedForeground }]}>
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemeBackground>
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

      <View style={[styles.inputBar, { backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingBottom: insets.bottom + 50 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message"
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
        </ThemeBackground>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', fontFamily: 'System', color: '#FFFFFF' },
  messagesContainer: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  messageRow: { flexDirection: 'row', marginVertical: 4 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 4 },
  myMessage: { backgroundColor: '#00E5FF', borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: 'rgba(0, 0, 0, 0.6)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  messageText: { fontSize: 16, lineHeight: 22, fontFamily: 'System' },
  messageTime: { fontSize: 11, marginTop: 4, alignSelf: 'flex-end', fontFamily: 'Courier' },
  inputBar: { paddingHorizontal: 12, paddingTop: 10, backgroundColor: 'rgba(0, 0, 0, 0.8)', borderTopWidth: 1, borderTopColor: 'rgba(0, 229, 255, 0.2)' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontFamily: 'System' },
  sendButton: { width: 36, height: 36, borderRadius: 4, backgroundColor: '#00E5FF', justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  sendButtonDisabled: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  jumpToBottomButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#00E5FF',
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  title: { fontSize: 20, fontWeight: '600', fontFamily: 'System' },
  subtitle: { fontSize: 16, fontFamily: 'System' },
  button: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 4, borderWidth: 1, borderColor: '#00E5FF' },
  buttonText: { fontSize: 16, fontWeight: '600', fontFamily: 'System' },
});