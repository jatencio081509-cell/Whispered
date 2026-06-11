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

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_date: string | null;
  status: string;
  created_at: string;
  user_id: string;
}

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const CATEGORIES = ['Relationship', 'Personal', 'Health', 'Career', 'Finance', 'Other'];

  useEffect(() => {
    loadGoals();
  }, [user]);

  // Real-time sync for goals
  useEffect(() => {
    const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
    if (!partnerUserId || !user) return;

    const channel = supabase
      .channel('goals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Goal change:', payload);
          loadGoals();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${partnerUserId}`,
        },
        (payload) => {
          console.log('Partner goal change:', payload);
          loadGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.unsafeMetadata?.partner_user_id, user?.id]);

  const loadGoals = async () => {
    if (!user) return;
    
    try {
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.eq.${partnerUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      Alert.alert('Error', 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!title.trim() || !user) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        Alert.alert('Error', 'You need to link with a partner first');
        setIsSaving(false);
        return;
      }

      const newGoal = {
        id: Date.now().toString(36),
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        target_date: targetDate || null,
        status: 'active',
      };

      const { error } = await supabase
        .from('goals')
        .insert(newGoal);

      if (error) throw error;

      await loadGoals();
      setShowModal(false);
      setTitle("");
      setDescription("");
      setCategory("");
      setTargetDate("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to add goal');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGoalStatus = async (goal: Goal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const newStatus = goal.status === 'active' ? 'completed' : 'active';
      const { error } = await supabase
        .from('goals')
        .update({ status: newStatus })
        .eq('id', goal.id);

      if (error) throw error;

      await loadGoals();
    } catch (error) {
      console.error('Error updating goal status:', error);
      Alert.alert('Error', 'Failed to update goal status');
    }
  };

  const deleteGoal = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', 'Failed to delete goal');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#10B981' : status === 'archived' ? '#6B7280' : colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.scanLine} />
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Goals</Text>
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
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Loading goals...</Text>
        </View>
      ) : goals.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: "rgba(0,229,255,0.08)", borderColor: colors.border, borderWidth: 1 }]}>
            <Feather name="target" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No goals yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Set shared goals with your partner</Text>
          <Pressable style={[styles.emptyBtn, { borderColor: colors.primary, borderWidth: 1 }]} onPress={() => setShowModal(true)}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.emptyBtnText, { color: colors.primary }]}>Add goal</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(g) => g.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          renderItem={({ item: goal }) => (
            <Pressable
              style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onLongPress={() => deleteGoal(goal.id)}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalMeta}>
                  <Pressable onPress={() => toggleGoalStatus(goal)}>
                    <Feather 
                      name={goal.status === 'completed' ? 'check-circle' : 'circle'} 
                      size={20} 
                      color={getStatusColor(goal.status)} 
                    />
                  </Pressable>
                  <Text style={[styles.goalTitle, { 
                    color: colors.text, 
                    textDecorationLine: goal.status === 'completed' ? 'line-through' : 'none',
                    opacity: goal.status === 'completed' ? 0.6 : 1
                  }]}>{goal.title}</Text>
                </View>
                {goal.user_id === user?.id && (
                  <View style={[styles.youBadge, { backgroundColor: `${colors.primary}20` }]}>
                    <Text style={[styles.youText, { color: colors.primary }]}>You</Text>
                  </View>
                )}
              </View>
              
              {goal.description && <Text style={[styles.goalDescription, { color: colors.foreground }]}>{goal.description}</Text>}
              
              <View style={styles.goalFooter}>
                {goal.category && (
                  <View style={[styles.categoryBadge, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={[styles.categoryText, { color: colors.primary }]}>{goal.category}</Text>
                  </View>
                )}
                <Text style={[styles.targetDate, { color: colors.mutedForeground }]}>
                  <Feather name="calendar" size={12} color={colors.mutedForeground} /> {formatDate(goal.target_date)}
                </Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>New goal</Text>
            
            <TextInput
              style={[styles.titleInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Goal title"
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

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Target date (optional)</Text>
            <TextInput
              style={[styles.dateInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={targetDate}
              onChangeText={setTargetDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => { setShowModal(false); setTitle(""); setDescription(""); setCategory(""); setTargetDate(""); }}
              >
                <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={addGoal} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={[styles.modalSaveText, { color: colors.primaryForeground }]}>Save goal</Text>
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
  goalCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  goalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  goalMeta: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  goalTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", flex: 1 },
  goalDescription: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  goalFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  targetDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  youBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  youText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 16 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  titleInput: { height: 48, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 16, fontFamily: "Inter_500Medium" },
  descriptionInput: { minHeight: 80, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular" },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 8 },
  categorySelector: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  categoryOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  categoryOptionSelected: { borderWidth: 2 },
  categoryOptionText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  dateInput: { height: 48, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular" },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  modalCancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  modalSaveBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalSaveText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#030712" },
});
