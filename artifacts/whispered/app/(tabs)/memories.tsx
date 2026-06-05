import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

interface Memory {
  id: string;
  uri: string;
  caption: string;
  date: string;
}

export default function MemoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  useEffect(() => {
    AsyncStorage.getItem("memories").then((data) => {
      if (data) setMemories(JSON.parse(data));
    });
  }, []);

  const saveMemories = (updated: Memory[]) => {
    setMemories(updated);
    AsyncStorage.setItem("memories", JSON.stringify(updated));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setShowModal(true);
    }
  };

  const addMemory = async () => {
    if (!selectedImage) return;
    setIsUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMemory: Memory = {
      id: Date.now().toString(36),
      uri: selectedImage,
      caption: caption.trim(),
      date: new Date().toISOString(),
    };

    const updated = [newMemory, ...memories];
    saveMemories(updated);
    setShowModal(false);
    setSelectedImage(null);
    setCaption("");
    setIsUploading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteMemory = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = memories.filter((m) => m.id !== id);
    saveMemories(updated);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const numCols = 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Memories</Text>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={pickImage}
        >
          <Feather name="plus" size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>

      {memories.length === 0 ? (
        <View style={styles.empty}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: `${colors.accent}20` },
            ]}
          >
            <Feather name="image" size={32} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No memories yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Add your first photo memory together
          </Text>
          <Pressable
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={pickImage}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>
              Add memory
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={memories}
          numColumns={numCols}
          keyExtractor={(m) => m.id}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: insets.bottom + 100 },
          ]}
          columnWrapperStyle={styles.row}
          renderItem={({ item: mem }) => (
            <Pressable
              style={[
                styles.memCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onLongPress={() => deleteMemory(mem.id)}
            >
              <Image
                source={{ uri: mem.uri }}
                style={styles.memImage}
                resizeMode="cover"
              />
              <View style={styles.memInfo}>
                {mem.caption ? (
                  <Text
                    style={[styles.memCaption, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {mem.caption}
                  </Text>
                ) : null}
                <Text style={[styles.memDate, { color: colors.mutedForeground }]}>
                  {formatDate(mem.date)}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Add Memory Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
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
              Add memory
            </Text>

            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : null}

            <TextInput
              style={[
                styles.captionInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              maxLength={200}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalCancelBtn,
                  { borderColor: colors.border },
                ]}
                onPress={() => {
                  setShowModal(false);
                  setSelectedImage(null);
                  setCaption("");
                }}
              >
                <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalSaveBtn,
                  { backgroundColor: colors.primary },
                ]}
                onPress={addMemory}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color={colors.primaryForeground} size="small" />
                ) : (
                  <Text
                    style={[styles.modalSaveText, { color: colors.primaryForeground }]}
                  >
                    Save memory
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
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
  grid: { padding: 12, gap: 10 },
  row: { gap: 10 },
  memCard: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  memImage: { width: "100%", height: 160 },
  memInfo: { padding: 10, gap: 4 },
  memCaption: { fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 16 },
  memDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#555",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  captionInput: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
  },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  modalCancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  modalSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
