import React, { useEffect, useState } from "react";
import {
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
import { useColors } from "@/hooks/useColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("goals").then((d) => {
      if (d) setGoals(JSON.parse(d));
    });
  }, []);

  const save = (updated: Goal[]) => {
    setGoals(updated);
    AsyncStorage.setItem("goals", JSON.stringify(updated));
  };

  const openCreate = () => {
    setEditGoal(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setShowModal(true);
  };

  const addGoal = () => {
    if (!title.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newGoal: Goal = {
      id: Date.now().toString(36),
      title: title.trim(),
      description: description.trim(),
      progress: 0,
      dueDate: dueDate.trim() || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    save([newGoal, ...goals]);
    setShowModal(false);
  };

  const updateProgress = (id: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = goals.map((g) =>
      g.id === id
        ? {
            ...g,
            progress: Math.max(0, Math.min(100, g.progress + delta)),
            completed: g.progress + delta >= 100,
          }
        : g,
    );
    save(updated);
  };

  const deleteGoal = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    save(goals.filter((g) => g.id !== id));
  };

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

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
          Shared Goals
        </Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openCreate}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {goals.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: `${colors.accent}20` },
              ]}
            >
              <Feather name="target" size={32} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No goals yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
            >
              Create goals to work towards together
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={openCreate}
            >
              <Feather name="plus" size={16} color={colors.primaryForeground} />
              <Text
                style={[styles.emptyBtnText, { color: colors.primaryForeground }]}
              >
                Add first goal
              </Text>
            </Pressable>
          </View>
        ) : (
          goals.map((goal) => (
            <View
              key={goal.id}
              style={[
                styles.goalCard,
                {
                  backgroundColor: colors.card,
                  borderColor: goal.completed
                    ? `${colors.success}50`
                    : colors.border,
                },
              ]}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleRow}>
                  <View
                    style={[
                      styles.goalDot,
                      {
                        backgroundColor: goal.completed
                          ? colors.success
                          : colors.primary,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.goalTitle,
                      {
                        color: colors.text,
                        textDecorationLine: goal.completed
                          ? "line-through"
                          : "none",
                      },
                    ]}
                  >
                    {goal.title}
                  </Text>
                </View>
                <Pressable onPress={() => deleteGoal(goal.id)} hitSlop={8}>
                  <Feather
                    name="trash-2"
                    size={14}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>

              {goal.description ? (
                <Text
                  style={[styles.goalDesc, { color: colors.mutedForeground }]}
                >
                  {goal.description}
                </Text>
              ) : null}

              {goal.dueDate ? (
                <View style={styles.dueDateRow}>
                  <Feather
                    name="calendar"
                    size={12}
                    color={colors.mutedForeground}
                  />
                  <Text
                    style={[styles.dueDate, { color: colors.mutedForeground }]}
                  >
                    {goal.dueDate}
                  </Text>
                </View>
              ) : null}

              <View style={styles.progressArea}>
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${goal.progress}%`,
                        backgroundColor: goal.completed
                          ? colors.success
                          : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>
                  {goal.progress}%
                </Text>
              </View>

              {!goal.completed ? (
                <View style={styles.progressBtns}>
                  <Pressable
                    style={[
                      styles.progressBtn,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => updateProgress(goal.id, -10)}
                  >
                    <Feather name="minus" size={14} color={colors.text} />
                  </Pressable>
                  <Pressable
                    style={[
                      styles.progressBtn,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => updateProgress(goal.id, 10)}
                  >
                    <Feather name="plus" size={14} color={colors.text} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.completedBadge}>
                  <Feather name="check-circle" size={14} color={colors.success} />
                  <Text style={[styles.completedText, { color: colors.success }]}>
                    Completed
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              New goal
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Goal title"
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description (optional)"
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="Due date (optional)"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primary, opacity: !title.trim() ? 0.5 : 1 },
                ]}
                onPress={addGoal}
                disabled={!title.trim()}
              >
                <Text style={[styles.saveText, { color: colors.primaryForeground }]}>
                  Add goal
                </Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { padding: 20, gap: 12 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  goalCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  goalDot: { width: 8, height: 8, borderRadius: 4 },
  goalTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  goalDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  dueDateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dueDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressArea: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressPct: { fontSize: 12, fontFamily: "Inter_500Medium", width: 36, textAlign: "right" },
  progressBtns: { flexDirection: "row", gap: 8 },
  progressBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  completedBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  completedText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 14,
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#555", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 14 },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  saveBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
