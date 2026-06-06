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
import { LinearGradient } from "expo-linear-gradient";
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

  const loadHistory = useCallback(async () => {
    if (!couple) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${baseUrl}/api/messages`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
        if (data.length > 0) AsyncStorage.setItem("lastMessage", data[0].content);
      }
    } catch { } finally { setIsLoading(false); }
  }, [couple, getToken, baseUrl]);

  useEffect(() => {
    if (!couple) return;
    let ws: WebSocket | null = null;
    const connect = async () => {
      const token = await getToken();
      if (!token || !domain) return;
      ws = new WebSocket(`wss://${domain}/api/ws?token=${token}`);
      wsRef.current = ws;
      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === "message") {
            setMessages((prev) => {
              if (prev.find((m) => m.id === event.data.id)) return prev;
              return [event.data, ...prev];
            });
            AsyncStorage.setItem("lastMessage", event.data.content);
          } else if (event.type === "typing") {
            if (event.userId !== userId) setPartnerTyping(event.isTyping);
          } else if (event.type === "message_deleted") {
            setMessages((prev) => prev.map((m) => m.id === event.messageId ? { ...m, isDeleted: true } : m));
          }
        } catch { }
      };
      ws.onerror = () => {};
      ws.onclose = () => { wsRef.current = null; };
    };
    connect();
    loadHistory();
    return () => { ws?.close(); wsRef.current = null; };
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
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = { id: tempId, coupleId: couple?.id ?? "", senderId: userId ?? "", content: text, type: "text", isDeleted: false, createdAt: new Date().toISOString(), editedAt: null, seenAt: null };
    setMessages((prev) => [tempMsg, ...prev]);
    AsyncStorage.setItem("lastMessage", text);
    wsRef.current.send(JSON.stringify({ type: "message", content: text, msgType: "text" }));
    setInput("");
    sendTyping(false);
  };

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const renderMessage = ({ item: msg }: { item: Message }) => {
    const isMe = msg.senderId === userId;
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowPartner]}>
        {isMe ? (
          <LinearGradient
            colors={["#7B2FFF", "#0072FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.bubbleMe]}
          >
            {msg.isDeleted ? (
              <Text style={[styles.deletedText, { color: "rgba(255,255,255,0.5)" }]}>Message deleted</Text>
            ) : (
              <>
                <Text style={[styles.msgText, { color: "#FFFFFF" }]}>{msg.content}</Text>
                <View style={styles.msgMeta}>
                  <Text style={[styles.msgTime, { color: "rgba(255,255,255,0.55)" }]}>{formatTime(msg.createdAt)}</Text>
                  {msg.editedAt ? <Text style={[styles.editedLabel, { color: "rgba(255,255,255,0.45)" }]}>edited</Text> : null}
                </View>
              </>
            )}
          </LinearGradient>
        ) : (
          <View style={[styles.bubble, styles.bubblePartner, { backgroundColor: "rgba(0,229,255,0.05)", borderColor: "rgba(0,229,255,0.15)" }]}>
            {msg.isDeleted ? (
              <Text style={[styles.deletedText, { color: colors.mutedForeground }]}>Message deleted</Text>
            ) : (
              <>
                <Text style={[styles.msgText, { color: colors.text }]}>{msg.content}</Text>
                <View style={styles.msgMeta}>
                  <Text style={[styles.msgTime, { color: colors.mutedForeground }]}>{formatTime(msg.createdAt)}</Text>
                  {msg.editedAt ? <Text style={[styles.editedLabel, { color: colors.mutedForeground }]}>edited</Text> : null}
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  if (!couple) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <View style={styles.scanLine} />
        <Feather name="link" size={40} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Connect first</Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Link your account with your partner to start chatting</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scanLine} />
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View style={[styles.avatarCircle, { backgroundColor: "rgba(0,229,255,0.08)", borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={{ fontSize: 16 }}>💙</Text>
        </View>
        <View>
          <Text style={[styles.headerName, { color: colors.text }]}>{couple.partnerDisplayName || "Your partner"}</Text>
          <Text style={[styles.headerStatus, { color: colors.primary }]}>
            {partnerTyping ? "typing..." : "still in your current 🌊"}
          </Text>
        </View>
      </View>

      {/* Messages + Input */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
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
            contentContainerStyle={[styles.msgList, { paddingBottom: 16, paddingTop: 8 }]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!!messages.length}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListHeaderComponent={
              partnerTyping ? (
                <View style={[styles.typingBubble, { backgroundColor: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.15)", borderWidth: 1 }]}>
                  <Text style={[styles.typingDots, { color: colors.primary }]}>• • •</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Text style={{ fontSize: 40 }}>🌊</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Start your story</Text>
                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Say something special</Text>
              </View>
            }
          />
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
              style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.8 : 1 }]}
              onPress={sendMessage}
              disabled={!input.trim()}
            >
              <LinearGradient
                colors={input.trim() ? ["#00E5FF", "#0072FF"] : [colors.muted, colors.muted]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendBtnGradient}
              >
                <Feather name="send" size={15} color={input.trim() ? "#030712" : colors.mutedForeground} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  flex: { flex: 1 },
  centerContent: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  headerStatus: { fontSize: 12, fontFamily: "Inter_400Regular" },
  msgList: { paddingHorizontal: 16 },
  msgRow: { marginVertical: 3 },
  msgRowMe: { alignItems: "flex-end" },
  msgRowPartner: { alignItems: "flex-start" },
  bubble: { maxWidth: "80%", paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleMe: { borderRadius: 18, borderBottomRightRadius: 5 },
  bubblePartner: { borderRadius: 18, borderBottomLeftRadius: 5, borderWidth: 1 },
  msgText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  deletedText: { fontSize: 13, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  msgMeta: { flexDirection: "row", gap: 6, alignItems: "center" },
  msgTime: { fontSize: 10, fontFamily: "Inter_400Regular" },
  editedLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  typingBubble: { alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, borderBottomLeftRadius: 5, marginBottom: 4, marginLeft: 16 },
  typingDots: { fontSize: 16, letterSpacing: 4, fontFamily: "Inter_600SemiBold" },
  emptyChat: { alignItems: "center", justifyContent: "center", paddingTop: 100, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  inputBar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  inputWrapper: { flexDirection: "row", alignItems: "flex-end", borderRadius: 22, borderWidth: 1, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, gap: 8 },
  textInput: { flex: 1, maxHeight: 120, fontSize: 15, fontFamily: "Inter_400Regular", paddingTop: 4, paddingBottom: 4 },
  sendBtn: { borderRadius: 18, overflow: "hidden" },
  sendBtnGradient: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
});
