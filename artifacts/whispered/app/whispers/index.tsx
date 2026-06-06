import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

type RevealCondition = "time_delay" | "both_online" | "streak_milestone" | "anniversary" | "prompt_complete";

interface Whisper {
  id: string;
  content: string;
  revealCondition: RevealCondition;
  revealValue: string;
  revealed: boolean;
  createdAt: string;
  revealedAt?: string;
}

const CONDITIONS: { key: RevealCondition; label: string; desc: string; icon: string }[] = [
  { key: "time_delay",       label: "After a time delay",    desc: "Unlocks after chosen duration",       icon: "clock"          },
  { key: "both_online",      label: "When both online",      desc: "Reveals when you're both in the app", icon: "heart"          },
  { key: "streak_milestone", label: "Streak milestone",      desc: "Reveals at a streak count",           icon: "zap"            },
  { key: "anniversary",      label: "Anniversary date",      desc: "Unlocks on a special date",           icon: "calendar"       },
  { key: "prompt_complete",  label: "After prompt",          desc: "Reveals after daily prompt",          icon: "message-square" },
];

export default function WhispersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [condition, setCondition] = useState<RevealCondition>("time_delay");
  const [condValue, setCondValue] = useState("");
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem("whispers").then((d) => { if (d) setWhispers(JSON.parse(d)); });
  }, []);

  const save = (updated: Whisper[]) => {
    setWhispers(updated);
    AsyncStorage.setItem("whispers", JSON.stringify(updated));
  };

  const createWhisper = () => {
    if (!content.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const w: Whisper = { id: Date.now().toString(36), content: content.trim(), revealCondition: condition, revealValue: condValue.trim(), revealed: false, createdAt: new Date().toISOString() };
    save([w, ...whispers]);
    setShowCreate(false); setContent(""); setCondValue("");
  };

  const revealWhisper = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    save(whispers.map((w) => w.id === id ? { ...w, revealed: true, revealedAt: new Date().toISOString() } : w));
  };

  const deleteWhisper = (id: string) => save(whispers.filter((w) => w.id !== id));
  const getConditionInfo = (key: RevealCondition) => CONDITIONS.find((c) => c.key === key) ?? CONDITIONS[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scanLine} />
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Whispers</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: "rgba(0,229,255,0.1)", borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => setShowCreate(true)}
        >
          <Feather name="plus" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={whispers}
        keyExtractor={(w) => w.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <LinearGradient
            colors={["rgba(0,229,255,0.12)", "rgba(123,47,255,0.08)"]}
            style={[styles.heroBanner, { borderColor: "rgba(0,229,255,0.2)" }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={{ fontSize: 24 }}>🌊</Text>
            <View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Whisper Moments</Text>
              <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
                Hidden messages that unlock at the perfect moment
              </Text>
            </View>
          </LinearGradient>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No whispers yet. Create your first hidden message.
            </Text>
          </View>
        }
        renderItem={({ item: w }) => {
          const cond = getConditionInfo(w.revealCondition);
          return (
            <View style={[styles.whisperCard, { backgroundColor: colors.card, borderColor: w.revealed ? "rgba(34,211,165,0.3)" : colors.border }]}>
              <View style={styles.whisperHeader}>
                <View style={[styles.condBadge, { backgroundColor: "rgba(123,47,255,0.15)", borderColor: "rgba(123,47,255,0.3)", borderWidth: 1 }]}>
                  <Feather name={cond.icon as any} size={12} color="#7B2FFF" />
                  <Text style={[styles.condLabel, { color: "#7B2FFF" }]}>{cond.label}</Text>
                </View>
                <Pressable onPress={() => deleteWhisper(w.id)} hitSlop={8}>
                  <Feather name="trash-2" size={14} color={colors.mutedForeground} />
                </Pressable>
              </View>

              {w.revealed ? (
                <>
                  <Text style={[styles.whisperContent, { color: colors.text }]}>{w.content}</Text>
                  <View style={styles.revealedBadge}>
                    <Feather name="unlock" size={12} color={colors.success} />
                    <Text style={[styles.revealedText, { color: colors.success }]}>Revealed</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.lockedContent, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                    <Feather name="lock" size={18} color={colors.mutedForeground} />
                    <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>Hidden until condition met</Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.previewBtn, { backgroundColor: "rgba(0,229,255,0.08)", borderColor: "rgba(0,229,255,0.22)", borderWidth: 1, opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => revealWhisper(w.id)}
                  >
                    <Text style={[styles.previewBtnText, { color: colors.primary }]}>Reveal now</Text>
                  </Pressable>
                </>
              )}
            </View>
          );
        }}
      />

      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHandle, { backgroundColor: "rgba(0,229,255,0.25)" }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create whisper</Text>

            <TextInput
              style={[styles.contentInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your hidden message..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.condTitle, { color: colors.mutedForeground }]}>Reveal when</Text>
            <View style={styles.condGrid}>
              {CONDITIONS.map((c) => (
                <Pressable
                  key={c.key}
                  style={[
                    styles.condBtn,
                    {
                      backgroundColor: condition === c.key ? "rgba(0,229,255,0.1)" : colors.surface,
                      borderColor: condition === c.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setCondition(c.key)}
                >
                  <Feather name={c.icon as any} size={14} color={condition === c.key ? colors.primary : colors.mutedForeground} />
                  <Text style={[styles.condBtnText, { color: condition === c.key ? colors.primary : colors.mutedForeground }]}>{c.label}</Text>
                </Pressable>
              ))}
            </View>

            {(condition === "time_delay" || condition === "streak_milestone" || condition === "anniversary") ? (
              <TextInput
                style={[styles.valueInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                value={condValue}
                onChangeText={setCondValue}
                placeholder={condition === "time_delay" ? "e.g. 7 days" : condition === "streak_milestone" ? "e.g. 30" : "e.g. Jun 15, 2025"}
                placeholderTextColor={colors.mutedForeground}
              />
            ) : null}

            <View style={styles.modalBtns}>
              <Pressable style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowCreate(false)}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.createBtn, { backgroundColor: colors.primary, opacity: !content.trim() ? 0.5 : 1 }]}
                onPress={createWhisper}
                disabled={!content.trim()}
              >
                <Text style={[styles.createBtnText, { color: colors.primaryForeground }]}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  list: { padding: 20, gap: 14 },
  heroBanner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 4 },
  heroTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  heroSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  empty: { alignItems: "center", paddingTop: 40 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  whisperCard: { padding: 16, borderRadius: 18, borderWidth: 1, gap: 12 },
  whisperHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  condBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  condLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  whisperContent: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  revealedBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  revealedText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  lockedContent: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12 },
  lockedText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  previewBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, alignSelf: "flex-start" },
  previewBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 14, maxHeight: "90%" },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  contentInput: { minHeight: 100, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  condTitle: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.8 },
  condGrid: { gap: 8 },
  condBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  condBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  valueInput: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  modalBtns: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  createBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  createBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
