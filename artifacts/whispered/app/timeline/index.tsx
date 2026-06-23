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
    const generateAutoEvents = async () => {
      if (!user) return;

      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        console.log('No partner linked, skipping auto events');
        return;
      }

      const coupleId = generateCoupleId(user.id, partnerUserId);
      console.log('Generating auto events for couple:', coupleId);

      try {
        // Get couple data from Supabase - try to find by either user
        const { data: coupleData, error: coupleError } = await supabase
          .from('couples')
          .select('id, start_date, official_date, engagement_date, wedding_date')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .single();

        if (coupleError) {
          console.log('No couple found in database:', coupleError);
        } else {
          console.log('Found couple data:', coupleData);
        }

        if (!coupleData) {
          console.log('No couple data available, skipping auto events');
          return;
        }

        // Use the actual couple ID from the database
        const actualCoupleId = coupleData.id;
        console.log('Using couple ID:', actualCoupleId);

        // 1. Add "First Chat" event (most reliable - based on actual messages)
        const { data: firstMessage, error: msgError } = await supabase
          .from('messages')
          .select('created_at')
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id},from_user_id.eq.${partnerUserId},to_user_id.eq.${partnerUserId}`)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (firstMessage && !msgError) {
          const firstChatId = 'auto_first_chat';
          const { data: existingFirstChat } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', firstChatId)
            .eq('couple_id', actualCoupleId)
            .single();

          if (!existingFirstChat) {
            const firstChatDate = new Date(firstMessage.created_at).toISOString().split('T')[0];
            console.log('Creating First Chat event for date:', firstChatDate);
            const { error: insertError } = await supabase
              .from('timeline_events')
              .insert({
                id: firstChatId,
                user_id: user.id,
                couple_id: actualCoupleId,
                title: 'First Chat',
                description: 'Our first message to each other 💬',
                event_date: firstChatDate,
                category: 'Milestone',
              });
            
            if (insertError) {
              console.error('Error creating First Chat event:', insertError);
            } else {
              console.log('First Chat event created successfully');
            }
          }
        }

        // 2. Add "First Memory" event
        const { data: firstMemory, error: memoryError } = await supabase
          .from('memories')
          .select('created_at')
          .eq('couple_id', actualCoupleId)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (firstMemory && !memoryError) {
          const firstMemoryId = 'auto_first_memory';
          const { data: existingFirstMemory } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', firstMemoryId)
            .eq('couple_id', actualCoupleId)
            .single();

          if (!existingFirstMemory) {
            const memoryDate = new Date(firstMemory.created_at).toISOString().split('T')[0];
            console.log('Creating First Memory event for:', memoryDate);
            await supabase
              .from('timeline_events')
              .insert({
                id: firstMemoryId,
                user_id: user.id,
                couple_id: actualCoupleId,
                title: 'First Memory Saved',
                description: 'Started capturing our moments together 📸',
                event_date: memoryDate,
                category: 'Milestone',
              });
          }
        }

        // 3. Add "Connected on Whispered" event (when couple was created)
        if (coupleData.start_date) {
          const linkedId = 'auto_linked_accounts';
          const { data: existingLinked } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', linkedId)
            .eq('couple_id', actualCoupleId)
            .single();

          if (!existingLinked) {
            const linkedDate = new Date(coupleData.start_date).toISOString().split('T')[0];
            console.log('Creating Connected on Whispered event for:', linkedDate);
            await supabase
              .from('timeline_events')
              .insert({
                id: linkedId,
                user_id: user.id,
                couple_id: actualCoupleId,
                title: 'Connected on Whispered',
                description: 'Started our digital journey together 💕',
                event_date: linkedDate,
                category: 'Milestone',
              });
          }
        }

        // 3. Add "Official Date" event if set
        if (coupleData.official_date) {
          const officialId = 'auto_official_date';
          const { data: existingOfficial } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', officialId)
            .eq('couple_id', actualCoupleId)
            .single();

          if (!existingOfficial) {
            console.log('Creating Official Date event for:', coupleData.official_date);
            await supabase
              .from('timeline_events')
              .insert({
                id: officialId,
                user_id: user.id,
                couple_id: actualCoupleId,
                title: 'Made It Official',
                description: 'The day we became official ❤️',
                event_date: coupleData.official_date,
                category: 'Anniversary',
              });

            // Generate relationship milestones based on official date
            const daysTogether = Math.floor((Date.now() - new Date(coupleData.official_date).getTime()) / (1000 * 60 * 60 * 24));
            const milestoneDays = [7, 30, 50, 100, 200, 365, 500, 730, 1000];

            for (const days of milestoneDays) {
              if (daysTogether >= days) {
                const milestoneDate = new Date(coupleData.official_date);
                milestoneDate.setDate(milestoneDate.getDate() + days);
                const milestoneId = `milestone_${days}`;

                const { data: existing } = await supabase
                  .from('timeline_events')
                  .select('id')
                  .eq('id', milestoneId)
                  .eq('couple_id', actualCoupleId)
                  .single();

                if (!existing) {
                  console.log(`Creating ${days} day milestone`);
                  await supabase
                    .from('timeline_events')
                    .insert({
                      id: milestoneId,
                      user_id: user.id,
                      couple_id: actualCoupleId,
                      title: `${days} days together`,
                      description: days >= 365 ? `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} together! 🎉` : 'A milestone worth celebrating',
                      event_date: milestoneDate.toISOString().split('T')[0],
                      category: 'Milestone',
                    });
                }
              }
            }
          }
        }

        // 4. Add "Engagement" event if set
        if (coupleData.engagement_date) {
          const engagementId = 'auto_engagement';
          const { data: existingEngagement } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', engagementId)
            .eq('couple_id', actualCoupleId)
            .single();

          if (!existingEngagement) {
            console.log('Creating Engagement event for:', coupleData.engagement_date);
            await supabase
              .from('timeline_events')
              .insert({
                id: engagementId,
                user_id: user.id,
                couple_id: actualCoupleId,
                title: 'Engaged! 💍',
                description: 'We said yes to forever!',
                event_date: coupleData.engagement_date,
                category: 'Anniversary',
              });
          }
        }

        // 5. Add "Wedding" event if set
        if (coupleData.wedding_date) {
          const weddingId = 'auto_wedding';
          const { data: existingWedding } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', weddingId)
            .eq('couple_id', actualCoupleId)
            .single();

          if (!existingWedding) {
            console.log('Creating Wedding event for:', coupleData.wedding_date);
            await supabase
              .from('timeline_events')
              .insert({
                id: weddingId,
                user_id: user.id,
                couple_id: actualCoupleId,
                title: 'Married! 💒',
                description: 'Our wedding day - the best day ever!',
                event_date: coupleData.wedding_date,
                category: 'Anniversary',
              });
          }
        }

        // 6. Add "Dating Anniversary" event from start_date
        if (coupleData.start_date) {
          const anniversaryId = 'auto_dating_anniversary';
          const { data: existingAnniversary } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', anniversaryId)
            .eq('couple_id', actualCoupleId)
            .single();

          if (!existingAnniversary) {
            const anniversaryDate = new Date(coupleData.start_date).toISOString().split('T')[0];
            console.log('Creating Dating Anniversary event for:', anniversaryDate);
            await supabase
              .from('timeline_events')
              .insert({
                id: anniversaryId,
                user_id: user.id,
                couple_id: actualCoupleId,
                title: 'Started Dating',
                description: 'The beginning of our love story 💕',
                event_date: anniversaryDate,
                category: 'Anniversary',
              });
          }
        }

        // 7. Add "First Account Created" and "Both Joined" events
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, created_at')
          .in('id', [user.id, partnerUserId])
          .order('created_at', { ascending: true });

        if (users && users.length > 0 && !usersError) {
          // First person to join
          const firstUser = users[0];
          const firstAccountId = 'auto_first_account';
          const { data: existingFirstAccount } = await supabase
            .from('timeline_events')
            .select('id')
            .eq('id', firstAccountId)
            .eq('couple_id', actualCoupleId)
            .single();

          if (!existingFirstAccount) {
            const accountDate = new Date(firstUser.created_at).toISOString().split('T')[0];
            console.log('Creating First Account event for:', accountDate);
            await supabase
              .from('timeline_events')
              .insert({
                id: firstAccountId,
                user_id: user.id,
                couple_id: actualCoupleId,
                title: 'First to Join Whispered',
                description: 'One of us discovered Whispered! 🎉',
                event_date: accountDate,
                category: 'Milestone',
              });
          }

          // Last person to join (when both were on the app)
          if (users.length === 2) {
            const lastUser = users[1];
            const bothJoinedId = 'auto_both_joined';
            const { data: existingBothJoined } = await supabase
              .from('timeline_events')
              .select('id')
              .eq('id', bothJoinedId)
              .eq('couple_id', actualCoupleId)
              .single();

            if (!existingBothJoined) {
              const bothJoinedDate = new Date(lastUser.created_at).toISOString().split('T')[0];
              console.log('Creating Both Joined event for:', bothJoinedDate);
              await supabase
                .from('timeline_events')
                .insert({
                  id: bothJoinedId,
                  user_id: user.id,
                  couple_id: actualCoupleId,
                  title: 'Both on Whispered',
                  description: 'We\'re both here now! 💕',
                  event_date: bothJoinedDate,
                  category: 'Milestone',
                });
            }
          }
        }

        // Reload events after generating auto events
        console.log('Reloading events...');
        await loadEvents();
      } catch (error) {
        console.error('Error generating auto events:', error);
      }
    };

    generateAutoEvents();
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
