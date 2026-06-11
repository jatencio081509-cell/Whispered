import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";
import { useUser } from "@clerk/expo";
import { supabase } from "@/lib/supabase";
import NavigationDrawer from '@/components/NavigationDrawer';
import { LinearGradient } from 'expo-linear-gradient';

interface Memory {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  user_id: string;
}

export default function MemoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  useEffect(() => {
    loadMemories();
  }, [user]);

  // Real-time sync for memories
  useEffect(() => {
    const partnerUserId = user?.unsafeMetadata?.partner_user_id as string | undefined;
    if (!partnerUserId || !user) return;

    const channel = supabase
      .channel('memories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Memory change:', payload);
          loadMemories();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
          filter: `user_id=eq.${partnerUserId}`,
        },
        (payload) => {
          console.log('Partner memory change:', payload);
          loadMemories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.unsafeMetadata?.partner_user_id, user?.id]);

  const loadMemories = async () => {
    if (!user) return;
    
    try {
      // Get partner_user_id from user metadata
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.eq.${partnerUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error loading memories:', error);
      Alert.alert('Error', 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.8, allowsEditing: true, aspect: [4, 3] });
    if (!result.canceled && result.assets[0]) { setSelectedImage(result.assets[0].uri); setShowModal(true); }
  };

  const addMemory = async () => {
    if (!selectedImage || !user) return;
    setIsUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const partnerUserId = user.unsafeMetadata?.partner_user_id as string | undefined;
      if (!partnerUserId) {
        Alert.alert('Error', 'You need to link with a partner first');
        setIsUploading(false);
        return;
      }

      // For now, we'll use the local URI. In production, you'd upload to Supabase Storage
      const newMemory = {
        id: Date.now().toString(36),
        user_id: user.id,
        image_url: selectedImage,
        caption: caption.trim() || null,
      };

      const { error } = await supabase
        .from('memories')
        .insert(newMemory);

      if (error) throw error;

      await loadMemories();
      setShowModal(false);
      setSelectedImage(null);
      setCaption("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding memory:', error);
      Alert.alert('Error', 'Failed to add memory');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMemory = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
      Alert.alert('Error', 'Failed to delete memory');
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });

  return (
    <LinearGradient
      colors={['#0A1628', '#0D2840', '#0F3A5C', '#0A4A6E', '#0A1628']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <View style={styles.scanLine} />
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Memories</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1, borderColor: colors.border }]}
            onPress={pickImage}
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
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Loading memories...</Text>
        </View>
      ) : memories.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: "rgba(0,229,255,0.08)", borderColor: colors.border, borderWidth: 1 }]}>
            <Feather name="image" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No memories yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Add your first photo memory together</Text>
          <Pressable style={[styles.emptyBtn, { borderColor: colors.primary, borderWidth: 1 }]} onPress={pickImage}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.emptyBtnText, { color: colors.primary }]}>Add memory</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={memories}
          numColumns={2}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 100 }]}
          columnWrapperStyle={styles.row}
          renderItem={({ item: mem }) => (
            <Pressable
              style={[styles.memCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onLongPress={() => deleteMemory(mem.id)}
            >
              <Image source={{ uri: mem.image_url }} style={styles.memImage} resizeMode="cover" />
              <View style={styles.memInfo}>
                {mem.caption ? <Text style={[styles.memCaption, { color: colors.text }]} numberOfLines={2}>{mem.caption}</Text> : null}
                <Text style={[styles.memDate, { color: colors.mutedForeground }]}>{formatDate(mem.created_at)}</Text>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add memory</Text>
            {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" /> : null}
            <TextInput
              style={[styles.captionInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={200}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => { setShowModal(false); setSelectedImage(null); setCaption(""); }}
              >
                <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={addMemory} disabled={isUploading}>
                {isUploading ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text style={[styles.modalSaveText, { color: colors.primaryForeground }]}>Save memory</Text>
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

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
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
  grid: { padding: 12, gap: 10 },
  row: { gap: 10 },
  memCard: { flex: 1, borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  memImage: { width: "100%", height: 160 },
  memInfo: { padding: 10, gap: 4 },
  memCaption: { fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 16 },
  memDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24, gap: 16 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  previewImage: { width: "100%", height: 200, borderRadius: 14 },
  captionInput: { minHeight: 80, borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", textAlignVertical: "top" },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  modalCancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  modalSaveBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalSaveText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#030712" },
});
