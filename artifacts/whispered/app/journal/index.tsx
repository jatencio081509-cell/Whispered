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
import { useColors } from "@/hooks/useColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [readEntry, setReadEntry] = useState<JournalEntry | null>(null);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem("journal").then((d) => {
      if (d) setEntries(JSON.parse(d));
    });
  }, []);

  const save = (updated: JournalEntry[]) => {
    setEntries(updated);
    AsyncStorage.setItem("journal", JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!content.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const entry: JournalEntry = {
      id: Date.now().toString(36),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    save([entry, ...entries]);
    setShowModal(false);
    setTitle("");
    setContent("");
  };

  const deleteEntry = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    save(entries.filter((e) => e.id !== id));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Journal</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowModal(true)}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: `${colors.success}20` },
              ]}
            >
              <Feather name="book-open" size={32} color={colors.success} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Your story starts here
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
            >
              Write your first journal entry
            </Text>
          </View>
        }
        renderItem={({ item: entry }) => (
          <Pressable
            style={[
              styles.entryCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setReadEntry(entry)}
            onLongPress={() => deleteEntry(entry.id)}
          >
            <View style={styles.entryMeta}>
              <Text
                style={[styles.entryDate, { color: colors.mutedForeground }]}
              >
                {formatDate(entry.createdAt)}
              </Text>
              <View
                style={[styles.entryDot, { backgroundColor: colors.primary }]}
              />
            </View>
            {entry.title ? (
              <Text style={[styles.entryTitle, { color: colors.text }]}>
                {entry.title}
              </Text>
            ) : null}
            <Text
              style={[styles.entryPreview, { color: colors.mutedForeground }]}
              numberOfLines={3}
            >
              {entry.content}
            </Text>
          </Pressable>
        )}
      />

      {/* Write Modal */}
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
              New entry
            </Text>
            <TextInput
              style={[
                styles.titleInput,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title (optional)"
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              style={[
                styles.contentInput,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="Write freely..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              autoFocus
              textAlignVertical="top"
            />
            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => { setShowModal(false); setTitle(""); setContent(""); }}
              >
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primary, opacity: !content.trim() ? 0.5 : 1 },
                ]}
                onPress={addEntry}
                disabled={!content.trim()}
              >
                <Text style={[styles.saveText, { color: colors.primaryForeground }]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Read Modal */}
      <Modal
        visible={!!readEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setReadEntry(null)}
      >
        {readEntry ? (
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.readSheet,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.modalHandle} />
              <Pressable
                style={styles.closeBtn}
                onPress={() => setReadEntry(null)}
              >
                <Feather name="x" size={20} color={colors.text} />
              </Pressable>
              <Text style={[styles.readDate, { color: colors.mutedForeground }]}>
                {formatDate(readEntry.createdAt)}
              </Text>
              {readEntry.title ? (
                <Text style={[styles.readTitle, { color: colors.text }]}>
                  {readEntry.title}
                </Text>
              ) : null}
              <Text style={[styles.readContent, { color: colors.text }]}>
                {readEntry.content}
              </Text>
            </View>
          </View>
        ) : null}
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
  addBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  list: { padding: 20, gap: 12 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  entryCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  entryMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  entryDate: { fontSize: 12, fontFamily: "Inter_500Medium" },
  entryDot: { width: 6, height: 6, borderRadius: 3 },
  entryTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  entryPreview: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 14, maxHeight: "90%" },
  readSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 12, maxHeight: "90%" },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#555", alignSelf: "center", marginBottom: 4 },
  closeBtn: { alignSelf: "flex-end" },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  readDate: { fontSize: 12, fontFamily: "Inter_500Medium" },
  readTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  readContent: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  titleInput: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  contentInput: { height: 180, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  modalBtns: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  saveBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  saveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
