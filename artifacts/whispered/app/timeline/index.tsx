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
  Button,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";
import { useUser } from "@clerk/expo";
import { supabase } from "@/lib/supabase";
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';

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
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const CATEGORIES = ['Relationship', 'Personal', 'Milestone', 'Anniversary', 'Other'];

  useEffect(() => {
    loadEvents();
  }, [user]);

  // Auto-generate milestone events
  useEffect(() => {
    const generateMilestones = async () => {
      if (!user) return;

      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) return;

      const coupleId = generateCoupleId(user.id, partnerUserId);

      // Get couple start date from user metadata or other source
      const startDate = user.unsafeMetadata?.relationship_start_date as string | undefined;
      if (!startDate) return;

      const daysTogether = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const milestoneDays = [7, 30, 50, 100, 200, 365];

      for (const days of milestoneDays) {
        if (daysTogether >= days) {
          const milestoneDate = new Date(startDate);
          milestoneDate.setDate(milestoneDate.getDate() + days);
          const milestoneId = `milestone_${days}`;

          // Check if this milestone already exists
          const { data: existing } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', milestoneId)
            .eq('couple_id', coupleId)
            .single();

          if (!existing) {
            await supabase
              .from('timeline_events')
              .insert({
                id: milestoneId,
                user_id: user.id,
                couple_id: coupleId,
                title: `${days} days together`,
                description: 'A milestone worth celebrating',
                event_date: milestoneDate.toISOString().split('T')[0],
                category: 'Milestone',
              });
          }
        }
      }

      // Reload events after generating milestones
      await loadEvents();
    };

    generateMilestones();
  }, [user]);

  // Real-time sync for timeline events
  useEffect(() => {
    const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
    if (!partnerUserId || !user) return;

    const coupleId = generateCoupleId(user.id, partnerUserId);

    const channel = supabase
      .channel('timeline')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timeline_events',
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          console.log('Timeline change:', payload);
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.unsafeMetadata?.partner_user_id, user?.id]);

  const generateCoupleId = (userId1: string, userId2: string) => {
    const sorted = [userId1, userId2].sort();
    return `${sorted[0]}-${sorted[1]}`;
  };

  const loadEvents = async () => {
    if (!user) return;
    
    try {
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        setLoading(false);
        return;
      }

      const coupleId = generateCoupleId(user.id, partnerUserId);
      
      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('couple_id', coupleId)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading timeline events:', error);
      Alert.alert('Error', 'Failed to load timeline events');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (event: TimelineEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || "");
    setCategory(event.category || "");
    setEventDate(event.event_date);
    setShowModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setEventDate("");
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

      const coupleId = generateCoupleId(user.id, partnerUserId);

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('timeline_events')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            category: category || null,
            event_date: eventDate.trim(),
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        // Create new event
        const newEvent = {
          id: Date.now().toString(36),
          user_id: user.id,
          couple_id: coupleId,
          title: title.trim(),
          description: description.trim() || null,
          category: category || null,
          event_date: eventDate.trim(),
        };

        const { error } = await supabase
          .from('timeline_events')
          .insert(newEvent);

        if (error) throw error;
      }

      await loadEvents();
      closeModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving timeline event:', error);
      Alert.alert('Error', 'Failed to save timeline event');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (event: TimelineEvent) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEvent(event.id),
        },
      ]
    );
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error deleting timeline event:', error);
      Alert.alert('Error', 'Failed to delete timeline event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEventDate(selectedDate.toISOString().split('T')[0]);
    }
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
      <ThemeBackground>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Timeline</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1, backgroundColor: colors.primary, borderColor: colors.border }]}
            onPress={() => setShowModal(true)}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
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
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 }]}>
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
            <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.95 }]}>
              <View style={styles.timelineLine}>
                <View style={[styles.timelineDot, { backgroundColor: getCategoryColor(event.category) }]} />
                <View style={[styles.timelineConnector, { backgroundColor: colors.mutedForeground, opacity: 0.3 }]} />
              </View>
              
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventDate, { color: colors.primary }]}>{formatDate(event.event_date)}</Text>
                  <View style={styles.eventActions}>
                    {event.user_id === user?.id && (
                      <View style={[styles.youBadge, { backgroundColor: `${colors.primary}20` }]}>
                        <Text style={[styles.youText, { color: colors.primary }]}>You</Text>
                      </View>
                    )}
                    <Pressable
                      onPress={() => openEditModal(event)}
                      style={styles.actionButton}
                    >
                      <Feather name="edit-2" size={16} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => confirmDelete(event)}
                      style={styles.actionButton}
                    >
                      <Feather name="trash-2" size={16} color="#FF4444" />
                    </Pressable>
                  </View>
                </View>
                
                <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                
                {event.description && <Text style={[styles.eventDescription, { color: colors.foreground }]}>{event.description}</Text>}
                
                {event.category && (
                  <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                    <Text style={[styles.categoryText, { color: getCategoryColor(event.category) }]}>{event.category}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.98 }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.mutedForeground, opacity: 0.5 }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingEvent ? 'Edit timeline event' : 'New timeline event'}
            </Text>
            
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
                  style={[
                    styles.categoryOption,
                    {
                      borderColor: category === cat ? colors.primary : colors.border,
                      backgroundColor: category === cat ? `${colors.primary}20` : 'transparent'
                    }
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryOptionText, { color: category === cat ? colors.primary : colors.text }]}>{cat}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Event date</Text>
            <Pressable
              style={[styles.dateInput, { backgroundColor: colors.input, borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, { color: eventDate ? colors.text : colors.mutedForeground }]}>
                {eventDate ? formatDate(eventDate) : 'Select date'}
              </Text>
              <Feather name="calendar" size={20} color={colors.primary} />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={eventDate ? new Date(eventDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                onChange={handleDateChange}
              />
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalCancelBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}
                onPress={closeModal}
              >
                <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalSaveBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={addEvent} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={[styles.modalSaveText, { color: colors.primaryForeground }]}>
                    {editingEvent ? 'Update event' : 'Save event'}
                  </Text>
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

      {/* Floating Action Button */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 20 }]}
        onPress={() => setShowModal(true)}
      >
        <Feather name="plus" size={24} color={colors.primaryForeground} />
      </Pressable>
      </ThemeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "System", fontWeight: '600' },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 12 },
  addBtn: { width: 44, height: 44, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44 },
  menuBtn: { padding: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  emptyTitle: { fontSize: 16, fontFamily: "System", fontWeight: '600' },
  emptySubtitle: { fontSize: 14, fontFamily: "System", textAlign: "center" },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 4, marginTop: 8, borderWidth: 1 },
  emptyBtnText: { fontSize: 14, fontFamily: "System", fontWeight: '500' },
  list: { padding: 16, gap: 0 },
  eventCard: { flexDirection: "row", paddingVertical: 16, gap: 16, borderWidth: 1, borderRadius: 4, paddingHorizontal: 16 },
  timelineLine: { alignItems: "center", width: 20 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineConnector: { width: 2, flex: 1, minHeight: 40 },
  eventContent: { flex: 1, gap: 8 },
  eventHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionButton: { padding: 4 },
  eventDate: { fontSize: 12, fontFamily: "System", fontWeight: '600' },
  eventTitle: { fontSize: 16, fontFamily: "System", fontWeight: '600' },
  eventDescription: { fontSize: 14, fontFamily: "System", lineHeight: 20 },
  categoryBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  categoryText: { fontSize: 10, fontFamily: "System", fontWeight: '600' },
  youBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  youText: { fontSize: 10, fontFamily: "System", fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 4, borderTopRightRadius: 4, borderWidth: 1, padding: 24, gap: 16 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 16, fontFamily: "System", fontWeight: '600' },
  titleInput: { height: 48, borderRadius: 4, borderWidth: 1, padding: 14, fontSize: 16, fontFamily: "System" },
  descriptionInput: { minHeight: 80, borderRadius: 4, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "System" },
  label: { fontSize: 12, fontFamily: "System", fontWeight: '500', marginBottom: 8 },
  categorySelector: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  categoryOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1 },
  categoryOptionSelected: { borderWidth: 2 },
  categoryOptionText: { fontSize: 12, fontFamily: "System", fontWeight: '500' },
  dateInput: { height: 48, borderRadius: 4, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateText: { fontSize: 14, fontFamily: "System" },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  modalCancelText: { fontSize: 14, fontFamily: "System", fontWeight: '500' },
  modalSaveBtn: { flex: 1, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  modalSaveText: { fontSize: 14, fontFamily: "System", fontWeight: '600' },
  fab: { position: "absolute", right: 20, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
});
