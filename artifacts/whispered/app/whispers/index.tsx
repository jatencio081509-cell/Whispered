import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import * as Haptics from "expo-haptics";
import { useUser } from '@clerk/expo';
import { supabase } from '@/lib/supabase';
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';

type RevealCondition = "time_delay" | "both_online" | "streak_milestone" | "anniversary" | "prompt_complete";

interface Whisper {
  id: string;
  content: string;
  revealCondition: RevealCondition;
  revealValue: string;
  user1_id: string;
  user2_id: string | null;
  revealed: boolean;
  created_at: string;
  revealed_at: string | null;
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
  const { user } = useUser();
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [condition, setCondition] = useState<RevealCondition>("time_delay");
  const [condValue, setCondValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const myUserId = user?.id;
  const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;

  // Calculate countdown for time delay whispers
  const calculateCountdown = (whisper: Whisper): string | null => {
    if (whisper.revealed || whisper.revealCondition !== "time_delay") return null;
    
    const createdAt = new Date(whisper.created_at).getTime();
    const delayMs = parseDelayToMs(whisper.revealValue);
    const revealTime = createdAt + delayMs;
    const now = Date.now();
    const remainingMs = revealTime - now;
    
    if (remainingMs <= 0) return "Ready to reveal";
    
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const parseDelayToMs = (delayStr: string): number => {
    const match = delayStr.match(/(\d+)\s*(day|days|hour|hours|min|mins|minute|minutes|second|seconds|s|m|h|d)/i);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
    
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'd':
      case 'day':
      case 'days':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
      case 'hour':
      case 'hours':
        return value * 60 * 60 * 1000;
      case 'm':
      case 'min':
      case 'mins':
      case 'minute':
      case 'minutes':
        return value * 60 * 1000;
      case 's':
      case 'second':
      case 'seconds':
        return value * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  };

  // Update countdowns every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, string> = {};
      whispers.forEach((whisper) => {
        const countdown = calculateCountdown(whisper);
        if (countdown) {
          newCountdowns[whisper.id] = countdown;
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [whispers]);

  const fetchWhispers = async () => {
    if (!myUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('whispers')
        .select('*')
        .or(`user1_id.eq.${myUserId},user2_id.eq.${myUserId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching whispers:', error);
        return;
      }

      setWhispers(data || []);
    } catch (err) {
      console.error('Failed to fetch whispers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myUserId) {
      fetchWhispers();

      // Set up real-time subscription
      const channel = supabase
        .channel('whispers_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'whispers',
          },
          () => {
            fetchWhispers();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [myUserId]);

  const createWhisper = async () => {
    if (!content.trim() || !myUserId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const { error } = await supabase.from('whispers').insert({
        content: content.trim(),
        reveal_condition: condition,
        reveal_value: condValue.trim(),
        user1_id: myUserId,
        user2_id: partnerUserId || null,
        revealed: false,
      });

      if (error) {
        console.error('Error creating whisper:', error);
        alert('Failed to create whisper: ' + error.message);
        return;
      }

      setShowCreate(false);
      setContent("");
      setCondValue("");
      await fetchWhispers();
    } catch (err) {
      console.error('Failed to create whisper:', err);
      alert('Failed to create whisper');
    }
  };

  const revealWhisper = async (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      const { error } = await supabase
        .from('whispers')
        .update({ revealed: true, revealed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error revealing whisper:', error);
        alert('Failed to reveal whisper: ' + error.message);
        return;
      }

      await fetchWhispers();
    } catch (err) {
      console.error('Failed to reveal whisper:', err);
      alert('Failed to reveal whisper');
    }
  };

  const deleteWhisper = async (id: string) => {
    try {
      const { error } = await supabase.from('whispers').delete().eq('id', id);

      if (error) {
        console.error('Error deleting whisper:', error);
        return;
      }

      await fetchWhispers();
    } catch (err) {
      console.error('Failed to delete whisper:', err);
    }
  };

  const getConditionInfo = (key: RevealCondition) => CONDITIONS.find((c) => c.key === key) ?? CONDITIONS[0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemeBackground>

        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border, zIndex: 20 }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Whispers</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>

        <Pressable
          style={[styles.floatingAddBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreate(true)}
        >
          <Feather name="plus" size={24} color={colors.primaryForeground} />
        </Pressable>

        <FlatList
          data={whispers}
          keyExtractor={(w) => w.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            loading ? (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.text }]}>Loading...</Text>
              </View>
            ) : (
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
            )
          }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No whispers yet. Create your first hidden message.
              </Text>
            </View>
          )
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
                  {w.revealCondition === "time_delay" && countdowns[w.id] && (
                    <View style={styles.countdownBadge}>
                      <Feather name="clock" size={12} color={colors.primary} />
                      <Text style={[styles.countdownText, { color: colors.primary }]}>{countdowns[w.id]}</Text>
                    </View>
                  )}
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
        <Pressable style={{ flex: 1 }} onPress={() => { Keyboard.dismiss(); setShowCreate(false); }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{ flex: 1 }}
          >
            <Pressable style={styles.modalOverlay} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ScrollView
                  keyboardDismissMode="interactive"
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
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
                </ScrollView>
              </View>
            </Pressable>
        </KeyboardAvoidingView>
        </Pressable>
      </Modal>

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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontFamily: "System", fontWeight: '600' },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
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
  countdownBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  countdownText: { fontSize: 12, fontFamily: "Inter_500Medium" },
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
