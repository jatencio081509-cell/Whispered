import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Message {
  id: string;
  coupleId: string;
  senderId: string;
  content: string;
  type: string;
  isDeleted: boolean;
  createdAt: string;
  editedAt: string | null;
  seenAt: string | null;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getToken, userId } = useAuth();
  const { couple } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const baseUrl = domain ? `https://${domain}` : "";

  // Load message history
  const loadHistory = useCallback(async () => {
    if (!couple) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
        if (data.length > 0) {
          AsyncStorage.setItem("lastMessage", data[0].content);
        }
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false);
    }
  }, [couple, getToken, baseUrl]);

  // WebSocket connection
  useEffect(() => {
    if (!couple) return;

    let ws: WebSocket | null = null;

    const connect = async () => {
      const token = await getToken();
      if (!token || !domain) return;

      const wsUrl = `wss://${domain}/api/ws?token=${token}`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "message") {
            setMessages((prev) => {
              const exists = prev.find((m) => m.id === event.data.id);
              if (exists) return prev;
              return [event.data, ...prev];
            });
            AsyncStorage.setItem("lastMessage", event.data.content);
          } else if (event.type === "typing") {
            if (event.userId !== userId) {
              setPartnerTyping(event.isTyping);
            }
          } else if (event.type === "message_deleted") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === event.messageId ? { ...m, isDeleted: true } : m,
              ),
            );
          }
        } catch {
          // ignore
        }
      };

      ws.onerror = () => {};
      ws.onclose = () => {
        wsRef.current = null;
      };
    };

    connect();
    loadHistory();

    return () => {
      ws?.close();
      wsRef.current = null;
    };
  }, [couple]);

  const sendTyping = (isTyping: boolean) => {
    wsRef.current?.send(JSON.stringify({ type: "typing", isTyping }));
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    sendTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => sendTyping(false), 2000);
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      coupleId: couple?.id ?? "",
      senderId: userId ?? "",
      content: text,
      type: "text",
      isDeleted: false,
      createdAt: new Date().toISOString(),
      editedAt: null,
      seenAt: null,
    };
    setMessages((prev) => [tempMsg, ...prev]);
    AsyncStorage.setItem("lastMessage", text);

    wsRef.current.send(
      JSON.stringify({ type: "message", content: text, msgType: "text" }),
    );
    setInput("");
    sendTyping(false);
  };

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const renderMessage = ({ item: msg }: { item: Message }) => {
    const isMe = msg.senderId === userId;
    return (
      <View
        style={[
          styles.msgRow,
          isMe ? styles.msgRowMe : styles.msgRowPartner,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
          ]}
        >
          {msg.isDeleted ? (
            <Text
              style={[styles.deletedText, { color: colors.mutedForeground }]}
            >
              Message deleted
            </Text>
          ) : (
            <>
              <Text
                style={[
                  styles.msgText,
                  { color: isMe ? colors.primaryForeground : colors.text },
                ]}
              >
                {msg.content}
              </Text>
              <View style={styles.msgMeta}>
                <Text
                  style={[
                    styles.msgTime,
                    {
                      color: isMe
                        ? `${colors.primaryForeground}80`
                        : colors.mutedForeground,
                    },
                  ]}
                >
                  {formatTime(msg.createdAt)}
                </Text>
                {msg.editedAt ? (
                  <Text
                    style={[
                      styles.editedLabel,
                      { color: isMe ? `${colors.primaryForeground}70` : colors.mutedForeground },
                    ]}
                  >
                    edited
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  if (!couple) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: colors.background },
        ]}
      >
        <Feather name="link" size={40} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Connect first
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
          Link your account with your partner to start chatting
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={[styles.avatarCircle, { backgroundColor: `${colors.primary}30` }]}
        >
          <Feather name="heart" size={16} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.headerName, { color: colors.text }]}>
            {couple.partnerDisplayName || "Your partner"}
          </Text>
          <Text style={[styles.headerStatus, { color: colors.mutedForeground }]}>
            {partnerTyping ? "typing..." : "in your heart"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(m) => m.id}
            inverted
            contentContainerStyle={[
              styles.msgList,
              { paddingBottom: 16, paddingTop: 8 },
            ]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!!messages.length}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListHeaderComponent={
              partnerTyping ? (
                <View style={[styles.typingBubble, { backgroundColor: colors.card }]}>
                  <Text style={[styles.typingDots, { color: colors.mutedForeground }]}>
                    •••
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Feather name="message-circle" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Start your story
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
                >
                  Say something special
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={input}
              onChangeText={handleInputChange}
              placeholder="Whisper something..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={1000}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor:
                    input.trim() ? colors.primary : colors.muted,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <Feather name="send" size={16} color={colors.primaryForeground} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  headerStatus: { fontSize: 12, fontFamily: "Inter_400Regular" },
  msgList: { paddingHorizontal: 16 },
  msgRow: { marginVertical: 3 },
  msgRowMe: { alignItems: "flex-end" },
  msgRowPartner: { alignItems: "flex-start" },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 4,
  },
  msgText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  deletedText: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  msgMeta: { flexDirection: "row", gap: 6, alignItems: "center" },
  msgTime: { fontSize: 10, fontFamily: "Inter_400Regular" },
  editedLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  typingBubble: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 4,
    marginLeft: 16,
  },
  typingDots: { fontSize: 20, letterSpacing: 3 },
  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 22,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    paddingTop: 4,
    paddingBottom: 4,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
