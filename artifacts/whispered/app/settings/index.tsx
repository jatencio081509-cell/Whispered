import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import NavigationDrawer from '@/components/NavigationDrawer';
import { syncAllData } from '@/lib/syncClerkToSupabase';

export default function SettingsScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const colors = useColors();

  const [anniversaryInput, setAnniversaryInput] = useState('');
  const [savingDate, setSavingDate] = useState(false);
  const [showEditPartnerName, setShowEditPartnerName] = useState(false);
  const [editingPartnerName, setEditingPartnerName] = useState('');
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const [editingDateType, setEditingDateType] = useState<'official' | 'engagement' | 'wedding' | null>(null);
  const [editingDateValue, setEditingDateValue] = useState('');

  if (!isLoaded || !user) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.foreground }}>Loading...</Text>
      </View>
    );
  }

  const coupleId = user.unsafeMetadata?.coupleId as string | undefined;
  const partnerName = user.unsafeMetadata?.partnerName as string | undefined;
  const isLinked = !!coupleId;
  const [officialDate, setOfficialDate] = useState<string>();
  const [engagementDate, setEngagementDate] = useState<string>();
  const [weddingDate, setWeddingDate] = useState<string>();

  // Load dates from Supabase when component mounts
  React.useEffect(() => {
    const loadDates = async () => {
      if (!coupleId) {
        // Fallback to Clerk metadata if no couple exists
        setOfficialDate(user?.unsafeMetadata?.officialDate as string | undefined);
        setEngagementDate(user?.unsafeMetadata?.engagementDate as string | undefined);
        setWeddingDate(user?.unsafeMetadata?.weddingDate as string | undefined);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('couples')
          .select('official_date, engagement_date, wedding_date')
          .eq('id', coupleId)
          .single();

        if (error) throw error;

        setOfficialDate(data?.official_date || undefined);
        setEngagementDate(data?.engagement_date || undefined);
        setWeddingDate(data?.wedding_date || undefined);
      } catch (err) {
        console.error('Failed to load dates:', err);
      }
    };

    loadDates();
  }, [coupleId, user]);

  const saveDate = async (type: 'official' | 'engagement' | 'wedding', date: string) => {
    if (!user) return;
    try {
      const coupleId = user.unsafeMetadata?.coupleId as string | undefined;
      if (!coupleId) {
        // Fallback to Clerk metadata if no couple exists
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            [`${type}Date`]: date,
          },
        });
        return;
      }

      // Save to Supabase couples table
      const metadataKey = `${type}_date`;
      const { error } = await supabase
        .from('couples')
        .update({ [metadataKey]: date })
        .eq('id', coupleId);

      if (error) throw error;
    } catch (err) {
      console.error(`Failed to save ${type} date`, err);
    }
  };

  const savePartnerName = async () => {
    if (!user) return;
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          partnerName: editingPartnerName.trim() || 'Partner',
        },
      });
      setShowEditPartnerName(false);
    } catch (error) {
      console.error('Failed to save partner name', error);
    }
  };

  const handleSync = async () => {
    if (!user) return;
    console.log('Manual sync triggered');
    await syncAllData(
      user.id,
      user.firstName,
      user.username,
      user.imageUrl,
      user.unsafeMetadata?.coupleId as string | undefined,
      user.unsafeMetadata?.partnerName as string | undefined,
      user.unsafeMetadata?.inviteCode as string | undefined
    );
    Alert.alert('Sync', 'Sync complete. Check console for details.');
  };

  return (
    <LinearGradient
      colors={['#0A1628', '#0D2840', '#0F3A5C', '#0A4A6E', '#0A1628']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
          <Pressable onPress={() => setShowNavigationDrawer(true)}>
            <Feather name="menu" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Feather name={isLinked ? "users" : "user"} size={20} color={isLinked ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.statusText, { color: colors.foreground }]}>
                {isLinked ? `Linked to ${partnerName || 'partner'}` : "Solo"}
              </Text>
              {isLinked && (
                <Pressable onPress={() => { setEditingPartnerName(partnerName || ''); setShowEditPartnerName(true); }}>
                  <Feather name="edit-2" size={16} color={colors.primary} />
                </Pressable>
              )}
            </View>
            {!isLinked && (
              <Pressable onPress={() => router.push('/(auth)/link-partner')} style={styles.linkButton}>
                <Text style={[styles.linkButtonText, { color: colors.primary }]}>Link Partner</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Couple</Text>
          {isLinked ? (
            <View style={styles.coupleCard}>
              <Text style={[styles.coupleText, { color: colors.foreground }]}>
                You're connected with {partnerName || 'your partner'}
              </Text>
            </View>
          ) : (
            <Pressable onPress={() => router.push('/(auth)/link-partner')} style={styles.emptyCoupleCard}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Link with your partner to unlock couple features
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Important Dates</Text>
          
          <View style={styles.dateCard}>
            <View style={styles.dateRow}>
              <View style={styles.dateInfo}>
                <Text style={[styles.dateLabel, { color: colors.foreground }]}>Official Date</Text>
                <Text style={[styles.dateValue, { color: officialDate ? colors.foreground : colors.mutedForeground }]}>
                  {officialDate || 'Not set'}
                </Text>
              </View>
              <Pressable onPress={() => { setEditingDateType('official'); setEditingDateValue(officialDate || ''); }}>
                <Feather name="edit-2" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.dateCard}>
            <View style={styles.dateRow}>
              <View style={styles.dateInfo}>
                <Text style={[styles.dateLabel, { color: colors.foreground }]}>Engagement Date</Text>
                <Text style={[styles.dateValue, { color: engagementDate ? colors.foreground : colors.mutedForeground }]}>
                  {engagementDate || 'Not set'}
                </Text>
              </View>
              <Pressable onPress={() => { setEditingDateType('engagement'); setEditingDateValue(engagementDate || ''); }}>
                <Feather name="edit-2" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.dateCard}>
            <View style={styles.dateRow}>
              <View style={styles.dateInfo}>
                <Text style={[styles.dateLabel, { color: colors.foreground }]}>Wedding Date</Text>
                <Text style={[styles.dateValue, { color: weddingDate ? colors.foreground : colors.mutedForeground }]}>
                  {weddingDate || 'Not set'}
                </Text>
              </View>
              <Pressable onPress={() => { setEditingDateType('wedding'); setEditingDateValue(weddingDate || ''); }}>
                <Feather name="edit-2" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Preferences</Text>
        </View>
      </View>

      {/* Edit Partner Name Modal */}
      <Modal
        visible={showEditPartnerName}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditPartnerName(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEditPartnerName(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit partner name</Text>
            <TextInput
              style={[styles.editInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              value={editingPartnerName}
              onChangeText={setEditingPartnerName}
              placeholder="Enter partner's name"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowEditPartnerName(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={savePartnerName}
              >
                <Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Date Modal */}
      <Modal
        visible={editingDateType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingDateType(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditingDateType(null)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Edit {editingDateType === 'official' ? 'Official' : editingDateType === 'engagement' ? 'Engagement' : 'Wedding'} Date
            </Text>
            <TextInput
              style={[styles.editInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              value={editingDateValue}
              onChangeText={setEditingDateValue}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setEditingDateType(null)}
              >
                <Text style={[styles.modalButtonText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  if (editingDateType) {
                    saveDate(editingDateType, editingDateValue);
                    setEditingDateType(null);
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <NavigationDrawer
        visible={showNavigationDrawer}
        onClose={() => setShowNavigationDrawer(false)}
      />

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '700' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  statusCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusText: { fontSize: 18, fontWeight: '600' },
  linkButton: { marginTop: 12, alignSelf: 'flex-start' },
  linkButtonText: { fontSize: 15, fontWeight: '600' },
  coupleCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  coupleText: { fontSize: 16, fontWeight: '500' },
  emptyCoupleCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  emptyText: { textAlign: 'center', fontSize: 15 },
  anniversaryCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, alignItems: 'center' },
  anniversaryText: { fontSize: 18, fontWeight: '600' },
  anniversarySubtext: { fontSize: 14, marginTop: 4 },
  dateInputContainer: { marginTop: 16 },
  dateInput: { backgroundColor: '#1A1A1A', color: 'white', padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 12 },
  dateSaveButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  editInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    borderRadius: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateCard: {
    backgroundColor: 'rgba(20, 40, 70, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});