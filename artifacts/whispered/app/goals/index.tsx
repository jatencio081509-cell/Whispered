import React, { useEffect, useState } from "react";
import {
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
import { useColors } from "@/hooks/useColors";
import { useUser } from "@clerk/expo";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import * as Haptics from "expo-haptics";
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  dueDate: string | null;
  completed: boolean;
  frequency: 'one-time' | 'daily' | 'yearly';
  isShared: boolean;
  userProgress: Record<string, number>;
  lastResetAt: string;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { couple } = useApp();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState<'one-time' | 'daily' | 'yearly'>('one-time');
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);

  const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
  const partnerName = user?.unsafeMetadata?.partnerName as string | undefined;
  const myUserId = user?.id;
  const coupleId = couple?.id;

  // Generate a consistent couple ID from the two user IDs
  // This avoids needing to query/create records in the couples table
  const generateCoupleId = (userId1: string, userId2: string) => {
    const sorted = [userId1, userId2].sort();
    return `${sorted[0]}-${sorted[1]}`;
  };

  // Use generated couple ID if we have both user IDs, otherwise fall back to context
  const effectiveCoupleId = (myUserId && partnerUserId) 
    ? generateCoupleId(myUserId, partnerUserId)
    : coupleId;

  const fetchGoals = async () => {
    if (!effectiveCoupleId) return;
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('couple_id', effectiveCoupleId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        return;
      }

      const formatted = (data || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        progress: g.progress,
        dueDate: g.due_date,
        completed: g.completed,
        frequency: g.frequency || 'one-time',
        isShared: g.is_shared || false,
        userProgress: g.user_progress || {},
        lastResetAt: g.last_reset_at || g.created_at,
        createdBy: g.created_by,
        updatedBy: g.updated_by,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      }));

      // Check and reset goals based on frequency
      const resetGoals = await Promise.all(formatted.map(checkAndResetGoal));
      setGoals(resetGoals);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditGoal(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setFrequency('one-time');
    setIsShared(false);
    setShowModal(true);
  };

  const openEdit = (goal: Goal) => {
    setEditGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || "");
    setDueDate(goal.dueDate || "");
    setFrequency(goal.frequency);
    setIsShared(goal.isShared);
    setShowModal(true);
  };

  const addGoal = async () => {
    if (!title.trim()) {
      console.log('Title is empty');
      return;
    }
    if (!effectiveCoupleId) {
      console.log('No couple ID - need to link with partner first');
      alert('Please link with your partner first to create shared goals');
      return;
    }
    if (!myUserId) {
      console.log('No user ID');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      if (editGoal) {
        // Update existing goal
        const { error } = await supabase.from('goals').update({
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate.trim() || null,
          frequency: frequency,
          is_shared: isShared,
          updated_by: myUserId,
        }).eq('id', editGoal.id);

        if (error) {
          console.error('Error updating goal:', error);
          alert('Failed to update goal: ' + error.message);
          return;
        }
      } else {
        // Create new goal
        console.log('Adding goal with effectiveCoupleId:', effectiveCoupleId, 'userId:', myUserId);
        const userProgressInit = isShared && myUserId ? { [myUserId]: 0 } : {};
        const { error } = await supabase.from('goals').insert({
          couple_id: effectiveCoupleId,
          title: title.trim(),
          description: description.trim() || null,
          progress: 0,
          due_date: dueDate.trim() || null,
          completed: false,
          frequency: frequency,
          is_shared: isShared,
          user_progress: userProgressInit,
          created_by: myUserId,
        });

        if (error) {
          console.error('Error adding goal:', error);
          alert('Failed to add goal: ' + error.message);
          return;
        }
      }

      setShowModal(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setFrequency('one-time');
      setIsShared(false);
      setEditGoal(null);
      await fetchGoals();
    } catch (err) {
      console.error('Failed to save goal:', err);
      alert('Failed to save goal');
    }
  };

  const updateProgress = async (id: string, delta: number) => {
    if (!myUserId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    try {
      if (goal.isShared) {
        // Update per-user progress for shared goals
        const currentUserProgress = goal.userProgress[myUserId] || 0;
        const newProgress = Math.max(0, Math.min(100, currentUserProgress + delta));
        
        const updatedUserProgress = {
          ...goal.userProgress,
          [myUserId]: newProgress,
        };

        // Calculate if goal is completed (both users at 100%)
        const creatorProgress = updatedUserProgress[goal.createdBy] || 0;
        const partnerProgress = partnerUserId ? (updatedUserProgress[partnerUserId] || 0) : 0;
        const completed = creatorProgress >= 100 && partnerProgress >= 100;
        
        const { error } = await supabase
          .from('goals')
          .update({
            user_progress: updatedUserProgress,
            completed,
            updated_by: myUserId,
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating progress:', error);
          return;
        }
      } else {
        // Update single progress for individual goals
        const newProgress = Math.max(0, Math.min(100, goal.progress + delta));
        const completed = newProgress >= 100;
        
        const { error } = await supabase
          .from('goals')
          .update({
            progress: newProgress,
            completed,
            updated_by: myUserId,
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating goal:', error);
          return;
        }
      }
      
      await fetchGoals();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const deleteGoal = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);

      if (error) {
        console.error('Error deleting goal:', error);
        return;
      }

      await fetchGoals();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  // Fetch goals on mount and set up real-time sync
  useEffect(() => {
    if (effectiveCoupleId) {
      fetchGoals();

      // Set up real-time subscription
      const channel = supabase
        .channel('goals_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'goals',
            filter: `couple_id=eq.${effectiveCoupleId}`,
          },
          () => {
            fetchGoals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [effectiveCoupleId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  const checkAndResetGoal = async (goal: Goal) => {
    if (goal.frequency === 'one-time') return goal;

    const now = new Date();
    const lastReset = new Date(goal.lastResetAt);
    const createdAt = new Date(goal.createdAt);

    let needsReset = false;

    if (goal.frequency === 'daily') {
      // Check if it's a new day since last reset
      const lastResetDate = new Date(lastReset.getFullYear(), lastReset.getMonth(), lastReset.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      needsReset = today > lastResetDate;
    } else if (goal.frequency === 'yearly') {
      // Check if it's been a year since last reset (not since creation)
      const lastResetYear = lastReset.getFullYear();
      const currentYear = now.getFullYear();
      needsReset = currentYear > lastResetYear;
    }

    if (needsReset && myUserId) {
      try {
        const resetData: any = {
          last_reset_at: now.toISOString(),
          updated_by: myUserId,
        };

        if (goal.isShared) {
          // Reset individual user progress
          resetData.user_progress = {
            ...goal.userProgress,
            [myUserId]: 0,
          };
        } else {
          // Reset single progress
          resetData.progress = 0;
          resetData.completed = false;
        }

        const { error } = await supabase
          .from('goals')
          .update(resetData)
          .eq('id', goal.id);

        if (error) {
          console.error('Error resetting goal:', error);
          alert('Failed to reset goal: ' + error.message);
          return goal;
        } else {
          // Return the updated goal
          return {
            ...goal,
            ...resetData,
            lastResetAt: now.toISOString(),
            progress: goal.isShared ? goal.progress : 0,
            completed: goal.isShared ? goal.completed : false,
            userProgress: goal.isShared ? { ...goal.userProgress, [myUserId]: 0 } : goal.userProgress,
          };
        }
      } catch (err) {
        console.error('Failed to reset goal:', err);
        alert('Failed to reset goal');
        return goal;
      }
    }

    return goal;
  };

  const isCreatedByMe = (goal: Goal) => goal.createdBy === myUserId;
  const isUpdatedByPartner = (goal: Goal) => goal.updatedBy === partnerUserId;

  const isGoalCompleted = (goal: Goal) => {
    if (!goal.isShared) {
      return goal.completed;
    }
    // For shared goals, check if both users have reached 100%
    const creatorProgress = goal.userProgress[goal.createdBy] || 0;
    const partnerProgress = partnerUserId ? (goal.userProgress[partnerUserId] || 0) : 0;
    return creatorProgress >= 100 && partnerProgress >= 100;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemeBackground>

        <View
          style={[
            styles.header,
            { paddingTop: topPad + 12, borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Shared Goals
          </Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Loading goals...</Text>
            </View>
          ) : goals.length === 0 ? (
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
            <View style={styles.grid}>
              {goals.map((goal) => (
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
                      {isUpdatedByPartner(goal) && (
                        <View style={[styles.partnerBadge, { backgroundColor: `${colors.primary}20` }]}>
                          <Feather name="users" size={10} color={colors.primary} />
                        </View>
                      )}
                    </View>
                    <View style={styles.goalHeaderActions}>
                      <Pressable onPress={() => openEdit(goal)} hitSlop={8}>
                        <Feather
                          name="edit-2"
                          size={14}
                          color={colors.mutedForeground}
                        />
                      </Pressable>
                      <Pressable onPress={() => deleteGoal(goal.id)} hitSlop={8}>
                        <Feather
                          name="trash-2"
                          size={14}
                          color={colors.mutedForeground}
                        />
                      </Pressable>
                    </View>
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
                        {formatDate(goal.dueDate)}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.metaRow}>
                    <View style={[styles.creatorBadge, { backgroundColor: isCreatedByMe(goal) ? `${colors.primary}15` : `${colors.accent}15` }]}>
                      <Feather name={isCreatedByMe(goal) ? "user" : "heart"} size={10} color={isCreatedByMe(goal) ? colors.primary : colors.accent} />
                      <Text style={[styles.creatorText, { color: isCreatedByMe(goal) ? colors.primary : colors.accent }]}>
                        {isCreatedByMe(goal) ? "You" : (partnerName || 'Partner')}
                      </Text>
                    </View>
                    <View style={[styles.frequencyBadge, { backgroundColor: `${colors.primary}15` }]}>
                      <Feather name="repeat" size={10} color={colors.primary} />
                      <Text style={[styles.frequencyBadgeText, { color: colors.primary }]}>
                        {goal.frequency}
                      </Text>
                    </View>
                    {goal.isShared && (
                      <View style={[styles.sharedBadge, { backgroundColor: `${colors.accent}15` }]}>
                        <Feather name="users" size={10} color={colors.accent} />
                        <Text style={[styles.sharedBadgeText, { color: colors.accent }]}>
                          Shared
                        </Text>
                      </View>
                    )}
                  </View>

                  {goal.isShared ? (
                    <View style={styles.sharedProgressArea}>
                      <View style={styles.userProgressSection}>
                        <Text style={[styles.userProgressLabel, { color: colors.text }]}>
                          {isCreatedByMe(goal) ? "Your progress" : `${partnerName || 'Partner'}'s progress`}
                        </Text>
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
                                  width: `${(goal.userProgress[goal.createdBy] || 0)}%`,
                                  backgroundColor: colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>
                            {goal.userProgress[goal.createdBy] || 0}%
                          </Text>
                        </View>
                      </View>
                      {partnerUserId && (
                        <View style={styles.userProgressSection}>
                          <Text style={[styles.userProgressLabel, { color: colors.text }]}>
                            {isCreatedByMe(goal) ? `${partnerName || 'Partner'}'s progress` : "Your progress"}
                          </Text>
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
                                    width: `${goal.userProgress[partnerUserId] || 0}%`,
                                    backgroundColor: colors.accent,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>
                              {goal.userProgress[partnerUserId] || 0}%
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
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
                  )}

                  {!goal.completed ? (
                    <View style={styles.progressActions}>
                      <Pressable
                        style={[
                          styles.quickProgressBtn,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                        ]}
                        onPress={() => updateProgress(goal.id, 25)}
                      >
                        <Text style={[styles.quickProgressText, { color: colors.text }]}>+25%</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.quickProgressBtn,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                        ]}
                        onPress={() => updateProgress(goal.id, 50)}
                      >
                        <Text style={[styles.quickProgressText, { color: colors.text }]}>+50%</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.completeBtn,
                          { backgroundColor: colors.success },
                        ]}
                        onPress={() => updateProgress(goal.id, 100 - goal.progress)}
                      >
                        <Feather name="check" size={14} color="#fff" />
                        <Text style={styles.completeBtnText}>Complete</Text>
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
              ))}
            </View>
          )}
        </ScrollView>

        <Pressable
          style={[styles.floatingAddBtn, { backgroundColor: colors.primary }]}
          onPress={openCreate}
        >
          <Feather name="plus" size={24} color={colors.primaryForeground} />
        </Pressable>

        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
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
                  {editGoal ? 'Edit goal' : 'New goal'}
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
                <View style={styles.frequencySelector}>
                  <Text style={[styles.frequencyLabel, { color: colors.text }]}>Frequency</Text>
                  <View style={styles.frequencyOptions}>
                    {(['one-time', 'daily', 'yearly'] as const).map((freq) => (
                      <Pressable
                        key={freq}
                        style={[
                          styles.frequencyOption,
                          {
                            backgroundColor: frequency === freq ? colors.primary : colors.input,
                            borderColor: frequency === freq ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setFrequency(freq)}
                      >
                        <Text
                          style={[
                            styles.frequencyOptionText,
                            {
                              color: frequency === freq ? colors.primaryForeground : colors.text,
                            },
                          ]}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <Pressable
                  style={[styles.sharedToggle, { backgroundColor: colors.input, borderColor: colors.border }]}
                  onPress={() => setIsShared(!isShared)}
                >
                  <View style={styles.sharedToggleContent}>
                    <Text style={[styles.sharedToggleLabel, { color: colors.text }]}>
                      Share with partner
                    </Text>
                    <View style={[styles.sharedToggleSwitch, { backgroundColor: isShared ? colors.primary : colors.border }]}>
                      <View style={[styles.sharedToggleKnob, { transform: [{ translateX: isShared ? 16 : 0 }], backgroundColor: isShared ? colors.primaryForeground : colors.mutedForeground }]} />
                    </View>
                  </View>
                  <Text style={[styles.sharedToggleDesc, { color: colors.mutedForeground }]}>
                    {isShared ? 'Both partners track their own progress' : 'Only you track progress'}
                  </Text>
                </Pressable>
                <View style={styles.modalBtns}>
                  <Pressable
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={() => {
                      setShowModal(false);
                      setEditGoal(null);
                      setTitle("");
                      setDescription("");
                      setDueDate("");
                      setFrequency('one-time');
                      setIsShared(false);
                    }}
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
                      {editGoal ? 'Update goal' : 'Add goal'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 20,
  },
  headerTitle: { fontSize: 24, fontFamily: "System", fontWeight: '600' },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { padding: 20, gap: 12 },
  grid: { gap: 10 },
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
    borderRadius: 4,
    borderWidth: 1,
    gap: 10,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalHeaderActions: { flexDirection: "row", gap: 12 },
  goalTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  goalDot: { width: 8, height: 8, borderRadius: 4 },
  goalTitle: { fontSize: 15, fontFamily: "System", fontWeight: '600', flex: 1 },
  goalDesc: { fontSize: 12, fontFamily: "System", lineHeight: 18 },
  dueDateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dueDate: { fontSize: 12, fontFamily: "System" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 8 },
  partnerBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  creatorBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  creatorText: { fontSize: 10, fontFamily: "System", fontWeight: '600' },
  frequencyBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  frequencyBadgeText: { fontSize: 10, fontFamily: "System", fontWeight: '600' },
  sharedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  sharedBadgeText: { fontSize: 10, fontFamily: "System", fontWeight: '600' },
  sharedProgressArea: { gap: 12 },
  userProgressSection: { gap: 4 },
  userProgressLabel: { fontSize: 12, fontFamily: "System", fontWeight: '500' },
  progressArea: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressPct: { fontSize: 12, fontFamily: "System", fontWeight: '500', width: 36, textAlign: "right" },
  progressActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  quickProgressBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1 },
  quickProgressText: { fontSize: 12, fontFamily: "System", fontWeight: '600' },
  completeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, flex: 1 },
  completeBtnText: { fontSize: 12, fontFamily: "System", fontWeight: '600', color: "#fff" },
  progressBtns: { flexDirection: "row", gap: 8 },
  progressBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  completedBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  completedText: { fontSize: 13, fontFamily: "System", fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    padding: 24,
    gap: 14,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#555", alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontFamily: "System", fontWeight: '600' },
  input: {
    height: 52,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "System",
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 14 },
  frequencySelector: { gap: 8 },
  frequencyLabel: { fontSize: 14, fontFamily: "System", fontWeight: '600' },
  frequencyOptions: { flexDirection: "row", gap: 8 },
  frequencyOption: { flex: 1, paddingVertical: 10, borderRadius: 4, borderWidth: 1, alignItems: "center" },
  frequencyOptionText: { fontSize: 13, fontFamily: "System", fontWeight: '600' },
  sharedToggle: { padding: 16, borderRadius: 4, borderWidth: 1, gap: 8 },
  sharedToggleContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sharedToggleLabel: { fontSize: 14, fontFamily: "System", fontWeight: '600' },
  sharedToggleSwitch: { width: 36, height: 20, borderRadius: 10, padding: 2 },
  sharedToggleKnob: { width: 16, height: 16, borderRadius: 8 },
  sharedToggleDesc: { fontSize: 12, fontFamily: "System" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  cancelText: { fontSize: 14, fontFamily: "System", fontWeight: '500' },
  saveBtn: { flex: 1, height: 48, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  saveText: { fontSize: 14, fontFamily: "System", fontWeight: '600' },
});
