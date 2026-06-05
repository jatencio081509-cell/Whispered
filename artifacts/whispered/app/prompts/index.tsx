import React, { useEffect, useState } from "react";
import {
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const PROMPTS = [
  "What's a small thing I did recently that made you feel loved?",
  "If we could live anywhere in the world, where would you choose and why?",
  "What's your favorite memory of us so far?",
  "What's one thing you want us to experience together this year?",
  "Describe me in three words — but they can't be ordinary.",
  "What song reminds you of us, and why?",
  "What's something you've never told me but want to share?",
  "If you could relive one day of our relationship, which would it be?",
  "What do you think our biggest strength as a couple is?",
  "What's something small I do that makes your day better?",
  "Where do you see us in 5 years?",
  "What's a dream you have that you haven't shared with me yet?",
  "What does home feel like to you?",
  "If you could give our relationship a title, what would it be?",
];

interface PromptRecord {
  date: string;
  prompt: string;
  myAnswer: string;
  partnerAnswer: string;
  revealed: boolean;
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getDailyPrompt(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  return PROMPTS[dayOfYear % PROMPTS.length];
}

export default function PromptsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [todayRecord, setTodayRecord] = useState<PromptRecord | null>(null);
  const [myAnswer, setMyAnswer] = useState("");
  const [archive, setArchive] = useState<PromptRecord[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const todayKey = getTodayKey();
  const todayPrompt = getDailyPrompt();

  useEffect(() => {
    AsyncStorage.multiGet(["prompt_" + todayKey, "prompts_archive"]).then(
      ([today, arch]) => {
        if (today[1]) {
          const r: PromptRecord = JSON.parse(today[1]);
          setTodayRecord(r);
          setMyAnswer(r.myAnswer);
          setSubmitted(!!r.myAnswer);
        }
        if (arch[1]) setArchive(JSON.parse(arch[1]));
      },
    );
  }, []);

  const submitAnswer = () => {
    if (!myAnswer.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PromptRecord = {
      date: todayKey,
      prompt: todayPrompt,
      myAnswer: myAnswer.trim(),
      partnerAnswer: "",
      revealed: false,
    };
    setTodayRecord(record);
    setSubmitted(true);
    AsyncStorage.setItem("prompt_" + todayKey, JSON.stringify(record));

    const newArchive = [record, ...archive.filter((a) => a.date !== todayKey)];
    setArchive(newArchive);
    AsyncStorage.setItem("prompts_archive", JSON.stringify(newArchive));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Daily Prompts
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.inner,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Prompt */}
        <LinearGradient
          colors={[`${colors.accent}30`, `${colors.primary}20`]}
          style={[styles.promptCard, { borderColor: `${colors.accent}40` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.promptBadge}>
            <View
              style={[
                styles.promptDot,
                { backgroundColor: colors.primary },
              ]}
            />
            <Text style={[styles.promptBadgeText, { color: colors.primary }]}>
              Today&apos;s prompt
            </Text>
          </View>
          <Text style={[styles.promptText, { color: colors.text }]}>
            {todayPrompt}
          </Text>
        </LinearGradient>

        {!submitted ? (
          <View style={styles.answerSection}>
            <Text style={[styles.answerLabel, { color: colors.mutedForeground }]}>
              Your answer
            </Text>
            <TextInput
              style={[
                styles.answerInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={myAnswer}
              onChangeText={setMyAnswer}
              placeholder="Write your honest answer..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: !myAnswer.trim() || pressed ? 0.7 : 1,
                },
              ]}
              onPress={submitAnswer}
              disabled={!myAnswer.trim()}
            >
              <Feather name="send" size={16} color={colors.primaryForeground} />
              <Text
                style={[styles.submitText, { color: colors.primaryForeground }]}
              >
                Submit answer
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.submittedCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.submittedHeader}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={[styles.submittedTitle, { color: colors.success }]}>
                Your answer saved
              </Text>
            </View>
            <Text style={[styles.myAnswerText, { color: colors.text }]}>
              {myAnswer}
            </Text>
            <Text
              style={[styles.waitingText, { color: colors.mutedForeground }]}
            >
              Waiting for your partner to answer... Both answers reveal together.
            </Text>
          </View>
        )}

        {/* Archive */}
        {archive.length > 1 ? (
          <>
            <Text
              style={[styles.archiveTitle, { color: colors.mutedForeground }]}
            >
              Past prompts
            </Text>
            {archive
              .filter((a) => a.date !== todayKey)
              .map((a) => (
                <View
                  key={a.date}
                  style={[
                    styles.archiveCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.archiveDate,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {formatDate(a.date)}
                  </Text>
                  <Text
                    style={[styles.archivePrompt, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {a.prompt}
                  </Text>
                  <Text
                    style={[
                      styles.archiveAnswer,
                      { color: colors.mutedForeground },
                    ]}
                    numberOfLines={2}
                  >
                    You: {a.myAnswer}
                  </Text>
                </View>
              ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  inner: { padding: 20, gap: 16 },
  promptCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 12 },
  promptBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  promptDot: { width: 6, height: 6, borderRadius: 3 },
  promptBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  promptText: { fontSize: 18, fontFamily: "Inter_500Medium", lineHeight: 26 },
  answerSection: { gap: 12 },
  answerLabel: { fontSize: 13, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.3 },
  answerInput: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  submitText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  submittedCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 10 },
  submittedHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  submittedTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  myAnswerText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  waitingText: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  archiveTitle: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  archiveCard: { padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  archiveDate: { fontSize: 11, fontFamily: "Inter_500Medium" },
  archivePrompt: { fontSize: 14, fontFamily: "Inter_500Medium" },
  archiveAnswer: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
