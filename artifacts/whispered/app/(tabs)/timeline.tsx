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

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  category: string | null;
  created_at: string;
  user_id: string;
}

export default function TimelineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const CATEGORIES = ['Relationship', 'Personal', 'Milestone', 'Anniversary', 'Other'];

  useEffect(() => {
    loadEvents();
  }, [user]);

  // Real-time sync for timeline events
  useEffect(() => {
    const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
    if (!partnerUserId || !user) return;

    const channel = supabase
      .channel('timeline')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timeline_events',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Timeline change:', payload);
          loadEvents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timeline_events',
          filter: `user_id=eq.${partnerUserId}`,
        },
        (payload) => {
          console.log('Partner timeline change:', payload);
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.unsafeMetadata?.partner_user_id, user?.id]);

  const loadEvents = async () => {
    if (!user) return;
    
    try {
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.eq.${partnerUserId}`)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading timeline events:', error);
      Alert.alert('Error', 'Failed to load timeline events');
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    if (!title.trim() || !eventDate.trim() || !user) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        Alert.alert('Error', 'You need to link with a partner first');
        setIsSaving(false);
        return;
      }

      const newEvent = {
        id: Date.now().toString(36),
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        event_date: eventDate.trim(),
      };

      const { error } = await supabase
        .from('timeline_events')
        .insert(newEvent);

      if (error) throw error;

      await loadEvents();
      setShowModal(false);
      setTitle("");
      setDescription("");
      setCategory("");
      setEventDate("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding timeline event:', error);
      Alert.alert('Error', 'Failed to add timeline event');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadEvents();
    } catch (error) {
      console.error('Error deleting timeline event:', error);
      Alert.alert('Error', 'Failed to delete timeline event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  };

  const getCategoryColor = (category: string | null) => {
    const categoryColors: { [key: string]: string } = {
      Relationship: '#FF6B6B',
      Personal: '#4ECDC4',
      Milestone: '#FFE66D',
      Anniversary: '#FF69B4',
      Other: '#95E1D3',
    };
    return category ? categoryColors[category] || colors.primary : colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Grid Pattern Background */}
      <View style={styles.gridBackground}>
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineVertical} />
      </View>
      <View style={styles.scanLine} />
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Timeline</Text>
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
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Loading timeline...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: "rgba(0,229,255,0.08)", borderColor: colors.border, borderWidth: 1 }]}>
            <Feather name="calendar" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No timeline events yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Add important dates and milestones</Text>
          <Pressable style={[styles.emptyBtn, { borderColor: colors.primary, borderWidth: 1 }]} onPress={() => setShowModal(true)}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.emptyBtnText, { color: colors.primary }]}>Add event</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          renderItem={({ item: event }) => (
            <Pressable
              style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onLongPress={() => deleteEvent(event.id)}
            >
              <View style={styles.timelineLine}>
                <View style={[styles.timelineDot, { backgroundColor: getCategoryColor(event.category) }]} />
                <View style={[styles.timelineConnector, { backgroundColor: colors.border }]} />
              </View>
              
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventDate, { color: colors.primary }]}>{formatDate(event.event_date)}</Text>
                  {event.user_id === user?.id && (
                    <View style={[styles.youBadge, { backgroundColor: `${colors.primary}20` }]}>
                      <Text style={[styles.youText, { color: colors.primary }]}>You</Text>
                    </View>
                  )}
                </View>
                
                <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                
                {event.description && <Text style={[styles.eventDescription, { color: colors.foreground }]}>{event.description}</Text>}
                
                {event.category && (
                  <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                    <Text style={[styles.categoryText, { color: getCategoryColor(event.category) }]}>{event.category}</Text>
                  </View>
                )}
              </View>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>New timeline event</Text>
            
            <TextInput
              style={[styles.titleInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor={colors.mutedForeground}
            />
            
            <TextInput
              style={[styles.descriptionInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description (optional)"
              placeholderTextColor={colors.mutedForeground}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Category</Text>
            <View style={styles.categorySelector}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.categoryOption, category === cat && styles.categoryOptionSelected, { borderColor: colors.border }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryOptionText, category === cat && { color: colors.primary }]}>{cat}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Event date</Text>
            <TextInput
              style={[styles.dateInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={eventDate}
              onChangeText={setEventDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => { setShowModal(false); setTitle(""); setDescription(""); setCategory(""); setEventDate(""); }}
              >
                <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={addEvent} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={[styles.modalSaveText, { color: colors.primaryForeground }]}>Save event</Text>
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
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  gridLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  scanLine: { position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(0,229,255,0.3)", zIndex: 10 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "System", fontWeight: '600' },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 12 },
  addBtn: { width: 38, height: 38, borderRadius: 4, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: 'rgba(0, 229, 255, 0.2)' },
  menuBtn: { padding: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  emptyTitle: { fontSize: 16, fontFamily: "System", fontWeight: '600' },
  emptySubtitle: { fontSize: 14, fontFamily: "System", textAlign: "center" },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 4, marginTop: 8, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  emptyBtnText: { fontSize: 14, fontFamily: "System", fontWeight: '500' },
  list: { padding: 16, gap: 0 },
  eventCard: { flexDirection: "row", paddingVertical: 16, gap: 16, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)', borderRadius: 4 },
  timelineLine: { alignItems: "center", width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineConnector: { width: 2, flex: 1, minHeight: 40, backgroundColor: 'rgba(0, 229, 255, 0.2)' },
  eventContent: { flex: 1, gap: 8 },
  eventHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventDate: { fontSize: 12, fontFamily: "System", fontWeight: '600' },
  eventTitle: { fontSize: 16, fontFamily: "System", fontWeight: '600' },
  eventDescription: { fontSize: 14, fontFamily: "System", lineHeight: 20 },
  categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryText: { fontSize: 10, fontFamily: "System", fontWeight: '600' },
  youBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  youText: { fontSize: 10, fontFamily: "System", fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 4, borderTopRightRadius: 4, borderWidth: 1, padding: 24, gap: 16, borderColor: 'rgba(0, 229, 255, 0.2)', backgroundColor: 'rgba(0, 0, 0, 0.8)' },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4, backgroundColor: 'rgba(0, 229, 255, 0.2)' },
  modalTitle: { fontSize: 16, fontFamily: "System", fontWeight: '600' },
  titleInput: { height: 48, borderRadius: 4, borderWidth: 1, padding: 14, fontSize: 16, fontFamily: "System", backgroundColor: 'rgba(0, 0, 0, 0.6)', borderColor: 'rgba(0, 229, 255, 0.2)' },
  descriptionInput: { minHeight: 80, borderRadius: 4, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "System", backgroundColor: 'rgba(0, 0, 0, 0.6)', borderColor: 'rgba(0, 229, 255, 0.2)' },
  label: { fontSize: 12, fontFamily: "System", fontWeight: '500', marginBottom: 8 },
  categorySelector: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  categoryOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  categoryOptionSelected: { borderWidth: 2, borderColor: '#00E5FF' },
  categoryOptionText: { fontSize: 12, fontFamily: "System", fontWeight: '500' },
  dateInput: { height: 48, borderRadius: 4, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "System", backgroundColor: 'rgba(0, 0, 0, 0.6)', borderColor: 'rgba(0, 229, 255, 0.2)' },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderColor: 'rgba(0, 229, 255, 0.2)' },
  modalCancelText: { fontSize: 14, fontFamily: "System", fontWeight: '500' },
  modalSaveBtn: { flex: 1, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center", backgroundColor: '#00E5FF', borderWidth: 1, borderColor: '#00E5FF' },
  modalSaveText: { fontSize: 14, fontFamily: "System", fontWeight: '600', color: "#030712" },
});
