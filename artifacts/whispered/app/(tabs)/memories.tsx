import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import NavigationDrawer from '@/components/NavigationDrawer';
import { supabase } from '@/lib/supabase';

export default function MemoriesScreen() {
  const { user, isLoaded } = useUser();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchMemories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching memories:', error);
        return;
      }

      setMemories(data || []);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('memories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
        },
        (payload) => {
          fetchMemories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user?.id]);

  const addMemory = async () => {
    if (!newMemoryText.trim() || !user) return;

    setAdding(true);

    try {
      const { error } = await supabase.from('memories').insert({
        text: newMemoryText.trim(),
        created_by: user.id,
      });

      if (error) {
        console.error('Error adding memory:', error);
        Alert.alert('Error', 'Failed to add memory. Please try again.');
      } else {
        setNewMemoryText('');
        setShowAddModal(false);
        // Realtime will refresh the list automatically
      }
    } catch (err) {
      console.error('Failed to add memory:', err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setAdding(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#0D2840', '#0F3A5C', '#0A4A6E', '#0A1628']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={{ paddingTop: insets.top, paddingHorizontal: 20 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Memories</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable onPress={() => setShowAddModal(true)}>
              <Feather name="plus" size={26} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => setShowNavigationDrawer(true)}>
              <Feather name="menu" size={24} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : memories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No memories yet.
          </Text>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={styles.addFirstButton}
          >
            <Text style={{ color: colors.primaryForeground, fontWeight: '600' }}>
              Add your first memory
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memoryCard}>
              <Text style={[styles.memoryText, { color: colors.foreground }]}>
                {item.text}
              </Text>
              <Text style={styles.memoryDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        />
      )}

      {/* Add Memory Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Add a Memory
            </Text>

            <TextInput
              value={newMemoryText}
              onChangeText={setNewMemoryText}
              placeholder="What memory do you want to save?"
              placeholderTextColor={colors.mutedForeground}
              style={styles.memoryInput}
              multiline
              autoFocus
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setShowAddModal(false);
                  setNewMemoryText('');
                }}
                style={styles.cancelButton}
              >
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={addMemory}
                disabled={!newMemoryText.trim() || adding}
                style={[styles.saveButton, (!newMemoryText.trim() || adding) && styles.saveButtonDisabled]}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Add Memory</Text>
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
  title: { fontSize: 28, fontWeight: '700' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: { fontSize: 18, textAlign: 'center', marginBottom: 24 },
  addFirstButton: {
    backgroundColor: '#00E5FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  memoryCard: {
    backgroundColor: 'rgba(26,26,30,0.85)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  memoryText: { fontSize: 16, lineHeight: 24 },
  memoryDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  memoryInput: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#00E5FF',
  },
  saveButtonDisabled: {
    backgroundColor: '#444',
  },
});