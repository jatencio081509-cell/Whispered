import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";
import { useUser } from "@clerk/expo";
import { supabase } from "@/lib/supabase";
import NavigationDrawer from '@/components/NavigationDrawer';

interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  created_at: string;
  user_id: string;
}

export default function JournalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const MOODS = ['happy', 'calm', 'okay', 'sad', 'loved', 'motivated'];

  useEffect(() => {
    loadEntries();
  }, [user]);

  // Real-time sync for journal entries
  useEffect(() => {
    const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
    if (!partnerUserId || !user) return;

    const channel = supabase
      .channel('journal')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Journal change:', payload);
          loadEntries();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${partnerUserId}`,
        },
        (payload) => {
          console.log('Partner journal change:', payload);
          loadEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.unsafeMetadata?.partner_user_id, user?.id]);

  const loadEntries = async () => {
    if (!user) return;
    
    try {
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.eq.${partnerUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!content.trim() || !user) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        Alert.alert('Error', 'You need to link with a partner first');
        setIsSaving(false);
        return;
      }

      const newEntry = {
        id: Date.now().toString(36),
        user_id: user.id,
        title: title.trim() || null,
        content: content.trim(),
        mood: mood || null,
      };

      const { error } = await supabase
        .from('journal_entries')
        .insert(newEntry);

      if (error) throw error;

      await loadEntries();
      setShowModal(false);
      setTitle("");
      setContent("");
      setMood("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding journal entry:', error);
      Alert.alert('Error', 'Failed to add journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadEntries();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      Alert.alert('Error', 'Failed to delete journal entry');
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const getMoodEmoji = (mood: string | null) => {
    const moodEmojis: { [key: string]: string } = {
      happy: '😊',
      calm: '😌',
      okay: '🙂',
      sad: '😔',
      loved: '❤️',
      motivated: '🔥',
    };
    return mood ? moodEmojis[mood] || '' : '';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scanLine} />
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Journal</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1, borderColor: colors.border }]}
            onPress={() => setShowModal(true)}
          >
            <Feather name="plus" size={20} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => setShowNavigationDrawer(true)} style={styles.menuBtn}>
            <Feather name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Loading journal...</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: "rgba(0,229,255,0.08)", borderColor: colors.border, borderWidth: 1 }]}>
            <Feather name="book" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No journal entries yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Start writing your shared journal</Text>
          <Pressable style={[styles.emptyBtn, { borderColor: colors.primary, borderWidth: 1 }]} onPress={() => setShowModal(true)}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.emptyBtnText, { color: colors.primary }]}>Add entry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          renderItem={({ item: entry }) => (
            <Pressable
              style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onLongPress={() => deleteEntry(entry.id)}
            >
              <View style={styles.entryHeader}>
                <View style={styles.entryMeta}>
                  {entry.mood && <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>}
                  <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>
                    {formatDate(entry.created_at)} at {formatTime(entry.created_at)}
                  </Text>
                </View>
                {entry.user_id === user?.id && (
                  <View style={[styles.youBadge, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={[styles.youText, { color: colors.primary }]}>You</Text>
                  </View>
                )}
              </View>
              {entry.title && <Text style={[styles.entryTitle, { color: colors.text }]}>{entry.title}</Text>}
              <Text style={[styles.entryContent, { color: colors.foreground }]}>{entry.content}</Text>
            </Pressable>
          )}
        />
      )}

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>New journal entry</Text>
            
            <TextInput
              style={[styles.titleInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title (optional)"
              placeholderTextColor={colors.mutedForeground}
            />
            
            <TextInput
              style={[styles.contentInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={content}
              onChangeText={setContent}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.moodLabel, { color: colors.mutedForeground }]}>How are you feeling?</Text>
            <View style={styles.moodSelector}>
              {MOODS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.moodOption, mood === m && styles.moodOptionSelected, { borderColor: colors.border }]}
                  onPress={() => setMood(m)}
                >
                  <Text style={styles.moodOptionText}>{getMoodEmoji(m)}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => { setShowModal(false); setTitle(""); setContent(""); setMood(""); }}
              >
                <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={addEntry} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={[styles.modalSaveText, { color: colors.primaryForeground }]}>Save entry</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 12 },
  addBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  menuBtn: { padding: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  emptyBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  list: { padding: 16, gap: 12 },
  entryCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  entryMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  moodEmoji: { fontSize: 16 },
  entryDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  youBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  youText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  entryTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  entryContent: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 16 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  titleInput: { height: 48, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 16, fontFamily: "Inter_500Medium" },
  contentInput: { minHeight: 120, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular" },
  moodLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 8 },
  moodSelector: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  moodOption: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  moodOptionSelected: { borderWidth: 2 },
  moodOptionText: { fontSize: 20 },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  modalCancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  modalSaveBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalSaveText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#030712" },
});
