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
  Image,
  Alert,
} from 'react-native';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import NavigationDrawer from '@/components/NavigationDrawer';
import * as ImagePicker from 'expo-image-picker';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileExt = uri.split('.').pop();
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('memories')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('memories')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      return null;
    }
  };

  const addMemory = async () => {
    if ((!newMemoryText.trim() && !selectedImage) || !user) {
      Alert.alert('Error', 'Please add a caption or a photo.');
      return;
    }

    setAdding(true);

    try {
      let imageUrl = null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          Alert.alert('Error', 'Failed to upload photo. Please try again.');
          setAdding(false);
          return;
        }
      }

      const { error } = await supabase.from('memories').insert({
        text: newMemoryText.trim() || '',
        image_url: imageUrl,
        created_by: user.id,
      });

      if (error) {
        console.error('Error adding memory:', error);
        Alert.alert('Error', 'Failed to save memory.');
      } else {
        setNewMemoryText('');
        setSelectedImage(null);
        setShowAddModal(false);
        // Realtime will refresh the list
      }
    } catch (err) {
      console.error('Failed to add memory:', err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setAdding(false);
    }
  };

  const openAddModal = () => {
    setNewMemoryText('');
    setSelectedImage(null);
    setShowAddModal(true);
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
            <Pressable onPress={openAddModal}>
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
          <Pressable onPress={openAddModal} style={styles.addFirstButton}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>
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
              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.memoryImage}
                  resizeMode="cover"
                />
              )}
              {item.text ? (
                <Text style={[styles.memoryText, { color: colors.foreground }]}>
                  {item.text}
                </Text>
              ) : null}
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

            <Pressable onPress={pickImage} style={styles.imagePickerButton}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="camera" size={32} color={colors.mutedForeground} />
                  <Text style={{ color: colors.mutedForeground, marginTop: 8 }}>
                    Add Photo
                  </Text>
                </View>
              )}
            </Pressable>

            <TextInput
              value={newMemoryText}
              onChangeText={setNewMemoryText}
              placeholder="Write a caption..."
              placeholderTextColor={colors.mutedForeground}
              style={styles.memoryInput}
              multiline
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setShowAddModal(false);
                  setNewMemoryText('');
                  setSelectedImage(null);
                }}
                style={styles.cancelButton}
              >
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={addMemory}
                disabled={(!newMemoryText.trim() && !selectedImage) || adding}
                style={[styles.saveButton, ((!newMemoryText.trim() && !selectedImage) || adding) && styles.saveButtonDisabled]}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Save Memory</Text>
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
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  memoryImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  imagePickerButton: {
    height: 180,
    backgroundColor: '#111',
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  memoryInput: {
    backgroundColor: '#111',
    color: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
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