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
  Animated,
} from 'react-native';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import NavigationDrawer from '@/components/NavigationDrawer';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/syncClerkToSupabase';

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
  const [uploadingProgress, setUploadingProgress] = useState(0);

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
      const asset = result.assets[0];
      setSelectedImage(asset.uri);

      // Explicit size check warning
      if (asset.fileSize) {
        const sizeMB = asset.fileSize / (1024 * 1024);

        if (sizeMB > 50) {
          Alert.alert(
            "Photo Too Large",
            `This photo is ${sizeMB.toFixed(1)} MB. Photos over 50MB are too large and will likely fail to upload. Please choose a smaller photo.`,
            [{ text: "OK", onPress: () => setSelectedImage(null) }]
          );
          return;
        }

        if (sizeMB > 15) {
          Alert.alert(
            "Large Photo",
            `This photo is ${sizeMB.toFixed(1)} MB. It might take a while to upload. Do you want to continue?`,
            [
              { text: "Cancel", style: "cancel", onPress: () => setSelectedImage(null) },
              { text: "Continue", style: "default" },
            ]
          );
        }
      }
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileExt = uri.split('.').pop();
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;

      const storageClient = supabaseAdmin?.storage || supabase.storage;

      // Simulate progress for better UX
      setUploadingProgress(0.1);

      const { data, error } = await storageClient
        .from('memories')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (error) {
        console.error('Upload error:', error);
        setUploadingProgress(0);
        return null;
      }

      setUploadingProgress(0.7);

      const { data: publicUrlData } = storageClient
        .from('memories')
        .getPublicUrl(fileName);

      setUploadingProgress(1);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      setUploadingProgress(0);
      return null;
    }
  };

  const addMemory = async () => {
    if ((!newMemoryText.trim() && !selectedImage) || !user) {
      Alert.alert('Error', 'Please add a caption or a photo.');
      return;
    }

    setAdding(true);
    setUploadingProgress(0);

    try {
      let imageUrl = null;

      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          Alert.alert('Error', 'Failed to upload photo. Please try again.');
          setAdding(false);
          setUploadingProgress(0);
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
      }
    } catch (err) {
      console.error('Failed to add memory:', err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setAdding(false);
      setUploadingProgress(0);
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

            {adding && (
              <View style={styles.uploadingContainer}>
                <Text style={styles.uploadingText}>
                  {uploadingProgress > 0.6 ? "Saving memory..." : "Uploading photo..."}
                </Text>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${uploadingProgress * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(uploadingProgress * 100)}%
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setShowAddModal(false);
                  setNewMemoryText('');
                  setSelectedImage(null);
                }}
                style={styles.cancelButton}
                disabled={adding}
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
  uploadingContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  uploadingText: {
    color: colors.foreground,
    marginBottom: 8,
    fontSize: 15,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 4,
  },
  progressText: {
    color: colors.mutedForeground,
    fontSize: 13,
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