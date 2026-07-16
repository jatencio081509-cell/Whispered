import React, { useState, useEffect, useRef } from 'react';
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
import { Feather } from '@expo/vector-icons';
import NavigationDrawer from '@/components/NavigationDrawer';
import ThemeBackground from '@/components/ThemeBackground';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

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
  const [imageData, setImageData] = useState<Record<string, string>>({});
  const [reactions, setReactions] = useState<Record<string, any[]>>({});
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');

  const fetchMemories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Fetched memories:', data);
      console.log('Fetch error:', error);

      if (error) {
        console.error('Error fetching memories:', error);
        return;
      }

      setMemories(data || []);

      // Pre-fetch images
      console.log('Starting image pre-fetch for', (data || []).filter(item => item.image_url).length, 'images');
      const imageDataPromises = (data || [])
        .filter(item => item.image_url)
        .map(async (item) => {
          try {
            console.log('Fetching image:', item.image_url);
            const response = await fetch(item.image_url);
            console.log('Image response status:', response.status);
            const blob = await response.blob();
            console.log('Image blob size:', blob.size);
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
              reader.onload = () => {
                const result = reader.result as string;
                console.log('Image converted to base64, length:', result.length);
                resolve(result);
              };
              reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(error);
              };
              reader.readAsDataURL(blob);
            });
            return { id: item.id, base64 };
          } catch (err) {
            console.error('Failed to fetch image:', item.image_url, err);
            return null;
          }
        });

      const imageDataResults = await Promise.all(imageDataPromises);
      const imageDataMap = imageDataResults.reduce((acc, result) => {
        if (result) {
          acc[result.id] = result.base64;
        }
        return acc;
      }, {} as Record<string, string>);

      setImageData(imageDataMap);

      // Fetch reactions for memories
      const memoryIds = (data || []).map(m => m.id);
      if (memoryIds.length > 0) {
        const { data: reactionsData, error: reactionsError } = await supabase
          .from('reactions')
          .select('*')
          .in('memory_id', memoryIds);
        
        console.log('Reactions data:', reactionsData);
        console.log('Reactions error:', reactionsError);
        
        const reactionsMap = (reactionsData || []).reduce((acc, reaction: any) => {
          if (!acc[reaction.memory_id]) {
            acc[reaction.memory_id] = [];
          }
          acc[reaction.memory_id].push(reaction);
          return acc;
        }, {} as Record<string, any[]>);
        
        setReactions(reactionsMap);
      }
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
          console.log('Realtime update received:', payload);
          fetchMemories();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
        },
        (payload) => {
          console.log('Reaction realtime update received:', payload);
          fetchMemories();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

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
      console.log('Starting upload for:', uri);
      
      // Use FileSystem to read the file
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('File info:', fileInfo);
      
      if (!fileInfo.exists) {
        console.error('File does not exist');
        return null;
      }

      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      
      console.log('Base64 length:', base64.length);
      
      // Convert base64 to Uint8Array for React Native
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('ArrayBuffer size:', bytes.byteLength, 'bytes');

      if (bytes.byteLength === 0) {
        console.error('ArrayBuffer is empty, cannot upload');
        return null;
      }

      const fileExt = uri.split('.').pop();
      const fileName = `${user!.id}-${Date.now()}.${fileExt}`;

      const storageClient = supabase.storage;

      setUploadingProgress(0.1);

      console.log('Uploading to storage:', fileName);
      const { data, error } = await storageClient
        .from('memories')
        .upload(fileName, bytes, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Upload error:', error);
        setUploadingProgress(0);
        return null;
      }

      console.log('Upload successful:', data);
      console.log('Upload data path:', data?.path);

      setUploadingProgress(0.7);

      const { data: publicUrlData } = storageClient
        .from('memories')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrlData.publicUrl);

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
        id: `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        caption: newMemoryText.trim() || '',
        image_url: imageUrl,
        user_id: user.id,
      });

      if (error) {
        console.error('Error adding memory:', error);
        Alert.alert('Error', 'Failed to save memory.');
      } else {
        setNewMemoryText('');
        setSelectedImage(null);
        setShowAddModal(false);

        // Send push notification to partner
        const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
        if (partnerUserId) {
          const partnerName = user.unsafeMetadata?.partnerName as string | undefined;
          supabase.functions.invoke('send-push-notification', {
            body: {
              toUserId: partnerUserId,
              title: partnerName || 'New memory',
              body: newMemoryText.trim() || 'Added a new memory',
            },
          }).catch(console.error);
        }
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

  const addReaction = async (memoryId: string, emoji: string) => {
    if (!user) return;

    // Check if reaction already exists
    const existingReaction = reactions[memoryId]?.find(
      (r: any) => r.user_id === user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // If exists, remove it (toggle behavior)
      await removeReaction(memoryId, emoji);
    } else {
      // If doesn't exist, add it
      const { error } = await supabase.from('reactions').insert({
        memory_id: memoryId,
        user_id: user.id,
        emoji: emoji,
      });

      if (error) {
        // Handle duplicate key error by removing instead
        if (error.code === '23505') {
          await removeReaction(memoryId, emoji);
        } else {
          console.error('Error adding reaction:', error);
        }
      }
    }
  };

  const removeReaction = async (memoryId: string, emoji: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('reactions')
      .delete()
      .match({
        memory_id: memoryId,
        user_id: user.id,
        emoji: emoji,
      });

    if (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const updateCaption = async () => {
    if (!editingMemory || !user) return;

    const { error } = await supabase
      .from('memories')
      .update({ caption: editCaption })
      .eq('id', editingMemory)
      .select();

    if (error) {
      console.error('Error updating caption:', error);
      Alert.alert('Error', 'Failed to update caption.');
    } else {
      // Update local state immediately to prevent flicker
      setMemories(memories.map(m => 
        m.id === editingMemory ? { ...m, caption: editCaption } : m
      ));
      setEditingMemory(null);
      setEditCaption('');
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemeBackground>

      {/* Header */}
      <View style={{ paddingTop: insets.top, paddingHorizontal: 20 }}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Memories</Text>
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
          <Button 
            title="Add your first memory" 
            onPress={openAddModal}
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.memoryCard}>
              {item.image_url && imageData[item.id] ? (
                <Image
                  source={{ uri: imageData[item.id] }}
                  style={styles.memoryImage}
                  resizeMode="cover"
                />
              ) : item.image_url ? (
                <View style={[styles.memoryImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }]}>
                  <ActivityIndicator size="small" color="#00E5FF" />
                </View>
              ) : null}
              {editingMemory === item.id ? (
                <View style={styles.editContainer}>
                  <Input
                    value={editCaption}
                    onChangeText={setEditCaption}
                    placeholder="Edit caption..."
                    multiline
                    numberOfLines={3}
                  />
                  <View style={styles.editButtons}>
                    <Button
                      title="Cancel"
                      onPress={() => setEditingMemory(null)}
                      variant="secondary"
                      size="small"
                    />
                    <Button
                      title="Save"
                      onPress={updateCaption}
                      variant="primary"
                      size="small"
                    />
                  </View>
                </View>
              ) : (
                <>
                  {item.caption ? (
                    <Text style={[styles.memoryText, { color: colors.foreground }]}>
                      {item.caption}
                    </Text>
                  ) : null}
                  <Text style={styles.memoryDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </>
              )}
              
              {/* Reactions and Actions */}
              <View style={styles.memoryActions}>
                <View style={styles.reactionsContainer}>
                  {reactions[item.id]?.map((reaction: any, index: number) => {
                    const userName = reaction.users 
                      ? `${reaction.users.first_name || ''} ${reaction.users.last_name || ''}`.trim() || 'You'
                      : (reaction.user_id === user?.id ? 'You' : reaction.user_id);
                    
                    return (
                      <Badge
                        key={index}
                        text={`${reaction.emoji} ${userName}`}
                        variant="default"
                      />
                    );
                  })}
                </View>
                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={() => setShowReactionPicker(showReactionPicker === item.id ? null : item.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="heart" size={20} color={colors.mutedForeground} />
                  </Pressable>
                  {item.user_id === user?.id && (
                    <Pressable
                      onPress={() => {
                        setEditingMemory(item.id);
                        setEditCaption(item.caption || '');
                      }}
                      style={styles.actionButton}
                    >
                      <Feather name="edit-2" size={18} color={colors.mutedForeground} />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Reaction Picker */}
              {showReactionPicker === item.id && (
                <View style={[styles.reactionPicker, { backgroundColor: colors.card }]}>
                  {['❤️', '😂', '😍', '🥰', '😢', '😮', '🔥', '👍'].map((emoji) => {
                    const hasReacted = reactions[item.id]?.some(
                      (r: any) => r.user_id === user?.id && r.emoji === emoji
                    );
                    return (
                      <Pressable
                        key={emoji}
                        onPress={() => {
                          if (hasReacted) {
                            removeReaction(item.id, emoji);
                          } else {
                            addReaction(item.id, emoji);
                          }
                          setShowReactionPicker(null);
                        }}
                        style={[
                          styles.emojiOption,
                          hasReacted && { backgroundColor: colors.primary }
                        ]}
                      >
                        <Text style={styles.emojiText}>{emoji}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </Card>
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

            <Input
              value={newMemoryText}
              onChangeText={setNewMemoryText}
              placeholder="Write a caption..."
              multiline
              numberOfLines={3}
            />

            {adding && (
              <View style={styles.uploadingContainer}>
                <Text style={[styles.uploadingText, { color: colors.foreground }]}>
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
              <Button
                title="Cancel"
                onPress={() => {
                  setShowAddModal(false);
                  setNewMemoryText('');
                  setSelectedImage(null);
                }}
                disabled={adding}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title="Save Memory"
                onPress={addMemory}
                disabled={(!newMemoryText.trim() && !selectedImage) || adding}
                loading={adding}
                style={{ flex: 1 }}
              />
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: '600', fontFamily: 'System' },
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
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 24, fontFamily: 'System' },
  addFirstButton: {
    backgroundColor: '#00E5FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  memoryCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  memoryImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  memoryText: { fontSize: 16, lineHeight: 24, fontFamily: 'System' },
  memoryDate: {
    fontSize: 12,
    color: 'rgba(0, 229, 255, 0.7)',
    marginTop: 8,
    fontFamily: 'Courier',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  imagePickerButton: {
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  memoryInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    borderRadius: 4,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  uploadingContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'System',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(0, 229, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  editContainer: {
    marginBottom: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    padding: 8,
  },
  memoryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 229, 255, 0.1)',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reactionBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionUser: {
    fontSize: 10,
    color: 'rgba(0, 229, 255, 0.7)',
    fontFamily: 'Courier',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  reactionPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  emojiOption: {
    padding: 6,
    borderRadius: 4,
  },
  emojiText: {
    fontSize: 18,
  },
});